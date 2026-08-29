import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Anchor, MapPin, Search, ShieldCheck } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { apiRequest } from "@/lib/queryClient";
import { PILOT_ROUTES, type PilotRoute } from "@shared/pilot-routes";
import { COASTAL_POINT_NAMES, ILHABELA_BEACHES } from "@shared/coastal-locations";

const RidesMap = lazy(() => import("@/components/map/RidesMap"));

function routeKey(route: PilotRoute) {
  return route.origin + " → " + route.destination;
}

export default function Routes() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const routesQuery = useQuery({ queryKey: ["/api/routes/popular"], queryFn: () => apiRequest("GET", "/api/routes/popular") });
  const locationsQuery = useQuery({ queryKey: ["/api/locations"], queryFn: () => apiRequest("GET", "/api/locations") });
  const ridesQuery = useQuery({ queryKey: ["/api/rides", "routes-boat"], queryFn: () => apiRequest("GET", "/api/rides?type=boat") });

  const routes = ((routesQuery.data?.routes ?? []) as PilotRoute[]).length > 0 ? (routesQuery.data?.routes as PilotRoute[]) : PILOT_ROUTES;
  const rides = (ridesQuery.data?.rides ?? []) as any[];
  const locationNames = useMemo(() => {
    const stored = ((locationsQuery.data?.locations ?? []) as any[]).map((location) => location.name).filter(Boolean);
    return Array.from(new Set([...stored, ...COASTAL_POINT_NAMES, ...PILOT_ROUTES.flatMap((route) => [route.origin, route.destination])]));
  }, [locationsQuery.data]);
  const filteredRoutes = routes.filter((route) => {
    const haystack = (routeKey(route) + " " + route.region).toLocaleLowerCase("pt-BR");
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
      <section className="routes-command">
        <div className="routes-command-copy">
          <p className="section-label">ROTAS DO LITORAL PAULISTA</p>
          <h1>Encontre seu próximo embarque.</h1>
          <p>Veja as conexões publicadas no mapa, compare pontos de saída e escolha uma travessia de lancha.</p>
        </div>
        <div className="routes-command-search">
          <div className="routes-search-field"><MapPin size={16} /><SiteAutocomplete value={from} onChange={setFrom} options={locationNames} placeholder="Saída" ariaLabel="Ponto de saída" /></div>
          <div className="routes-search-field"><MapPin size={16} /><SiteAutocomplete value={to} onChange={setTo} options={locationNames} placeholder="Chegada" ariaLabel="Ponto de chegada" /></div>
          <button type="button" onClick={search}>Encontrar rota <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="routes-map-first">
        <div className="routes-map-first-heading">
          <div><p className="home-v2-kicker">MAPA VIVO</p><h2>As travessias, de verdade.</h2></div>
          <p>Toque em uma lancha para abrir os detalhes da saída.</p>
        </div>
        <Suspense fallback={<div className="routes-map-loading">Carregando mapa costeiro…</div>}>
          <RidesMap height="560px" rides={rides.filter((ride) => ride.rideType === "boat")} />
        </Suspense>
      </section>

      <section className="routes-directory-v2">
        <div className="routes-directory-heading">
          <div><p className="home-v2-kicker">ROTAS PUBLICADAS</p><h2>Escolha de onde sair.</h2></div>
          <label className="routes-filter-v2"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar por cidade ou região" aria-label="Filtrar rotas" /></label>
        </div>
        <div className="routes-list-v2">
          {filteredRoutes.map((route) => {
            const matchingRide = rides.filter((ride) => ride.originCity === route.origin && ride.destinationCity === route.destination).sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0];
            return <Link key={route.id} href={"/lanchas?from=" + encodeURIComponent(route.origin) + "&to=" + encodeURIComponent(route.destination)}><span className="routes-route-row-v2"><span className="routes-route-mark"><MapPin size={18} /></span><span className="routes-route-main"><strong>{route.origin} <ArrowRight size={15} /> {route.destination}</strong><span>{route.region}</span></span><span className="routes-route-detail"><strong>{matchingRide ? new Date(matchingRide.departureTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Consulte saídas"}</strong><span>{matchingRide ? "próxima saída publicada" : "horários conforme publicação"}</span></span><span className="routes-route-detail"><strong>{matchingRide ? "R$ " + Number(matchingRide.pricePerSeat).toFixed(0) : "Até 12 pessoas"}</strong><span>{matchingRide ? "por pessoa" : "capacidade da lancha"}</span></span><ArrowRight className="routes-route-arrow" size={18} /></span></Link>;
          })}
        </div>
        {filteredRoutes.length === 0 && <div className="routes-empty-v2">Nenhuma rota corresponde a essa busca.</div>}
      </section>

      <section className="routes-points-v2">
        <div className="routes-points-v2-heading"><div><p className="home-v2-kicker">PONTOS CONHECIDOS</p><h2>Onde você pode embarcar.</h2></div><p>Praias e píeres entram no mapa conforme operadores e rotas são publicados.</p></div>
        <div className="routes-point-grid-v2">{ILHABELA_BEACHES.slice(0, 16).map((point) => <span key={point.name} className="routes-point-item-v2"><MapPin size={15} /><strong>{point.name}</strong><small>Ilhabela · ponto de referência</small></span>)}</div>
      </section>

      <section className="routes-cta-v2">
        <div className="routes-cta-v2-icon"><ShieldCheck size={23} /></div>
        <div><p className="home-v2-kicker">A ROTA QUE VOCÊ PRECISA</p><h2>Não encontrou seu caminho?</h2><p>Peça uma rota e ajude a construir a próxima conexão do litoral.</p></div>
        <Link href="/solicitar-rota"><span className="home-v2-coral-button">Solicitar uma rota <ArrowRight size={17} /></span></Link>
      </section>
    </div>
  );
}
