import { pgTable, serial, text, integer, timestamp, boolean, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("passenger"), // "passenger" | "captain"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const captainProfiles = pgTable("captain_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  licenseNumber: text("license_number").notNull(),
  licenseImageUrl: text("license_image_url").notNull(),
  boatName: text("boat_name").notNull(),
  boatModel: text("boat_model"),
  boatCapacity: integer("boat_capacity").notNull(),
  boatImageUrl: text("boat_image_url"),
  bio: text("bio"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("captain_profiles_user_id_idx").on(t.userId),
]);

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  captainId: integer("captain_id").notNull().references(() => users.id),
  originCity: text("origin_city").notNull(),
  destinationCity: text("destination_city").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  returnTime: timestamp("return_time"),
  pricePerSeat: numeric("price_per_seat", { precision: 10, scale: 2 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // "active" | "cancelled" | "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("rides_captain_id_idx").on(t.captainId),
  index("rides_status_idx").on(t.status),
  index("rides_departure_time_idx").on(t.departureTime),
]);

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").notNull().references(() => rides.id),
  passengerId: integer("passenger_id").notNull().references(() => users.id),
  seats: integer("seats").notNull().default(1),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "cancelled"
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("reservations_ride_id_idx").on(t.rideId),
  index("reservations_passenger_id_idx").on(t.passengerId),
]);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").notNull().references(() => rides.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  captainId: integer("captain_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("reviews_captain_id_idx").on(t.captainId),
]);

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCaptainProfileSchema = createInsertSchema(captainProfiles).omit({ id: true, createdAt: true, verified: true });
export const insertRideSchema = createInsertSchema(rides).omit({ id: true, createdAt: true, availableSeats: true, status: true } as any);
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, status: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CaptainProfile = typeof captainProfiles.$inferSelect;
export type InsertCaptainProfile = typeof captainProfiles.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
