import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAP_STYLE, loadGoogleMaps } from "./googleMaps";
import { getCityCoords, num, PIN, SP_REGION_CENTER, SP_REGION_ZOOM } from "./leafletSetup";

export interface GoogleRoutePoint {
  lat?: number | string | null;
  lng?: number | string | null;
  label?: string;
  city?: string | null;
}

interface GoogleRouteMapProps {
  origin?: GoogleRoutePoint | null;
  dest?: GoogleRoutePoint | null;
  height?: string;
}

function resolve(point?: GoogleRoutePoint | null): [number, number] | null {
  if (!point) return null;
  const lat = num(point.lat);
  const lng = num(point.lng);
  if (lat !== null && lng !== null) return [lat, lng];
  return getCityCoords(point.city);
}

export default function GoogleRouteMap({ origin, dest, height = "260px" }: GoogleRouteMapProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const o = resolve(origin);
  const d = resolve(dest);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapNode.current) return;
      const points = [o, d].filter(Boolean) as [number, number][];
      const center = points.length === 2
        ? { lat: (points[0][0] + points[1][0]) / 2, lng: (points[0][1] + points[1][1]) / 2 }
        : points[0] ? { lat: points[0][0], lng: points[0][1] } : { lat: SP_REGION_CENTER[0], lng: SP_REGION_CENTER[1] };
      const map = new maps.Map(mapNode.current, {
        center,
        zoom: points.length === 2 ? 10 : SP_REGION_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        styles: GOOGLE_MAP_STYLE,
      });
      const bounds = new maps.LatLngBounds();

      if (o) {
        const marker = new maps.Marker({
          map,
          position: { lat: o[0], lng: o[1] },
          title: origin?.label || origin?.city || "Embarque",
          icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: PIN.origin, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
        });
        marker.addListener("click", () => {
          const info = new maps.InfoWindow({ content: `<div class="lc-popup"><div class="lc-popup-kicker">EMBARQUE</div><b>${origin?.label || origin?.city || "Ponto de partida"}</b></div>` });
          info.open({ map, anchor: marker });
        });
        bounds.extend({ lat: o[0], lng: o[1] });
      }
      if (d) {
        const marker = new maps.Marker({
          map,
          position: { lat: d[0], lng: d[1] },
          title: dest?.label || dest?.city || "Destino",
          icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: PIN.dest, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
        });
        marker.addListener("click", () => {
          const info = new maps.InfoWindow({ content: `<div class="lc-popup"><div class="lc-popup-kicker">DESTINO</div><b>${dest?.label || dest?.city || "Destino"}</b></div>` });
          info.open({ map, anchor: marker });
        });
        bounds.extend({ lat: d[0], lng: d[1] });
      }
      if (points.length === 2) {
        new maps.Polyline({ map, path: points.map(([lat, lng]) => ({ lat, lng })), geodesic: true, strokeColor: PIN.boat, strokeOpacity: 0.85, strokeWeight: 3 });
      }
      if (points.length > 1) map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => { cancelled = true; };
  }, [o?.[0], o?.[1], d?.[0], d?.[1], origin?.label, origin?.city, dest?.label, dest?.city]);

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
    <div className="lc-map-frame lc-map-frame-coastal lc-route-map lc-google-map" style={{ height }}>
      <div ref={mapNode} className="lc-google-map-canvas" aria-label="Mapa da rota de lancha" />
      {status === "loading" && <div className="lc-google-map-loading">Carregando Google Maps…</div>}
      <div className="marcamar-map-badge" aria-hidden="true">
        <span className="marcamar-map-badge-mark">✦</span>
        <span><strong>Google Maps</strong><small>embarque → destino</small></span>
      </div>
      <div className="marcamar-map-legend" aria-hidden="true">
        <span className="marcamar-map-legend-dot origin" /> Embarque
        <span className="marcamar-map-legend-dot dest" /> Destino
      </div>
    </div>
  );
}
