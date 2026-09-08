import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MaritimeIcon } from "@/components/MaritimeIcon";
import { ILHABELA_BEACHES } from "@shared/coastal-locations";
import { getCityCoords, MAP_THEME_CLASS, PIN, pinIcon, SP_REGION_CENTER, SP_REGION_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "./leafletSetup";

export type CoastalRoutePoint = { lat: number; lng: number };
type Target = "origin" | "destination";

type CoastalRoutePickerProps = {
  origin: CoastalRoutePoint | null;
  destination: CoastalRoutePoint | null;
  onOriginChange: (point: CoastalRoutePoint | null) => void;
  onDestinationChange: (point: CoastalRoutePoint | null) => void;
  height?: string;
};

const COASTAL_CITY_NAMES = ["São Sebastião", "Ilhabela", "Ubatuba", "Caraguatatuba", "Bertioga", "Santos", "Guarujá", "Angra dos Reis", "Paraty"];

const COASTAL_REFERENCES = [
  ...ILHABELA_BEACHES.map((point) => ({ lat: point.latitude, lng: point.longitude })),
  ...COASTAL_CITY_NAMES.flatMap((name) => {
    const coords = getCityCoords(name);
    return coords ? [{ lat: coords[0], lng: coords[1] }] : [];
  }),
];

function nearestCoastalPoint(point: CoastalRoutePoint): CoastalRoutePoint | null {
  let nearest: CoastalRoutePoint | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const reference of COASTAL_REFERENCES) {
    const latitudeScale = Math.cos((reference.lat * Math.PI) / 180);
    const distance = Math.hypot((point.lat - reference.lat) * 1.1, (point.lng - reference.lng) * latitudeScale);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = reference;
    }
  }
  // Keep the allowed zone intentionally tight so inland clicks are rejected.
  return nearestDistance <= 0.035 ? nearest : null;
}

function RecenterRoute({ origin, destination }: Pick<CoastalRoutePickerProps, "origin" | "destination">) {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      map.fitBounds([[origin.lat, origin.lng], [destination.lat, destination.lng]], { padding: [46, 46], maxZoom: 13, animate: true });
      return;
    }
    const point = origin || destination;
    if (point) map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 12), { animate: true, duration: 0.45 });
  }, [destination?.lat, destination?.lng, map, origin?.lat, origin?.lng]);

  return null;
}

function RouteClickHandler({ target, onPlace, onReject }: { target: Target; onPlace: (target: Target, point: CoastalRoutePoint) => void; onReject: () => void }) {
  useMapEvents({
    click(event) {
      const snapped = nearestCoastalPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
      if (!snapped) {
        onReject();
        return;
      }
      onPlace(target, snapped);
    },
  });
  return null;
}

function RoutePin({ value, target, onChange }: { value: CoastalRoutePoint; target: Target; onChange: (target: Target, point: CoastalRoutePoint) => void }) {
  const color = target === "origin" ? PIN.origin : PIN.dest;
  return (
    <Marker
      position={[value.lat, value.lng]}
      icon={pinIcon(color, "", true)}
      draggable
      eventHandlers={{
        dragend: (event: any) => {
          const dragged = event.target.getLatLng();
          const snapped = nearestCoastalPoint({ lat: dragged.lat, lng: dragged.lng });
          if (snapped) onChange(target, snapped);
        },
      }}
    />
  );
}

export default function CoastalRoutePicker({ origin, destination, onOriginChange, onDestinationChange, height = "420px" }: CoastalRoutePickerProps) {
  const [target, setTarget] = useState<Target>(origin ? "destination" : "origin");
  const [notice, setNotice] = useState("");
  const center = useMemo<[number, number]>(() => {
    const point = origin || destination;
    return point ? [point.lat, point.lng] : SP_REGION_CENTER;
  }, [destination, origin]);

  const place = (nextTarget: Target, point: CoastalRoutePoint) => {
    setNotice("");
    if (nextTarget === "origin") onOriginChange(point);
    else onDestinationChange(point);
    setTarget(nextTarget === "origin" ? "destination" : "origin");
  };

  const handleDrag = (nextTarget: Target, point: CoastalRoutePoint) => {
    setNotice("");
    if (nextTarget === "origin") onOriginChange(point);
    else onDestinationChange(point);
  };

  const clear = (nextTarget: Target) => {
    setNotice("");
    if (nextTarget === "origin") onOriginChange(null);
    else onDestinationChange(null);
    setTarget(nextTarget);
  };

  return (
    <div className="route-picker-single">
      <div className="route-picker-head">
        <div>
          <p className="home-v2-kicker">PONTOS EXATOS</p>
          <strong>Confirme o cais.</strong>
          <span>Toque na costa para posicionar cada ponto.</span>
        </div>
        <span className="route-picker-count">{(origin ? 1 : 0) + (destination ? 1 : 0)} de 2</span>
      </div>
      <div className="route-picker-switcher" role="group" aria-label="Escolha qual ponto ajustar">
        <button type="button" className={target === "origin" ? "active" : ""} onClick={() => setTarget("origin")} aria-pressed={target === "origin"}>
          <span className="route-picker-dot origin" /> Embarque
          {origin && <small>definido</small>}
        </button>
        <button type="button" className={target === "destination" ? "active" : ""} onClick={() => setTarget("destination")} aria-pressed={target === "destination"}>
          <span className="route-picker-dot destination" /> Chegada
          {destination && <small>definido</small>}
        </button>
      </div>
      <div className="route-picker-map lc-map-frame-coastal" style={{ height }}>
        <MapContainer className={MAP_THEME_CLASS} center={center} zoom={origin || destination ? 12 : SP_REGION_ZOOM} style={{ height: "100%", width: "100%" }} scrollWheelZoom aria-label="Mapa costeiro para escolher embarque e chegada">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <RecenterRoute origin={origin} destination={destination} />
          <RouteClickHandler target={target} onPlace={place} onReject={() => setNotice("Escolha um ponto na costa. Áreas em terra ficam bloqueadas.")} />
          {origin && <RoutePin value={origin} target="origin" onChange={handleDrag} />}
          {destination && <RoutePin value={destination} target="destination" onChange={handleDrag} />}
        </MapContainer>
        <div className="route-picker-map-badge" aria-hidden="true"><MaritimeIcon variant="compass" size={17} /> mapa costeiro</div>
        {notice && <div className="route-picker-notice" role="status">{notice}</div>}
      </div>
      <div className="route-picker-values">
        <div><span className="route-picker-dot origin" /><span><small>Embarque</small><strong>{origin ? "Ponto definido" : "Toque no mapa"}</strong></span>{origin && <button type="button" onClick={() => clear("origin")}>Limpar</button>}</div>
        <div><span className="route-picker-dot destination" /><span><small>Chegada</small><strong>{destination ? "Ponto definido" : "Toque no mapa"}</strong></span>{destination && <button type="button" onClick={() => clear("destination")}>Limpar</button>}</div>
      </div>
    </div>
  );
}
