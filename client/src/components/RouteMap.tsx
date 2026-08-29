import { useEffect, useRef, useState } from "react";
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

const CITY_COORDS: Record<string, [number, number]> = {
  "campinas": [-22.9056, -47.0608], "são paulo": [-23.5505, -46.6333], "sao paulo": [-23.5505, -46.6333],
  "santos": [-23.9618, -46.3322], "guarujá": [-23.9932, -46.2567], "guaruja": [-23.9932, -46.2567],
  "bertioga": [-23.8542, -46.1388], "ilhabela": [-23.7781, -45.3581],
  "são sebastião": [-23.7969, -45.4081], "sao sebastiao": [-23.7969, -45.4081],
  "ubatuba": [-23.4336, -45.0838], "angra dos reis": [-23.0067, -44.3181],
  "paraty": [-23.2178, -44.7131], "parati": [-23.2178, -44.7131], "ilha grande": [-23.1711, -44.1927],
  "rio de janeiro": [-22.9068, -43.1729], "niterói": [-22.8832, -43.1036], "niteroi": [-22.8832, -43.1036],
};

export function getCityCoords(city: string): [number, number] | null {
  return CITY_COORDS[city.toLocaleLowerCase("pt-BR").trim()] ?? null;
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length >= 2) map.fitBounds(L.latLngBounds(coords), { padding: [48, 48], maxZoom: 12 });
  }, [coords, map]);
  return null;
}

interface RideRouteMapProps {
  originCity: string; destCity: string;
  originLat?: string | number | null; originLng?: string | number | null;
  destLat?: string | number | null; destLng?: string | number | null;
  type?: "boat"; height?: string;
}

export function RideRouteMap({ originCity, destCity, originLat, originLng, destLat, destLng, height = "220px" }: RideRouteMapProps) {
  const o = getCityCoords(originCity); const d = getCityCoords(destCity);
  const oLat = originLat != null ? Number(originLat) : o?.[0]; const oLng = originLng != null ? Number(originLng) : o?.[1];
  const dLat = destLat != null ? Number(destLat) : d?.[0]; const dLng = destLng != null ? Number(destLng) : d?.[1];
  if (![oLat, oLng, dLat, dLng].every((value) => Number.isFinite(value))) {
    return <div style={{ height, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>Mapa indisponível para esta rota</div>;
  }
  const coords: [number, number][] = [[oLat!, oLng!], [dLat!, dLng!]];
  return (
    <div style={{ height, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <MapContainer center={[(oLat! + dLat!) / 2, (oLng! + dLng!) / 2]} zoom={9} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <FitBounds coords={coords} />
        <Marker position={coords[0]} icon={makeIcon("#3C7A89", "🚢")}><Popup><strong>Origem</strong><br />{originCity}</Popup></Marker>
        <Marker position={coords[1]} icon={makeIcon("#E2725B", "⚓")}><Popup><strong>Destino</strong><br />{destCity}</Popup></Marker>
        <Polyline positions={coords} pathOptions={{ color: "#3C7A89", weight: 3, opacity: 0.75, dashArray: "8,5" }} />
      </MapContainer>
    </div>
  );
}

interface MapPickerProps {
  onOriginPick: (lat: number, lng: number) => void;
  onDestPick: (lat: number, lng: number) => void;
  originPin: [number, number] | null; destPin: [number, number] | null; type?: "boat";
}

function ClickHandler({ mode, onOriginPick, onDestPick }: { mode: "origin" | "dest"; onOriginPick: (lat: number, lng: number) => void; onDestPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: any) => mode === "origin" ? onOriginPick(e.latlng.lat, e.latlng.lng) : onDestPick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler); return () => { map.off("click", handler); };
  }, [map, mode, onOriginPick, onDestPick]);
  return null;
}

export function MapPicker({ onOriginPick, onDestPick, originPin, destPin }: MapPickerProps) {
  const [mode, setMode] = useState<"origin" | "dest">("origin");
  const modeRef = useRef<"origin" | "dest">("origin");
  const color = "#3C7A89";
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {(["origin", "dest"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { modeRef.current = m; setMode(m); }} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1.5px solid", borderColor: mode === m ? color : "var(--border)", background: mode === m ? `${color}15` : "var(--surface)", color: mode === m ? color : "var(--text2)", transition: "all 0.15s" }}>
            {m === "origin" ? "🚢 Marcar embarque" : "⚓ Marcar desembarque"}
          </button>
        ))}
      </div>
      <div style={{ height: 260, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
        <MapContainer center={[-23.5, -46.0]} zoom={8} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <ClickHandler mode={modeRef.current} onOriginPick={onOriginPick} onDestPick={onDestPick} />
          {originPin && <Marker position={originPin} icon={makeIcon(color, "🚢")}><Popup>Embarque</Popup></Marker>}
          {destPin && <Marker position={destPin} icon={makeIcon("#E2725B", "⚓")}><Popup>Desembarque</Popup></Marker>}
          {originPin && destPin && <Polyline positions={[originPin, destPin]} pathOptions={{ color, weight: 2.5, opacity: 0.7, dashArray: "6,4" }} />}
        </MapContainer>
      </div>
      <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Clique no mapa para marcar embarque e desembarque. Opcional — os campos de cidade são suficientes.</p>
    </div>
  );
}

export interface MapPoint { lat: number; lng: number; city: string; type?: "boat"; rides?: number; }

export default function RouteMap({ points, center = [-23.5, -46.6], zoom = 7, height = "420px" }: { points: MapPoint[]; center?: [number, number]; zoom?: number; height?: string }) {
  const boatIcon = makeIcon("#3C7A89", "⚓");
  const boats = points.filter((point) => point.type === undefined || point.type === "boat");
  return (
    <div style={{ height, width: "100%", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution='© <a href="https://carto.com">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        {boats.map((point, i) => (
          <Marker key={i} position={[point.lat, point.lng]} icon={boatIcon}>
            <Popup><div style={{ fontFamily: "Inter, sans-serif", minWidth: 120 }}><div style={{ fontWeight: 700, fontSize: 13 }}>⚓ {point.city}</div>{point.rides ? <div style={{ color: "#3C7A89", fontWeight: 700, fontSize: 12, marginTop: 3 }}>{point.rides} {point.rides === 1 ? "viagem" : "viagens"}</div> : null}</div></Popup>
          </Marker>
        ))}
        {boats.map((a, i) => { const b = boats[i + 1]; return b ? <Polyline key={`b${i}`} positions={[[a.lat, a.lng], [b.lat, b.lng]]} pathOptions={{ color: "#3C7A89", weight: 2, opacity: 0.5, dashArray: "8,5" }} /> : null; })}
      </MapContainer>
    </div>
  );
}
