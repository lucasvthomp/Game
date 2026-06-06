import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + bundlers issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function makeIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:32px;height:32px;border-radius:50% 50% 50% 4px;
      transform:rotate(-45deg);
      border:3px solid #fff;
      box-shadow:0 4px 16px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:13px;line-height:1">${label}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

const boatIcon = makeIcon("#0E86C8", "⚓");
const carIcon  = makeIcon("#F59E0B", "🚗");

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  city: string;
  type: "boat" | "car";
  route?: string;
  price?: string;
}

interface RouteMapProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  showRouteLines?: boolean;
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const latlngs = points.map(p => [p.lat, p.lng] as [number, number]);
    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 9 });
  }, [points, map]);
  return null;
}

export default function RouteMap({
  points,
  center = [-23.5, -46.6],
  zoom = 7,
  height = "420px",
  className = "",
  showRouteLines = true,
}: RouteMapProps) {
  // Group points into pairs for polylines
  const boatPairs: [MapPoint, MapPoint][] = [];
  const carPairs:  [MapPoint, MapPoint][] = [];

  if (showRouteLines) {
    const boats = points.filter(p => p.type === "boat");
    const cars  = points.filter(p => p.type === "car");
    for (let i = 0; i + 1 < boats.length; i += 2) boatPairs.push([boats[i], boats[i + 1]]);
    for (let i = 0; i + 1 < cars.length;  i += 2) carPairs.push([cars[i], cars[i + 1]]);
  }

  return (
    <div style={{ height, width: "100%" }} className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 1 && <FitBounds points={points} />}

        {boatPairs.map(([a, b], i) => (
          <Polyline
            key={`boat-${i}`}
            positions={[[a.lat, a.lng], [b.lat, b.lng]]}
            pathOptions={{ color: "#0E86C8", weight: 3, opacity: 0.7, dashArray: "8 6" }}
          />
        ))}
        {carPairs.map(([a, b], i) => (
          <Polyline
            key={`car-${i}`}
            positions={[[a.lat, a.lng], [b.lat, b.lng]]}
            pathOptions={{ color: "#F59E0B", weight: 3, opacity: 0.7 }}
          />
        ))}

        {points.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            icon={p.type === "boat" ? boatIcon : carIcon}
          >
            <Popup>
              <div className="map-pin-card">
                <span className={`map-pin-type map-pin-type-${p.type}`}>
                  {p.type === "boat" ? "⚓ Lancha" : "🚗 Carro"}
                </span>
                <div className="map-pin-card-title">{p.city}</div>
                {p.route && <div className="map-pin-card-sub">{p.route}</div>}
                {p.price && <div style={{ marginTop: 6, fontWeight: 800, color: "var(--boat)", fontSize: 14 }}>R$ {p.price}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
