// Within Reach — reference implementation of the "reach layer".
//
// This is illustrative, not a deployable kit. The white paper in ../docs is the
// idea; this file is one worked example showing the single matching rule holds up.
// Everything distinctive about the model lives here, and it is deliberately small:
// two fields on each side (location, reach) and one rule.
//
// Run the worked examples with:  npm run demo

/** The four reach tiers. `worldwide` is simply the absence of a limit. */
export type ReachTier = "local" | "state" | "country" | "worldwide";

/**
 * A participant's location, given at whatever precision they choose to share.
 * Coarser detail gates which reach tiers they can use (see `usableReach`):
 *   - country  : always required — the coarsest unit.
 *   - state    : optional — needed for the `state` tier.
 *   - postcode : optional — needed for the `local` tier (exact-match floor).
 *   - lat/lng  : optional — the postcode centroid, needed for radius-based local.
 *
 * The reach field stores no place name of its own; the region is always derived
 * from this location, read outward to the chosen tier.
 */
export interface Location {
  country: string;   // e.g. "AU"
  state?: string;    // e.g. "ACT"
  postcode?: string; // e.g. "2600"
  lat?: number;      // postcode centroid latitude
  lng?: number;      // postcode centroid longitude
}

/** One side of a trade: where you are, and how far you'll go. */
export interface Party {
  location: Location;
  reach: ReachTier;
}

/**
 * What "local" means is the one thing a builder gets to choose.
 *   - radiusKm: null  -> "local" is the same postcode, exactly. The day-one floor:
 *                        no geographic data needed, shippable immediately.
 *   - radiusKm: number -> "local" is everything within that many km of the
 *                        participant's own postcode centroid. Needs centroids,
 *                        but it's the version that actually feels like "near me".
 */
export interface LocalConfig {
  radiusKm: number | null;
}

const DEFAULT_LOCAL: LocalConfig = { radiusKm: 25 };

/** Great-circle distance in km between two located points, or null if either lacks a centroid. */
function distanceKm(a: Location, b: Location): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Is `target` inside the region defined by reading `origin`'s location out to `tier`?
 *
 * This is the heart of it: a reach tier is never an absolute area, it's measured
 * FROM the participant's own location. "Country" means *my* country; "local" means
 * the area around *me*. So a tier plus a location becomes a concrete region, and
 * containment is just: does the other party's location fall inside it?
 */
export function within(
  target: Location,
  origin: Location,
  tier: ReachTier,
  local: LocalConfig = DEFAULT_LOCAL,
): boolean {
  switch (tier) {
    case "worldwide":
      return true; // no limit — everyone is inside

    case "country":
      return target.country === origin.country;

    case "state":
      // need to know the origin's state to draw a state region at all
      return (
        target.country === origin.country &&
        !!origin.state &&
        target.state === origin.state
      );

    case "local": {
      // floor: same postcode, exact match — no geo data, works on day one
      if (local.radiusKm == null) {
        return !!origin.postcode && target.postcode === origin.postcode;
      }
      // richer: within a radius of the origin's postcode centroid
      const d = distanceKm(origin, target);
      // no centroid to measure with -> fall back to the floor rather than over-match
      if (d == null) {
        return !!origin.postcode && target.postcode === origin.postcode;
      }
      return d <= local.radiusKm;
    }
  }
}

/**
 * THE RULE.
 *
 * A listing is visible to a buyer only when both sides cover the same ground:
 * the seller sits inside the buyer's reach, AND the buyer sits inside the
 * seller's reach. Both have to say yes to the same geography. Everything else
 * in this file is in service of these two lines.
 */
export function matches(
  seller: Party,
  buyer: Party,
  local: LocalConfig = DEFAULT_LOCAL,
): boolean {
  const sellerInBuyersReach = within(seller.location, buyer.location, buyer.reach, local);
  const buyerInSellersReach = within(buyer.location, seller.location, seller.reach, local);
  return sellerInBuyersReach && buyerInSellersReach;
}

/**
 * Which reach tiers a participant can actually use, given the precision they
 * shared. The precision you give is the precision you get: share only a country
 * and `local`/`state` simply aren't on the menu for you.
 */
export function usableReach(loc: Location): ReachTier[] {
  const tiers: ReachTier[] = ["worldwide", "country"];
  if (loc.state) tiers.push("state");
  if (loc.postcode) tiers.push("local");
  return tiers;
}
