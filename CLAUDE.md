# Within Reach — working context

This file orients a Claude Code session. Read it, then look at `docs/within-reach-whitepaper.md`
(the idea in full) and `reference/reach.ts` (the one new part, as code).

## What this project is

A white paper proposing a **theory of searchability for any buy/sell marketplace**, plus a
small reference implementation. It is *not* a product and not a deployable marketplace. The
deliverable is the idea and a worked example of its one novel piece.

The idea: buyer and seller each set a geographic **reach** (local / state / country / worldwide);
a listing is visible only where the two reaches **overlap**. It sorts by where you are and how
far you'll go, never by size. Local-first but not local-only.

## The only new part

Everything that matters is the "reach layer": **two fields** (`location`, `reach`) on each side
and **one rule**:

```
visible = (seller.location within buyer.reach) and (buyer.location within seller.reach)
```

Reach is read outward from each party's *own* location, turning a tier into a region; a match
fires only when each party's location sits inside the other's region. The commerce engine
underneath (listings, accounts, carts, payments) is assumed forked from an existing open-source
platform — **do not build it.** Build only the reach layer.

## Data model (settled)

- `location`: most precise geo-id the participant chooses to share. `country` always; `state`,
  `postcode`, and lat/lng (postcode centroid) optional. Precision gates which reach tiers are
  usable (`usableReach`).
- `reach`: enum of the four tiers; `worldwide` is the absence of a limit. Stores no place name —
  the region is always derived from `location`.
- `local`: the floor is an exact same-postcode match (no geo data, day-one). The richer version
  is a radius from the postcode centroid. Both are in `reference/reach.ts`; which one a build
  ships is the builder's choice.

## Scope discipline (important)

- Start absurdly small. This is a seed, not a platform. Don't over-scope.
- Spec-first. The reference is illustrative, not a kit — keep it readable and minimal over
  feature-complete.
- The engine is forked/assumed, not in scope. New code = the reach layer and things that
  directly demonstrate it.
- Substrate (single platform vs federated protocol) is left open on purpose — don't pick one
  unless asked.
- Stay country-neutral in docs and examples where it's about the model itself; a reader should
  be able to picture their own country. (The white paper's Problem section keeps one deliberate
  first-person Australian anecdote — that's intentional, leave it.)

## Likely next steps (not yet done)

- A formal `spec/reach-layer.md` — the normative version of the data model + rule, so the
  reference and the prose both point at one source of truth. Worth doing before the reference grows.
- A choice of licence (see README "Status" — MIT/Apache vs AGPL trade-off). Jason's call.
- Tests beyond the demo's inline checks, if/when the layer grows.

## Reference code

- TypeScript, dependency-free except `tsx` to run the demo. `cd reference && npm install && npm run demo`.
- `reach.ts` is the library; `demo.ts` is worked examples that double as a self-check (every line
  should print PASS). Keep that property — if you change the logic, the demo must still pass and
  should gain a case for whatever you changed.

## Working style

- Peer register. Direct, honest diagnosis over validation — name problems, contradictions, and
  overreach plainly rather than smoothing them over. Flag overclaims even when they're convenient.
- en-AU spelling.
- Dry humour is fine; AI-polished filler is not. No throat-clearing, no "great question".
- Working rhythm: draft → show → get an explicit OK → *then* commit. Don't draft, commit, and
  build in one swing.
- Jason works partly by voice-to-text, so occasional homophone typos are transcription noise, not
  meaning — read for intent.
