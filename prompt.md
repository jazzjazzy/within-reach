We're moving to the next step on the Within Reach reference: an interactive
demo backed by a real database, so we can pick a user, search for something,
and see only the sellers whose reach overlaps ours — the matching rule working
end to end over real-ish data.

Read these first, in order:
  1. CLAUDE.md (project context and scope discipline)
  2. whitepaper/within-reach-whitepaper.md — focus on "How It Works" and
     "Technical Architecture"
  3. reference/reach.ts and reference/demo.ts — the reach layer and its self-check

Goal: a SQLite-backed seed dataset plus an interactive command-line demo where I
choose which user I am, enter a search term, and get back the listings I'm
allowed to see — filtered strictly by the reach-overlap rule relative to that
user.

Database and architecture:
  - Use SQLite via better-sqlite3. Provide a schema/migration and a seed script.
  - The matching rule stays in reference/reach.ts. Do NOT reimplement reach or
    overlap logic in SQL. SQL is for storage, text search on the listing, and at
    most a coarse pre-filter (e.g. by country). The authoritative step is:
    hydrate candidate rows into the reach.ts types (Location, Party) and call
    matches(seller, user) in TypeScript to decide visibility.
  - Keep the .db file out of git (add to .gitignore); seeding recreates it.

Scope guardrails:
  - Build ON TOP of reference/reach.ts. Import matches/within/usableReach from it.
  - This is a reference, not a kit. An interactive CLI is fine; no web server, no
    framework, no auth, no payments — none of the forked-engine parts.
  - Match the data shapes in reach.ts exactly. Keep the existing demo.ts
    self-check passing.
  - Node's built-in readline for interaction — no extra interaction libraries.
  - en-AU spelling.

The dataset should include:
  - A geographic reference set: ~6-10 postcodes with name, state, country and
    lat/lng centroids, realistic enough that the default 25 km local radius
    behaves sensibly. Include same-town, nearby-cross-border, far-same-country,
    and overseas points.
  - A handful of users (searchers), each with a location and a default reach —
    a mix of local, country, and worldwide, including at least one who shared
    only their country (so precision-gating shows up).
  - Sellers with listings, each listing having a title, price, and the seller's
    location + reach, covering:
      * a non-shippable local-only seller (e.g. lemons or eggs, reach: local)
      * a maker who ships nationally (reach: country)
      * a one-person workshop selling something niche worldwide (reach: worldwide)
      * a large operation bounded to its own country (reach: country), to show
        size-neutrality
      * at least one service rather than a good (e.g. a tutor or repairer)

The interactive demo should:
  - List the users and let me pick one — that sets who I am, with my location
    and reach.
  - Prompt me for a search term, match it against listing titles, then show only
    the listings whose seller passes matches(seller, me).
  - For each result show the seller, the listing, and how far away/which tier
    matched. Optionally show what got filtered out and why (e.g. "3 listings
    matched your search but sit outside your reach").
  - Loop so I can search again or switch user, and exit cleanly.
  - Be runnable with a single command wired into package.json (e.g. npm run demo
    or npm run search), with a separate seed command (e.g. npm run seed).

Process: read the files, then propose a brief plan first — the schema, the file
list, and one or two sample seed records — for my OK before generating
everything. Once I approve, build it, seed it, run it, and confirm the existing
demo.ts self-check still passes.
