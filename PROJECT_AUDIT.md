# Marcamar project audit

Date: 2026-08-24
Repository: lucasvthomp/Game
Base audited: main

## Existing architecture

- Frontend: React 18 + TypeScript, Vite 5, Wouter routing, TanStack Query, custom CSS design tokens, Lucide icons.
- Backend: Express 4 + TypeScript, bundled with esbuild for production.
- Database: PostgreSQL via pg and Drizzle schema/types. The current server also creates and alters tables directly during startup.
- Authentication: Passport local sessions with scrypt password hashing, PostgreSQL-backed sessions, and optional Google OAuth. Roles currently include passenger, captain, driver, and both.
- Storage/uploads: Multer writes uploaded images to uploads locally and /tmp/uploads in production.
- Maps: React Leaflet/OpenStreetMap. The existing map layer supports ride markers and optional click-to-place origin/destination pins.
- Deployment: Railway Nixpacks configuration (npm run build, then npm run start).

## Reusable product functionality

Already present and worth preserving:

- Portuguese landing page with route search, live boat-ride feed, map section, recurring-route messaging, trust sections, and operator CTA.
- Authentication and account/profile flows.
- Captain and driver onboarding forms with document/image upload fields and verification flags.
- Ride publishing for boat/car rides, ride search/filter/sort, ride detail pages, reservations, cancellation, reservation messaging, and reviews.
- Responsive navigation, mobile bottom navigation, design tokens, media assets, and map components.
- Rate limiting, Helmet, parameterized database access through the storage layer, and password hashing.

## Gaps against the MVP specification

High-priority missing capabilities:

- No structured locations or maritime_routes entities; routes are still free-text city pairs with optional coordinates.
- No approved maritime GeoJSON/polyline route model or route-management UI.
- No marine weather provider abstraction or Open-Meteo integration/cache.
- No operator/admin dashboard, role-based admin controls, verification queue, incident handling, audit log, or document expiry workflow.
- No real payment integration despite a legacy stripe_payment_intent_id column; no payment intent/webhook/commission/payout flow.
- No booking state machine matching the requested payment/check-in/completion states.
- No trip-day experience, check-in, live tracking, emergency flow, notifications, or analytics.
- Search is not yet a desktop split list/map experience with route-linked highlighting and structured meeting points.
- Search form does not yet include the requested date and passenger fields on the landing page.
- No automated test suite or CI workflow.
- No .env.example documenting required production variables.
- The default session secret falls back to a development literal; production must fail closed when SESSION_SECRET is missing.
- Production uploads use ephemeral /tmp; vessel/operator media needs durable object storage before production.
- Startup SQL migrations are useful for the prototype but should move to versioned migrations before concurrent production deploys.

## Migration risks

1. Adding structured locations/routes must preserve legacy ride city fields and existing records.
2. Introducing a booking state machine must map existing confirmed/cancelled reservations without breaking current UI.
3. Payments require idempotent server-side webhooks and reconciliation before exposing paid states.
4. Replacing Leaflet with another provider is unnecessary risk; add a provider interface around the existing map first.
5. Weather data is informational only and must not be represented as a safety guarantee.
6. Moving uploads to object storage requires preserving existing URLs and access controls.
7. Admin permissions must be enforced in API middleware, not only hidden in the UI.

## Recommended implementation order

1. Add .env.example, versioned migration strategy, secure session configuration, and baseline tests.
2. Introduce structured locations and approved maritime_routes, with a manual route/admin fallback.
3. Extend search and the results/map experience with date, passengers, meeting points, and route data.
4. Add operator/vessel verification states and a protected admin review surface.
5. Add the marine weather provider abstraction, cached condition summaries, and trip-page display.
6. Implement the reservation/payment state machine with provider webhooks and commission accounting.
7. Add confirmation, messaging/notifications, check-in, completion, reviews, cancellation, and incident workflows.
8. Add analytics, seed/demo routes, accessibility/performance QA, and Railway deployment checks.

## MVP status

The repository is a functioning prototype with a strong base for the passenger/operator browsing and booking loop. It is not yet the full marketplace MVP described in the build instructions. The highest-value next slice is structured approved maritime routes plus date/passenger search, followed by verification/admin and payments.
