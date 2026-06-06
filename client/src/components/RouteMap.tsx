import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function makeIcon(color: string, emoji: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;line-height:1">${emoji}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

// Common Brazilian city coordinates lookup
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

export function getCityCoords(city: string): [number, number] | null {
  return CITY_COORDS[city.toLowerCase().trim()] ?? null;
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length < 2) return;
    map.fitBounds(L.latLngBounds(coords), { padding: [48, 48], maxZoom: 12 });
  }, [coords, map]);
  return null;
}

// ── Single ride origin→dest map ──
interface RideRouteMapProps {
  originCity: string;
  destCity: string;
  originLat?: string | number | null;
  originLng?: string | number | null;
  destLat?: string | number | null;
  destLng?: string | number | null;
  type?: "car" | "boat";
  height?: string;
}

export function RideRouteMap({ originCity, destCity, originLat, originLng, destLat, destLng, type = "boat", height = "220px" }: RideRouteMapProps) {
  const isBoat = type === "boat";
  const color = isBoat ? "#2563EB" : "#F05A28";

  const oCoord = getCityCoords(originCity);
  const dCoord = getCityCoords(destCity);
  const oLat = originLat != null ? Number(originLat) : oCoord?.[0];
  const oLng = originLng != null ? Number(originLng) : oCoord?.[1];
  const dLat = destLat   != null ? Number(destLat)   : dCoord?.[0];
  const dLng = destLng   != null ? Number(destLng)   : dCoord?.[1];

  if (!oLat || !oLng || !dLat || !dLng) {
    return (
      <div style={{ height, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>
        Mapa indisponível para estas cidades
      </div>
    );
  }

  const originIcon = makeIcon(color, isBoat ? "🚢" : "🚗");
  const destIcon   = makeIcon(color, isBoat ? "⚓" : "🏁");
  const coords: [number, number][] = [[oLat, oLng], [dLat, dLng]];
  const center: [number, number] = [(oLat + dLat) / 2, (oLng + dLng) / 2];

  return (
    <div style={{ height, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <FitBounds coords={coords} />
        <Marker position={[oLat, oLng]} icon={originIcon}>
          <Popup><strong>Origem</strong><br />{originCity}</Popup>
        </Marker>
        <Marker position={[dLat, dLng]} icon={destIcon}>
          <Popup><strong>Destino</strong><br />{destCity}</Popup>
        </Marker>
        <Polyline positions={coords} pathOptions={{ color, weight: 3, opacity: 0.75, dashArray: isBoat ? "8,5" : "6,4" }} />
      </MapContainer>
    </div>
  );
}

// ── Pin-drop map picker for create forms ──
interface MapPickerProps {
  onOriginPick: (lat: number, lng: number) => void;
  onDestPick:   (lat: number, lng: number) => void;
  originPin: [number, number] | null;
  destPin:   [number, number] | null;
  type?: "car" | "boat";
}

function ClickHandler({ mode, onOriginPick, onDestPick }: { mode: "origin" | "dest"; onOriginPick: (lat: number, lng: number) => void; onDestPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: any) => {
      if (mode === "origin") onOriginPick(e.latlng.lat, e.latlng.lng);
      else onDestPick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, mode, onOriginPick, onDestPick]);
  return null;
}

export function MapPicker({ onOriginPick, onDestPick, originPin, destPin, type = "boat" }: MapPickerProps) {
  const isBoat = type === "boat";
  const color = isBoat ? "#2563EB" : "#F05A28";
  const [mode, setMode] = useRef<"origin" | "dest">("origin") as any;
  const modeRef = useRef<"origin" | "dest">("origin");

  const originIcon = makeIcon(color, isBoat ? "🚢" : "🚗");
  const destIcon   = makeIcon(color, isBoat ? "⚓" : "🏁");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {(["origin", "dest"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { modeRef.current = m; }}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1.5px solid",
              borderColor: modeRef.current === m ? color : "var(--border)",
              background: modeRef.current === m ? `${color}15` : "var(--surface)",
              color: modeRef.current === m ? color : "var(--text2)",
              transition: "all 0.15s",
            }}
          >
            {m === "origin" ? (isBoat ? "🚢 Marcar origem" : "🚗 Marcar origem") : (isBoat ? "⚓ Marcar destino" : "🏁 Marcar destino")}
          </button>
        ))}
      </div>
      <div style={{ height: 260, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
        <MapContainer center={[-23.5, -46.0]} zoom={8} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <ClickHandler mode={modeRef.current} onOriginPick={onOriginPick} onDestPick={onDestPick} />
          {originPin && <Marker position={originPin} icon={originIcon}><Popup>Origem</Popup></Marker>}
          {destPin   && <Marker position={destPin}   icon={destIcon}><Popup>Destino</Popup></Marker>}
          {originPin && destPin && (
            <Polyline positions={[originPin, destPin]} pathOptions={{ color, weight: 2.5, opacity: 0.7, dashArray: "6,4" }} />
          )}
        </MapContainer>
      </div>
      <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Clique no mapa para marcar a localização. Opcional — os campos de cidade são suficientes.</p>
    </div>
  );
}

// ── Overview map (multiple cities) used on Home ──
export interface MapPoint {
  lat: number; lng: number;
  city: string; type: "boat" | "car";
  rides?: number;
}

export default function RouteMap({ points, center = [-23.5, -46.6], zoom = 7, height = "420px" }: { points: MapPoint[]; center?: [number, number]; zoom?: number; height?: string }) {
  const boatIcon = makeIcon("#2563EB", "⚓");
  const carIcon  = makeIcon("#F05A28", "🚗");

  const boats = points.filter(p => p.type === "boat");
  const cars  = points.filter(p => p.type === "car");

  return (
    <div style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='© <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={p.type === "boat" ? boatIcon : carIcon}>
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.type === "boat" ? "⚓" : "🚗"} {p.city}</div>
                {p.rides && <div style={{ color: p.type === "boat" ? "#2563EB" : "#F05A28", fontWeight: 700, fontSize: 12, marginTop: 3 }}>{p.rides} {p.rides === 1 ? "viagem" : "viagens"}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        {boats.map((a, i) => {
          const b = boats[i + 1]; if (!b) return null;
          return <Polyline key={`b${i}`} positions={[[a.lat, a.lng], [b.lat, b.lng]]} pathOptions={{ color: "#2563EB", weight: 2, opacity: 0.5, dashArray: "8,5" }} />;
        })}
        {cars.map((a, i) => {
          const b = cars[i + 1]; if (!b) return null;
          return <Polyline key={`c${i}`} positions={[[a.lat, a.lng], [b.lat, b.lng]]} pathOptions={{ color: "#F05A28", weight: 2, opacity: 0.5, dashArray: "6,4" }} />;
        })}
      </MapContainer>
    </div>
  );
}
