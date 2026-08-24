import { db } from "./db.js";
import {
  users, captainProfiles, driverProfiles, rides, recurringSchedules, reservations, reviews, messages, locations, maritimeRoutes, incidents
} from "@shared/schema";
import type {
  User, InsertUser,
  CaptainProfile, InsertCaptainProfile,
  DriverProfile, InsertDriverProfile,
  Ride, InsertRide,
  RecurringSchedule, InsertRecurringSchedule,
  Reservation, InsertReservation,
  Review, InsertReview,
  Message, InsertMessage,
  Location, InsertLocation, MaritimeRoute, InsertMaritimeRoute, Incident, InsertIncident,
} from "@shared/schema";
import { eq, desc, and, gte, sql, or, ilike, asc } from "drizzle-orm";
import { hashPassword } from "./auth.js";

export const storage = {
  // ── Users ──
  async getUser(id: number): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.id, id)))[0];
  },
  async getUserByEmail(email: string): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.email, email)))[0];
  },
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.googleId, googleId)))[0];
  },
  async getUserByUsername(username: string): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.username, username)))[0];
  },
  async createUser(data: Omit<InsertUser, "password"> & { password: string }): Promise<User> {
    const hashed = await hashPassword(data.password);
    const [user] = await db.insert(users).values({ ...data, password: hashed }).returning();
    return user;
  },
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  },

  // ── Captain Profiles ──
  async getCaptainProfile(userId: number): Promise<CaptainProfile | undefined> {
    return (await db.select().from(captainProfiles).where(eq(captainProfiles.userId, userId)))[0];
  },
  async createCaptainProfile(data: InsertCaptainProfile): Promise<CaptainProfile> {
    const [profile] = await db.insert(captainProfiles).values(data).returning();
    const user = await this.getUser(data.userId);
    const newRole = user?.role === "driver" ? "both" : "captain";
    await db.update(users).set({ role: newRole }).where(eq(users.id, data.userId));
    return profile;
  },

  // ── Driver Profiles ──
  async getDriverProfile(userId: number): Promise<DriverProfile | undefined> {
    return (await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId)))[0];
  },
  async createDriverProfile(data: InsertDriverProfile): Promise<DriverProfile> {
    const [profile] = await db.insert(driverProfiles).values(data).returning();
    const user = await this.getUser(data.userId);
    const newRole = user?.role === "captain" ? "both" : "driver";
    await db.update(users).set({ role: newRole }).where(eq(users.id, data.userId));
    return profile;
  },

  // ── Structured locations and approved routes ──
  async listLocations(): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.active, true)).orderBy(asc(locations.name));
  },
  async createLocation(data: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(data).returning();
    return location;
  },
  async listMaritimeRoutes(): Promise<MaritimeRoute[]> {
    return db.select().from(maritimeRoutes).orderBy(desc(maritimeRoutes.createdAt));
  },
  async createMaritimeRoute(data: InsertMaritimeRoute): Promise<MaritimeRoute> {
    const [route] = await db.insert(maritimeRoutes).values(data).returning();
    return route;
  },
  async setMaritimeRouteActive(id: number, active: boolean): Promise<MaritimeRoute | undefined> {
    const [route] = await db.update(maritimeRoutes).set({ active }).where(eq(maritimeRoutes.id, id)).returning();
    return route;
  },

  // ── Admin verification ──
  async listCaptainProfiles(): Promise<CaptainProfile[]> {
    return db.select().from(captainProfiles).orderBy(asc(captainProfiles.createdAt));
  },
  async listDriverProfiles(): Promise<DriverProfile[]> {
    return db.select().from(driverProfiles).orderBy(asc(driverProfiles.createdAt));
  },
  async setCaptainVerified(id: number, verified: boolean): Promise<CaptainProfile | undefined> {
    const [profile] = await db.update(captainProfiles).set({ verified }).where(eq(captainProfiles.id, id)).returning();
    return profile;
  },
  async setDriverVerified(id: number, verified: boolean): Promise<DriverProfile | undefined> {
    const [profile] = await db.update(driverProfiles).set({ verified }).where(eq(driverProfiles.id, id)).returning();
    return profile;
  },

  // ── Rides ──
  async getRide(id: number): Promise<Ride | undefined> {
    return (await db.select().from(rides).where(eq(rides.id, id)))[0];
  },
  async getActiveRides(type?: "boat" | "car"): Promise<Ride[]> {
    const conditions = [eq(rides.status, "active"), gte(rides.departureTime, new Date())];
    if (type) conditions.push(eq(rides.rideType, type));
    return db.select().from(rides).where(and(...conditions)).orderBy(rides.departureTime);
  },
  async getRidesByCaptain(captainId: number): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.captainId, captainId)).orderBy(desc(rides.departureTime));
  },
  async createRide(data: InsertRide): Promise<Ride> {
    const [ride] = await db.insert(rides).values(data).returning();
    return ride;
  },
  async updateRide(id: number, data: Partial<Ride>): Promise<Ride> {
    const [ride] = await db.update(rides).set(data).where(eq(rides.id, id)).returning();
    return ride;
  },
  async cancelRide(id: number): Promise<void> {
    await db.update(rides).set({ status: "cancelled" }).where(eq(rides.id, id));
  },

  // ── Recurring Schedules ──
  async createRecurringSchedule(data: InsertRecurringSchedule): Promise<RecurringSchedule> {
    const [schedule] = await db.insert(recurringSchedules).values(data).returning();
    return schedule;
  },
  async getRecurringSchedulesByUser(userId: number): Promise<RecurringSchedule[]> {
    return db.select().from(recurringSchedules).where(and(eq(recurringSchedules.userId, userId), eq(recurringSchedules.active, true))).orderBy(desc(recurringSchedules.createdAt));
  },
  async getActiveRecurringSchedules(type?: "boat" | "car"): Promise<RecurringSchedule[]> {
    const conditions = [eq(recurringSchedules.active, true)];
    if (type) conditions.push(eq(recurringSchedules.rideType, type));
    return db.select().from(recurringSchedules).where(and(...conditions)).orderBy(desc(recurringSchedules.createdAt));
  },
  async findMatchingSchedules(type: string, origin: string, destination: string): Promise<RecurringSchedule[]> {
    return db.select().from(recurringSchedules).where(
      and(
        eq(recurringSchedules.active, true),
        eq(recurringSchedules.rideType, type),
        ilike(recurringSchedules.originCity, `%${origin}%`),
        ilike(recurringSchedules.destinationCity, `%${destination}%`),
      )
    );
  },
  async deactivateRecurringSchedule(id: number, userId: number): Promise<void> {
    await db.update(recurringSchedules).set({ active: false }).where(and(eq(recurringSchedules.id, id), eq(recurringSchedules.userId, userId)));
  },

  // ── Reservations ──
  async getReservation(id: number): Promise<Reservation | undefined> {
    return (await db.select().from(reservations).where(eq(reservations.id, id)))[0];
  },
  async getReservationsByRide(rideId: number): Promise<Reservation[]> {
    return db.select().from(reservations).where(eq(reservations.rideId, rideId));
  },
  async getReservationsByPassenger(passengerId: number): Promise<Reservation[]> {
    return db.select().from(reservations).where(eq(reservations.passengerId, passengerId)).orderBy(desc(reservations.createdAt));
  },
  async getUserReservationForRide(rideId: number, passengerId: number): Promise<Reservation | undefined> {
    return (await db.select().from(reservations).where(and(eq(reservations.rideId, rideId), eq(reservations.passengerId, passengerId))))[0];
  },
  async createReservation(data: InsertReservation): Promise<Reservation> {
    const [res] = await db.insert(reservations).values({ ...data, status: "confirmed" }).returning();
    await db.update(rides).set({ availableSeats: sql`available_seats - ${data.seats}` }).where(eq(rides.id, data.rideId));
    return res;
  },
  async updateReservationStatus(id: number, status: string): Promise<Reservation | undefined> {
    const [reservation] = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
    return reservation;
  },
  async cancelReservation(id: number): Promise<void> {
    const res = await this.getReservation(id);
    if (!res) return;
    await db.update(reservations).set({ status: "cancelled" }).where(eq(reservations.id, id));
    await db.update(rides).set({ availableSeats: sql`available_seats + ${res.seats}` }).where(eq(rides.id, res.rideId));
  },

  // ── Incidents ──
  async createIncident(data: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(data).returning();
    return incident;
  },
  async getIncidentsByReservation(reservationId: number): Promise<Incident[]> {
    return db.select().from(incidents).where(eq(incidents.reservationId, reservationId)).orderBy(desc(incidents.createdAt));
  },

  // ── Messages ──
  async getMessagesByReservation(reservationId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.reservationId, reservationId)).orderBy(asc(messages.createdAt));
  },
  async createMessage(data: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(data).returning();
    return msg;
  },

  // ── Reviews ──
  async getReviewsByCaptain(captainId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.captainId, captainId)).orderBy(desc(reviews.createdAt));
  },
  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  },
  async getCaptainAverageRating(captainId: number): Promise<number> {
    const result = await db.select({ avg: sql<string>`AVG(rating)` }).from(reviews).where(eq(reviews.captainId, captainId));
    return parseFloat(result[0]?.avg || "0");
  },
};

