// A tiny demo web server for the reach layer. No framework — Node's built-in http.
//
//   npm run seed     (build the database first)
//   npm run web      (then open http://localhost:5173)
//
// It serves one static page and two JSON endpoints. The page is just a viewer:
// pick who you are, type a search term, and see the listings the reach rule lets
// through. All visibility decisions happen in engine.ts -> reach.ts; the server
// only moves rows and JSON around. This is the forked "engine" stubbed to the
// thinnest thing that shows the reach layer — not a real marketplace.

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb, DB_PATH, listUsers, listSellers, getUser, hydrate } from "./db.js";
import { usableReach } from "./reach.js";
import { search, matchSellers, catalogue } from "./engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8137;
const PAGE = join(__dirname, "public", "index.html");
const CATALOGUE_PAGE = join(__dirname, "public", "catalogue.html");

if (!existsSync(DB_PATH)) {
  console.error("No database found. Seed it first:  npm run seed");
  process.exit(1);
}

const db = openDb();

function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(json);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  // The page.
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(readFileSync(PAGE));
    return;
  }

  // The full-catalogue page.
  if (req.method === "GET" && (url.pathname === "/catalogue" || url.pathname === "/catalogue.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(readFileSync(CATALOGUE_PAGE));
    return;
  }

  // Every listing, grouped by seller (no reach rule applied).
  if (req.method === "GET" && url.pathname === "/api/catalogue") {
    sendJson(res, 200, catalogue(db));
    return;
  }

  // The buyers you can act as, with their home town and which reach tiers their
  // shared precision actually allows.
  if (req.method === "GET" && url.pathname === "/api/users") {
    const users = listUsers(db).map((u) => {
      const h = hydrate(db, u);
      return { id: h.id, name: h.name, town: h.town, reach: h.reach, usable: usableReach(h.location) };
    });
    sendJson(res, 200, { users });
    return;
  }

  // Every seller, plain (for the right-hand column before a buyer is picked).
  if (req.method === "GET" && url.pathname === "/api/sellers") {
    const sellers = listSellers(db).map((s) => {
      const h = hydrate(db, s);
      return { id: h.id, name: h.name, town: h.town, reach: h.reach };
    });
    sendJson(res, 200, { sellers });
    return;
  }

  // Every seller scored against a chosen buyer's reach (matched / not, with reason).
  if (req.method === "GET" && url.pathname === "/api/match") {
    const userRow = getUser(db, url.searchParams.get("user") ?? "");
    if (!userRow) {
      sendJson(res, 400, { error: "Unknown user" });
      return;
    }
    sendJson(res, 200, matchSellers(db, userRow));
    return;
  }

  // A search as a chosen buyer.
  if (req.method === "GET" && url.pathname === "/api/search") {
    const userId = url.searchParams.get("user") ?? "";
    const term = (url.searchParams.get("q") ?? "").trim();
    const userRow = getUser(db, userId);
    if (!userRow) {
      sendJson(res, 400, { error: `Unknown user: ${userId || "(none)"}` });
      return;
    }
    if (term === "") {
      sendJson(res, 400, { error: "Empty search term" });
      return;
    }
    sendJson(res, 200, search(db, userRow, term));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Pick another:  PORT=8200 npm run web`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Within Reach demo running at  http://localhost:${PORT}`);
  console.log("Pick a buyer, search a term, see only what's within reach. Ctrl-C to stop.");
});
