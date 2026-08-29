export type MarineConditions = {
  latitude: number;
  longitude: number;
  time: string;
  waveHeightMeters: number | null;
  wavePeriodSeconds: number | null;
  waveDirectionDegrees: number | null;
  windSpeedKmh: number | null;
  windDirectionDegrees: number | null;
  seaSurfaceTemperatureC: number | null;
  summary: "informational" | "unavailable";
  source: string;
  sourceUrl: string;
};

type OpenMeteoResponse = {
  hourly?: Record<string, Array<number | null>>;
  hourly_units?: Record<string, string>;
};

const SOURCE_NAME = "Open-Meteo Marine API";
const SOURCE_URL = "https://open-meteo.com/en/docs/marine-weather-api";

const hourlyFields = [
  "wave_height",
  "wave_period",
  "wave_direction",
  "wind_speed_10m",
  "wind_direction_10m",
  "sea_surface_temperature",
].join(",");

export async function getMarineConditions(latitude: number, longitude: number, date?: string): Promise<MarineConditions> {
  const baseUrl = process.env.OPEN_METEO_MARINE_URL || "https://marine-api.open-meteo.com/v1/marine";
  const day = date || new Date().toISOString().slice(0, 10);
  const url = new URL(baseUrl);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("hourly", hourlyFields);
  url.searchParams.set("start_date", day);
  url.searchParams.set("end_date", day);
  url.searchParams.set("timezone", "America/Sao_Paulo");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Marine provider returned ${response.status}`);
  const data = await response.json() as OpenMeteoResponse;
  const hourly = data.hourly || {};
  const index = 12;
  const value = (key: string) => hourly[key]?.[index] ?? hourly[key]?.[0] ?? null;
  return {
    latitude,
    longitude,
    time: day,
    waveHeightMeters: value("wave_height"),
    wavePeriodSeconds: value("wave_period"),
    waveDirectionDegrees: value("wave_direction"),
    windSpeedKmh: value("wind_speed_10m"),
    windDirectionDegrees: value("wind_direction_10m"),
    seaSurfaceTemperatureC: value("sea_surface_temperature"),
    summary: "informational",
    source: SOURCE_NAME,
    sourceUrl: SOURCE_URL,
  };
}
