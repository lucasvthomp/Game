import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COASTAL_POINT_COORDS } from "@shared/coastal-locations";

// ── Default marker icon fix for bundlers (Leaflet + Vite) ──
// Vite doesn't resolve the relative image URLs Leaflet expects, so we point the
// default icon at the CDN copies. Most pins use custom divIcons below, but this
// keeps any fallback <Marker> from rendering a broken image.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Warm palette pin colours (hard-coded hex because they render inside Leaflet's
// own DOM where CSS custom properties from our app are not reliably inherited).
export const PIN = {
  origin: "#3C7A89", // teal
  dest: "#E2725B",   // terracotta
  boat: "#3C7A89",   // teal
} as const;

// Applied to every Leaflet canvas so the map underlay receives the same
// branded coastal color treatment, regardless of which map component renders it.
export const MAP_THEME_CLASS = "marcamar-map-theme";

/**
 * Build a warm teardrop divIcon. The `drop` flag adds a CSS bounce so pins can
 * animate in when first placed.
 */
export function pinIcon(color: string, emoji = "", drop = false) {
  return L.divIcon({
    className: "",
    html: `<div class="lc-pin${drop ? " lc-pin-drop" : ""}" style="--lc-pin:${color}">
      <div class="lc-pin-body">${emoji ? `<span class="lc-pin-emoji">${emoji}</span>` : ""}</div>
    </div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -36],
  });
}

// ── Brazilian city coordinate lookup (litoral paulista + Vale do Paraíba) ──
const CITY_COORDS: Record<string, [number, number]> = {
  "campinas": [-22.9056, -47.0608],
  "são paulo": [-23.5505, -46.6333], "sao paulo": [-23.5505, -46.6333],
  "guarulhos": [-23.4543, -46.5333],
  "são josé dos campos": [-23.1794, -45.8869], "sao jose dos campos": [-23.1794, -45.8869], "sjc": [-23.1794, -45.8869],
  "taubaté": [-23.0260, -45.5553], "taubate": [-23.0260, -45.5553],
  "pindamonhangaba": [-22.9239, -45.4614],
  "santos": [-23.9618, -46.3322],
  "guarujá": [-23.9932, -46.2567], "guaruja": [-23.9932, -46.2567],
  "bertioga": [-23.8542, -46.1388],
  "ilhabela": [-23.7781, -45.3581],
  "são sebastião": [-23.7969, -45.4081], "sao sebastiao": [-23.7969, -45.4081],
  "ubatuba": [-23.4336, -45.0838],
  "angra dos reis": [-23.0067, -44.3181],
  "paraty": [-23.2178, -44.7131], "parati": [-23.2178, -44.7131],
  "ilha grande": [-23.1711, -44.1927],
  "rio de janeiro": [-22.9068, -43.1729],
  "niterói": [-22.8832, -43.1036], "niteroi": [-22.8832, -43.1036],
  "petrópolis": [-22.5050, -43.1786], "petropolis": [-22.5050, -43.1786],
  "volta redonda": [-22.5230, -44.1027],
  "resende": [-22.4695, -44.4503],
};

const normalizeLocation = (value: string) => value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
const NAMED_LOCATION_COORDS: Record<string, [number, number]> = Object.fromEntries([
  ...Object.entries(CITY_COORDS),
  ...Object.entries(COASTAL_POINT_COORDS),
].map(([name, coords]) => [normalizeLocation(name), coords])) as Record<string, [number, number]>;

export function getCityCoords(city?: string | null): [number, number] | null {
  if (!city) return null;
  return NAMED_LOCATION_COORDS[normalizeLocation(city)] ?? null;
}

/** Coerce a numeric/string/null coord to a finite number or null. */
export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// São Paulo state / litoral paulista default view
export const SP_REGION_CENTER: [number, number] = [-23.7, -45.4];
export const SP_REGION_ZOOM = 8;

// OpenStreetMap standard tiles — public, keyless and reliable for the MVP.
// The Marcamar theme is layered in CSS, so the underlay stays familiar while
// the interface gets its own coastal palette and markers.
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
