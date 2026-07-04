# Dorshi Holiday Resort cum Restaurant

A hotel booking web app for Dorshi Holiday Resort — guests can browse available rooms, make reservations, cancel bookings, and view a photo gallery.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/booking-app run dev` — run the frontend (port 20508, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `cd lib/db && pnpm tsx src/seed.ts` — seed room data into the database
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Framer Motion
- API: Express 5 + Pino logging
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, `drizzle-zod`, `react-hook-form` + `@hookform/resolvers`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/booking-app/` — Vite+React frontend
  - `src/components/chat/` — main layout (ChatPage, ChatHeader, SuggestionChips)
  - `src/components/booking/BookingFormCard.tsx` — room booking form with date picker, room selector, price summary
  - `src/components/cancellation/CancellationFormCard.tsx` — lookup + cancel flow
  - `src/components/photos/PhotoGallery.tsx` — masonry gallery with lightbox
  - `src/types/booking.ts` — shared TypeScript interfaces
- `artifacts/api-server/` — Express API server
  - `src/routes/` — rooms, bookings, cancellations, webhooks
  - `src/lib/db-ops.ts` — all DB operations (serializable transactions, optimistic locking)
  - `src/lib/validation.ts` — Zod schemas for request validation
- `lib/db/` — Drizzle ORM schema + migrations
  - `src/schema/rooms.ts`, `src/schema/bookings.ts` — DB tables
  - `src/seed.ts` — seeds 6 rooms (2 Standard, 2 Deluxe, 2 Suite)
- `lib/api-spec/openapi.yaml` — OpenAPI 3.0 spec (source of truth for codegen)
- `artifacts/booking-app/public/assets/` — 34 resort images (.webp)

## Architecture decisions

- **Serializable transactions for bookings**: `atomicCreateBooking` runs in `SERIALIZABLE` isolation with retry logic to prevent double-bookings without application-level locks.
- **Routing via artifact.toml**: The Replit proxy routes `/api/*` to the Express server (port 8080) and `/*` to the Vite dev server (port 20508) — no manual proxy configuration needed in Vite.
- **Rooms are seeded, not CMS-managed**: 6 rooms are pre-defined via `lib/db/src/seed.ts`; run with `pnpm tsx src/seed.ts` from `lib/db/`.
- **No Redis/Upstash, no Twilio**: Rate limiting omitted for simplicity; SMS/Sheets integrations are non-blocking side effects not implemented in this migration.
- **Webhook auth via shared secret**: `SHEETS_WEBHOOK_SECRET` env var must be set for the `/api/webhooks/sheets` endpoint to accept requests.

## Product

- **Home** — animated welcome screen with three navigation cards: Book, Cancel, Gallery
- **Book Your Stay** — select dates → fetch available rooms → fill guest details → confirm (with price summary + tax)
- **Cancel Booking** — enter name & phone → lookup existing booking → review details → confirm cancellation
- **Photo Gallery** — filterable masonry grid with lightbox for 34 resort photos

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After schema changes, run `pnpm --filter @workspace/db run push` then re-seed if needed.
- The API server must be running for booking/cancellation flows to work; the frontend gracefully shows errors if the API is down.
- `nanoid` is used in `api-server` for booking IDs (`BK-XXXXXX` format).
- Zod must be installed in both `@workspace/api-server` AND `@workspace/booking-app` — it's not hoisted.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
