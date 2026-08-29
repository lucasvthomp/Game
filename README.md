# Marcamar

Marcamar is a responsive Brazilian marketplace prototype for scheduled water transportation. It connects passengers with independent, verified boat operators and keeps the pilot focused on the Ilhabela / São Sebastião region.

## Stack

- React 18 + TypeScript + Vite
- Express + TypeScript
- PostgreSQL + Drizzle ORM
- Passport local sessions, with optional Google OAuth
- Google Maps JavaScript API for configured deployments, with React Leaflet / OpenStreetMap fallback
- TanStack Query and Wouter on the client

## Local setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in `DATABASE_URL` and a long random `SESSION_SECRET`. Google OAuth and payment credentials are optional for local development.

3. Install dependencies and start the development server:

   ```bash
   npm install
   npm run dev
   ```

   The app is available at http://localhost:5000.

## Commands

- `npm run dev` — start the Express/Vite development server
- `npm run check` — run the TypeScript compiler without emitting files
- `npm run build` — build the client and bundle the server
- `npm start` — run the production bundle
- `npm run db:push` — apply the Drizzle schema to the configured database

The prototype also applies backwards-compatible startup migrations for deployments that already contain the legacy tables.

## Core passenger flow

- Search published boat trips by origin, destination, date, and passenger count.
- Open a trip to review its operator, vessel, meeting point, price, map, and marine conditions.
- Reserve seats and access reservation messaging, check-in, cancellation, incident reporting, and reviews.
- When a search returns no trips, choose **Pedir esta rota** to submit a route request. Authenticated passengers can track requests at `/solicitar-rota`; admins can review them at `/admin`.

Route requests are opportunities, not confirmed bookings. Admin status changes notify the requesting passenger in-app.

## Environment variables

See [.env.example](.env.example). Production deployments must provide `DATABASE_URL` and `SESSION_SECRET`; secrets must stay in Railway/service environment variables and never be committed.

## Deployment

Railway uses `npm run build` during the build phase and `npm start` at runtime. Set `SESSION_SECRET` and `DATABASE_URL` before deploying.


## Maps

Set `VITE_GOOGLE_MAPS_API_KEY` in the client build environment to use Google Maps for live ride maps, route detail maps, and coastal drop-pin selection. Restrict the public browser key in Google Cloud Console by HTTP referrer and limit it to the APIs the app uses. When the variable is absent, the app keeps its keyless OpenStreetMap fallback for local development.
