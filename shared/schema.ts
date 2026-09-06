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
  homeCity: text("home_city"),
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
  topCaptain: boolean("top_captain").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("captain_profiles_user_id_idx").on(t.userId)]);

export const verificationSubmissions = pgTable("verification_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("not_started"),
  subjectName: text("subject_name"),
  documentLast4: text("document_last4"),
  documentUrl: text("document_url"),
  provider: text("provider").notNull().default("manual"),
  providerReference: text("provider_reference"),
  consentAt: timestamp("consent_at"),
  result: jsonb("result"),
  reviewerId: integer("reviewer_id").references(() => users.id),
  reviewerNotes: text("reviewer_notes"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("verification_submissions_user_idx").on(t.userId),
  index("verification_submissions_status_idx").on(t.status),
  index("verification_submissions_kind_idx").on(t.kind),
]);

export const adminAuditEvents = pgTable("admin_audit_events", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("admin_audit_events_created_idx").on(t.createdAt)]);

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

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // city | island | beach | marina | pier | community | pickup
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  municipality: text("municipality"),
  state: text("state").default("SP"),
  country: text("country").default("BR"),
  placeId: text("place_id"),
  description: text("description"),
  meetingInstructions: text("meeting_instructions"),
  photos: jsonb("photos"),
  active: boolean("active").notNull().default(true),
});

export const maritimeRoutes = pgTable("maritime_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originLocationId: integer("origin_location_id").notNull().references(() => locations.id),
  destinationLocationId: integer("destination_location_id").notNull().references(() => locations.id),
  geojson: jsonb("geojson"),
  distanceNm: numeric("distance_nm", { precision: 8, scale: 2 }),
  typicalDurationMinutes: integer("typical_duration_minutes"),
  active: boolean("active").notNull().default(false),
  region: text("region"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("maritime_routes_origin_idx").on(t.originLocationId),
  index("maritime_routes_destination_idx").on(t.destinationLocationId),
  index("maritime_routes_active_idx").on(t.active),
]);

export const routeRequests = pgTable("route_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  requestedDate: timestamp("requested_date"),
  passengers: integer("passengers").notNull().default(1),
  notes: text("notes"),
  status: text("status").notNull().default("open"), // open | reviewing | matched | closed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("route_requests_user_idx").on(t.userId),
  index("route_requests_status_idx").on(t.status),
  index("route_requests_created_at_idx").on(t.createdAt),
]);

export const commercialWaitlist = pgTable("commercial_waitlist", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  interest: text("interest").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull().references(() => reservations.id),
  reporterId: integer("reporter_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("incidents_reservation_id_idx").on(t.reservationId),
  index("incidents_status_idx").on(t.status),
]);

export const insertCommercialWaitlistSchema = createInsertSchema(commercialWaitlist).omit({ id: true, createdAt: true });
export const insertVerificationSubmissionSchema = createInsertSchema(verificationSubmissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminAuditEventSchema = createInsertSchema(adminAuditEvents).omit({ id: true, createdAt: true });

export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true });
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("notifications_user_idx").on(t.userId),
  index("notifications_unread_idx").on(t.userId, t.readAt),
]);

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, readAt: true });
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Zod schemas
export const insertRouteRequestSchema = createInsertSchema(routeRequests).omit({ id: true, createdAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertMaritimeRouteSchema = createInsertSchema(maritimeRoutes).omit({ id: true, createdAt: true });

export type CommercialWaitlist = typeof commercialWaitlist.$inferSelect;
export type InsertCommercialWaitlist = typeof commercialWaitlist.$inferInsert;
export type VerificationSubmission = typeof verificationSubmissions.$inferSelect;
export type InsertVerificationSubmission = typeof verificationSubmissions.$inferInsert;
export type AdminAuditEvent = typeof adminAuditEvents.$inferSelect;
export type InsertAdminAuditEvent = typeof adminAuditEvents.$inferInsert;

export type RouteRequest = typeof routeRequests.$inferSelect;
export type InsertRouteRequest = typeof routeRequests.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;
export type MaritimeRoute = typeof maritimeRoutes.$inferSelect;
export type InsertMaritimeRoute = typeof maritimeRoutes.$inferInsert;

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

