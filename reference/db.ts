// Storage layer for the interactive search demo.
//
// SQLite holds the data and does the *text* search on listing titles. It does NOT
// decide visibility — that stays in reach.ts. Rows are hydrated into the reach-layer
// types here, and search.ts calls matches() to make the call. The only concession to
// the database is a coarse text filter; the reach rule never touches SQL.

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Location, Party, ReachTier } from "./reach.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = join(__dirname, "within-reach.db");

/** How much of a participant's location they chose to share. Gates reach precision. */
export type Share = "country" | "state" | "postcode";

export const SCHEMA = `
CREATE TABLE postcodes (
  code    TEXT NOT NULL,
  country TEXT NOT NULL,
  name    TEXT NOT NULL,
  state   TEXT,
  lat     REAL,
  lng     REAL,
  PRIMARY KEY (country, code)
);

CREATE TABLE parties (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  role    TEXT NOT NULL CHECK (role IN ('user','seller')),
  country TEXT NOT NULL,
  code    TEXT,
  share   TEXT NOT NULL CHECK (share IN ('country','state','postcode')),
  reach   TEXT NOT NULL CHECK (reach IN ('local','state','country','worldwide'))
);

CREATE TABLE listings (
  id         TEXT PRIMARY KEY,
  seller_id  TEXT NOT NULL REFERENCES parties(id),
  title      TEXT NOT NULL,
  price_cents INTEGER NOT NULL
);
`;

export function openDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");
  return db;
}

// --- Row shapes (as stored) ----------------------------------------------------

export interface PartyRow {
  id: string;
  name: string;
  role: "user" | "seller";
  country: string;
  code: string | null;
  share: Share;
  reach: ReachTier;
}

interface PostcodeRow {
  code: string;
  country: string;
  name: string;
  state: string | null;
  lat: number | null;
  lng: number | null;
}

/** A party hydrated into reach-layer form, plus its display label and home town. */
export interface HydratedParty extends Party {
  id: string;
  name: string;
  town: string; // human-readable home, e.g. "Canberra, ACT"
}

/**
 * Build a reach-layer Location from a party row, masking fields the participant
 * didn't share. This is where precision-gating happens: share="country" yields a
 * country-only Location, so usableReach() will refuse local/state for them.
 */
function hydrateLocation(party: PartyRow, pc: PostcodeRow | undefined): Location {
  const loc: Location = { country: party.country };
  if (party.share === "country" || !pc) return loc;
  if (party.share === "state" || party.share === "postcode") {
    if (pc.state) loc.state = pc.state;
  }
  if (party.share === "postcode") {
    loc.postcode = pc.code;
    if (pc.lat != null) loc.lat = pc.lat;
    if (pc.lng != null) loc.lng = pc.lng;
  }
  return loc;
}

function townLabel(party: PartyRow, pc: PostcodeRow | undefined): string {
  if (party.share === "country" || !pc) return party.country;
  return pc.state ? `${pc.name}, ${pc.state}` : pc.name;
}

export function hydrate(db: Database.Database, party: PartyRow): HydratedParty {
  const pc = party.code
    ? (db
        .prepare("SELECT * FROM postcodes WHERE country = ? AND code = ?")
        .get(party.country, party.code) as PostcodeRow | undefined)
    : undefined;
  return {
    id: party.id,
    name: party.name,
    town: townLabel(party, pc),
    location: hydrateLocation(party, pc),
    reach: party.reach,
  };
}

// --- Queries -------------------------------------------------------------------

export function listUsers(db: Database.Database): PartyRow[] {
  return db
    .prepare("SELECT * FROM parties WHERE role = 'user' ORDER BY name")
    .all() as PartyRow[];
}

export function getUser(db: Database.Database, id: string): PartyRow | undefined {
  return db
    .prepare("SELECT * FROM parties WHERE role = 'user' AND id = ?")
    .get(id) as PartyRow | undefined;
}

export function listSellers(db: Database.Database): PartyRow[] {
  return db
    .prepare("SELECT * FROM parties WHERE role = 'seller' ORDER BY name")
    .all() as PartyRow[];
}

/** A candidate listing: matched the search text, seller not yet reach-checked. */
export interface Candidate {
  id: string;
  title: string;
  priceCents: number;
  seller: HydratedParty;
}

/**
 * Listings whose title contains `term` (case-insensitive). This is the ONLY filter
 * SQL applies. Visibility is decided afterwards in TypeScript via matches(). No
 * country pre-filter: a worldwide buyer wants other countries too, so filtering by
 * country here would silently break the rule.
 */
export function findCandidates(db: Database.Database, term: string): Candidate[] {
  // Explicit aliases so listing and party columns never collide on `id`.
  const rows = db
    .prepare(
      `SELECT l.id          AS listing_id,
              l.title       AS title,
              l.price_cents AS price_cents,
              p.id          AS seller_id,
              p.name        AS name,
              p.role        AS role,
              p.country     AS country,
              p.code        AS code,
              p.share       AS share,
              p.reach       AS reach
       FROM listings l
       JOIN parties p ON p.id = l.seller_id
       WHERE l.title LIKE '%' || ? || '%' COLLATE NOCASE
       ORDER BY l.title`,
    )
    .all(term) as Array<{
    listing_id: string;
    title: string;
    price_cents: number;
    seller_id: string;
    name: string;
    role: "user" | "seller";
    country: string;
    code: string | null;
    share: Share;
    reach: ReachTier;
  }>;

  return rows.map((r) => {
    const seller: PartyRow = {
      id: r.seller_id,
      name: r.name,
      role: r.role,
      country: r.country,
      code: r.code,
      share: r.share,
      reach: r.reach,
    };
    return {
      id: r.listing_id,
      title: r.title,
      priceCents: r.price_cents,
      seller: hydrate(db, seller),
    };
  });
}
