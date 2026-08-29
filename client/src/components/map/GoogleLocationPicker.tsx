import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAP_STYLE, loadGoogleMaps } from "./googleMaps";
import { PIN, SP_REGION_CENTER, SP_REGION_ZOOM } from "./leafletSetup";
import { ILHABELA_BEACHES } from "@shared/coastal-locations";

export interface GoogleLocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (latlng: { lat: number; lng: number } | null) => void;
  label?: string;
  variant?: "origin" | "dest";
  height?: string;
}

function nearestCoastalPoint(point: { lat: number; lng: number }) {
  let nearest: { lat: number; lng: number } | null = null;
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

/**
 * Google Maps version of the Uber-style coastal drop pin. Every click and
 * drag is snapped to a known Ilhabela beach reference; inland points are
 * rejected before they reach the parent form.
 */
export default function GoogleLocationPicker({ value, onChange, label, variant = "origin", height = "260px" }: GoogleLocationPickerProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const valueRef = useRef(value);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState("");
  const isDestination = variant === "dest";
  const color = isDestination ? PIN.dest : PIN.origin;

  useEffect(() => {
    valueRef.current = value;
    if (markerRef.current && value) {
      markerRef.current.setPosition({ lat: value.lat, lng: value.lng });
    }
    if (mapRef.current && value) {
      mapRef.current.panTo({ lat: value.lat, lng: value.lng });
    }
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapNode.current) return;
      const map = new maps.Map(mapNode.current, {
        center: valueRef.current
          ? { lat: valueRef.current.lat, lng: valueRef.current.lng }
          : { lat: SP_REGION_CENTER[0], lng: SP_REGION_CENTER[1] },
        zoom: valueRef.current ? 13 : SP_REGION_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        styles: GOOGLE_MAP_STYLE,
      });
      mapRef.current = map;

      const place = (point: { lat: number; lng: number }) => {
        if (!markerRef.current) {
          markerRef.current = new maps.Marker({
            map,
            position: point,
            draggable: true,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
          });
          markerRef.current.addListener("dragend", () => {
            const dragged = markerRef.current?.getPosition();
            if (!dragged) return;
            const snapped = nearestCoastalPoint({ lat: dragged.lat(), lng: dragged.lng() });
            if (snapped) {
              setNotice("");
              valueRef.current = snapped;
              markerRef.current.setPosition(snapped);
              onChange(snapped);
            } else {
              setNotice("O ponto precisa ficar na costa. Áreas em terra ficam bloqueadas.");
              if (valueRef.current) markerRef.current.setPosition(valueRef.current);
            }
          });
        } else {
          markerRef.current.setPosition(point);
          markerRef.current.setMap(map);
        }
        map.panTo(point);
        map.setZoom(Math.max(map.getZoom() || 0, 13));
      };

      map.addListener("click", (event: any) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (typeof lat !== "number" || typeof lng !== "number") return;
        const snapped = nearestCoastalPoint({ lat, lng });
        if (!snapped) {
          setNotice("Escolha um ponto na costa. Áreas em terra ficam bloqueadas.");
          return;
        }
        setNotice("");
        valueRef.current = snapped;
        place(snapped);
        onChange(snapped);
      });

      if (valueRef.current) place(valueRef.current);
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [color, onChange]);

  const clear = () => {
    setNotice("");
    valueRef.current = null;
    markerRef.current?.setMap(null);
    onChange(null);
  };

  if (status === "error") {
    return (
      <div className="lc-map-frame lc-map-frame-coastal lc-map-empty" style={{ height }} role="img" aria-label="Mapa indisponível">
        <span style={{ fontSize: 22, marginBottom: 6 }}>🗺️</span>
        Google Maps indisponível
        <span className="lc-map-empty-sub">Confira a chave VITE_GOOGLE_MAPS_API_KEY</span>
      </div>
    );
  }

  return (
    <div className="lc-picker">
      <div className="lc-picker-head">
        {label && <div className="lc-picker-label">{label}</div>}
        {value && <button type="button" className="lc-picker-clear" onClick={clear}>Limpar ponto</button>}
      </div>
      <div className="lc-map-frame lc-map-frame-coastal lc-picker-map lc-google-map" style={{ height }}>
        <div ref={mapNode} className="lc-google-map-canvas" aria-label="Escolha um ponto no mapa costeiro" />
        {status === "loading" && <div className="lc-google-map-loading">Carregando Google Maps…</div>}
        <div className="marcamar-map-badge" aria-hidden="true">
          <span className="marcamar-map-badge-mark">✦</span>
          <span><strong>Google Maps</strong><small>toque para marcar</small></span>
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
        {value ? <>Ponto selecionado · {value.lat.toFixed(5)}, {value.lng.toFixed(5)}</> : <>Escolha um ponto costeiro no mapa — locais em terra não são aceitos</>}
      </div>
    </div>
  );
}
