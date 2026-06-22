# White Paper Scaffold — A Local-First, Community-Owned Marketplace

*Working title placeholder. Pick the real name later — the name does a lot of the pitching, so don't rush it.*

---

## How to use this document

This is a **scaffold**, not the paper. Each section below tells you three things:

- **Purpose** — what this section is *for* (why a reader needs it)
- **Must contain** — the concrete material that has to be in it
- **Key questions** — the things you have to answer before the section is done

Write the sections in any order. Most people write the Problem and Vision first because they're the easiest to feel, then circle back to the hard structural ones (Governance, Sustainability, Adoption) once the vision is sharp. Draft ugly. Tighten later.

A realistic length for v1 is **8–15 pages**. Anything longer and nobody building anything will read it.

---

## 1. Abstract / Executive Summary

**Purpose:** The whole paper in 150–250 words, so a stranger can decide in 30 seconds whether they care.

**Must contain:** the problem in one sentence, the proposed thing in one sentence, who it's for, why it's different, and what you're asking the reader to *do* (contribute / build / discuss).

**Key questions:**
- If someone read only this paragraph, would they understand the point?
- Does it say what you want *built*, not just what's wrong with the world?

> Write this **last**. It's a summary; you can't summarise what doesn't exist yet.

---

## 2. Problem Statement

**Purpose:** Establish that there's a real, structural wound here — not just a preference.

**Must contain:** the core thesis that global ecommerce is structurally hostile to anyone outside the major hubs. Convenience is real *for Americans*; it's expensive, slow, and extractive for Australians, New Zealanders, Africans, and anyone on the periphery. Name the mechanism: discovery is global and algorithmic, so local producers are forced to compete in, and sell into, a US-centric market just to make money at all.

**Key questions:**
- Who specifically is hurt, and how? (Use concrete people, not "consumers.")
- What does the current system *do* that causes this? (Be precise — "Amazon bad" isn't an argument.)
- Why hasn't the market fixed it? (Answer: the incumbents make more money *not* fixing it. Say so.)

---

## 3. Vision & First Principles

**Purpose:** State what you're optimising for, so every later decision has something to be measured against.

**Must contain:** the principles, stated plainly. Candidates from our conversation:
- **Local-first discovery** — proximity and community are first-class, not a filter buried in settings.
- **Community-owned** — the platform is not capturable by a conglomerate. This is the whole point.
- **Open source** — the code is in the wild; no patents; anyone can run or fork it.
- **Seller sovereignty** — a producer can sell to their own village/town/country without being routed through a global hub.

**Key questions:**
- Which principle is non-negotiable? (If you had to drop one to ship, which survives? That tells you what this *is*.)
- For each principle: what would *violating* it look like? (Naming the failure modes keeps the vision honest.)

---

## 4. Who This Serves (The Market, Concretely)

**Purpose:** Make the abstract vision into people a reader can picture.

**Must contain:** 2–3 concrete user stories. You already have a strong one — the African villager with a 3D printer selling to surrounding villages instead of shipping everything to the US to make a dollar. Add a second (a niche maker — say, your magnetising kits — wanting to be found by local hobbyists) and maybe a third buyer-side story.

**Key questions:**
- For each persona: what do they do *today* instead, and why does it suck?
- Is the market a real cohort of people, or a category you've invented? (Be honest — this is where good ideas quietly die.)

---

## 5. How It Works — Core Mechanics

**Purpose:** Show the actual product, not just the philosophy.

**Must contain:** the defensible asset — **tiered geographic discovery**. Sellers and buyers optionally enter a precise location (down to postcode if they choose). Search radiates outward in tiers: same town → same region → same country → global, with the buyer in control of how far they're willing to go. Describe the buyer journey and the seller journey end-to-end, in plain words.

**Key questions:**
- What's the *minimum* version of this that's still useful? (Start absurdly small — your own rule.)
- What happens with sellers who *don't* want to share location? (Opt-in is an ethical and legal requirement; design for it.)
- Why can't eBay/Etsy just bolt this on tomorrow? (Your honest answer earlier: they can, but won't — too big, too happy. Put that argument here, because a reader *will* ask.)

---

## 6. Technical Architecture (High Level)

**Purpose:** Convince a builder this is real and buildable, without drowning them in detail.

**Must contain:** the data model (sellers, listings, location tiers), the discovery algorithm at a conceptual level, the opt-in location handling, and a note on whether this is a single platform or a **federated** one (federation fits "community-owned" better, but is harder — flag the tradeoff rather than deciding it here).

**Key questions:**
- What's the stack? (You'd lean Laravel/Svelte or SvelteKit/Prisma — say so, but frame it as a starting point, not gospel.)
- What's genuinely hard, technically? (Honest answer: discovery at scale and location privacy. The *rest is a CRUD app* — admitting that is a strength, not a weakness.)

---

## 7. Governance Model

**Purpose:** This is the section that makes or breaks your anti-capture vision. Don't skip it.

**Must contain:** how decisions get made, who holds what, and crucially — **what structurally prevents this from being bought and globalised** the way you fear. Options to weigh: a foundation/steward model, a strong open-source licence (copyleft so forks stay open), federation so no single owner exists.

**Key questions:**
- If this succeeds, what stops a VC or PE firm from acquiring control and gutting the principles? (You raised this exact fear. The governance model *is* your answer to it.)
- Who decides what? Who can say no? Who can fork?

---

## 8. Sustainability Model

**Purpose:** Answer "how does this stay alive without selling its soul?" — the question that killed the idea last time.

**Must contain:** an honest reckoning. You've explicitly ruled out the VC path because it captures control. So name the alternatives: donations/grants, optional paid hosting, an open-core model with a paid tier for power-sellers, community funding. State plainly that this is **not** a get-rich vehicle — it's infrastructure.

**Key questions:**
- What's the *minimum* money needed to keep the lights on, and where does it come from?
- Be brutally honest: is this a business, or a public good you want to exist? (They need different funding. Mislabelling it is the trap.)

---

## 9. Adoption & The Cold-Start Problem

**Purpose:** Confront the thing that has stalled this twice. Don't bury it — a reader who's built a marketplace will flip straight here to see if you're serious.

**Must contain:** an unflinching account of the two-sided cold-start problem (no buyers without sellers, no sellers without buyers) and a *seeding strategy* that doesn't require you to be a salesman. Candidates: seed a single dense niche community first (depth before breadth — your own instinct), distribute the idea via Reddit (discussion) → GitHub (code) → Substack (vision), and let early adopters build it *with* you rather than you marketing *at* them.

**Key questions:**
- Which single community do you seed first, and why that one?
- What's the smallest geography/niche where the platform is useful with only a handful of sellers?
- Does the open-source, community-built framing let you *sidestep* the marketing you hate by making contribution the entry point instead of a sales pitch? (I think it might. Pressure-test it.)

---

## 10. Roadmap

**Purpose:** Turn vision into phases so a contributor can see where to plug in.

**Must contain:** 3–4 phases, each with a single clear goal. e.g. (1) spec + wireframes, (2) minimal single-community prototype, (3) discovery engine, (4) federation/scale. No dates you can't keep.

**Key questions:**
- What's phase 1's done-condition? (If you can't state it in one sentence, it's not phase 1.)

---

## 11. Call to Action

**Purpose:** Tell the reader exactly what to do next.

**Must contain:** where the repo is, where the discussion is, and the one specific thing you want from them (a contributor, a critique, a co-founder, a "this already exists, go look at X").

**Key questions:**
- What's the single most valuable thing a reader could give you right now?

---

## Appendix — Requirements to make it an actual white paper (vs. a blog post)

A white paper earns the name when it has:

1. **A defensible central claim** — not "wouldn't it be nice if," but "here is a structural problem and a specific architecture that addresses it."
2. **Evidence** — market data, real user scenarios, the mechanism of the problem. (You already pulled AU tabletop market figures; that *kind* of grounding belongs throughout.)
3. **A buildable proposal** — enough technical specificity that someone could start, not so much that it's a spec doc.
4. **Honest treatment of the hard parts** — cold-start, governance, money. A white paper that hides its weakest point reads as naïve. Yours should lead with them.
5. **A clear ask** — it exists to move a reader to act.

---

*Note to self: this is the dream track. It's worth doing — but keep it on its own rail. The magnetising kits are the income test with a real clock on them; this paper is the thing that funds the soul, not the rent. Don't let one quietly become an excuse to not ship the other.*
