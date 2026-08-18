import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "wouter";
import L from "leaflet";
import { PIN, pinIcon, getCityCoords, num, SP_REGION_CENTER, SP_REGION_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "./leafletSetup";

export interface RideMarker {
  id: number;
  rideType: "boat";
  originCity: string;
  destinationCity: string;
  pricePerSeat: string | number;
  originLat?: number | string | null;
  originLng?: number | string | null;
}

interface RidesMapProps {
  rides: RideMarker[];
  height?: string;
}

function FitToPins({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 1) {
      map.setView(coords[0], 10);
    } else if (coords.length >= 2) {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 11 });
    }
  }, [coords, map]);
  return null;
}

function originCoord(r: RideMarker): [number, number] | null {
  const lat = num(r.originLat);
  const lng = num(r.originLng);
  if (lat !== null && lng !== null) return [lat, lng];
  return getCityCoords(r.originCity);
}

/**
 * RidesMap — plots every published boat ride (that has resolvable origin coords)
 * as a clickable pin. Clicking a pin opens a popup with the route, price and a
 * link to the ride detail page. Fits to pins, falling back to the SP region.
 */
export default function RidesMap({ rides, height = "480px" }: RidesMapProps) {
  const markers = useMemo(
    () => rides
      .map((r) => ({ ride: r, coord: originCoord(r) }))
      .filter((m): m is { ride: RideMarker; coord: [number, number] } => m.coord !== null),
    [rides],
  );

  const coords = markers.map((m) => m.coord);
  const boatIcon = pinIcon(PIN.boat, "⚓");

  if (markers.length === 0) {
    return (
      <div className="lc-map-frame lc-map-empty" style={{ height }} role="img" aria-label="Mapa indisponível">
        <span style={{ fontSize: 22, marginBottom: 6 }}>🗺️</span>
        Nenhuma viagem para mostrar no mapa
        <span className="lc-map-empty-sub">As viagens sem localização não aparecem aqui</span>
      </div>
    );
  }

  return (
    <div className="lc-map-frame" style={{ height }}>
      <MapContainer center={SP_REGION_CENTER} zoom={SP_REGION_ZOOM} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitToPins coords={coords} />
        {markers.map(({ ride, coord }) => {
          const price = parseFloat(String(ride.pricePerSeat)).toFixed(2).replace(".", ",");
          return (
            <Marker key={ride.id} position={coord} icon={boatIcon}>
              <Popup>
                <div className="lc-popup">
                  <div className="lc-popup-route">{ride.originCity} → {ride.destinationCity}</div>
                  <div className="lc-popup-price">R$ {price} <span>/ pessoa</span></div>
                  <Link href={`/viagens/${ride.id}`}>
                    <span className="lc-popup-link">Ver viagem →</span>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

