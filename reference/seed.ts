// Recreates within-reach.db from seed-data.json.
//
//   npm run seed
//
// The dataset lives in seed-data.json (postcodes, buyers, sellers, 600 listings);
// this script just drops the database and re-inserts it, so reseeding is clean and
// reproducible. Edit the JSON to change the world.

import { existsSync, unlinkSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, DB_PATH, SCHEMA, type Share } from "./db.js";
import type { ReachTier } from "./reach.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedData {
  postcodes: Array<{ code: string; country: string; name: string; state: string | null; lat: number | null; lng: number | null }>;
  users: Array<{ id: string; name: string; country: string; code: string | null; share: Share; reach: ReachTier }>;
  sellers: Array<{ id: string; name: string; country: string; code: string | null; share: Share; reach: ReachTier }>;
  listings: Array<{ id: string; seller_id: string; title: string; price_cents: number }>;
}

const data: SeedData = JSON.parse(readFileSync(join(__dirname, "seed-data.json"), "utf8"));

if (existsSync(DB_PATH)) unlinkSync(DB_PATH);
const db = openDb();
db.exec(SCHEMA);

const insPostcode = db.prepare(
  "INSERT INTO postcodes (code, country, name, state, lat, lng) VALUES (?,?,?,?,?,?)",
);
const insParty = db.prepare(
  "INSERT INTO parties (id, name, role, country, code, share, reach) VALUES (?,?,?,?,?,?,?)",
);
const insListing = db.prepare(
  "INSERT INTO listings (id, seller_id, title, price_cents) VALUES (?,?,?,?)",
);

const seed = db.transaction(() => {
  for (const p of data.postcodes) {
    insPostcode.run(p.code, p.country, p.name, p.state, p.lat, p.lng);
  }
  for (const u of data.users) {
    insParty.run(u.id, u.name, "user", u.country, u.code, u.share, u.reach);
  }
  for (const s of data.sellers) {
    insParty.run(s.id, s.name, "seller", s.country, s.code, s.share, s.reach);
  }
  for (const l of data.listings) {
    insListing.run(l.id, l.seller_id, l.title, l.price_cents);
  }
});
seed();
db.close();

console.log(`Seeded ${DB_PATH}`);
console.log(
  `  ${data.postcodes.length} postcodes, ${data.users.length} buyers, ${data.sellers.length} sellers, ${data.listings.length} listings`,
);
console.log("Start the demo with:  npm run web");
