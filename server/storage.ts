import { db } from "./db.js";
import { users, captainProfiles, rides, reservations, reviews } from "@shared/schema";
import type {
  User, InsertUser,
  CaptainProfile, InsertCaptainProfile,
  Ride, InsertRide,
  Reservation, InsertReservation,
  Review, InsertReview,
} from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { hashPassword } from "./auth.js";

export const storage = {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.id, id)))[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.email, email)))[0];
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

  // Captain profiles
  async getCaptainProfile(userId: number): Promise<CaptainProfile | undefined> {
    return (await db.select().from(captainProfiles).where(eq(captainProfiles.userId, userId)))[0];
  },

  async createCaptainProfile(data: InsertCaptainProfile): Promise<CaptainProfile> {
    const [profile] = await db.insert(captainProfiles).values(data).returning();
    await db.update(users).set({ role: "captain" }).where(eq(users.id, data.userId));
    return profile;
  },

  async updateCaptainProfile(userId: number, data: Partial<CaptainProfile>): Promise<CaptainProfile> {
    const [profile] = await db.update(captainProfiles).set(data).where(eq(captainProfiles.userId, userId)).returning();
    return profile;
  },

  // Rides
  async getRide(id: number): Promise<Ride | undefined> {
    return (await db.select().from(rides).where(eq(rides.id, id)))[0];
  },

  async getActiveRides(): Promise<Ride[]> {
    return db.select().from(rides)
      .where(and(eq(rides.status, "active"), gte(rides.departureTime, new Date())))
      .orderBy(rides.departureTime);
  },

  async getRidesByCaptain(captainId: number): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.captainId, captainId)).orderBy(desc(rides.departureTime));
  },

  async createRide(data: InsertRide): Promise<Ride> {
    const [ride] = await db.insert(rides).values({
      ...data,
      availableSeats: data.totalSeats,
    }).returning();
    return ride;
  },

  async updateRide(id: number, data: Partial<Ride>): Promise<Ride> {
    const [ride] = await db.update(rides).set(data).where(eq(rides.id, id)).returning();
    return ride;
  },

  async cancelRide(id: number): Promise<void> {
    await db.update(rides).set({ status: "cancelled" }).where(eq(rides.id, id));
  },

  // Reservations
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
    return (await db.select().from(reservations).where(
      and(eq(reservations.rideId, rideId), eq(reservations.passengerId, passengerId))
    ))[0];
  },

  async createReservation(data: InsertReservation): Promise<Reservation> {
    const [res] = await db.insert(reservations).values({ ...data, status: "confirmed" }).returning();
    await db.update(rides)
      .set({ availableSeats: sql`available_seats - ${data.seats}` })
      .where(eq(rides.id, data.rideId));
    return res;
  },

  async cancelReservation(id: number): Promise<void> {
    const res = await this.getReservation(id);
    if (!res) return;
    await db.update(reservations).set({ status: "cancelled" }).where(eq(reservations.id, id));
    await db.update(rides)
      .set({ availableSeats: sql`available_seats + ${res.seats}` })
      .where(eq(rides.id, res.rideId));
  },

  // Reviews
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
