export type CoastalPoint = {
  name: string;
  municipality: string;
  type: "city" | "beach" | "island" | "community";
  latitude: number;
  longitude: number;
};

/**
 * Named pickup and drop-off points for the first coastal pilot.
 * Coordinates are map-friendly reference points; the captain can refine the
 * exact pin on the map when publishing a trip.
 */
export const ILHABELA_BEACHES: CoastalPoint[] = [
  { name: "Praia do Perequê", municipality: "Ilhabela", type: "beach", latitude: -23.8059, longitude: -45.3565 },
  { name: "Praia do Engenho d'Água", municipality: "Ilhabela", type: "beach", latitude: -23.7952, longitude: -45.3478 },
  { name: "Praia da Vila", municipality: "Ilhabela", type: "beach", latitude: -23.7785, longitude: -45.3486 },
  { name: "Praia do Saco da Capela", municipality: "Ilhabela", type: "beach", latitude: -23.7767, longitude: -45.3440 },
  { name: "Praia do Pequeá", municipality: "Ilhabela", type: "beach", latitude: -23.7730, longitude: -45.3418 },
  { name: "Praia de Itaquanduba", municipality: "Ilhabela", type: "beach", latitude: -23.7698, longitude: -45.3372 },
  { name: "Praia dos Barreiros", municipality: "Ilhabela", type: "beach", latitude: -23.7606, longitude: -45.3317 },
  { name: "Praia de Santa Tereza", municipality: "Ilhabela", type: "beach", latitude: -23.7646, longitude: -45.3370 },
  { name: "Praia do Viana", municipality: "Ilhabela", type: "beach", latitude: -23.7508, longitude: -45.3230 },
  { name: "Praia da Siriúba", municipality: "Ilhabela", type: "beach", latitude: -23.7448, longitude: -45.3177 },
  { name: "Praia do Sino", municipality: "Ilhabela", type: "beach", latitude: -23.7390, longitude: -45.3128 },
  { name: "Praia do Arrozal", municipality: "Ilhabela", type: "beach", latitude: -23.7358, longitude: -45.3096 },
  { name: "Praia do Pinto", municipality: "Ilhabela", type: "beach", latitude: -23.7314, longitude: -45.3066 },
  { name: "Praia da Armação", municipality: "Ilhabela", type: "beach", latitude: -23.7248, longitude: -45.3030 },
  { name: "Praia do Pacuíba", municipality: "Ilhabela", type: "beach", latitude: -23.7064, longitude: -45.2935 },
  { name: "Praia do Jabaquara", municipality: "Ilhabela", type: "beach", latitude: -23.6910, longitude: -45.2775 },
  { name: "Praia da Fome", municipality: "Ilhabela", type: "beach", latitude: -23.6808, longitude: -45.2701 },
  { name: "Praia de Castelhanos", municipality: "Ilhabela", type: "beach", latitude: -23.7509, longitude: -45.1466 },
  { name: "Praia do Eustáquio", municipality: "Ilhabela", type: "beach", latitude: -23.7719, longitude: -45.2020 },
  { name: "Praia da Serraria", municipality: "Ilhabela", type: "beach", latitude: -23.7880, longitude: -45.2143 },
  { name: "Praia do Enchovas", municipality: "Ilhabela", type: "beach", latitude: -23.9001, longitude: -45.2394 },
  { name: "Praia do Bonete", municipality: "Ilhabela", type: "beach", latitude: -23.9190, longitude: -45.2230 },
  { name: "Praia da Feiticeira", municipality: "Ilhabela", type: "beach", latitude: -23.8650, longitude: -45.2895 },
  { name: "Praia do Portinho", municipality: "Ilhabela", type: "beach", latitude: -23.8725, longitude: -45.2860 },
  { name: "Praia do Oscar", municipality: "Ilhabela", type: "beach", latitude: -23.8790, longitude: -45.2830 },
  { name: "Praia do Julião", municipality: "Ilhabela", type: "beach", latitude: -23.8820, longitude: -45.2812 },
  { name: "Praia Grande", municipality: "Ilhabela", type: "beach", latitude: -23.8872, longitude: -45.2787 },
  { name: "Praia do Curral", municipality: "Ilhabela", type: "beach", latitude: -23.9000, longitude: -45.2670 },
  { name: "Praia do Veloso", municipality: "Ilhabela", type: "beach", latitude: -23.9165, longitude: -45.2535 },
  { name: "Praia da Caveira", municipality: "Ilhabela", type: "beach", latitude: -23.8220, longitude: -45.1800 },
  { name: "Praia do Guanxuma", municipality: "Ilhabela", type: "beach", latitude: -23.7920, longitude: -45.1610 },
];

export const COASTAL_CITY_NAMES = [
  "São Sebastião", "Ilhabela", "Ubatuba", "Caraguatatuba", "Bertioga",
  "Santos", "Guarujá", "São Vicente", "Praia Grande", "Mongaguá",
  "Itanhaém", "Peruíbe", "Iguape", "Ilha Comprida", "Cananéia",
  "Angra dos Reis", "Paraty", "Ilha Grande",
];

export const COASTAL_POINT_NAMES = [
  ...COASTAL_CITY_NAMES,
  "Bonete",
  "Castelhanos",
  ...ILHABELA_BEACHES.map((point) => point.name),
];

export const COASTAL_POINT_COORDS: Record<string, [number, number]> = Object.fromEntries(
  ILHABELA_BEACHES.map((point) => [point.name, [point.latitude, point.longitude]]),
) as Record<string, [number, number]>;
