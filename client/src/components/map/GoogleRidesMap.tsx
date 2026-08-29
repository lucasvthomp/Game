import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { GOOGLE_MAP_STYLE, loadGoogleMaps } from "./googleMaps";
import { getCityCoords, num, PIN, SP_REGION_CENTER, SP_REGION_ZOOM } from "./leafletSetup";

export interface GoogleRideMarker {
  id: number;
  rideType: "boat";
  originCity: string;
  destinationCity: string;
  pricePerSeat: string | number;
  originLat?: number | string | null;
  originLng?: number | string | null;
}

interface GoogleRidesMapProps {
  rides: GoogleRideMarker[];
  height?: string;
}

function originCoord(ride: GoogleRideMarker): [number, number] | null {
  const lat = num(ride.originLat);
  const lng = num(ride.originLng);
  if (lat !== null && lng !== null) return [lat, lng];
  return getCityCoords(ride.originCity);
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] || character));
}

/**
 * Google-backed live ride map. It only activates when
 * VITE_GOOGLE_MAPS_API_KEY is configured; RidesMap keeps the existing
 * OpenStreetMap renderer as a graceful local/deploy fallback until then.
 */
export default function GoogleRidesMap({ rides, height = "480px" }: GoogleRidesMapProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapNode.current) return;
      const map = new maps.Map(mapNode.current, {
        center: { lat: SP_REGION_CENTER[0], lng: SP_REGION_CENTER[1] },
        zoom: SP_REGION_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        styles: GOOGLE_MAP_STYLE,
      });
      mapInstance.current = map;
      infoWindowRef.current = new maps.InfoWindow();
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const bounds = new maps.LatLngBounds();
      let markerCount = 0;
      rides.forEach((ride) => {
        const coord = originCoord(ride);
        if (!coord) return;
        markerCount += 1;
        const marker = new maps.Marker({
          map,
          position: { lat: coord[0], lng: coord[1] },
          title: `${ride.originCity} → ${ride.destinationCity}`,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: PIN.boat,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
        marker.addListener("click", () => {
          const price = parseFloat(String(ride.pricePerSeat)).toFixed(2).replace(".", ",");
          infoWindowRef.current?.setContent(`
            <div class="lc-popup lc-google-popup">
              <div class="lc-popup-kicker">LANCHA</div>
              <div class="lc-popup-route">${escapeHtml(ride.originCity)} <span aria-hidden="true">→</span> ${escapeHtml(ride.destinationCity)}</div>
              <div class="lc-popup-price">R$ ${price} <span>/ pessoa</span></div>
              <a class="lc-popup-link" href="/viagens/${encodeURIComponent(String(ride.id))}">Abrir detalhes <span aria-hidden="true">→</span></a>
            </div>`);
          infoWindowRef.current?.open({ map, anchor: marker });
        });
        markersRef.current.push(marker);
        bounds.extend({ lat: coord[0], lng: coord[1] });
      });

      if (markerCount === 1) map.setZoom(10);
      if (markerCount > 1) map.fitBounds(bounds, { top: 64, right: 64, bottom: 64, left: 64 });
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapInstance.current = null;
    };
  }, [rides]);

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
    <div className="lc-map-frame lc-map-frame-coastal lc-rides-map lc-google-map" style={{ height }}>
      <div ref={mapNode} className="lc-google-map-canvas" aria-label="Mapa de lanchas disponíveis" />
      {status === "loading" && <div className="lc-google-map-loading">Carregando Google Maps…</div>}
      <div className="marcamar-map-badge" aria-hidden="true">
        <span className="marcamar-map-badge-mark">✦</span>
        <span><strong>Google Maps</strong><small>litoral em movimento</small></span>
      </div>
      <div className="marcamar-map-legend" aria-hidden="true">
        <span className="marcamar-map-legend-dot boat" /> Saídas no mapa
      </div>
    </div>
  );
}
