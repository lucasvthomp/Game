import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { MAP_THEME_CLASS, PIN, pinIcon, SP_REGION_CENTER, SP_REGION_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "./leafletSetup";
import { ILHABELA_BEACHES } from "@shared/coastal-locations";

export interface LatLng { lat: number; lng: number }

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (latlng: LatLng | null) => void;
  label?: string;
  /** Pin colour by purpose: teal origin / terracotta destination. */
  variant?: "origin" | "dest";
  height?: string;
}

function nearestCoastalPoint(point: LatLng): LatLng | null {
  let nearest: LatLng | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const beach of ILHABELA_BEACHES) {
    const latitudeScale = Math.cos((beach.latitude * Math.PI) / 180);
    const distance = Math.hypot(
      (point.lat - beach.latitude) * 1.1,
      (point.lng - beach.longitude) * latitudeScale,
    );
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { lat: beach.latitude, lng: beach.longitude };
    }
  }
  return nearestDistance <= 0.085 ? nearest : null;
}

function ClickToPlace({ onChange, onReject }: { onChange: (latlng: LatLng) => void; onReject: () => void }) {
  useMapEvents({
    click(e) {
      const point = nearestCoastalPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      if (point) onChange(point);
      else onReject();
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
  const [notice, setNotice] = useState("");
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
          <button type="button" className="lc-picker-clear" onClick={() => { setNotice(""); onChange(null); }}>
            Limpar ponto
          </button>
        )}
      </div>
      <div className="lc-map-frame lc-map-frame-coastal lc-picker-map" style={{ height }}>
        <MapContainer className={MAP_THEME_CLASS} center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom attributionControl aria-label="Escolha um ponto no mapa costeiro">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <RecenterOnValue value={value} />
          <ClickToPlace onChange={(point) => { setNotice(""); onChange(point); }} onReject={() => setNotice("Escolha um ponto na costa. Áreas em terra ficam bloqueadas.")} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (event: any) => {
                  const point = event.target.getLatLng();
                  const snapped = nearestCoastalPoint({ lat: point.lat, lng: point.lng });
                  if (snapped) {
                    setNotice("");
                    onChange(snapped);
                  } else {
                    setNotice("O ponto precisa ficar na costa. Ajustamos para o último local válido.");
                    onChange(value);
                  }
                },
              }}
            />
          )}
        </MapContainer>
        <div className="marcamar-map-badge" aria-hidden="true">
          <span className="marcamar-map-badge-mark">✦</span>
          <span><strong>Mapa costeiro</strong><small>toque para marcar</small></span>
        </div>
        <div className="marcamar-map-legend" aria-hidden="true">
          <span className={`marcamar-map-legend-dot ${isDestination ? "dest" : "origin"}`} />
          {isDestination ? "Destino" : "Embarque"}
        </div>
        {notice && <div className="lc-picker-map-notice" role="status">{notice}</div>}
        <div className="lc-picker-map-hint" aria-hidden="true">
          <span className="lc-picker-map-dot" />
          Clique para posicionar · arraste para ajustar
        </div>
      </div>
      <div className="lc-picker-coords" aria-live="polite">
        {value
          ? <>Ponto selecionado · {value.lat.toFixed(5)}, {value.lng.toFixed(5)}</>
          : <>Escolha um ponto costeiro no mapa — locais em terra não são aceitos</>}
      </div>
    </div>
  );
}
