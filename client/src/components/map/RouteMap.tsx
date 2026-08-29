import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { MAP_THEME_CLASS, PIN, pinIcon, getCityCoords, num, TILE_URL, TILE_ATTRIBUTION } from "./leafletSetup";
import GoogleRouteMap from "./GoogleRouteMap";
import { hasGoogleMapsKey } from "./googleMaps";

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
export default function RouteMap({ origin, dest, height = "260px" }: RouteMapProps) {
  if (hasGoogleMapsKey()) return <GoogleRouteMap origin={origin} dest={dest} height={height} />;

  const o = resolve(origin);
  const d = resolve(dest);
  const coords = [o, d].filter(Boolean) as [number, number][];

  if (coords.length === 0) {
    return (
      <div
        className="lc-map-frame lc-map-frame-coastal lc-map-empty"
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

  const lineColor = PIN.boat;
  const originIcon = pinIcon(PIN.origin, "🚢", true);
  const destIcon = pinIcon(PIN.dest, "⚓", true);
  const center: [number, number] = coords.length === 2
    ? [(coords[0][0] + coords[1][0]) / 2, (coords[0][1] + coords[1][1]) / 2]
    : coords[0];

  return (
    <div className="lc-map-frame lc-map-frame-coastal lc-route-map" style={{ height }}>
      <MapContainer className={MAP_THEME_CLASS} center={center} zoom={9} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl aria-label="Mapa da rota de lancha">
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitBounds coords={coords} />
        {o && (
          <Marker position={o} icon={originIcon}>
            <Popup><div className="lc-popup"><div className="lc-popup-kicker">EMBARQUE</div><b>{origin?.label || origin?.city || "Ponto de partida"}</b></div></Popup>
          </Marker>
        )}
        {d && (
          <Marker position={d} icon={destIcon}>
            <Popup><div className="lc-popup"><div className="lc-popup-kicker">DESTINO</div><b>{dest?.label || dest?.city || "Destino"}</b></div></Popup>
          </Marker>
        )}
        {coords.length === 2 && (
          <Polyline
            positions={coords}
            pathOptions={{ color: lineColor, weight: 3.5, opacity: 0.8, dashArray: "9,6" }}
          />
        )}
      </MapContainer>
      <div className="marcamar-map-badge" aria-hidden="true">
        <span className="marcamar-map-badge-mark">✦</span>
        <span><strong>Rota costeira</strong><small>embarque → destino</small></span>
      </div>
      <div className="marcamar-map-legend" aria-hidden="true">
        <span className="marcamar-map-legend-dot origin" /> Embarque
        <span className="marcamar-map-legend-dot dest" /> Destino
      </div>
    </div>
  );
}
