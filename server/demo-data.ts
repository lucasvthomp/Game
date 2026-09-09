import { pool } from "./db.js";
import { hashPassword } from "./auth.js";

const DISABLED_VALUES = new Set(["false", "0", "off", "no"]);

function demoDataEnabled() {
  const setting = process.env.DEMO_DATA;
  return setting === undefined || !DISABLED_VALUES.has(setting.toLowerCase());
}

const demoUsers = [
  { key: "captain", email: "demo.capitao@marcamar.test", username: "demo-capitao", fullName: "Marina Costa", homeCity: "Ilhabela", phone: "+55 12 99999-0001", avatarUrl: "/images/marcamar-avatar-marina.svg", role: "captain" },
  { key: "passenger", email: "demo.passageiro@marcamar.test", username: "demo-passageiro", fullName: "Ana Ribeiro", homeCity: "Ilhabela", phone: "+55 12 99999-0003", avatarUrl: "/images/marcamar-avatar-ana.svg", role: "passenger" },
] as const;

/**
 * Seeds fictional lancha records so every passenger/captain flow can be exercised before launch.
 * Everything is marked [DEMO] and can be disabled with DEMO_DATA=false.
 */
export async function seedDemoData() {
  if (!demoDataEnabled()) {
    console.log("Demo data disabled (DEMO_DATA=false).");
    return;
  }

  try {
    const password = await hashPassword("marcamar-demo");
    const userIds: Record<string, number> = {};

    for (const user of demoUsers) {
      const existing = await pool.query<{ id: number }>(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [user.email],
      );
      if (existing.rows[0]) {
        await pool.query(`UPDATE users SET username = $2, password = $3, full_name = $4, home_city = $5, phone = $6, avatar_url = $7, role = $8 WHERE id = $1`, [existing.rows[0].id, user.username, password, user.fullName, user.homeCity, user.phone, user.avatarUrl, user.role]);
        userIds[user.key] = existing.rows[0].id;
        continue;
      }
      const inserted = await pool.query<{ id: number }>(
        "INSERT INTO users (email, username, password, full_name, home_city, phone, avatar_url, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING RETURNING id",
        [user.email, user.username, password, user.fullName, user.homeCity, user.phone, user.avatarUrl, user.role],
      );
      const id = inserted.rows[0]?.id;
      if (!id) throw new Error(`Demo user ${user.email} could not be created.`);
      userIds[user.key] = id;
    }

    const captainId = userIds.captain;
    if (!captainId) throw new Error("Demo captain could not be created.");

    await pool.query(`INSERT INTO captain_profiles
  (user_id, license_number, license_image_url, boat_name, boat_model, boat_capacity, boat_image_url, bio, verified, top_captain)
SELECT $1, 'DEMO-CAP-001', '/images/marcamar-map-route.svg', 'Vento Sul', 'Lancha cabinada 24', 8,
       '/images/marcamar-map-route.svg', 'Capitã local com saídas entre as praias de Ilhabela.', true, true
WHERE NOT EXISTS (SELECT 1 FROM captain_profiles WHERE user_id = $1)`, [captainId]);

    // Keep existing demo rows aligned when new trust fields are introduced.
    await pool.query("UPDATE captain_profiles SET verified = true, top_captain = true WHERE user_id = $1 AND license_number = 'DEMO-CAP-001'", [captainId]);

    const demoRides = [
      { originCity: "São Sebastião", destinationCity: "Ilhabela", originLat: -23.804, originLng: -45.414, destLat: -23.778, destLng: -45.358, departureDays: 1, price: 45, totalSeats: 8, availableSeats: 6, description: "[DEMO] Travessia de teste São Sebastião → Ilhabela." },
      { originCity: "Ilhabela", destinationCity: "São Sebastião", originLat: -23.778, originLng: -45.358, destLat: -23.804, destLng: -45.414, departureDays: 1, price: 45, totalSeats: 8, availableSeats: 5, description: "[DEMO] Travessia de teste Ilhabela → São Sebastião." },
      { originCity: "São Sebastião", destinationCity: "Ubatuba", originLat: -23.804, originLng: -45.414, destLat: -23.433, destLng: -45.071, departureDays: 2, price: 85, totalSeats: 8, availableSeats: 7, description: "[DEMO] Rota de teste São Sebastião → Ubatuba." },
      { originCity: "Ubatuba", destinationCity: "São Sebastião", originLat: -23.433, originLng: -45.071, destLat: -23.804, destLng: -45.414, departureDays: 2, price: 85, totalSeats: 8, availableSeats: 6, description: "[DEMO] Rota de teste Ubatuba → São Sebastião." },
      { originCity: "Ilhabela · Praia do Perequê", destinationCity: "Ilhabela · Praia do Bonete", originLat: -23.8059, originLng: -45.3565, destLat: -23.919, destLng: -45.223, departureDays: 3, price: 125, totalSeats: 8, availableSeats: 5, description: "[DEMO] Manhã tranquila até o Bonete · confirme o cais na conversa." },
      { originCity: "Bonete", destinationCity: "Ilhabela", originLat: -23.919, originLng: -45.223, destLat: -23.778, destLng: -45.358, departureDays: 3, price: 125, totalSeats: 8, availableSeats: 5, description: "[DEMO] Retorno de teste Bonete → Ilhabela." },
      { originCity: "Ilhabela · Praia do Perequê", destinationCity: "Ilhabela · Praia de Castelhanos", originLat: -23.8059, originLng: -45.3565, destLat: -23.7509, destLng: -45.1466, departureDays: 4, price: 160, totalSeats: 8, availableSeats: 6, description: "[DEMO] Travessia panorâmica para Castelhanos em lancha pequena." },
      { originCity: "Castelhanos", destinationCity: "Ilhabela", originLat: -23.7509, originLng: -45.1466, destLat: -23.778, destLng: -45.358, departureDays: 4, price: 160, totalSeats: 8, availableSeats: 6, description: "[DEMO] Retorno de teste Castelhanos → Ilhabela." },
      { originCity: "Ilhabela · Praia do Curral", destinationCity: "Ilhabela · Praia do Engenho d'Água", originLat: -23.9, originLng: -45.267, destLat: -23.7952, destLng: -45.3478, departureDays: 5, price: 95, totalSeats: 6, availableSeats: 4, description: "[DEMO] Conexão costeira entre Curral e Engenho d'Água." },
    ];

    // Remove the old car fixture once, then repair each lancha independently.
    await pool.query(`DELETE FROM rides WHERE description = '[DEMO] Carona de teste para validar o fluxo terrestre.' AND NOT EXISTS (SELECT 1 FROM reservations WHERE reservations.ride_id = rides.id)`);
    for (const ride of demoRides) {
      const exists = await pool.query<{ id: number }>(
        "SELECT id FROM rides WHERE description = $1 LIMIT 1",
        [ride.description],
      );
      if (exists.rows[0]) {
        await pool.query("UPDATE rides SET origin_city = $2, destination_city = $3, ride_type = 'boat' WHERE id = $1", [exists.rows[0].id, ride.originCity, ride.destinationCity]);
        continue;
      }
      await pool.query(`INSERT INTO rides
  (captain_id, ride_type, origin_city, destination_city, origin_lat, origin_lng, dest_lat, dest_lng,
   departure_time, return_time, price_per_seat, total_seats, available_seats, description, status)
VALUES ($1, 'boat', $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10, $11, $12, 'active')`, [
        captainId, ride.originCity, ride.destinationCity, ride.originLat, ride.originLng, ride.destLat, ride.destLng,
        new Date(Date.now() + ride.departureDays * 24 * 60 * 60 * 1000), ride.price, ride.totalSeats, ride.availableSeats, ride.description,
      ]);
    }

    // Seed clearly labeled fictional reviews so the trust UI can be exercised before launch.
    // They are idempotent and disappear with the rest of the demo data when DEMO_DATA=false.
    const passengerId = userIds.passenger;
    if (passengerId) {
      const demoReviewCopy = [
        ["[DEMO] Travessia de teste São Sebastião → Ilhabela.", 5, "Embarque simples e comunicação clara."],
        ["[DEMO] Travessia de teste Ilhabela → São Sebastião.", 5, "Lancha bem cuidada e horário cumprido."],
        ["[DEMO] Rota de teste São Sebastião → Ubatuba.", 4, "Boa condução e ponto de encontro bem explicado."],
        ["[DEMO] Rota de teste Ubatuba → São Sebastião.", 5, "Viagem tranquila pela costa."],
        ["[DEMO] Manhã tranquila até o Bonete · confirme o cais na conversa.", 5, "Capitã atenciosa durante todo o trajeto."],
        ["[DEMO] Retorno de teste Bonete → Ilhabela.", 5, "Tudo certo do início ao fim."],
        ["[DEMO] Travessia panorâmica para Castelhanos em lancha pequena.", 5, "Ótima experiência na água."],
        ["[DEMO] Retorno de teste Castelhanos → Ilhabela.", 5, "Ponto de embarque fácil de encontrar."],
        ["[DEMO] Conexão costeira entre Curral e Engenho d'Água.", 5, "Rota prática e bem organizada."],
      ] as const;
      for (const [description, rating, comment] of demoReviewCopy) {
        await pool.query(`INSERT INTO reviews (ride_id, reviewer_id, captain_id, rating, comment)
SELECT id, $1, captain_id, $2, $3 FROM rides
WHERE description = $4
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE ride_id = rides.id AND reviewer_id = $1)`, [passengerId, rating, comment, description]);
      }
    }

    console.log("Demo lancha data ready (set DEMO_DATA=false to disable).");
  } catch (error) {
    console.error("Demo data seed skipped:", error instanceof Error ? error.message : error);
  }
}
