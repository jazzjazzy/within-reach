// The search step, framing-free, reused by the web server.
//
// SQLite finds candidates by title text; THIS module applies the reach rule by
// calling matches() from reach.ts. Nothing about reach or overlap lives in SQL,
// and nothing about it is reinvented here — within()/matches()/distanceKm() all
// come from the reach layer.

import type Database from "better-sqlite3";
import { findCandidates, hydrate, listSellers, type HydratedParty, type PartyRow } from "./db.js";
import { matches, within, usableReach, distanceKm } from "./reach.js";

export interface VisibleResult {
  id: string;
  title: string;
  priceCents: number;
  price: string;
  sellerId: string;
  seller: string;
  town: string;
  sellerReach: string;
  tier: string; // e.g. "your [local] ∩ their [country]"
  distanceKm: number | null;
}

export interface HiddenResult {
  id: string;
  title: string;
  sellerId: string;
  seller: string;
  town: string;
  reason: string;
}

export interface SearchResult {
  you: { id: string; name: string; town: string; reach: string; usable: string[] };
  term: string;
  visible: VisibleResult[];
  hidden: HiddenResult[];
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** How a visible listing matched: the two reach tiers in play. */
function whyVisible(seller: HydratedParty, me: HydratedParty): string {
  return `your [${me.reach}] ∩ their [${seller.reach}]`;
}

/** Why a search hit was filtered out — which side of the rule said no. */
function whyHidden(seller: HydratedParty, me: HydratedParty): string {
  const sellerInMyReach = within(seller.location, me.location, me.reach);
  const meInSellerReach = within(me.location, seller.location, seller.reach);
  const reasons: string[] = [];
  if (!sellerInMyReach) reasons.push(`they sit outside your [${me.reach}] reach`);
  if (!meInSellerReach) reasons.push(`you sit outside their [${seller.reach}] reach`);
  return reasons.join(" and ");
}

export interface CatalogueGroup {
  id: string;
  name: string;
  town: string;
  reach: string;
  country: string;
  listings: Array<{ id: string; title: string; price: string; priceCents: number }>;
}

/** The whole catalogue, grouped by seller — for the "see everything" page. No reach rule applied. */
export function catalogue(db: Database.Database): { total: number; sellers: number; groups: CatalogueGroup[] } {
  const rows = db
    .prepare("SELECT id, seller_id, title, price_cents FROM listings ORDER BY title")
    .all() as Array<{ id: string; seller_id: string; title: string; price_cents: number }>;

  const bySeller = new Map<string, CatalogueGroup["listings"]>();
  for (const r of rows) {
    if (!bySeller.has(r.seller_id)) bySeller.set(r.seller_id, []);
    bySeller.get(r.seller_id)!.push({ id: r.id, title: r.title, price: money(r.price_cents), priceCents: r.price_cents });
  }

  const groups = listSellers(db).map((row) => {
    const s = hydrate(db, row);
    return {
      id: s.id,
      name: s.name,
      town: s.town,
      reach: s.reach,
      country: s.location.country,
      listings: bySeller.get(s.id) ?? [],
    };
  });

  return { total: rows.length, sellers: groups.length, groups };
}

export interface SellerMatch {
  id: string;
  name: string;
  town: string;
  reach: string;
  matched: boolean;
  distanceKm: number | null;
  detail: string; // tier if matched, reason if not
}

/**
 * For a given buyer, evaluate the reach rule against EVERY seller (no search term).
 * This is what the visualisation highlights: which sellers are reachable for this
 * buyer, and which sit outside the overlap. Same matches() call as search; just run
 * over the seller list instead of over text hits.
 */
export function matchSellers(
  db: Database.Database,
  userRow: PartyRow,
): { you: SearchResult["you"]; sellers: SellerMatch[] } {
  const me = hydrate(db, userRow);
  const sellers = listSellers(db).map((row) => {
    const s = hydrate(db, row);
    const matched = matches(s, me);
    const d = distanceKm(me.location, s.location);
    return {
      id: s.id,
      name: s.name,
      town: s.town,
      reach: s.reach,
      matched,
      distanceKm: d == null ? null : Math.round(d),
      detail: matched ? whyVisible(s, me) : whyHidden(s, me),
    };
  });
  return {
    you: { id: me.id, name: me.name, town: me.town, reach: me.reach, usable: usableReach(me.location) },
    sellers,
  };
}

/**
 * Run a search as a given buyer: text-match listings, then keep only those whose
 * seller passes matches(seller, me). Returns both the visible set and the hits
 * that were filtered out (with the reason), so the demo can show the rule working.
 */
export function search(db: Database.Database, userRow: PartyRow, term: string): SearchResult {
  const me = hydrate(db, userRow);
  const candidates = findCandidates(db, term);

  const visible: VisibleResult[] = [];
  const hidden: HiddenResult[] = [];

  for (const c of candidates) {
    if (matches(c.seller, me)) {
      const d = distanceKm(me.location, c.seller.location);
      visible.push({
        id: c.id,
        title: c.title,
        priceCents: c.priceCents,
        price: money(c.priceCents),
        sellerId: c.seller.id,
        seller: c.seller.name,
        town: c.seller.town,
        sellerReach: c.seller.reach,
        tier: whyVisible(c.seller, me),
        distanceKm: d == null ? null : Math.round(d),
      });
    } else {
      hidden.push({
        id: c.id,
        title: c.title,
        sellerId: c.seller.id,
        seller: c.seller.name,
        town: c.seller.town,
        reason: whyHidden(c.seller, me),
      });
    }
  }

  // Nearest-first when distance is known; everything else falls in behind.
  visible.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  return {
    you: {
      id: me.id,
      name: me.name,
      town: me.town,
      reach: me.reach,
      usable: usableReach(me.location),
    },
    term,
    visible,
    hidden,
  };
}
