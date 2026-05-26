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
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'passenger',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

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
  console.log(`LanchaCarona rodando na porta ${PORT}`);
});
