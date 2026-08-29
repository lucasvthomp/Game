import { pool } from "./db.js";
import { hashPassword } from "./auth.js";

const DISABLED_VALUES = new Set(["false", "0", "off", "no"]);

function demoDataEnabled() {
  const setting = process.env.DEMO_DATA;
  return setting === undefined || !DISABLED_VALUES.has(setting.toLowerCase());
}

const demoUsers = [
  { key: "captain", email: "demo.capitao@marcamar.test", username: "demo-capitao", fullName: "Marina Costa", homeCity: "Ilhabela", phone: "+55 12 99999-0001", role: "captain" },
  { key: "driver", email: "demo.motorista@marcamar.test", username: "demo-motorista", fullName: "Rafael Souza", homeCity: "São Sebastião", phone: "+55 12 99999-0002", role: "driver" },
  { key: "passenger", email: "demo.passageiro@marcamar.test", username: "demo-passageiro", fullName: "Ana Ribeiro", homeCity: "Ilhabela", phone: "+55 12 99999-0003", role: "passenger" },
] as const;

/**
 * Seeds fictional records so every core flow can be exercised before launch.
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

    // Upsert each user independently so one existing/partial record never blocks the others.
    for (const user of demoUsers) {
      const existing = await pool.query<{ id: number }>(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [user.email],
      );
      if (existing.rows[0]) {
        await pool.query(`UPDATE users SET username = $2, password = $3, full_name = $4, home_city = $5, phone = $6, role = $7 WHERE id = $1`, [existing.rows[0].id, user.username, password, user.fullName, user.homeCity, user.phone, user.role]);
        userIds[user.key] = existing.rows[0].id;
        continue;
      }
      const inserted = await pool.query<{ id: number }>(
        "INSERT INTO users (email, username, password, full_name, home_city, phone, role) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING RETURNING id",
        [user.email, user.username, password, user.fullName, user.homeCity, user.phone, user.role],
      );
      const id = inserted.rows[0]?.id;
      if (!id) throw new Error(`Demo user ${user.email} could not be created.`);
      userIds[user.key] = id;
    }

    const captainId = userIds.captain;
    const driverId = userIds.driver;
    if (!captainId || !driverId) throw new Error("Demo operator users could not be created.");

    await pool.query(`INSERT INTO captain_profiles
  (user_id, license_number, license_image_url, boat_name, boat_model, boat_capacity, boat_image_url, bio, verified)
SELECT $1, 'DEMO-CAP-001', '/images/marcamar-map-route.svg', 'Vento Sul', 'Lancha cabinada 24', 8,
       '/images/marcamar-map-route.svg', 'Capitã local com saídas entre as praias de Ilhabela.', true
WHERE NOT EXISTS (SELECT 1 FROM captain_profiles WHERE user_id = $1)`, [captainId]);

    await pool.query(`INSERT INTO driver_profiles
  (user_id, license_number, license_image_url, car_make, car_model, car_year, car_color, car_capacity, car_image_url, bio, verified)
SELECT $1, 'DEMO-CNH-001', '/images/marcamar-map-coast.svg', 'Toyota', 'Yaris', 2023, 'Azul-marinho', 4,
       '/images/marcamar-map-coast.svg', 'Motorista parceiro para conexões entre os municípios do litoral.', true
WHERE NOT EXISTS (SELECT 1 FROM driver_profiles WHERE user_id = $1)`, [driverId]);

    const demoRides = [
      { captainId, rideType: "boat", originCity: "Praia do Perequê", destinationCity: "Praia do Bonete", originLat: -23.8059, originLng: -45.3565, destLat: -23.919, destLng: -45.223, departureDays: 2, price: 125, totalSeats: 8, availableSeats: 5, description: "[DEMO] Manhã tranquila até o Bonete · confirme o cais na conversa." },
      { captainId, rideType: "boat", originCity: "Praia do Perequê", destinationCity: "Praia de Castelhanos", originLat: -23.8059, originLng: -45.3565, destLat: -23.7509, destLng: -45.1466, departureDays: 3, price: 160, totalSeats: 8, availableSeats: 6, description: "[DEMO] Travessia panorâmica para Castelhanos em lancha pequena." },
      { captainId, rideType: "boat", originCity: "Praia do Curral", destinationCity: "Praia do Engenho d'Água", originLat: -23.9, originLng: -45.267, destLat: -23.7952, destLng: -45.3478, departureDays: 5, price: 95, totalSeats: 6, availableSeats: 4, description: "[DEMO] Conexão costeira entre Curral e Engenho d'Água." },
      { captainId: driverId, rideType: "car", originCity: "São Sebastião", destinationCity: "Caraguatatuba", originLat: -23.795, originLng: -45.414, destLat: -23.62, destLng: -45.413, departureDays: 2, price: 35, totalSeats: 4, availableSeats: 3, description: "[DEMO] Carona de teste para validar o fluxo terrestre." },
    ];

    // Insert each ride independently; this also repairs a partially seeded database.
    for (const ride of demoRides) {
      const exists = await pool.query<{ id: number }>(
        "SELECT id FROM rides WHERE description = $1 LIMIT 1",
        [ride.description],
      );
      if (exists.rows[0]) continue;
      await pool.query(`INSERT INTO rides
  (captain_id, ride_type, origin_city, destination_city, origin_lat, origin_lng, dest_lat, dest_lng,
   departure_time, return_time, price_per_seat, total_seats, available_seats, description, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, $10, $11, $12, $13, 'active')`, [
        ride.captainId, ride.rideType, ride.originCity, ride.destinationCity, ride.originLat, ride.originLng,
        ride.destLat, ride.destLng, new Date(Date.now() + ride.departureDays * 24 * 60 * 60 * 1000),
        ride.price, ride.totalSeats, ride.availableSeats, ride.description,
      ]);
    }

    console.log("Demo data ready (set DEMO_DATA=false to disable).");
  } catch (error) {
    console.error("Demo data seed skipped:", error instanceof Error ? error.message : error);
  }
}
