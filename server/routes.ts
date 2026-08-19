import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage.js";
import passport from "passport";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadsDir = process.env.NODE_ENV === "production" ? "/tmp/uploads" : "uploads";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, [".jpg", ".jpeg", ".png", ".webp"].includes(ext));
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Não autenticado." });
  next();
}
function requireCaptainOrDriver(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Não autenticado." });
  const role = (req.user as any).role;
  if (!["captain", "driver", "both"].includes(role)) return res.status(403).json({ error: "Complete seu perfil de motorista ou capitão primeiro." });
  next();
}

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// ── AUTH ──
router.get("/auth/providers", (_req: Request, res: Response) => {
  res.json({ google: googleConfigured(), email: true });
});

router.get("/auth/google", (req: Request, res: Response, next: NextFunction) => {
  if (!googleConfigured()) {
    return res.status(503).json({ error: "Login com Google ainda não foi configurado." });
  }
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })(req, res, next);
});

router.get(
  "/auth/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    if (!googleConfigured()) return res.redirect("/entrar?error=google_unavailable");
    passport.authenticate("google", { failureRedirect: "/entrar?error=google" })(req, res, next);
  },
  (_req: Request, res: Response) => res.redirect("/viagens"),
);

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName, phone } = req.body;
    if (!email || !password || !username || !fullName) return res.status(400).json({ error: "Preencha todos os campos." });
    if (password.length < 6) return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
    if (await storage.getUserByEmail(email.toLowerCase().trim())) return res.status(400).json({ error: "Email já cadastrado." });
    if (await storage.getUserByUsername(username.trim())) return res.status(400).json({ error: "Nome de usuário já em uso." });
    const user = await storage.createUser({ email: email.toLowerCase().trim(), username: username.trim(), password, fullName: fullName.trim(), phone: phone?.trim() || null, role: "passenger" });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Erro ao fazer login." });
      const { password: _, ...safe } = user;
      res.json({ user: safe });
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/auth/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: info?.message || "Credenciais inválidas." });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Erro ao fazer login." });
      const { password: _, ...safe } = user;
      res.json({ user: safe });
    });
  })(req, res, next);
});

router.post("/auth/logout", requireAuth, (req: Request, res: Response) => {
  req.logout(() => res.json({ success: true }));
});

router.get("/auth/me", (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ error: "Não autenticado." });
  const { password: _, ...safe } = req.user as any;
  res.json({ user: safe });
});

// ── CAPTAIN PROFILE ──
router.post("/captain/profile", requireAuth, upload.fields([{ name: "licenseImage", maxCount: 1 }, { name: "boatImage", maxCount: 1 }]), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (await storage.getCaptainProfile(user.id)) return res.status(400).json({ error: "Perfil de capitão já existe." });
    const files = req.files as { [f: string]: Express.Multer.File[] };
    const licenseImageUrl = files?.licenseImage?.[0] ? `/uploads/${files.licenseImage[0].filename}` : null;
    if (!licenseImageUrl) return res.status(400).json({ error: "Foto da habilitação é obrigatória." });
    const { licenseNumber, boatName, boatModel, boatCapacity, bio } = req.body;
    if (!licenseNumber || !boatName || !boatCapacity) return res.status(400).json({ error: "Campos obrigatórios faltando." });
    const profile = await storage.createCaptainProfile({ userId: user.id, licenseNumber, licenseImageUrl, boatName, boatModel: boatModel || null, boatCapacity: parseInt(boatCapacity), boatImageUrl: files?.boatImage?.[0] ? `/uploads/${files.boatImage[0].filename}` : null, bio: bio || null });
    res.json({ profile });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/captain/profile", requireAuth, async (req: Request, res: Response) => {
  const profile = await storage.getCaptainProfile((req.user as any).id);
  if (!profile) return res.status(404).json({ error: "Perfil não encontrado." });
  res.json({ profile });
});

router.get("/captain/:userId/profile", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido." });
  const [profile, user] = await Promise.all([storage.getCaptainProfile(userId), storage.getUser(userId)]);
  if (!profile || !user) return res.status(404).json({ error: "Capitão não encontrado." });
  const avgRating = await storage.getCaptainAverageRating(userId);
  const { password: _, ...safe } = user;
  res.json({ profile, user: safe, avgRating });
});

// ── DRIVER PROFILE ──
router.post("/driver/profile", requireAuth, upload.fields([{ name: "licenseImage", maxCount: 1 }, { name: "carImage", maxCount: 1 }]), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (await storage.getDriverProfile(user.id)) return res.status(400).json({ error: "Perfil de motorista já existe." });
    const files = req.files as { [f: string]: Express.Multer.File[] };
    const licenseImageUrl = files?.licenseImage?.[0] ? `/uploads/${files.licenseImage[0].filename}` : null;
    if (!licenseImageUrl) return res.status(400).json({ error: "Foto da CNH é obrigatória." });
    const { licenseNumber, carMake, carModel, carYear, carColor, carCapacity, bio } = req.body;
    if (!licenseNumber || !carMake || !carModel || !carCapacity) return res.status(400).json({ error: "Campos obrigatórios faltando." });
    const profile = await storage.createDriverProfile({ userId: user.id, licenseNumber, licenseImageUrl, carMake, carModel, carYear: carYear ? parseInt(carYear) : null, carColor: carColor || null, carCapacity: parseInt(carCapacity), carImageUrl: files?.carImage?.[0] ? `/uploads/${files.carImage[0].filename}` : null, bio: bio || null });
    res.json({ profile });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/driver/profile", requireAuth, async (req: Request, res: Response) => {
  const profile = await storage.getDriverProfile((req.user as any).id);
  if (!profile) return res.status(404).json({ error: "Perfil não encontrado." });
  res.json({ profile });
});

// ── RIDES ──
router.get("/rides", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as "boat" | "car" | undefined;
    const activeRides = await storage.getActiveRides(type);
    const enriched = await Promise.all(activeRides.map(async (ride) => {
      const captain = await storage.getUser(ride.captainId);
      const [captainProfile, driverProfile, avgRating] = await Promise.all([
        storage.getCaptainProfile(ride.captainId),
        storage.getDriverProfile(ride.captainId),
        storage.getCaptainAverageRating(ride.captainId),
      ]);
      return {
        ...ride,
        captainName: captain?.fullName || "Motorista",
        captainUsername: captain?.username,
        boatName: captainProfile?.boatName,
        carInfo: driverProfile ? `${driverProfile.carMake} ${driverProfile.carModel}${driverProfile.carColor ? ` · ${driverProfile.carColor}` : ""}` : null,
        avgRating,
      };
    }));
    res.json({ rides: enriched });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/rides/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  const ride = await storage.getRide(id);
  if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
  const captain = await storage.getUser(ride.captainId);
  const [captainProfile, driverProfile, avgRating, reviewsData] = await Promise.all([
    storage.getCaptainProfile(ride.captainId),
    storage.getDriverProfile(ride.captainId),
    storage.getCaptainAverageRating(ride.captainId),
    storage.getReviewsByCaptain(ride.captainId),
  ]);
  const { password: _, ...safe } = captain as any;
  res.json({ ride, captain: safe, captainProfile, driverProfile, avgRating, reviewCount: reviewsData.length });
});

router.post("/rides", requireCaptainOrDriver, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { rideType, originCity, destinationCity, departureTime, returnTime, pricePerSeat, totalSeats, description,
            originLat, originLng, destLat, destLng } = req.body;
    if (!originCity || !destinationCity || !departureTime || !pricePerSeat || !totalSeats) return res.status(400).json({ error: "Preencha todos os campos." });
    if (rideType === "boat" && !(await storage.getCaptainProfile(user.id))) return res.status(400).json({ error: "Complete seu perfil de capitão primeiro." });
    if (rideType === "car" && !(await storage.getDriverProfile(user.id))) return res.status(400).json({ error: "Complete seu perfil de motorista primeiro." });
    const seats = parseInt(totalSeats);
    // Coordinates come from the drop-pin map picker; nullable so text-only rides still work.
    const coord = (v: any) => (v === undefined || v === null || v === "" ? null : parseFloat(v).toString());
    const ride = await storage.createRide({
      captainId: user.id,
      rideType: rideType || "boat",
      originCity, destinationCity,
      originLat: coord(originLat), originLng: coord(originLng),
      destLat: coord(destLat), destLng: coord(destLng),
      departureTime: new Date(departureTime),
      returnTime: returnTime ? new Date(returnTime) : null,
      pricePerSeat: parseFloat(pricePerSeat).toString(),
      totalSeats: seats,
      availableSeats: seats,
      description: description || null,
    });
    res.json({ ride });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/my/rides", requireCaptainOrDriver, async (req: Request, res: Response) => {
  const user = req.user as any;
  const myRides = await storage.getRidesByCaptain(user.id);
  const enriched = await Promise.all(myRides.map(async (ride) => {
    const reservationList = await storage.getReservationsByRide(ride.id);
    const confirmedSeats = reservationList.filter(r => r.status === "confirmed").reduce((s, r) => s + r.seats, 0);
    return { ...ride, confirmedSeats, reservationCount: reservationList.filter(r => r.status === "confirmed").length };
  }));
  res.json({ rides: enriched });
});

router.delete("/rides/:id", requireCaptainOrDriver, async (req: Request, res: Response) => {
  const user = req.user as any;
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  const ride = await storage.getRide(id);
  if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
  if (ride.captainId !== user.id) return res.status(403).json({ error: "Sem permissão." });
  await storage.cancelRide(id);
  res.json({ success: true });
});

router.get("/rides/:id/reservations", requireAuth, async (req: Request, res: Response) => {
  try {
    const rideId = parseInt(req.params.id as string);
    if (isNaN(rideId)) return res.status(400).json({ error: "ID inválido." });
    const ride = await storage.getRide(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    // Only the captain/driver can see reservations
    if (ride.captainId !== (req.user as any).id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const rawReservations = await storage.getReservationsByRide(rideId);
    const reservations = await Promise.all(rawReservations.map(async (r) => {
      const passenger = await storage.getUser(r.passengerId);
      return { ...r, passengerName: passenger?.fullName || "Passageiro", userName: passenger?.fullName };
    }));
    res.json({ reservations });
  } catch (e: any) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { fullName, phone } = req.body;
    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone.trim() || null;
    const updated = await storage.updateUser(user.id, updates);
    const { password: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (e: any) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── RECURRING SCHEDULES ──
router.get("/recurring", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as "boat" | "car" | undefined;
    const schedules = await storage.getActiveRecurringSchedules(type);
    const enriched = await Promise.all(schedules.map(async (s) => {
      const user = await storage.getUser(s.userId);
      return { ...s, userName: user?.fullName, userUsername: user?.username };
    }));
    res.json({ schedules: enriched });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/recurring/mine", requireAuth, async (req: Request, res: Response) => {
  const schedules = await storage.getRecurringSchedulesByUser((req.user as any).id);
  res.json({ schedules });
});

router.post("/recurring", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { rideType, originCity, destinationCity, daysOfWeek, departureTime, returnTime, pricePerSeat, totalSeats, description } = req.body;
    if (!rideType || !originCity || !destinationCity || !daysOfWeek || !departureTime) return res.status(400).json({ error: "Campos obrigatórios faltando." });
    const schedule = await storage.createRecurringSchedule({
      userId: user.id, rideType, originCity, destinationCity,
      daysOfWeek: JSON.stringify(daysOfWeek),
      departureTime, returnTime: returnTime || null,
      pricePerSeat: pricePerSeat ? parseFloat(pricePerSeat).toString() : null,
      totalSeats: totalSeats ? parseInt(totalSeats) : null,
      description: description || null,
    });
    res.json({ schedule });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/recurring/:id", requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  await storage.deactivateRecurringSchedule(id, (req.user as any).id);
  res.json({ success: true });
});

// ── RESERVATIONS ──
router.post("/reservations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { rideId, seats } = req.body;
    if (!rideId || !seats) return res.status(400).json({ error: "Dados inválidos." });
    const ride = await storage.getRide(parseInt(rideId));
    if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
    if (ride.status !== "active") return res.status(400).json({ error: "Viagem não disponível." });
    if (ride.captainId === user.id) return res.status(400).json({ error: "Você não pode reservar sua própria viagem." });
    const numSeats = parseInt(seats);
    if (ride.availableSeats < numSeats) return res.status(400).json({ error: "Assentos insuficientes." });
    const existing = await storage.getUserReservationForRide(ride.id, user.id);
    if (existing?.status === "confirmed") return res.status(400).json({ error: "Você já reservou esta viagem." });
    const totalPrice = (parseFloat(ride.pricePerSeat) * numSeats).toString();
    const reservation = await storage.createReservation({ rideId: ride.id, passengerId: user.id, seats: numSeats, totalPrice });
    res.json({ reservation });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/my/reservations", requireAuth, async (req: Request, res: Response) => {
  const user = req.user as any;
  const myRes = await storage.getReservationsByPassenger(user.id);
  const enriched = await Promise.all(myRes.map(async (r) => {
    const ride = await storage.getRide(r.rideId);
    const captain = ride ? await storage.getUser(ride.captainId) : null;
    return { ...r, ride, captainName: captain?.fullName };
  }));
  res.json({ reservations: enriched });
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

// ── MESSAGES ──
router.get("/messages/:reservationId", requireAuth, async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.reservationId as string);
  const reservation = await storage.getReservation(reservationId);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada" });
  const ride = await storage.getRide(reservation.rideId);
  if ((req.user as any).id !== reservation.passengerId && (req.user as any).id !== ride?.captainId) {
    return res.status(403).json({ error: "Sem permissão" });
  }
  const msgs = await storage.getMessagesByReservation(reservationId);
  const enriched = await Promise.all(msgs.map(async m => {
    const sender = await storage.getUser(m.senderId);
    return { ...m, senderName: sender?.fullName || "Usuário" };
  }));
  res.json({ messages: enriched });
});

router.post("/messages/:reservationId", requireAuth, async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.reservationId as string);
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: "Mensagem vazia" });
  const reservation = await storage.getReservation(reservationId);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada" });
  const ride = await storage.getRide(reservation.rideId);
  if ((req.user as any).id !== reservation.passengerId && (req.user as any).id !== ride?.captainId) {
    return res.status(403).json({ error: "Sem permissão" });
  }
  const msg = await storage.createMessage({ reservationId, senderId: (req.user as any).id, body: body.trim() });
  res.json({ message: msg });
});

// ── REVIEWS ──
router.post("/reviews", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { rideId, rating, comment } = req.body;
    if (!rideId || !rating) return res.status(400).json({ error: "Dados inválidos." });
    const ride = await storage.getRide(parseInt(rideId));
    if (!ride) return res.status(404).json({ error: "Viagem não encontrada." });
    const review = await storage.createReview({ rideId: parseInt(rideId), reviewerId: user.id, captainId: ride.captainId, rating: parseInt(rating), comment: comment || null });
    res.json({ review });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/captain/:userId/reviews", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido." });
  const [reviewList, avgRating] = await Promise.all([storage.getReviewsByCaptain(userId), storage.getCaptainAverageRating(userId)]);
  const enriched = await Promise.all(reviewList.map(async (r) => {
    const reviewer = await storage.getUser(r.reviewerId);
    return { ...r, reviewerName: reviewer?.fullName || "Passageiro" };
  }));
  res.json({ reviews: enriched, avgRating });
});

// ── PUBLIC DRIVER PROFILE ──
router.get("/driver/:userId/profile", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido." });
  const [profile, user] = await Promise.all([storage.getDriverProfile(userId), storage.getUser(userId)]);
  if (!profile || !user) return res.status(404).json({ error: "Motorista não encontrado." });
  const { password: _, ...safe } = user;
  res.json({ profile, user: safe });
});

export default router;

