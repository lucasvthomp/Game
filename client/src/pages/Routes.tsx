import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, BadgeCheck, Calendar, Search, Star, Trophy, Users } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { MaritimeIcon } from "@/components/MaritimeIcon";
import type { LatLng } from "@/components/map/LocationPicker";
import { getCityCoords } from "@/components/map/leafletSetup";
import { apiRequest } from "@/lib/queryClient";
import { PILOT_ROUTES, type PilotRoute } from "@shared/pilot-routes";
import { COASTAL_POINT_NAMES, ILHABELA_BEACHES } from "@shared/coastal-locations";

const RidesMap = lazy(() => import("@/components/map/RidesMap"));
const LocationPicker = lazy(() => import("@/components/map/LocationPicker"));

function cardDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data a confirmar" : date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function cardTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Horário a confirmar" : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function coastalPointFor(value: string): LatLng | null {
  if (!value) return null;
  const normalized = value.toLocaleLowerCase("pt-BR");
  const match = ILHABELA_BEACHES.find((point) => point.name.toLocaleLowerCase("pt-BR") === normalized || point.name.toLocaleLowerCase("pt-BR").includes(normalized) || point.municipality.toLocaleLowerCase("pt-BR") === normalized);
  if (match) return { lat: match.latitude, lng: match.longitude };
  const city = getCityCoords(value);
  return city ? { lat: city[0], lng: city[1] } : null;
}

function RouteRideCard({ ride }: { ride: any }) {
  const available = Math.max(0, Number(ride.availableSeats ?? ride.totalSeats ?? 0));
  const total = Number(ride.totalSeats ?? available);
  const rating = Number(ride.avgRating || 0);
  const isTop = Boolean(ride.captainTop || (ride.captainVerified && rating >= 4.8));
  const price = Number(ride.pricePerSeat);

  return (
    <Link href={"/viagens/" + ride.id}>
      <article className="routes-ride-card">
        <div className="routes-ride-profile">
          <span className="routes-ride-avatar">
            {ride.captainAvatarUrl ? <img src={ride.captainAvatarUrl} alt="" /> : <span>{(ride.captainName || "C").charAt(0).toUpperCase()}</span>}
          </span>
          <div className="routes-ride-profile-copy">
            <div className="routes-ride-name"><strong>{ride.captainName || "Capitão local"}</strong>{ride.captainVerified && <BadgeCheck size={16} />}</div>
            <span>{ride.captainUsername ? "@" + ride.captainUsername : "Operador local"}{ride.boatName ? " · " + ride.boatName : ""}</span>
            <div className="routes-ride-proof">
              {rating > 0 && <span><Star size={12} fill="currentColor" /> {rating.toFixed(1)}{ride.captainReviewCount ? " (" + ride.captainReviewCount + ")" : ""}</span>}
              {isTop && <span className="routes-ride-top"><Trophy size={11} /> Top capitão</span>}
            </div>
          </div>
        </div>

        <div className="routes-ride-route">
          <div><small>SAÍDA</small><strong>{ride.originCity}</strong></div>
          <span className="routes-ride-route-line"><i /><MaritimeIcon variant="lancha" size={19} /><i /></span>
          <div className="routes-ride-destination"><small>CHEGADA</small><strong>{ride.destinationCity}</strong></div>
        </div>

        <div className="routes-ride-meta">
          <span><Calendar size={15} /> <strong>{cardDate(ride.departureTime)}</strong></span>
          <span><MaritimeIcon variant="clock" size={16} /> <strong>{cardTime(ride.departureTime)}</strong></span>
          <span><Users size={15} /> <strong>{available}/{total}</strong> vagas</span>
        </div>

        <div className="routes-ride-footer">
          <div><small>A PARTIR DE</small><strong>{Number.isFinite(price) ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Consulte"}</strong><span>/ pessoa</span></div>
          <span className="routes-ride-cta">Ver detalhes <ArrowRight size={15} /></span>
        </div>
      </article>
    </Link>
  );
}

export default function Routes() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [mapStep, setMapStep] = useState<"search" | "pins">("search");
  const [originPin, setOriginPin] = useState<LatLng | null>(null);
  const [destinationPin, setDestinationPin] = useState<LatLng | null>(null);

  const locationsQuery = useQuery({ queryKey: ["/api/locations"], queryFn: () => apiRequest("GET", "/api/locations") });
  const ridesQuery = useQuery({ queryKey: ["/api/rides", "routes-boat"], queryFn: () => apiRequest("GET", "/api/rides?type=boat") });
  const rides = (ridesQuery.data?.rides ?? []) as any[];
  const publishedRides = rides.filter((ride) => ride.rideType === "boat");
  const locationNames = useMemo(() => {
    const stored = ((locationsQuery.data?.locations ?? []) as any[]).map((location) => location.name).filter(Boolean);
    return Array.from(new Set([...stored, ...COASTAL_POINT_NAMES, ...PILOT_ROUTES.flatMap((route) => [route.origin, route.destination])]));
  }, [locationsQuery.data]);
  const filteredRides = publishedRides.filter((ride) => {
    const haystack = (ride.originCity + " " + ride.destinationCity + " " + (ride.captainName || "")).toLocaleLowerCase("pt-BR");
    return !query || haystack.includes(query.toLocaleLowerCase("pt-BR"));
  });

  const updateFrom = (value: string) => {
    setFrom(value);
    const point = coastalPointFor(value);
    if (point) setOriginPin(point);
  };
  const updateTo = (value: string) => {
    setTo(value);
    const point = coastalPointFor(value);
    if (point) setDestinationPin(point);
  };
  const continueToPins = () => {
    if (!originPin) setOriginPin(coastalPointFor(from));
    if (!destinationPin) setDestinationPin(coastalPointFor(to));
    setMapStep("pins");
  };
  const search = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (travelDate) params.set("date", travelDate);
    if (travelTime) params.set("time", travelTime);
    if (passengers) params.set("passengers", passengers);
    if (originPin) { params.set("originLat", String(originPin.lat)); params.set("originLng", String(originPin.lng)); }
    if (destinationPin) { params.set("destinationLat", String(destinationPin.lat)); params.set("destinationLng", String(destinationPin.lng)); }
    window.location.href = "/lanchas?" + params.toString();
  };

  return (
    <div className="routes-page-v2">
      <section className="routes-map-hero" aria-labelledby="routes-title">
        <div className="routes-map-hero-map">
          <Suspense fallback={<div className="routes-map-loading">Carregando mapa costeiro…</div>}>
            <RidesMap height="min(560px, 66svh)" rides={publishedRides} />
          </Suspense>
          <div className="routes-map-hero-map-label"><MaritimeIcon variant="wave" size={16} /> mapa costeiro</div>
        </div>
        <div className="routes-map-hero-panel">
          <p className="home-v2-kicker">ROTAS</p>
          <h1 id="routes-title">Escolha seu caminho pela água.</h1>
          <p className="routes-map-hero-lead">Encontre uma saída publicada ou marque exatamente onde quer embarcar.</p>
          <div className="routes-map-search-card">
            <div className="routes-map-search-step"><span className="routes-map-step-number">1</span><div><strong>Defina o trecho</strong><small>Saída e chegada</small></div></div>
            <div className="routes-search-field"><MaritimeIcon variant="pinpoint" size={17} /><SiteAutocomplete value={from} onChange={updateFrom} options={locationNames} placeholder="Saída" ariaLabel="Ponto de saída" /></div>
            <div className="routes-search-field"><MaritimeIcon variant="beach" size={17} /><SiteAutocomplete value={to} onChange={updateTo} options={locationNames} placeholder="Chegada" ariaLabel="Ponto de chegada" /></div>
            <div className="routes-map-search-inline">
              <label><MaritimeIcon variant="clock" size={16} /><span><small>DATA</small><input type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} aria-label="Data da viagem" /></span></label>
              <label><MaritimeIcon variant="clock" size={16} /><span><small>HORÁRIO</small><input type="time" value={travelTime} onChange={(event) => setTravelTime(event.target.value)} aria-label="Horário da viagem" /></span></label>
              <label><MaritimeIcon variant="lancha" size={16} /><span><small>PASSAGEIROS</small><input type="number" min="1" max="12" value={passengers} onChange={(event) => setPassengers(event.target.value)} aria-label="Quantidade de passageiros" /></span></label>
            </div>
            {mapStep === "search" ? (
              <button type="button" className="routes-map-search-button" onClick={continueToPins}>Continuar no mapa <ArrowRight size={16} /></button>
            ) : (
              <div className="routes-map-pin-step">
                <div className="routes-map-search-step"><span className="routes-map-step-number">2</span><div><strong>Ajuste os pontos</strong><small>Arraste os pins pela costa</small></div></div>
                <div className="routes-map-pickers">
                  <Suspense fallback={<div className="routes-map-loading">Carregando seletor…</div>}>
                    <LocationPicker label="Embarque" variant="origin" value={originPin} onChange={setOriginPin} height="170px" />
                    <LocationPicker label="Chegada" variant="dest" value={destinationPin} onChange={setDestinationPin} height="170px" />
                  </Suspense>
                </div>
                <button type="button" className="routes-map-search-button" onClick={search}>Buscar saídas <ArrowRight size={16} /></button>
                <button type="button" className="routes-map-back" onClick={() => setMapStep("search")}>Voltar e editar trecho</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="routes-rides-directory">
        <div className="routes-rides-heading">
          <div><p className="home-v2-kicker">SAÍDAS PUBLICADAS</p><h2>Escolha uma lancha.</h2><p>Veja primeiro quem conduz. Depois confira rota, horário, valor e vagas.</p></div>
          <label className="routes-filter-v2"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar saídas" aria-label="Filtrar saídas" /></label>
        </div>
        {filteredRides.length > 0 ? (
          <div className="routes-rides-grid">{filteredRides.map((ride) => <RouteRideCard key={ride.id} ride={ride} />)}</div>
        ) : (
          <div className="routes-rides-empty"><MaritimeIcon variant="lancha" size={32} /><strong>Nenhuma saída publicada ainda.</strong><span>Peça uma rota ou tente outro termo de busca.</span><Link href="/solicitar-rota"><span>Solicitar uma rota <ArrowRight size={14} /></span></Link></div>
        )}
      </section>

      <section className="routes-points-v2">
        <div className="routes-points-v2-heading"><div><p className="home-v2-kicker">PONTOS CONHECIDOS</p><h2>Onde você pode embarcar.</h2></div><p>{ILHABELA_BEACHES.length}+ praias e pontos costeiros entram no mapa.</p></div>
        <div className="routes-point-grid-v2">{ILHABELA_BEACHES.slice(0, 16).map((point) => <span key={point.name} className="routes-point-item-v2"><MaritimeIcon variant="buoy" size={16} /><strong>{point.name}</strong><small>Ilhabela · ponto costeiro</small></span>)}</div>
      </section>

      <section className="routes-cta-v2">
        <div className="routes-cta-v2-icon"><MaritimeIcon variant="wave" size={24} /></div>
        <div><p className="home-v2-kicker">FALTA UMA SAÍDA?</p><h2>Peça a rota que você precisa.</h2><p>Conte origem, destino e data para ajudar a criar a próxima conexão.</p></div>
        <Link href="/solicitar-rota"><span className="home-v2-coral-button">Solicitar uma rota <ArrowRight size={17} /></span></Link>
      </section>
    </div>
  );
}
