import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { PIN, pinIcon, getCityCoords, num, TILE_URL, TILE_ATTRIBUTION } from "./leafletSetup";

export interface RoutePoint {
  lat?: number | string | null;
  lng?: number | string | null;
  label?: string;
  /** Optional city name — used to resolve coords when lat/lng are missing. */
  city?: string | null;
}

interface RouteMapProps {
  origin?: RoutePoint | null;
  dest?: RoutePoint | null;
  /** Ride type tints the route line (terracotta for car, teal for boat). */
  type?: "car" | "boat";
  height?: string;
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 1) {
      map.setView(coords[0], 11);
    } else if (coords.length >= 2) {
      map.fitBounds(L.latLngBounds(coords), { padding: [48, 48], maxZoom: 12 });
    }
  }, [coords, map]);
  return null;
}

function resolve(p?: RoutePoint | null): [number, number] | null {
  if (!p) return null;
  const lat = num(p.lat);
  const lng = num(p.lng);
  if (lat !== null && lng !== null) return [lat, lng];
  return getCityCoords(p.city);
}

/**
 * RouteMap — shows custom teal (origin) + terracotta (destination) pins with a
 * polyline between them, auto-fitting bounds. Renders a friendly placeholder
 * when coordinates are unavailable (e.g. older rides without coords).
 */
export default function RouteMap({ origin, dest, type = "boat", height = "260px" }: RouteMapProps) {
  const o = resolve(origin);
  const d = resolve(dest);
  const coords = [o, d].filter(Boolean) as [number, number][];

  if (coords.length === 0) {
    return (
      <div
        className="lc-map-frame lc-map-empty"
        style={{ height }}
        role="img"
        aria-label="Mapa indisponível"
      >
        <span style={{ fontSize: 22, marginBottom: 6 }}>🗺️</span>
        Mapa indisponível
        <span className="lc-map-empty-sub">Sem coordenadas para esta rota</span>
      </div>
    );
  }

  const lineColor = type === "boat" ? PIN.boat : PIN.car;
  const originIcon = pinIcon(PIN.origin, type === "boat" ? "🚢" : "🚗", true);
  const destIcon = pinIcon(PIN.dest, type === "boat" ? "⚓" : "🏁", true);
  const center: [number, number] = coords.length === 2
    ? [(coords[0][0] + coords[1][0]) / 2, (coords[0][1] + coords[1][1]) / 2]
    : coords[0];

  return (
    <div className="lc-map-frame" style={{ height }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitBounds coords={coords} />
        {o && (
          <Marker position={o} icon={originIcon}>
            <Popup><b>Origem</b><br />{origin?.label || origin?.city || "Ponto de partida"}</Popup>
          </Marker>
        )}
        {d && (
          <Marker position={d} icon={destIcon}>
            <Popup><b>Destino</b><br />{dest?.label || dest?.city || "Destino"}</Popup>
          </Marker>
        )}
        {coords.length === 2 && (
          <Polyline
            positions={coords}
            pathOptions={{ color: lineColor, weight: 3.5, opacity: 0.8, dashArray: type === "boat" ? "9,6" : "0" }}
          />
        )}
      </MapContainer>
    </div>
  );
}
