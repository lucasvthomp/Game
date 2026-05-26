import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage.js";
import { insertUserSchema, insertRideSchema, insertReservationSchema, insertReviewSchema } from "@shared/schema";
import passport from "passport";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Multer for file uploads
const uploadsDir = process.env.NODE_ENV === "production" ? "/tmp/uploads" : "uploads";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Não autenticado." });
  next();
}

function requireCaptain(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Não autenticado." });
  const user = req.user as any;
  if (user.role !== "captain") return res.status(403).json({ error: "Apenas capitães podem fazer isso." });
  next();
}

// --- Auth ---
router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName, phone } = req.body;
    if (!email || !password || !username || !fullName) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }
    if (password.length < 6) return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });

    const existing = await storage.getUserByEmail(email.toLowerCase().trim());
    if (existing) return res.status(400).json({ error: "Email já cadastrado." });

    const existingUsername = await storage.getUserByUsername(username.trim());
    if (existingUsername) return res.status(400).json({ error: "Nome de usuário já em uso." });

    const user = await storage.createUser({
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      role: "passenger",
    });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Erro ao fazer login." });
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/auth/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: info?.message || "Credenciais inválidas." });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Erro ao fazer login." });
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    });
  })(req, res, next);
});

router.post("/auth/logout", requireAuth, (req: Request, res: Response) => {
  req.logout(() => res.json({ success: true }));
});

router.get("/auth/me", (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Não autenticado." });
  const { password: _, ...safeUser } = req.user as any;
  res.json({ user: safeUser });
});

// --- Captain Profile ---
router.post("/captain/profile", requireAuth, upload.fields([
  { name: "licenseImage", maxCount: 1 },
  { name: "boatImage", maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const existing = await storage.getCaptainProfile(user.id);
    if (existing) return res.status(400).json({ error: "Perfil de capitão já existe." });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const licenseImageUrl = files?.licenseImage?.[0] ? `/uploads/${files.licenseImage[0].filename}` : null;
    const boatImageUrl = files?.boatImage?.[0] ? `/uploads/${files.boatImage[0].filename}` : null;

    if (!licenseImageUrl) return res.status(400).json({ error: "Foto da habilitação é obrigatória." });
    const { licenseNumber, boatName, boatModel, boatCapacity, bio } = req.body;
    if (!licenseNumber || !boatName || !boatCapacity) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const profile = await storage.createCaptainProfile({
      userId: user.id,
      licenseNumber,
      licenseImageUrl,
      boatName,
      boatModel: boatModel || null,
      boatCapacity: parseInt(boatCapacity),
      boatImageUrl: boatImageUrl || null,
      bio: bio || null,
    });
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/captain/profile", requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  const profile = await storage.getCaptainProfile(user.id);
  if (!profile) return res.status(404).json({ error: "Perfil não encontrado." });
  res.json({ profile });
});

router.get("/captain/:userId/profile", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido." });
  const profile = await storage.getCaptainProfile(userId);
  const user = await storage.getUser(userId);
  if (!profile || !user) return res.status(404).json({ error: "Capitão não encontrado." });
  const avgRating = await storage.getCaptainAverageRating(userId);
  const { password: _, ...safeUser } = user;
  res.json({ profile, user: safeUser, avgRating });
});

// --- Rides ---
router.get("/rides", async (req: Request, res: Response) => {
  try {
    const activeRides = await storage.getActiveRides();
    const enriched = await Promise.all(activeRides.map(async (ride) => {
      const captain = await storage.getUser(ride.captainId);
      const captainProfile = await storage.getCaptainProfile(ride.captainId);
      const avgRating = await storage.getCaptainAverageRating(ride.captainId);
      return {
        ...ride,
        captainName: captain?.fullName || "Capitão",
        captainUsername: captain?.username,
        captainAvatar: captain?.avatarUrl,
        boatName: captainProfile?.boatName,
        avgRating,
      };
    }));
    res.json({ rides: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/rides/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  const ride = await storage.getRide(id);
  if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
  const captain = await storage.getUser(ride.captainId);
  const captainProfile = await storage.getCaptainProfile(ride.captainId);
  const avgRating = await storage.getCaptainAverageRating(ride.captainId);
  const reservationCount = (await storage.getReservationsByRide(id)).filter(r => r.status === "confirmed").length;
  const { password: _, ...safeUser } = captain as any;
  res.json({ ride, captain: safeUser, captainProfile, avgRating, reservationCount });
});

router.post("/rides", requireCaptain, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { originCity, destinationCity, departureTime, returnTime, pricePerSeat, totalSeats, description } = req.body;
    if (!originCity || !destinationCity || !departureTime || !pricePerSeat || !totalSeats) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }
    const profile = await storage.getCaptainProfile(user.id);
    if (!profile) return res.status(400).json({ error: "Complete seu perfil de capitão primeiro." });

    const ride = await storage.createRide({
      captainId: user.id,
      originCity,
      destinationCity,
      departureTime: new Date(departureTime),
      returnTime: returnTime ? new Date(returnTime) : null,
      pricePerSeat: parseFloat(pricePerSeat).toString(),
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      description: description || null,
    });
    res.json({ ride });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my/rides", requireCaptain, async (req: Request, res: Response) => {
  const user = req.user as any;
  const myRides = await storage.getRidesByCaptain(user.id);
  const enriched = await Promise.all(myRides.map(async (ride) => {
    const reservationList = await storage.getReservationsByRide(ride.id);
    const confirmedSeats = reservationList.filter(r => r.status === "confirmed").reduce((s, r) => s + r.seats, 0);
    return { ...ride, confirmedSeats, reservationCount: reservationList.filter(r => r.status === "confirmed").length };
  }));
  res.json({ rides: enriched });
});

router.delete("/rides/:id", requireCaptain, async (req: Request, res: Response) => {
  const user = req.user as any;
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  const ride = await storage.getRide(id);
  if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
  if (ride.captainId !== user.id) return res.status(403).json({ error: "Sem permissão." });
  await storage.cancelRide(id);
  res.json({ success: true });
});

// --- Reservations ---
router.post("/reservations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { rideId, seats } = req.body;
    if (!rideId || !seats) return res.status(400).json({ error: "Dados inválidos." });

    const ride = await storage.getRide(parseInt(rideId));
    if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
    if (ride.status !== "active") return res.status(400).json({ error: "Viagem não está mais disponível." });
    if (ride.captainId === user.id) return res.status(400).json({ error: "Você não pode reservar sua própria viagem." });

    const numSeats = parseInt(seats);
    if (ride.availableSeats < numSeats) return res.status(400).json({ error: "Assentos insuficientes." });

    const existing = await storage.getUserReservationForRide(ride.id, user.id);
    if (existing && existing.status === "confirmed") return res.status(400).json({ error: "Você já reservou esta viagem." });

    const totalPrice = (parseFloat(ride.pricePerSeat) * numSeats).toString();
    const reservation = await storage.createReservation({
      rideId: ride.id,
      passengerId: user.id,
      seats: numSeats,
      totalPrice,
    });
    res.json({ reservation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my/reservations", requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  const myReservations = await storage.getReservationsByPassenger(user.id);
  const enriched = await Promise.all(myReservations.map(async (res) => {
    const ride = await storage.getRide(res.rideId);
    const captain = ride ? await storage.getUser(ride.captainId) : null;
    return { ...res, ride, captainName: captain?.fullName };
  }));
  return res.json({ reservations: enriched });
});

router.delete("/reservations/:id", requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  const reservation = await storage.getReservation(id);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada." });
  if (reservation.passengerId !== user.id) return res.status(403).json({ error: "Sem permissão." });
  await storage.cancelReservation(id);
  res.json({ success: true });
});

// --- Reviews ---
router.post("/reviews", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { rideId, rating, comment } = req.body;
    if (!rideId || !rating) return res.status(400).json({ error: "Dados inválidos." });
    const ride = await storage.getRide(parseInt(rideId));
    if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
    const review = await storage.createReview({
      rideId: parseInt(rideId),
      reviewerId: user.id,
      captainId: ride.captainId,
      rating: parseInt(rating),
      comment: comment || null,
    });
    res.json({ review });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/captain/:userId/reviews", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido." });
  const reviewList = await storage.getReviewsByCaptain(userId);
  const avgRating = await storage.getCaptainAverageRating(userId);
  res.json({ reviews: reviewList, avgRating });
});

export default router;
