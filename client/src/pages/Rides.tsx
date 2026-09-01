import { useQuery } from "@tanstack/react-query";
import { SiteSelect, SiteAutocomplete } from "@/components/SiteSelect";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { BadgeCheck, Calendar, Star, Search, Trophy, Users, ArrowRight, Map, List } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, lazy, Suspense } from "react";
import { COASTAL_POINT_NAMES } from "@shared/coastal-locations";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const RidesMap = lazy(() => import("@/components/map/RidesMap"));

function formatRideDate(value: string, pattern: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "A confirmar" : format(date, pattern, { locale: ptBR });
}

function formatPrice(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })
    : "Consulte";
}

export default function Rides() {
  const activeTab = "boat" as const;
  const initialParams = new URLSearchParams(window.location.search);
  const [searchText, setSearchText] = useState(initialParams.get("from") || initialParams.get("to") || "");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "departure">("departure");
  const [dateFilter, setDateFilter] = useState(initialParams.get("date") || "");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides", activeTab],
    queryFn: () => {
      const params = new URLSearchParams({ type: activeTab });
      ["from", "to", "date", "passengers"].forEach((key) => {
        const value = initialParams.get(key);
        if (value) params.set(key, value);
      });
      return apiRequest("GET", "/api/rides?" + params.toString());
    },
  });

  const allRides = ((data?.rides || []) as any[]).filter((ride) => ride.rideType === activeTab);
  const filtered = allRides
    .filter((ride) => {
      const query = searchText.toLocaleLowerCase("pt-BR");
      const matchesCity = !query
        || ride.originCity?.toLocaleLowerCase("pt-BR").includes(query)
        || ride.destinationCity?.toLocaleLowerCase("pt-BR").includes(query);
      const matchesDate = !dateFilter
        || new Date(ride.departureTime).toDateString() === new Date(dateFilter).toDateString();
      const matchesPrice = !maxPrice || Number(ride.pricePerSeat) <= Number(maxPrice);
      return matchesCity && matchesDate && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price") return Number(a.pricePerSeat) - Number(b.pricePerSeat);
      if (sortBy === "rating") return Number(b.avgRating || 0) - Number(a.avgRating || 0);
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });

  const clearFilters = () => {
    setDateFilter("");
    setMaxPrice("");
    setSortBy("departure");
  };

  return (
    <div className="rides-page rides-page-clean">
      <header className="rides-header rides-header-clean">
        <div className="rides-header-inner">
          <div className="rides-heading-clean">
            <div>
              <p className="section-label">SAÍDAS DE LANCHA</p>
              <h1 className="page-title">Escolha sua travessia</h1>
              <p>Veja quem conduz, o horário, o valor e quantas vagas ainda estão disponíveis.</p>
            </div>
            <span className="rides-heading-mark"><MaritimeIcon variant="lancha" size={30} /></span>
          </div>

          <div className="rides-search rides-search-clean">
            <Search size={16} className="rides-search-icon" />
            <SiteAutocomplete value={searchText} onChange={setSearchText} options={COASTAL_POINT_NAMES} placeholder="Buscar por cidade ou praia..." ariaLabel="Buscar por cidade ou praia" />
          </div>

          <div className="rides-filter-bar rides-filter-bar-clean">
            <label className="rides-filter-chip">
              <Calendar size={14} />
              <span className="sr-only">Filtrar por data</span>
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
            </label>
            <label className="rides-filter-chip">
              <span className="rides-filter-label">Até R$</span>
              <span className="sr-only">Preço máximo</span>
              <input type="number" min="0" placeholder="sem limite" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
            </label>
            <SiteSelect value={sortBy} onChange={(value) => setSortBy(value as typeof sortBy)} options={[{ value: "departure", label: "Mais próximas" }, { value: "price", label: "Menor preço" }, { value: "rating", label: "Melhor avaliação" }]} ariaLabel="Ordenar viagens" />
            {(dateFilter || maxPrice || sortBy !== "departure") && <button className="rides-clear-filter" onClick={clearFilters}>Limpar filtros</button>}
            <div className="rides-view-toggle" role="group" aria-label="Visualização">
              <button className={"rides-view-button " + (viewMode === "list" ? "is-selected" : "")} onClick={() => setViewMode("list")}><List size={14} /> Lista</button>
              <button className={"rides-view-button " + (viewMode === "map" ? "is-selected" : "")} onClick={() => setViewMode("map")}><Map size={14} /> Mapa</button>
            </div>
          </div>
        </div>
      </header>

      <main className="rides-body rides-body-clean">
        {viewMode === "map" && (
          <div className="lancha-live-map-cluster rides-map-clean">
            <div className="lancha-live-map">
              <Suspense fallback={<div className="rides-map-loading">Carregando mapa...</div>}>
                <RidesMap height="min(480px, 58svh)" rides={filtered} />
              </Suspense>
            </div>
            <span className="lancha-live-map-caption">mapa vivo · saídas publicadas</span>
          </div>
        )}

        {isLoading ? (
          <div className="ride-grid-v2 ride-grid-clean">
            {[1, 2, 3].map((item) => <div key={item} className="rcv2-skeleton" />)}
          </div>
        ) : viewMode === "map" ? null : filtered.length === 0 ? (
          <div className="rides-empty rides-empty-clean">
            <span className="rides-empty-icon"><MaritimeIcon variant="lancha" size={40} /></span>
            <h2>Nenhuma saída encontrada</h2>
            <p>Tente outro ponto ou peça uma rota para o seu caminho.</p>
            <Link href={"/solicitar-rota?" + initialParams.toString()}>
              <span className="rides-request-route-link">Pedir esta rota <ArrowRight size={14} /></span>
            </Link>
          </div>
        ) : (
          <>
            <div className="rides-results-summary">
              <p className="rides-count">{filtered.length} saída{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>
              <span><MaritimeIcon variant="clock" size={14} /> Horários e valores atualizados</span>
            </div>
            <div className="ride-grid-v2 ride-grid-clean">
              {filtered.map((ride, index) => {
                const availableSeats = Math.max(0, Number(ride.availableSeats ?? ride.totalSeats ?? 0));
                const totalSeats = Number(ride.totalSeats ?? availableSeats);
                const soldOut = availableSeats === 0;
                const rating = Number(ride.avgRating || 0);
                const isTopCaptain = Boolean(ride.captainTop || (ride.captainVerified && rating >= 4.8));

                return (
                  <Link key={ride.id} href={"/viagens/" + ride.id}>
                    <article className="ride-result-card fade-up" style={{ animationDelay: index * 50 + "ms" }}>
                      <div className="ride-result-card-top">
                        <span className="ride-result-avatar">
                          {ride.captainAvatarUrl ? <img src={ride.captainAvatarUrl} alt="" /> : <span>{(ride.captainName || "C").charAt(0).toUpperCase()}</span>}
                        </span>
                        <div className="ride-result-profile">
                          <div className="ride-result-profile-name">
                            <strong>{ride.captainName || "Capitão local"}</strong>
                            {ride.captainVerified && <BadgeCheck size={16} className="ride-result-verified" aria-label="Capitão verificado" />}
                          </div>
                          <span className="ride-result-profile-meta">
                            {ride.captainUsername ? "@" + ride.captainUsername : "Operador local"}
                            {ride.boatName ? " · " + ride.boatName : ""}
                            {ride.captainBoatModel ? " · " + ride.captainBoatModel : ""}
                          </span>
                          <span className="ride-result-proof">
                            {rating > 0 && <span className="ride-result-rating"><Star size={13} fill="currentColor" /> <strong>{rating.toFixed(1)}</strong>{ride.captainReviewCount ? <small>({ride.captainReviewCount})</small> : null}</span>}
                            {isTopCaptain && <span className="ride-result-top-badge"><Trophy size={12} /> Top capitão</span>}
                          </span>
                        </div>
                        {ride.description?.startsWith("[DEMO]") && <span className="ride-result-demo-badge">Exemplo</span>}
                      </div>

                      <div className="ride-result-route">
                        <div className="ride-result-route-point">
                          <span className="ride-result-route-label">SAÍDA</span>
                          <strong>{ride.originCity}</strong>
                        </div>
                        <div className="ride-result-route-connector" aria-hidden="true">
                          <span />
                          <MaritimeIcon variant="lancha" size={20} />
                          <span />
                        </div>
                        <div className="ride-result-route-point ride-result-route-point-destination">
                          <span className="ride-result-route-label">CHEGADA</span>
                          <strong>{ride.destinationCity}</strong>
                        </div>
                      </div>

                      <div className="ride-result-details">
                        <span><Calendar size={15} /><strong>{formatRideDate(ride.departureTime, "EEE, dd MMM")}</strong></span>
                        <span><MaritimeIcon variant="clock" size={16} /><strong>{formatRideDate(ride.departureTime, "HH:mm")}</strong></span>
                        <span><Users size={15} /><strong>{availableSeats}/{totalSeats}</strong><small> vagas</small></span>
                      </div>

                      <div className="ride-result-card-footer">
                        <div className="ride-result-price">
                          <span>A PARTIR DE</span>
                          <strong>{formatPrice(ride.pricePerSeat)}</strong><small>/ pessoa</small>
                        </div>
                        <span className={"ride-result-cta " + (soldOut ? "is-sold-out" : "")}>
                          {soldOut ? "Esgotado" : "Ver detalhes"} <ArrowRight size={16} />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
