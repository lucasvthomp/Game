import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage.js";
import { pool } from "./db.js";
import type { Express } from "express";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PgSession = connectPgSimple(session);

  app.use(
    session({
      store: new PgSession({ pool, tableName: "sessions", createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "lancha-carona-secret-dev",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email.toLowerCase().trim());
        if (!user) return done(null, false, { message: "Email ou senha incorretos." });
        const valid = await comparePassword(password, user.password);
        if (!valid) return done(null, false, { message: "Email ou senha incorretos." });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL ||
    `${process.env.APP_URL || "http://localhost:5000"}/api/auth/google/callback`;

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase().trim();
            if (!email) return done(null, false, { message: "Sua conta Google não informou um email." });

            const existingGoogleUser = await storage.getUserByGoogleId(profile.id);
            if (existingGoogleUser) return done(null, existingGoogleUser);

            const existingEmailUser = await storage.getUserByEmail(email);
            if (existingEmailUser) {
              const linkedUser = await storage.updateUser(existingEmailUser.id, {
                googleId: profile.id,
                avatarUrl: existingEmailUser.avatarUrl || profile.photos?.[0]?.value || null,
              });
              return done(null, linkedUser);
            }

            const baseUsername = (profile.username || email.split("@")[0])
              .normalize("NFKD")
              .replace(/[\\u0300-\\u036f]/g, "")
              .replace(/[^a-zA-Z0-9_]/g, "")
              .toLowerCase()
              .slice(0, 24) || "marinheiro";
            let username = baseUsername;
            let suffix = 2;
            while (await storage.getUserByUsername(username)) {
              username = `${baseUsername.slice(0, 24 - String(suffix).length)}${suffix}`;
              suffix += 1;
            }

            const user = await storage.createUser({
              email,
              googleId: profile.id,
              username,
              password: randomBytes(32).toString("hex"),
              fullName: profile.displayName || email.split("@")[0],
              phone: null,
              avatarUrl: profile.photos?.[0]?.value || null,
              role: "passenger",
            });
            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        },
      ),
    );
  }

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });
}

