import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { PIN, pinIcon, SP_REGION_CENTER, SP_REGION_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "./leafletSetup";

export interface LatLng { lat: number; lng: number }

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (latlng: LatLng | null) => void;
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

function RecenterOnValue({ value }: { value: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (!value) return;
    map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 13), { animate: true, duration: 0.45 });
  }, [map, value?.lat, value?.lng]);

  return null;
}

/**
 * LocationPicker — Uber-style point selection: click anywhere to place a pin,
 * then drag the pin to refine the exact pier/beach. The clear action lets users
 * start over without touching the text fields.
 */
export default function LocationPicker({ value, onChange, label, variant = "origin", height = "260px" }: LocationPickerProps) {
  const isDestination = variant === "dest";
  const color = isDestination ? PIN.dest : PIN.origin;
  const icon = pinIcon(color, isDestination ? "⚓" : "📍", true);
  const center: [number, number] = value ? [value.lat, value.lng] : SP_REGION_CENTER;
  const zoom = value ? 13 : SP_REGION_ZOOM;

  return (
    <div className="lc-picker">
      <div className="lc-picker-head">
        {label && <div className="lc-picker-label">{label}</div>}
        {value && (
          <button type="button" className="lc-picker-clear" onClick={() => onChange(null)}>
            Limpar ponto
          </button>
        )}
      </div>
      <div className="lc-map-frame lc-picker-map" style={{ height }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom attributionControl>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <RecenterOnValue value={value} />
          <ClickToPlace onChange={(point) => onChange(point)} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (event: any) => {
                  const point = event.target.getLatLng();
                  onChange({ lat: point.lat, lng: point.lng });
                },
              }}
            />
          )}
        </MapContainer>
        <div className="lc-picker-map-hint" aria-hidden="true">
          <span className="lc-picker-map-dot" />
          Clique para posicionar · arraste para ajustar
        </div>
      </div>
      <div className="lc-picker-coords" aria-live="polite">
        {value
          ? <>Ponto selecionado · {value.lat.toFixed(5)}, {value.lng.toFixed(5)}</>
          : <>Escolha o ponto exato de embarque no mapa</>}
      </div>
    </div>
  );
}
