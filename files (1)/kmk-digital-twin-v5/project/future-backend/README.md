# Future backend (reserved, not currently active)

This app is a **pure front-end build** right now — no server, no database.
Memories are stored in each visitor's own browser via `localStorage`
(see `src/board/memoryService.ts`).

This folder holds a complete, already-written REST API + Postgres schema
for the memory board, kept aside for when a real shared backend is wanted
(e.g. after the competition, for a live public deployment where memories
should be visible to everyone, not just stored per-device).

## What's here

```
future-backend/
├─ api/
│  ├─ memories/route.ts   # GET (list, optional ?buildingId=) + POST (create)
│  └─ health/route.ts     # GET — simple `select 1` DB health check
├─ db/
│  ├─ schema.ts           # Drizzle schema for the `memories` table
│  └─ index.ts            # Drizzle + node-postgres client (reads DATABASE_URL)
└─ drizzle.config.json
```

## How to reconnect it

1. **Move the code back into the live app:**
   ```bash
   mv future-backend/api      src/app/api
   mv future-backend/db       src/db
   mv future-backend/drizzle.config.json .
   ```
2. **Install the backend packages:**
   ```bash
   npm install drizzle-orm pg dotenv
   npm install -D drizzle-kit @types/pg
   ```
3. **Provision Postgres** (Neon, Supabase, Railway, etc.) and set
   `DATABASE_URL` in your environment / `.env`.
4. **Run the migration** to create the `memories` table:
   ```bash
   npx drizzle-kit push
   ```
5. **Un-exclude this folder** from `tsconfig.json` (remove the
   `"future-backend"` line from `exclude`) — once moved in step 1 there's
   nothing left here to exclude anyway.
6. **Swap `src/board/memoryService.ts`** — each function already has the
   equivalent `fetch()` implementation written out in a comment right below
   the localStorage version. Delete the localStorage body, uncomment the
   fetch version. The function signatures don't change, so nothing else in
   the app (`boardStore.ts`, `MemoryBoard.tsx`, the `/memories` page, etc.)
   needs to be touched.

Total effort: roughly 15–20 minutes, no redesign needed.
