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
      return apiRequest("GET", `/api/rides?${params.toString()}`);
    },
  });

  const liveRides = data?.rides || [];
  const allRides = liveRides.filter((r: any) => r.rideType === activeTab);

  let filtered = allRides.filter((r: any) => {
    const q = searchText.toLowerCase();
    const matchesCity = !q || r.originCity?.toLowerCase().includes(q) || r.destinationCity?.toLowerCase().includes(q);
    const matchesDate = !dateFilter || new Date(r.departureTime).toDateString() === new Date(dateFilter).toDateString();
    const matchesPrice = !maxPrice || parseFloat(r.pricePerSeat) <= parseFloat(maxPrice);
    return matchesCity && matchesDate && matchesPrice;
  });

  filtered = [...filtered].sort((a: any, b: any) => {
    if (sortBy === "price") return parseFloat(a.pricePerSeat) - parseFloat(b.pricePerSeat);
    if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
    return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
  });

  const rides = filtered;

  return (
    <div className="rides-page">
      <div className="rides-header">
        <div className="rides-header-inner">
          <div className="lancha-header-intro">
            <div className="lancha-header-copy">
              <p className="section-label" style={{ color: "var(--boat)" }}>
                TRAVESSIAS DE LANCHA
              </p>
              <h1 className="page-title" style={{ marginBottom: 16 }}>
                Travessias de lancha
              </h1>
              <p className="lancha-header-dek">
                Rotas publicadas por quem já navega pelo litoral de São Paulo. Encontre um embarque, confira os detalhes e escolha o seu caminho pela água.
              </p>
            </div>

          </div>

          <div className="rides-search">
            <Search size={15} className="rides-search-icon" />
            <SiteAutocomplete value={searchText} onChange={setSearchText} options={COASTAL_POINT_NAMES} placeholder="Buscar por cidade ou praia..." ariaLabel="Buscar por cidade ou praia" />
          </div>

          {/* Filter bar */}
          <div className="rides-filter-bar">
            <div className="rides-filter-chip">
              <Calendar size={13} style={{ color: "var(--text3)" }} />
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: "var(--text1)", cursor: "pointer" }}
              />
            </div>
            <div className="rides-filter-chip">
              <span className="rides-filter-label">Até R$</span>
              <input
                type="number"
                placeholder="Sem limite"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: "var(--text1)", width: 80 }}
              />
            </div>
            <SiteSelect value={sortBy} onChange={(value) => setSortBy(value as typeof sortBy)} options={[{ value: "departure", label: "Mais próximas" }, { value: "price", label: "Menor preço" }, { value: "rating", label: "Melhor avaliação" }]} ariaLabel="Ordenar viagens" />
            {(dateFilter || maxPrice || sortBy !== "departure") && (
              <button
                onClick={() => { setDateFilter(""); setMaxPrice(""); setSortBy("departure"); }}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: "var(--text3)", cursor: "pointer" }}
              >
                Limpar filtros
              </button>
            )}
            <div className="rides-view-toggle">
              <button className="rides-view-button"
                onClick={() => setViewMode("list")}
                style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: viewMode === "list" ? "var(--boat-light)" : "var(--surface)", color: viewMode === "list" ? "var(--boat)" : "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}
              >
                <List size={13} /> Lista
              </button>
              <button className="rides-view-button"
                onClick={() => setViewMode("map")}
                style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: viewMode === "map" ? "var(--boat-light)" : "var(--surface)", color: viewMode === "map" ? "var(--boat)" : "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}
              >
                <Map size={13} /> Mapa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rides-body">
        <>
        {viewMode === "map" && (
          <div className="lancha-live-map-cluster">
            <figure className="lancha-live-map-print lancha-live-map-print-a" aria-hidden="true">
              <img src="/images/marcamar-map-route.svg" alt="" />
            </figure>
            <figure className="lancha-live-map-print lancha-live-map-print-b" aria-hidden="true">
              <img src="/images/marcamar-map-coast.svg" alt="" />
            </figure>
            <div className="lancha-live-map">
              <Suspense fallback={<div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>Carregando mapa...</div>}>
                <RidesMap height="480px" rides={rides} />
              </Suspense>
            </div>
            <span className="lancha-live-map-caption">mapa vivo · viagens publicadas</span>
          </div>
        )}
        {isLoading ? (
          <div className="ride-grid-v2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rcv2-skeleton" />
            ))}
          </div>
        ) : viewMode === "map" ? null : rides.length === 0 ? (
          <div className="rides-empty">
            <MaritimeIcon variant="lancha" size={44} className="empty-state-icon" />
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>Nenhuma travessia encontrada</p>
            <p style={{ fontSize: 13 }}>Tente outra cidade ou volte mais tarde</p>
            <Link href={`/solicitar-rota?${initialParams.toString()}`}>
              <span className="rides-request-route-link">Pedir esta rota <ArrowRight size={14} /></span>
            </Link>
          </div>
        ) : (
          <>
            <p className="rides-count">{filtered.length} viagem{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>
            <div className="ride-grid-v2">
              {rides.map((ride: any, i: number) => {
                const accent = "var(--boat)";
                const soldOut = ride.availableSeats === 0;
                return (
                  <Link key={ride.id} href={`/viagens/${ride.id}`}>
                    <div className="rcv2 fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                      {/* Left accent bar */}
                      <div className="rcv2-bar" style={{ background: accent }} />

                      <div className="rcv2-body">
                        {/* Keep only the small context label here; practical details live below. */}
                        {ride.description?.startsWith("[DEMO]") && (
                          <div className="rcv2-top">
                            <span className="rcv2-demo-badge">Exemplo de teste</span>
                          </div>
                        )}

                        {/* Route — hero section */}
                        <div className="rcv2-route">
                          <div className="rcv2-city-block">
                            <div className="rcv2-city-label">ORIGEM</div>
                            <div className="rcv2-city">{ride.originCity}</div>
                          </div>
                          <div className="rcv2-route-mid">
                            <div className="rcv2-dot" style={{ background: accent }} />
                            <div className="rcv2-dashes" style={{ borderTopColor: accent }} />
                            <ArrowRight size={14} style={{ color: accent, flexShrink: 0 }} />
                          </div>
                          <div className="rcv2-city-block rcv2-city-block-right">
                            <div className="rcv2-city-label">DESTINO</div>
                            <div className="rcv2-city">{ride.destinationCity}</div>
                          </div>
                        </div>

                        <div className="rcv2-captain">
                          <span className="rcv2-avatar">
                            {ride.captainAvatarUrl ? <img src={ride.captainAvatarUrl} alt="" /> : <span>{(ride.captainName || "C")[0]}</span>}
                          </span>
                          <span className="rcv2-captain-copy">
                            <strong>{ride.captainName || "Capitão local"}</strong>
                            <small>{ride.captainUsername ? "@" + ride.captainUsername : "Operador local"}{ride.boatName ? " · " + ride.boatName : ""}{ride.captainBoatModel ? " · " + ride.captainBoatModel : ""}</small>
                          </span>
                          <span className="rcv2-captain-proof">
                            {Number(ride.avgRating || 0) > 0 && (
                              <span className="rcv2-captain-rating" aria-label={`${Number(ride.avgRating).toFixed(1)} de 5 estrelas`}>
                                <Star size={12} fill="var(--amber)" color="var(--amber)" />
                                <strong>{Number(ride.avgRating).toFixed(1)}</strong>
                                {Number(ride.captainReviewCount || 0) > 0 && <small>({ride.captainReviewCount})</small>}
                              </span>
                            )}
                            <span className="rcv2-captain-badges">
                              {ride.captainVerified && <span className="rcv2-verified-badge"><BadgeCheck size={13} /> Verificado</span>}
                              {(ride.captainTop || (ride.captainVerified && Number(ride.avgRating || 0) >= 4.8)) && <span className="rcv2-top-badge"><Trophy size={12} /> Top capitão</span>}
                            </span>
                          </span>
                        </div>

                        {/* Decision details: date, departure time, coastal meeting point and seats. */}
                        <div className="rcv2-detail-grid">
                          <span className="rcv2-detail-item">
                            <Calendar size={14} style={{ color: accent }} />
                            <span><strong>{format(new Date(ride.departureTime), "EEE, dd MMM", { locale: ptBR })}</strong><small>data</small></span>
                          </span>
                          <span className="rcv2-detail-item">
                            <MaritimeIcon variant="clock" size={14} style={{ color: accent }} />
                            <span><strong>{format(new Date(ride.departureTime), "HH:mm", { locale: ptBR })}</strong><small>saída</small></span>
                          </span>
                          <span className="rcv2-detail-item">
                            <MaritimeIcon variant="pinpoint" size={14} style={{ color: accent }} />
                            <span><strong>{ride.originCity}</strong><small>embarque</small></span>
                          </span>
                          <span className="rcv2-detail-item">
                            <Users size={14} style={{ color: accent }} />
                            <span><strong>{ride.availableSeats}/{ride.totalSeats || ride.availableSeats}</strong><small>lugares livres</small></span>
                          </span>
                        </div>

                        {/* Footer: BlaBlaCar-style starting price and clear next action. */}
                        <div className="rcv2-footer">
                          <div className="rcv2-price-stack">
                            <span className="rcv2-price-label">a partir de</span>
                            <span>
                              <span className="rcv2-price" style={{ color: accent }}>
                                R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
                              </span>
                              <span className="rcv2-per"> / pessoa</span>
                            </span>
                          </div>
                          <span className="rcv2-cta" style={{ background: accent, opacity: soldOut ? 0.4 : 1 }}>
                            {soldOut ? "Esgotado" : "Ver detalhes"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
        </>
      </div>
    </div>
  );
}

