import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, BadgeCheck, Calendar, Search, Star, Trophy, Users } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { MaritimeIcon } from "@/components/MaritimeIcon";
import type { LatLng } from "@/components/map/LocationPicker";
import { apiRequest } from "@/lib/queryClient";
import { PILOT_ROUTES, type PilotRoute } from "@shared/pilot-routes";
import { COASTAL_POINT_NAMES, ILHABELA_BEACHES } from "@shared/coastal-locations";

const RidesMap = lazy(() => import("@/components/map/RidesMap"));
const LocationPicker = lazy(() => import("@/components/map/LocationPicker"));

function routeKey(route: PilotRoute) {
  return route.origin + " → " + route.destination;
}

function cardDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data a confirmar" : date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function cardTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Horário a confirmar" : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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
  const [routePin, setRoutePin] = useState<LatLng | null>(null);
  const [showPinDrop, setShowPinDrop] = useState(false);
  const routesQuery = useQuery({ queryKey: ["/api/routes/popular"], queryFn: () => apiRequest("GET", "/api/routes/popular") });
  const locationsQuery = useQuery({ queryKey: ["/api/locations"], queryFn: () => apiRequest("GET", "/api/locations") });
  const ridesQuery = useQuery({ queryKey: ["/api/rides", "routes-boat"], queryFn: () => apiRequest("GET", "/api/rides?type=boat") });

  const routes = ((routesQuery.data?.routes ?? []) as PilotRoute[]).length > 0 ? (routesQuery.data?.routes as PilotRoute[]) : PILOT_ROUTES;
  const rides = (ridesQuery.data?.rides ?? []) as any[];
  const publishedRides = rides.filter((ride) => ride.rideType === "boat");
  const locationNames = useMemo(() => {
    const stored = ((locationsQuery.data?.locations ?? []) as any[]).map((location) => location.name).filter(Boolean);
    return Array.from(new Set([...stored, ...COASTAL_POINT_NAMES, ...PILOT_ROUTES.flatMap((route) => [route.origin, route.destination])]));
  }, [locationsQuery.data]);
  const filteredRoutes = routes.filter((route) => {
    const haystack = (routeKey(route) + " " + route.region).toLocaleLowerCase("pt-BR");
    return !query || haystack.includes(query.toLocaleLowerCase("pt-BR"));
  });
  const filteredRides = publishedRides.filter((ride) => {
    const haystack = (ride.originCity + " " + ride.destinationCity + " " + (ride.captainName || "")).toLocaleLowerCase("pt-BR");
    return !query || haystack.includes(query.toLocaleLowerCase("pt-BR"));
  });
  const search = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.location.href = "/lanchas?" + params.toString();
  };

  return (
    <div className="routes-page-v2">
      <header className="routes-command routes-command-clean">
        <div className="routes-command-copy">
          <p className="section-label">ROTAS</p>
          <h1>Veja onde embarcar.</h1>
          <p>Escolha uma saída ou marque um ponto costeiro no mapa.</p>
        </div>
        <div className="routes-command-search">
          <div className="routes-search-field"><MaritimeIcon variant="pinpoint" size={17} /><SiteAutocomplete value={from} onChange={setFrom} options={locationNames} placeholder="Saída" ariaLabel="Ponto de saída" /></div>
          <div className="routes-search-field"><MaritimeIcon variant="beach" size={17} /><SiteAutocomplete value={to} onChange={setTo} options={locationNames} placeholder="Chegada" ariaLabel="Ponto de chegada" /></div>
          <button type="button" onClick={search}>Buscar saída <ArrowRight size={16} /></button>
        </div>
      </header>

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

\n      <section className="routes-map-workspace">
        <div className="routes-map-workspace-head">
          <div><p className="home-v2-kicker">MAPA DO LITORAL</p><h2>Saídas perto de você.</h2><p>Veja viagens publicadas e marque um ponto somente na costa.</p></div>
          <span className="routes-map-workspace-badge"><MaritimeIcon variant="wave" size={17} /> pontos costeiros</span>
        </div>
        <div className="routes-map-workspace-grid">
          <div className="routes-map-live">
            <Suspense fallback={<div className="routes-map-loading">Carregando mapa costeiro…</div>}>
              <RidesMap height="min(440px, 55svh)" rides={publishedRides} />
            </Suspense>
          </div>
          <aside className={"routes-pin-card" + (showPinDrop ? " is-open" : "")}>
            <div className="routes-pin-card-icon"><MaritimeIcon variant="buoy" size={22} /></div>
            <p className="home-v2-kicker">PINPOINT</p>
            <h3>Marque o embarque.</h3>
            <p>O ponto precisa ficar na costa, perto de uma praia ou píer.</p>
            <button type="button" className="routes-pin-toggle" onClick={() => setShowPinDrop((current) => !current)}>{showPinDrop ? "Fechar mapa" : routePin ? "Ajustar ponto" : "Soltar pin"} <MaritimeIcon variant="route" size={16} /></button>
            {showPinDrop && <div className="routes-pin-picker"><Suspense fallback={<div className="routes-map-loading">Carregando seletor…</div>}><LocationPicker label="Ponto de embarque" variant="origin" value={routePin} onChange={setRoutePin} height="280px" /></Suspense>{routePin && <button type="button" className="routes-pin-use" onClick={() => setShowPinDrop(false)}>Usar este ponto <ArrowRight size={16} /></button>}</div>}
            {routePin && !showPinDrop && <div className="routes-pin-selected" role="status"><span><MaritimeIcon variant="buoy" size={16} /> Ponto costeiro salvo</span><small>{routePin.lat.toFixed(4)}, {routePin.lng.toFixed(4)}</small></div>}
          </aside>
        </div>
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
