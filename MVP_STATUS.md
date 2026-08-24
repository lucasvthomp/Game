# MVP status

Updated: 2026-08-24

This repository is a working Marcamar MVP prototype. It is intentionally a maintainable monolith and keeps the existing passenger/operator flows while adding the marketplace foundations described in the build brief.

## Complete in the current prototype

- Portuguese, responsive landing page and shared navigation
- Custom site dropdown/autocomplete controls
- Passenger search by origin, destination, date, and passenger count
- Boat trip results with list/map toggle, sorting, price filtering, and empty states
- Trip detail, reservations, cancellation, payment-provider boundary, messaging, check-in, completion, incidents, and reviews
- Local coastal location suggestions and approved maritime route records
- Marine weather provider abstraction with an informational disclaimer
- Captain/driver onboarding and API-enforced verification gates
- Admin review surfaces for operator verification, maritime routes, incidents, and route requests
- In-app notifications
- Route-request flow: a passenger can request an unavailable origin/destination/date/passenger combination, and admins can move it through received, analysis, possible match, and closed states
- Startup migrations, CI type/build checks, production session-secret fail-closed behavior, and Railway deployment configuration

## Partially complete / needs production hardening

- Verification is currently modeled with legacy captain/driver profile flags; the full per-document verification record and secure private document store still need to be introduced.
- Maritime routes have structured records and manual admin activation, but visual polyline editing and route-waypoint tooling are not finished.
- Payments are provider-abstracted and can use a configured provider, but production PIX/card reconciliation, webhooks, refunds, and payouts still require a selected Brazilian provider and credentials.
- Weather is cached/provider-abstracted at the application boundary but still needs a production commercial account and broader route sampling.
- Uploads use local/ephemeral storage in Railway; durable private object storage is required before handling real identity documents.
- Booking capacity and payment state transitions need database transactions and a full concurrency test suite before paid pilots.
- The admin dashboard is a useful prototype surface, not yet the complete operations/financial/safety console.

## Not implemented or blocked by external decisions

- Automated identity/liveness and maritime-document verification
- Private object storage, malware scanning, and document retention/deletion workflows
- Live GPS tracking and operator trip-day location sharing
- Full email/WhatsApp/SMS notification delivery
- Production payment provider, legal/compliance review, and Brazilian maritime operating policies
- Full i18n catalog, analytics warehouse, scheduled expiry jobs, and native apps

See [PROJECT_AUDIT.md](PROJECT_AUDIT.md) for the original audit, reuse decisions, and migration risks.
