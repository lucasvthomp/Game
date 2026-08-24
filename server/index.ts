import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth.js";
import router from "./routes.js";
import { pool } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || "5000");

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.set("trust proxy", 1);

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });
app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Auth (session + passport)
setupAuth(app);

// Serve uploaded files
const uploadsDir = process.env.NODE_ENV === "production" ? "/tmp/uploads" : path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// API routes
app.use("/api", router);

// Run DB migrations on startup
async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire);

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        google_id TEXT UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        home_city TEXT,
        phone TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'passenger',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users (google_id) WHERE google_id IS NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS home_city TEXT;

      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        municipality TEXT,
        state TEXT DEFAULT 'SP',
        country TEXT DEFAULT 'BR',
        place_id TEXT,
        description TEXT,
        meeting_instructions TEXT,
        photos JSONB,
        active BOOLEAN NOT NULL DEFAULT true
      );
      CREATE TABLE IF NOT EXISTS maritime_routes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        origin_location_id INTEGER NOT NULL REFERENCES locations(id),
        destination_location_id INTEGER NOT NULL REFERENCES locations(id),
        geojson JSONB,
        distance_nm NUMERIC(8,2),
        typical_duration_minutes INTEGER,
        active BOOLEAN NOT NULL DEFAULT false,
        region TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS maritime_routes_origin_idx ON maritime_routes(origin_location_id);
      CREATE INDEX IF NOT EXISTS maritime_routes_destination_idx ON maritime_routes(destination_location_id);
      CREATE INDEX IF NOT EXISTS maritime_routes_active_idx ON maritime_routes(active);

      CREATE TABLE IF NOT EXISTS captain_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        license_number TEXT NOT NULL,
        license_image_url TEXT NOT NULL,
        boat_name TEXT NOT NULL,
        boat_model TEXT,
        boat_capacity INTEGER NOT NULL,
        boat_image_url TEXT,
        bio TEXT,
        verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS captain_profiles_user_id_idx ON captain_profiles (user_id);

      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        captain_id INTEGER NOT NULL REFERENCES users(id),
        origin_city TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        return_time TIMESTAMP,
        price_per_seat NUMERIC(10,2) NOT NULL,
        total_seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS rides_captain_id_idx ON rides (captain_id);
      CREATE INDEX IF NOT EXISTS rides_status_idx ON rides (status);
      CREATE INDEX IF NOT EXISTS rides_departure_time_idx ON rides (departure_time);

      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        ride_id INTEGER NOT NULL REFERENCES rides(id),
        passenger_id INTEGER NOT NULL REFERENCES users(id),
        seats INTEGER NOT NULL DEFAULT 1,
        total_price NUMERIC(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS reservations_ride_id_idx ON reservations (ride_id);
      CREATE INDEX IF NOT EXISTS reservations_passenger_id_idx ON reservations (passenger_id);

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        ride_id INTEGER NOT NULL REFERENCES rides(id),
        reviewer_id INTEGER NOT NULL REFERENCES users(id),
        captain_id INTEGER NOT NULL REFERENCES users(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS reviews_captain_id_idx ON reviews (captain_id);

      CREATE TABLE IF NOT EXISTS driver_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        license_number TEXT NOT NULL,
        license_image_url TEXT NOT NULL,
        car_make TEXT NOT NULL,
        car_model TEXT NOT NULL,
        car_year INTEGER,
        car_color TEXT,
        car_capacity INTEGER NOT NULL,
        car_image_url TEXT,
        bio TEXT,
        verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS driver_profiles_user_id_idx ON driver_profiles (user_id);

      ALTER TABLE rides ADD COLUMN IF NOT EXISTS ride_type TEXT NOT NULL DEFAULT 'boat';
      CREATE INDEX IF NOT EXISTS rides_type_idx ON rides (ride_type);

      CREATE TABLE IF NOT EXISTS recurring_schedules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        ride_type TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        days_of_week TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        return_time TEXT,
        price_per_seat NUMERIC(10,2),
        total_seats INTEGER,
        description TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS recurring_user_id_idx ON recurring_schedules (user_id);
      CREATE INDEX IF NOT EXISTS recurring_type_idx ON recurring_schedules (ride_type);

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        reservation_id INTEGER NOT NULL REFERENCES reservations(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS messages_reservation_id_idx ON messages(reservation_id);
    `);
    console.log("Migrações concluídas.");
  } finally {
    client.release();
  }
}

// Serve frontend
if (process.env.NODE_ENV === "production") {
  const staticDir = path.join(__dirname, "public");
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  // In dev, Vite handles the frontend via proxy
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: path.join(process.cwd(), "client"),
    resolve: {
      alias: {
        "@": path.join(process.cwd(), "client/src"),
        "@shared": path.join(process.cwd(), "shared"),
      },
    },
  });
  app.use(vite.middlewares);
}

app.listen(PORT, async () => {
  await runMigrations();
  console.log(`Marcamar rodando na porta ${PORT}`);
});

