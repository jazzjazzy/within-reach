// Worked examples for the reach layer. These double as a self-check: run them and
// every line should print PASS. They're the canonical cases from the white paper.
//
//   npm run demo

import { matches, usableReach, distanceKm, type Party, type Location } from "./reach.js";

// A few real-ish places. Centroids are approximate — good enough to show the radius
// behaviour without pulling in a postcode dataset.
const canberra: Location   = { country: "AU", state: "ACT", postcode: "2600", lat: -35.28, lng: 149.13 };
const queanbeyan: Location = { country: "AU", state: "NSW", postcode: "2620", lat: -35.35, lng: 149.23 }; // ~12 km from Canberra, different state
const sydney: Location     = { country: "AU", state: "NSW", postcode: "2000", lat: -33.87, lng: 151.21 }; // ~250 km from Canberra
const london: Location     = { country: "GB", state: "ENG", postcode: "EC1A", lat:  51.52, lng:  -0.10 };

let failures = 0;
function check(name: string, got: boolean, want: boolean): void {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (got ${got}, want ${want})`);
}

console.log("Within Reach — reach layer self-check\n");

// 1. Anna's lemons. A local-only seller in Canberra; a buyer just over the border in
//    Queanbeyan, also looking local. ~12 km apart -> inside a 25 km local radius, and
//    note it crosses a state line: local is distance, not administrative boundary.
const anna: Party       = { location: canberra,   reach: "local" };
const localBuyer: Party = { location: queanbeyan, reach: "local" };
check("local seller <-> nearby local buyer", matches(anna, localBuyer), true);

// 2. The same local-only seller is still unreachable to a distant buyer set to
//    worldwide — she only sells local, and London is not local to Canberra.
const worldBuyer: Party = { location: london, reach: "worldwide" };
check("local seller <-> distant worldwide buyer", matches(anna, worldBuyer), false);

// 3. A national seller (reach: country) and a local buyer. They only match when the
//    seller is genuinely in the buyer's local area — proximity is still required on
//    the buyer's side, no matter how wide the seller casts.
const nationalSeller: Party  = { location: sydney,   reach: "country" };
const farLocalBuyer: Party   = { location: canberra, reach: "local"   };
check("national seller <-> far local buyer", matches(nationalSeller, farLocalBuyer), false);
const nearLocalBuyer: Party  = { location: sydney,   reach: "local"   };
check("national seller <-> same-city local buyer", matches(nationalSeller, nearLocalBuyer), true);

// 4. Two worldwide parties on opposite sides of the planet: a clean match. A one-person
//    workshop competing globally from a single bench is exactly this case.
const globalMaker: Party = { location: canberra, reach: "worldwide" };
const ukBuyer: Party     = { location: london,   reach: "worldwide" };
check("worldwide maker <-> worldwide buyer", matches(globalMaker, ukBuyer), true);

// 5. Size-neutrality. A large national operation that bounds itself to its own country
//    is invisible to an overseas buyer — by its own choice, not because it's small.
check("country-bounded seller <-> overseas buyer", matches(nationalSeller, ukBuyer), false);

// 6. Distance readout (used by the interactive search demo to show "X km away").
//    Canberra -> Sydney is ~250 km; with no centroid it's null, not a guess.
const dCanSyd = distanceKm(canberra, sydney);
check("distance Canberra<->Sydney is 240-260 km", dCanSyd != null && dCanSyd > 240 && dCanSyd < 260, true);
check("distance is null without a centroid", distanceKm(canberra, { country: "AU" }) === null, true);

// Precision gates tiers: what you can use depends on what you shared.
console.log("\nusable reach, country only :", usableReach({ country: "AU" }).join(", "));
console.log("usable reach, full postcode:", usableReach(canberra).join(", "));

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exitCode = failures === 0 ? 0 : 1;
