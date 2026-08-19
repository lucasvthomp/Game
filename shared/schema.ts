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
  googleId: text("google_id").unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("passenger"), // "passenger" | "captain" | "driver" | "both"
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
}, (t) => [index("captain_profiles_user_id_idx").on(t.userId)]);

export const driverProfiles = pgTable("driver_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  licenseNumber: text("license_number").notNull(),
  licenseImageUrl: text("license_image_url").notNull(),
  carMake: text("car_make").notNull(),
  carModel: text("car_model").notNull(),
  carYear: integer("car_year"),
  carColor: text("car_color"),
  carCapacity: integer("car_capacity").notNull(),
  carImageUrl: text("car_image_url"),
  bio: text("bio"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("driver_profiles_user_id_idx").on(t.userId)]);

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  captainId: integer("captain_id").notNull().references(() => users.id),
  rideType: text("ride_type").notNull().default("boat"), // "boat" | "car"
  originCity: text("origin_city").notNull(),
  destinationCity: text("destination_city").notNull(),
  // Map coordinates (nullable for legacy rows). Set via drop-pin when posting a ride.
  originLat: numeric("origin_lat", { precision: 9, scale: 6 }),
  originLng: numeric("origin_lng", { precision: 9, scale: 6 }),
  destLat: numeric("dest_lat", { precision: 9, scale: 6 }),
  destLng: numeric("dest_lng", { precision: 9, scale: 6 }),
  departureTime: timestamp("departure_time").notNull(),
  returnTime: timestamp("return_time"),
  pricePerSeat: numeric("price_per_seat", { precision: 10, scale: 2 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("rides_captain_id_idx").on(t.captainId),
  index("rides_status_idx").on(t.status),
  index("rides_type_idx").on(t.rideType),
  index("rides_departure_time_idx").on(t.departureTime),
]);

export const recurringSchedules = pgTable("recurring_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rideType: text("ride_type").notNull(), // "boat" | "car"
  originCity: text("origin_city").notNull(),
  destinationCity: text("destination_city").notNull(),
  daysOfWeek: text("days_of_week").notNull(), // JSON array e.g. "[1,2,3,4,5]"
  departureTime: text("departure_time").notNull(), // "08:00"
  returnTime: text("return_time"), // "18:00"
  pricePerSeat: numeric("price_per_seat", { precision: 10, scale: 2 }),
  totalSeats: integer("total_seats"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("recurring_user_id_idx").on(t.userId),
  index("recurring_type_idx").on(t.rideType),
]);

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").notNull().references(() => rides.id),
  passengerId: integer("passenger_id").notNull().references(() => users.id),
  seats: integer("seats").notNull().default(1),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("confirmed"),
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
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("reviews_captain_id_idx").on(t.captainId)]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull().references(() => reservations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("messages_reservation_id_idx").on(t.reservationId),
]);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCaptainProfileSchema = createInsertSchema(captainProfiles).omit({ id: true, createdAt: true, verified: true });
export const insertDriverProfileSchema = createInsertSchema(driverProfiles).omit({ id: true, createdAt: true, verified: true });
export const insertRideSchema = createInsertSchema(rides).omit({ id: true, createdAt: true, status: true } as any);
export const insertRecurringSchema = createInsertSchema(recurringSchedules).omit({ id: true, createdAt: true });
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, status: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CaptainProfile = typeof captainProfiles.$inferSelect;
export type InsertCaptainProfile = typeof captainProfiles.$inferInsert;
export type DriverProfile = typeof driverProfiles.$inferSelect;
export type InsertDriverProfile = typeof driverProfiles.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;
export type RecurringSchedule = typeof recurringSchedules.$inferSelect;
export type InsertRecurringSchedule = typeof recurringSchedules.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

