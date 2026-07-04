---
name: Dorshi Resort booking app migration
description: Key decisions from migrating the Next.js booking app to Vite+React + Express on Replit pnpm workspaces
---

## Rules & Decisions

**Routing**: artifact.toml routes `/api/*` → Express (port 8080) and `/*` → Vite (port 20508). No proxy config in vite.config.ts needed.

**Bookings use SERIALIZABLE transactions**: `atomicCreateBooking` in `artifacts/api-server/src/lib/db-ops.ts` runs overlap checks inside a serializable transaction with up to 3 retries for `40001` (serialization failure) errors.

**Room seeding**: 6 rooms are pre-loaded via `lib/db/src/seed.ts`. Run: `cd lib/db && pnpm tsx src/seed.ts`. Uses `onConflictDoNothing` so it's idempotent.

**Zod must be installed per-package**: It's not hoisted. Both `@workspace/api-server` and `@workspace/booking-app` need `zod` in their own package.json.

**nanoid in api-server**: Booking IDs are `BK-XXXXXX` format using `nanoid`. Must be in api-server deps.

**Why:** Replit pnpm workspace doesn't always hoist peer deps; explicit package-level installs are safer.
