import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { PIN, pinIcon, SP_REGION_CENTER, SP_REGION_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "./leafletSetup";

export interface LatLng { lat: number; lng: number }

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (latlng: LatLng) => void;
  label?: string;
  /** Pin colour by purpose: teal origin / terracotta destination. */
  variant?: "origin" | "dest";
  height?: string;
}

function ClickToPlace({ onChange }: { onChange: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * LocationPicker — a small map where clicking drops (or moves) a single pin.
 * Used in the create-ride forms to optionally geotag origin/destination.
 */
export default function LocationPicker({ value, onChange, label, variant = "origin", height = "240px" }: LocationPickerProps) {
  const color = variant === "dest" ? PIN.dest : PIN.origin;
  const icon = pinIcon(color, variant === "dest" ? "🏁" : "📍", true);

  return (
    <div>
      {label && (
        <div className="lc-picker-label">{label}</div>
      )}
      <div className="lc-map-frame" style={{ height }}>
        <MapContainer center={SP_REGION_CENTER} zoom={SP_REGION_ZOOM} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickToPlace onChange={onChange} />
          {value && <Marker position={[value.lat, value.lng]} icon={icon} />}
        </MapContainer>
      </div>
      <div className="lc-picker-coords">
        {value
          ? <>📌 {value.lat.toFixed(4)}, {value.lng.toFixed(4)}</>
          : <>Clique no mapa para marcar (opcional)</>}
      </div>
    </div>
  );
}
