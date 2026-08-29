import { pool } from "./db.js";
import { hashPassword } from "./auth.js";

const DISABLED_VALUES = new Set(["false", "0", "off", "no"]);

function demoDataEnabled() {
  const setting = process.env.DEMO_DATA;
  return setting === undefined || !DISABLED_VALUES.has(setting.toLowerCase());
}

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
    const demoUsers = [
      {
        email: "demo.capitao@marcamar.test",
        username: "demo-capitao",
        fullName: "Marina Costa",
        homeCity: "Ilhabela",
        phone: "+55 12 99999-0001",
        role: "captain",
      },
      {
        email: "demo.motorista@marcamar.test",
        username: "demo-motorista",
        fullName: "Rafael Souza",
        homeCity: "São Sebastião",
        phone: "+55 12 99999-0002",
        role: "driver",
      },
      {
        email: "demo.passageiro@marcamar.test",
        username: "demo-passageiro",
        fullName: "Ana Ribeiro",
        homeCity: "Ilhabela",
        phone: "+55 12 99999-0003",
        role: "passenger",
      },
    ];

    for (const user of demoUsers) {
      await pool.query(
        `INSERT INTO users (email, username, password, full_name, home_city, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           username = EXCLUDED.username,
           password = EXCLUDED.password,
           full_name = EXCLUDED.full_name,
           home_city = EXCLUDED.home_city,
           phone = EXCLUDED.phone,
           role = EXCLUDED.role`,
        [user.email, user.username, password, user.fullName, user.homeCity, user.phone, user.role],
      );
    }

    const captainResult = await pool.query<{ id: number }>(
      "SELECT id FROM users WHERE username = 'demo-capitao' LIMIT 1",
    );
    const driverResult = await pool.query<{ id: number }>(
      "SELECT id FROM users WHERE username = 'demo-motorista' LIMIT 1",
    );
    if (!captainResult.rows[0] || !driverResult.rows[0]) throw new Error("Demo users could not be created.");

    const captainId = captainResult.rows[0].id;
    const driverId = driverResult.rows[0].id;

    await pool.query(
      `INSERT INTO captain_profiles
        (user_id, license_number, license_image_url, boat_name, boat_model, boat_capacity, boat_image_url, bio, verified)
       SELECT $1, 'DEMO-CAP-001', '/images/marcamar-map-route.svg', 'Vento Sul', 'Lancha cabinada 24', 8,
              '/images/marcamar-map-route.svg', 'Capitã local com saídas entre as praias de Ilhabela.', true
       WHERE NOT EXISTS (SELECT 1 FROM captain_profiles WHERE user_id = $1)`,
      [captainId],
    );

    await pool.query(
      `INSERT INTO driver_profiles
        (user_id, license_number, license_image_url, car_make, car_model, car_year, car_color, car_capacity, car_image_url, bio, verified)
       SELECT $1, 'DEMO-CNH-001', '/images/marcamar-map-coast.svg', 'Toyota', 'Yaris', 2023, 'Azul-marinho', 4,
              '/images/marcamar-map-coast.svg', 'Motorista parceiro para conexões entre os municípios do litoral.', true
       WHERE NOT EXISTS (SELECT 1 FROM driver_profiles WHERE user_id = $1)`,
      [driverId],
    );

    await pool.query(
      `INSERT INTO rides
        (captain_id, ride_type, origin_city, destination_city, origin_lat, origin_lng, dest_lat, dest_lng,
         departure_time, return_time, price_per_seat, total_seats, available_seats, description, status)
       SELECT captain_id, ride_type, origin_city, destination_city, origin_lat, origin_lng, dest_lat, dest_lng,
              departure_time, return_time, price_per_seat, total_seats, available_seats, description, 'active'
       FROM (
         VALUES
           ($1, 'boat', 'Praia do Perequê', 'Praia do Bonete', -23.8059, -45.3565, -23.9190, -45.2230,
            NOW() + INTERVAL '2 days', NULL::timestamp, 125.00, 8, 5, '[DEMO] Manhã tranquila até o Bonete · confirme o cais na conversa.'),
           ($1, 'boat', 'Praia do Perequê', 'Praia de Castelhanos', -23.8059, -45.3565, -23.7509, -45.1466,
            NOW() + INTERVAL '3 days', NULL::timestamp, 160.00, 8, 6, '[DEMO] Travessia panorâmica para Castelhanos em lancha pequena.'),
           ($1, 'boat', 'Praia do Curral', 'Praia do Engenho d''Água', -23.9000, -45.2670, -23.7952, -45.3478,
            NOW() + INTERVAL '5 days', NULL::timestamp, 95.00, 6, 4, '[DEMO] Conexão costeira entre Curral e Engenho d''Água.'),
           ($2, 'car', 'São Sebastião', 'Caraguatatuba', -23.7950, -45.4140, -23.6200, -45.4130,
            NOW() + INTERVAL '2 days', NULL::timestamp, 35.00, 4, 3, '[DEMO] Carona de teste para validar o fluxo terrestre.')
       ) AS seed(captain_id, ride_type, origin_city, destination_city, origin_lat, origin_lng, dest_lat, dest_lng,
                 departure_time, return_time, price_per_seat, total_seats, available_seats, description)
       WHERE NOT EXISTS (
         SELECT 1 FROM rides existing
         WHERE existing.description LIKE '[DEMO]%'
       )`,
      [captainId, driverId],
    );

    console.log("Demo data ready (set DEMO_DATA=false to disable).");
  } catch (error) {
    console.error("Demo data seed skipped:", error);
  }
}
