# Marcamar project audit

Date: 2026-08-24
Repository: lucasvthomp/Game

## Architecture

- Frontend: React 18 + TypeScript, Vite 5, Wouter, TanStack Query, custom CSS tokens, and Lucide icons.
- Backend: Express 4 + TypeScript, bundled with esbuild for production.
- Database: PostgreSQL through pg and Drizzle schema/types. The prototype runs backwards-compatible startup migrations.
- Authentication: Passport local sessions with scrypt password hashing, PostgreSQL-backed sessions, and optional Google OAuth. API middleware enforces passenger/operator/admin permissions.
- Uploads: Multer with local storage in development and ephemeral `/tmp/uploads` in production.
- Maps: React Leaflet/OpenStreetMap. Existing components support ride markers and manual pin placement.
- Providers: marine weather and payments are behind server-side provider boundaries.
- Deployment: Railway Nixpacks configuration using `npm run build` and `npm start`.

## Reused and extended

- Portuguese landing page, coastal city autocomplete, date/passenger search, trip results, map toggle, trip details, reservations, messaging, check-in, incidents, reviews, and operator onboarding were preserved.
- Custom site dropdown/autocomplete controls are used instead of native select widgets.
- Structured `locations` and `maritime_routes` tables, manual admin route activation, marine condition display, notifications, and provider abstractions were extended rather than replacing the existing stack.
- The shared layout polish and responsive page gutters were kept as the visual baseline.

## Route-request feature added in this increment

- Authenticated passengers can open **Pedir esta rota** from an empty search result.
- `route_requests` stores origin, destination, requested date, passenger count, notes, status, and admin notes.
- `POST /api/route-requests` validates and records a request; `GET /api/my/route-requests` returns the passenger's history.
- Admins can review and advance requests through received, analysis, possible match, and closed states at `/admin`.
- Status changes create an in-app notification for the requesting passenger.
- `README.md` and `MVP_STATUS.md` document setup and honest implementation status.

## Risks and follow-up

1. Move startup SQL into versioned migrations before concurrent production deploys.
2. Add transaction-safe capacity reservation and a full booking/payment state machine before paid pilots.
3. Replace profile-level verification flags with per-document verification records, private object storage, access controls, expiry jobs, and audit history.
4. Add visual route polyline/waypoint editing and route-linked pickup points to the admin surface.
5. Configure a production payment provider and commercial marine-weather account; do not claim modeled conditions are a safety certification.
6. Move uploads to durable private object storage with file validation, malware scanning, and retention/deletion workflows.
7. Add a test suite for authorization, route requests, capacity, payment idempotency, cancellations, provider failures, and document expiration.

## MVP implementation order

1. Foundation: schema/migrations, secure sessions, roles, locations, maritime routes.
2. Marketplace: trip publishing, passenger search/results, trip detail, booking.
3. Trust and operations: verification/admin, notifications, incidents, cancellations, reviews.
4. Conditions and money: marine provider/cache and payment provider boundary.
5. Demand capture: route requests with admin follow-up and notifications.
6. Polish: responsive UI, Portuguese copy, accessibility, performance, docs, and Railway checks.
