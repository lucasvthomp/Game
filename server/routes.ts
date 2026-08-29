import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage.js";
import passport from "passport";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PILOT_ROUTES } from "../shared/pilot-routes.js";
import { getMarineConditions } from "./providers/marine-weather.js";
import { getPaymentProvider } from "./providers/payment.js";

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
function requireCaptain(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Não autenticado." });
  const role = (req.user as any).role;
  if (!["captain", "both"].includes(role)) return res.status(403).json({ error: "Complete seu perfil de capitão primeiro." });
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Não autenticado." });
  if ((req.user as any).role !== "admin") return res.status(403).json({ error: "Acesso restrito à equipe Marcamar." });
  next();
}

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

router.get("/notifications", requireAuth, async (req: Request, res: Response) => {
  res.json({ notifications: await storage.getNotificationsByUser((req.user as any).id) });
});

router.patch("/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });
  const notification = await storage.markNotificationRead(id, (req.user as any).id);
  if (!notification) return res.status(404).json({ error: "Notificação não encontrada." });
  res.json({ notification });
});

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
    const { email, username, password, fullName, homeCity, phone } = req.body;
    if (!email || !password || !username || !fullName || !homeCity) return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    if (password.length < 6) return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
    if (await storage.getUserByEmail(email.toLowerCase().trim())) return res.status(400).json({ error: "Email já cadastrado." });
    if (await storage.getUserByUsername(username.trim())) return res.status(400).json({ error: "Nome de usuário já em uso." });
    const user = await storage.createUser({ email: email.toLowerCase().trim(), username: username.trim(), password, fullName: fullName.trim(), homeCity: homeCity.trim(), phone: phone?.trim() || null, role: "passenger" });
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

router.get("/routes/popular", (_req: Request, res: Response) => {
  res.json({ routes: PILOT_ROUTES.filter((route) => route.active) });
});

router.get("/weather/marine", async (req: Request, res: Response) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: "Latitude e longitude são obrigatórias." });
  try {
    const conditions = await getMarineConditions(latitude, longitude, date);
    res.json({ conditions, disclaimer: "Condições previstas. Consulte o operador e informações marítimas oficiais antes da viagem." });
  } catch (error: any) {
    res.status(502).json({ error: "Condições marítimas indisponíveis no momento.", detail: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
});

router.get("/locations", async (_req: Request, res: Response) => {
  res.json({ locations: await storage.listLocations() });
});

router.get("/maritime-routes", async (_req: Request, res: Response) => {
  res.json({ routes: (await storage.listMaritimeRoutes()).filter((route) => route.active) });
});

router.post("/commercial-waitlist", async (req: Request, res: Response) => {
  try {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const company = typeof req.body.company === "string" ? req.body.company.trim() : "";
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const interest = typeof req.body.interest === "string" ? req.body.interest : "";
    const notes = typeof req.body.notes === "string" ? req.body.notes.trim() : "";
    const allowedInterests = ["people", "cargo", "both"];

    if (!fullName || !email || !allowedInterests.includes(interest)) {
      return res.status(400).json({ error: "Informe nome, email e o tipo de transporte comercial." });
    }
    if (fullName.length > 120 || email.length > 160 || company.length > 160 || phone.length > 40 || notes.length > 1000) {
      return res.status(400).json({ error: "Revise os limites dos campos enviados." });
    }

    const existing = await storage.getCommercialWaitlistByEmail(email);
    if (existing) return res.json({ entry: existing, alreadyRegistered: true });

    const entry = await storage.createCommercialWaitlist({
      fullName,
      email,
      company: company || null,
      phone: phone || null,
      interest,
      notes: notes || null,
    });
    res.status(201).json({ entry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Não foi possível registrar seu interesse comercial." });
  }
});

router.post("/route-requests", requireAuth, async (req: Request, res: Response) => {
  try {
    const origin = typeof req.body.origin === "string" ? req.body.origin.trim() : "";
    const destination = typeof req.body.destination === "string" ? req.body.destination.trim() : "";
    const notes = typeof req.body.notes === "string" ? req.body.notes.trim() : "";
    const passengers = Number(req.body.passengers || 1);
    const requestedDate = req.body.requestedDate ? new Date(req.body.requestedDate) : null;

    if (!origin || !destination) return res.status(400).json({ error: "Informe a origem e o destino." });
    if (origin.toLocaleLowerCase("pt-BR") === destination.toLocaleLowerCase("pt-BR")) {
      return res.status(400).json({ error: "Origem e destino precisam ser diferentes." });
    }
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 12) {
      return res.status(400).json({ error: "Escolha entre 1 e 12 passageiros." });
    }
    if (requestedDate && Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ error: "A data solicitada é inválida." });
    }
    if (origin.length > 120 || destination.length > 120 || notes.length > 1000) {
      return res.status(400).json({ error: "Revise os limites de texto do pedido." });
    }

    const request = await storage.createRouteRequest({
      userId: (req.user as any).id,
      origin,
      destination,
      requestedDate,
      passengers,
      notes: notes || null,
      status: "open",
      adminNotes: null,
    });
    res.status(201).json({ request });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Não foi possível registrar o pedido." });
  }
});

router.get("/my/route-requests", requireAuth, async (req: Request, res: Response) => {
  res.json({ requests: await storage.getRouteRequestsByUser((req.user as any).id) });
});

router.get("/admin/route-requests", requireAdmin, async (_req: Request, res: Response) => {
  const requests = await storage.listRouteRequests();
  const enriched = await Promise.all(requests.map(async (request) => {
    const user = await storage.getUser(request.userId);
    return {
      ...request,
      user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
    };
  }));
  res.json({ requests: enriched });
});

router.patch("/admin/route-requests/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const status = typeof req.body.status === "string" ? req.body.status : undefined;
  const adminNotes = typeof req.body.adminNotes === "string" ? req.body.adminNotes.trim() : undefined;
  const allowedStatuses = ["open", "reviewing", "matched", "closed"];
  if (!Number.isInteger(id) || !status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Status de pedido inválido." });
  }
  const request = await storage.updateRouteRequest(id, {
    status,
    ...(adminNotes !== undefined ? { adminNotes: adminNotes || null } : {}),
  });
  if (!request) return res.status(404).json({ error: "Pedido de rota não encontrado." });

  const statusLabel: Record<string, string> = {
    open: "recebido",
    reviewing: "em análise",
    matched: "encontramos uma possibilidade",
    closed: "encerrado",
  };
  await storage.createNotification({
    userId: request.userId,
    type: "route_request",
    title: "Atualização do pedido de rota",
    body: "Seu pedido de " + request.origin + " para " + request.destination + " foi " + statusLabel[status] + ".",
    href: "/solicitar-rota",
  });
  res.json({ request });
});

router.post("/admin/locations", requireAdmin, async (req: Request, res: Response) => {
  const { name, slug, type, latitude, longitude, municipality, meetingInstructions } = req.body;
  if (!name || !slug || !type) return res.status(400).json({ error: "Nome, slug e tipo são obrigatórios." });
  const location = await storage.createLocation({ name, slug, type, latitude: latitude ?? null, longitude: longitude ?? null, municipality: municipality ?? null, meetingInstructions: meetingInstructions ?? null });
  res.status(201).json({ location });
});

router.get("/admin/maritime-routes", requireAdmin, async (_req: Request, res: Response) => {
  res.json({ routes: await storage.listMaritimeRoutes() });
});

router.post("/admin/maritime-routes", requireAdmin, async (req: Request, res: Response) => {
  const { name, originLocationId, destinationLocationId, geojson, distanceNm, typicalDurationMinutes, region, notes } = req.body;
  if (!name || !originLocationId || !destinationLocationId) return res.status(400).json({ error: "Nome, origem e destino são obrigatórios." });
  const route = await storage.createMaritimeRoute({ name, originLocationId: Number(originLocationId), destinationLocationId: Number(destinationLocationId), geojson: geojson ?? null, distanceNm: distanceNm ?? null, typicalDurationMinutes: typicalDurationMinutes ?? null, region: region ?? null, notes: notes ?? null, active: false });
  res.status(201).json({ route });
});

router.patch("/admin/maritime-routes/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id) || typeof req.body.active !== "boolean") return res.status(400).json({ error: "Dados inválidos." });
  const route = await storage.setMaritimeRouteActive(id, req.body.active);
  if (!route) return res.status(404).json({ error: "Rota não encontrada." });
  res.json({ route });
});

router.get("/admin/incidents", requireAdmin, async (_req: Request, res: Response) => {
  res.json({ incidents: await storage.listIncidents() });
});

router.patch("/admin/incidents/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const allowed = ["open", "investigating", "resolved", "dismissed"];
  if (isNaN(id) || !allowed.includes(req.body.status)) return res.status(400).json({ error: "Status inválido." });
  const incident = await storage.updateIncidentStatus(id, req.body.status);
  if (!incident) return res.status(404).json({ error: "Incidente não encontrado." });
  res.json({ incident });
});

// ── ADMIN VERIFICATION ──
router.get("/admin/verifications", requireAdmin, async (_req: Request, res: Response) => {
  const captains = await storage.listCaptainProfiles();
  res.json({ captains });
});

router.patch("/admin/verifications/captain/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const verified = typeof req.body.verified === "boolean" ? req.body.verified : undefined;
  const topCaptain = typeof req.body.topCaptain === "boolean" ? req.body.topCaptain : undefined;
  if (isNaN(id) || (verified === undefined && topCaptain === undefined)) return res.status(400).json({ error: "Dados inválidos." });
  let profile = verified === undefined ? await storage.getCaptainProfileById(id) : await storage.setCaptainVerified(id, verified);
  if (topCaptain !== undefined) profile = await storage.setCaptainTop(id, topCaptain);
  if (!profile) return res.status(404).json({ error: "Perfil não encontrado." });
  res.json({ profile });
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

// ── LANCHA RIDES ──
router.get("/rides", async (req: Request, res: Response) => {
  try {
    const from = typeof req.query.from === "string" ? req.query.from.trim().toLocaleLowerCase("pt-BR") : "";
    const to = typeof req.query.to === "string" ? req.query.to.trim().toLocaleLowerCase("pt-BR") : "";
    const date = typeof req.query.date === "string" ? req.query.date : "";
    const passengers = Math.max(1, parseInt(String(req.query.passengers || "1"), 10) || 1);
    let activeRides = await storage.getActiveRides("boat");
    activeRides = activeRides.filter((ride) => {
      const matchesFrom = !from || ride.originCity.toLocaleLowerCase("pt-BR").includes(from);
      const matchesTo = !to || ride.destinationCity.toLocaleLowerCase("pt-BR").includes(to);
      const matchesDate = !date || ride.departureTime.toISOString().slice(0, 10) === date;
      return matchesFrom && matchesTo && matchesDate && ride.availableSeats >= passengers;
    });
    const enriched = await Promise.all(activeRides.map(async (ride) => {
      const captain = await storage.getUser(ride.captainId);
      const [captainProfile, avgRating, captainReviews] = await Promise.all([
        storage.getCaptainProfile(ride.captainId),
        storage.getCaptainAverageRating(ride.captainId),
        storage.getReviewsByCaptain(ride.captainId),
      ]);
      return {
        ...ride,
        captainName: captain?.fullName || "Capitão",
        captainUsername: captain?.username,
        captainAvatarUrl: captain?.avatarUrl || null,
        captainVerified: Boolean(captainProfile?.verified),
        captainTop: Boolean(captainProfile?.topCaptain),
        boatName: captainProfile?.boatName,
        captainBoatModel: captainProfile?.boatModel || null,
        captainBoatCapacity: captainProfile?.boatCapacity || ride.totalSeats,
        captainReviewCount: captainReviews.length,
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
  if (!ride || ride.rideType !== "boat") return res.status(404).json({ error: "Viagem de lancha não encontrada." });
  const captain = await storage.getUser(ride.captainId);
  const [captainProfile, avgRating, reviewsData] = await Promise.all([
    storage.getCaptainProfile(ride.captainId),
    storage.getCaptainAverageRating(ride.captainId),
    storage.getReviewsByCaptain(ride.captainId),
  ]);
  const { password: _, ...safe } = captain as any;
  res.json({ ride, captain: safe, captainProfile, avgRating, reviewCount: reviewsData.length });
});

router.post("/rides", requireCaptain, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { originCity, destinationCity, departureTime, returnTime, pricePerSeat, totalSeats, description,
            originLat, originLng, destLat, destLng } = req.body;
    if (!originCity || !destinationCity || !departureTime || !pricePerSeat || !totalSeats) return res.status(400).json({ error: "Preencha todos os campos." });
    const profile = await storage.getCaptainProfile(user.id);
    if (!profile) return res.status(400).json({ error: "Complete seu perfil de capitão primeiro." });
    if (!profile.verified) return res.status(403).json({ error: "Seu perfil de capitão ainda aguarda verificação Marcamar." });
    const seats = parseInt(totalSeats);
    const coord = (v: any) => (v === undefined || v === null || v === "" ? null : parseFloat(v).toString());
    const ride = await storage.createRide({
      captainId: user.id,
      rideType: "boat",
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

router.get("/my/rides", requireCaptain, async (req: Request, res: Response) => {
  const user = req.user as any;
  const myRides = (await storage.getRidesByCaptain(user.id)).filter((ride) => ride.rideType === "boat");
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
  if (!ride || ride.rideType !== "boat") return res.status(404).json({ error: "Viagem de lancha não encontrada." });
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
    // Only the captain can see reservations
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

router.post("/me/avatar", requireAuth, upload.single("avatar"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Escolha uma imagem JPG, PNG ou WebP." });
    const user = req.user as any;
    const updated = await storage.updateUser(user.id, { avatarUrl: `/uploads/${req.file.filename}` });
    const { password: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Não foi possível salvar sua foto." });
  }
});

router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { fullName, homeCity, phone } = req.body;
    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (homeCity !== undefined) updates.homeCity = homeCity.trim() || null;
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
    const schedules = await storage.getActiveRecurringSchedules("boat");
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
    const { originCity, destinationCity, daysOfWeek, departureTime, returnTime, pricePerSeat, totalSeats, description } = req.body;
    if (!originCity || !destinationCity || !daysOfWeek || !departureTime) return res.status(400).json({ error: "Campos obrigatórios faltando." });
    const schedule = await storage.createRecurringSchedule({
      userId: user.id, rideType: "boat", originCity, destinationCity,
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

router.post("/reservations/:id/payment-intent", requireAuth, async (req: Request, res: Response) => {
  const reservationId = parseInt(req.params.id as string);
  if (isNaN(reservationId)) return res.status(400).json({ error: "ID inválido." });
  const reservation = await storage.getReservation(reservationId);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada." });
  if (reservation.passengerId !== (req.user as any).id) return res.status(403).json({ error: "Sem permissão." });
  try {
    const amountCents = Math.round(parseFloat(reservation.totalPrice) * 100);
    const intent = await getPaymentProvider().createPaymentIntent(amountCents, reservation.id);
    res.json({ intent });
  } catch (error: any) {
    if (error.message === "PAYMENT_PROVIDER_NOT_CONFIGURED") return res.status(503).json({ error: "Pagamentos ainda não configurados." });
    res.status(502).json({ error: "Não foi possível iniciar o pagamento." });
  }
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

router.post("/reservations/:id/check-in", requireAuth, async (req: Request, res: Response) => {
  const reservation = await storage.getReservation(parseInt(req.params.id as string));
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada." });
  const ride = await storage.getRide(reservation.rideId);
  const userId = (req.user as any).id;
  if (userId !== reservation.passengerId && userId !== ride?.captainId) return res.status(403).json({ error: "Sem permissão." });
  if (!["confirmed", "payment_succeeded"].includes(reservation.status)) return res.status(400).json({ error: "Reserva não está pronta para check-in." });
  const updated = await storage.updateReservationStatus(reservation.id, "checked_in");
  res.json({ reservation: updated });
});

router.post("/reservations/:id/complete", requireAuth, async (req: Request, res: Response) => {
  const reservation = await storage.getReservation(parseInt(req.params.id as string));
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada." });
  const ride = await storage.getRide(reservation.rideId);
  if ((req.user as any).id !== ride?.captainId) return res.status(403).json({ error: "Somente o operador pode concluir a viagem." });
  const updated = await storage.updateReservationStatus(reservation.id, "completed");
  res.json({ reservation: updated });
});

router.post("/reservations/:id/incidents", requireAuth, async (req: Request, res: Response) => {
  const reservation = await storage.getReservation(parseInt(req.params.id as string));
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada." });
  const ride = await storage.getRide(reservation.rideId);
  const userId = (req.user as any).id;
  if (userId !== reservation.passengerId && userId !== ride?.captainId) return res.status(403).json({ error: "Sem permissão." });
  const { type, description } = req.body;
  if (!type || !description?.trim()) return res.status(400).json({ error: "Tipo e descrição são obrigatórios." });
  const incident = await storage.createIncident({ reservationId: reservation.id, reporterId: userId, type, description: description.trim(), status: "open" });
  res.status(201).json({ incident });
});

router.get("/reservations/:id/incidents", requireAuth, async (req: Request, res: Response) => {
  const reservation = await storage.getReservation(parseInt(req.params.id as string));
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada." });
  const ride = await storage.getRide(reservation.rideId);
  const userId = (req.user as any).id;
  if (userId !== reservation.passengerId && userId !== ride?.captainId && (req.user as any).role !== "admin") return res.status(403).json({ error: "Sem permissão." });
  res.json({ incidents: await storage.getIncidentsByReservation(reservation.id) });
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

export default router;

