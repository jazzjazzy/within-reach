# Within Reach

*A local-first marketplace, worldwide by choice.*

Online marketplaces collapsed a rich question — *where* do you want to buy and sell — into a single answer: everywhere. This is a proposal for putting that choice back.

The idea: buyer and seller each set how far they'll reach — local, state, country, or worldwide — and a listing appears only where the two reaches **overlap**. It sorts by where you are and how far you'll go, never by who you are or how big, so the same rules serve a backyard grower and a national operation. Local first, but not local-only. And it makes room for the trade global platforms structurally can't host — the produce that won't ship, the thing handed over between neighbours.

This repository is **a white paper and a worked reference, not a product.** There's no service to sign up for here. The hope is that someone better placed to run it picks the idea up and builds it.

## The whole mechanic

Almost none of this is new. A marketplace already needs listings, accounts, carts, payments, messaging — all of which have been built and given away many times over. You fork one of those. The only new part is a thin layer that adds **two fields** to each side and applies **one rule**:

```
visible = (seller.location within buyer.reach) and (buyer.location within seller.reach)
```

Each side's reach is read outward from their *own* location, turning a tier into a region. A listing matches a search only when each party falls inside the other's region — both sides covering the same ground. That's the entire thing.

## What's in here

```
within-reach/
├── docs/                      the idea, in full
│   ├── within-reach-whitepaper.md      ← start here
│   ├── within-reach-whitepaper.pdf
│   └── figure-*.svg
└── reference/                 the one new part, as runnable code
    ├── reach.ts               types, the region logic, and the matching rule
    └── demo.ts                worked examples / a self-check
```

The white paper is the argument. The reference is a single small example proving the rule holds up — it is **illustrative, not a deployable kit**. Take it as a sketch to save you a blank page, not something to drop into a system as-is.

## Running the reference

```bash
cd reference
npm install
npm run demo
```

You should see every canonical case pass: a local-only seller reachable by a nearby buyer but not a distant one; a national seller invisible to an overseas buyer by its own choice; precision gating which tiers a participant can use.

## Status

Early. The idea is complete; the code is a seed. A few things are deliberately left open for whoever builds it:

- **How deep "local" goes.** The floor is an exact same-postcode match — no geographic data, works on day one. The richer version is a radius around your postcode centroid (the reference does both). That's the one place real effort lives, and it's optional.
- **Substrate.** A single self-hosted platform or a federated protocol across many instances — the reach layer works the same on either. The builder's call, not the idea's.
- **Licence.** Not yet chosen. The trade-off is permissive (MIT/Apache — maximally forkable, but closed forks are allowed) versus copyleft (AGPL — keeps forks open). See the white paper's "Kept Open" section for the intent.

## The idea is free

It's set down here in public and dated, as prior art, so the core idea can't be quietly patented and fenced off. The reference is open source. Anyone can fork it and stand up their own. Nobody owns this, because there's nothing at the centre to own — that's the point of it, not a gap in it.

*(This describes intent, not legal advice. If formal defensive publication matters to you, take proper counsel.)*

## If you want to build it

Fork an engine or write your own; make "local" mean whatever fits your corner of the world; light the first market with people who already know each other. The idea only becomes something if someone is moved to make it. If that's you — go.
