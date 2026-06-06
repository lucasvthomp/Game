import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useSearch } from "wouter";
import { Anchor, Calendar, Clock, Star, Search, Car, Users, ArrowRight, Map, List } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, lazy, Suspense } from "react";

const RouteMap = lazy(() => import("@/components/RouteMap"));

const PLACEHOLDER_RIDES = [
  { id: 1, rideType: "boat", originCity: "Bertioga", destinationCity: "Ilhabela", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), pricePerSeat: "85.00", availableSeats: 4, captainName: "Rafael M.", boatName: "Veneza III", avgRating: 4.9 },
  { id: 2, rideType: "boat", originCity: "Santos", destinationCity: "Ilha Grande", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(), pricePerSeat: "120.00", availableSeats: 2, captainName: "Carlos P.", boatName: "Acqua Viva", avgRating: 4.7 },
  { id: 3, rideType: "boat", originCity: "Angra dos Reis", destinationCity: "Paraty", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 44).toISOString(), pricePerSeat: "65.00", availableSeats: 6, captainName: "Bruno S.", boatName: "Mar Aberto", avgRating: 5.0 },
  { id: 4, rideType: "boat", originCity: "Guarujá", destinationCity: "Ubatuba", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(), pricePerSeat: "95.00", availableSeats: 3, captainName: "Diego F.", boatName: "Brisa do Mar", avgRating: 4.8 },
  { id: 5, rideType: "boat", originCity: "Ilhabela", destinationCity: "São Sebastião", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), pricePerSeat: "40.00", availableSeats: 5, captainName: "Marcos T.", boatName: "Veleiro Sul", avgRating: 4.6 },
  { id: 6, rideType: "boat", originCity: "Paraty", destinationCity: "Angra dos Reis", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 80).toISOString(), pricePerSeat: "55.00", availableSeats: 1, captainName: "André L.", boatName: "Ondas do Sul", avgRating: 4.9 },
  { id: 101, rideType: "car", originCity: "Pindamonhangaba", destinationCity: "São José dos Campos", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), pricePerSeat: "18.00", availableSeats: 3, captainName: "Fernanda R.", carName: "Honda Civic", avgRating: 4.8 },
  { id: 102, rideType: "car", originCity: "Taubaté", destinationCity: "Guarulhos", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), pricePerSeat: "25.00", availableSeats: 2, captainName: "Guilherme A.", carName: "Toyota Corolla", avgRating: 4.9 },
  { id: 103, rideType: "car", originCity: "Campinas", destinationCity: "São Paulo", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(), pricePerSeat: "22.00", availableSeats: 1, captainName: "Juliana C.", carName: "VW Golf", avgRating: 4.7 },
  { id: 104, rideType: "car", originCity: "São Paulo", destinationCity: "Santos", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(), pricePerSeat: "30.00", availableSeats: 2, captainName: "Roberto M.", carName: "Hyundai HB20", avgRating: 4.5 },
];

type TabType = "car" | "boat";

export default function Rides({ defaultType }: { defaultType?: "car" | "boat"; [key: string]: any }) {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const typeFromUrl = params.get("type") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(typeFromUrl || defaultType || "car");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "departure">("departure");
  const [dateFilter, setDateFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides", activeTab],
    queryFn: () => apiRequest("GET", `/api/rides?type=${activeTab}`),
  });

  const liveRides = data?.rides || [];
  const source = liveRides.length > 0 ? liveRides : PLACEHOLDER_RIDES;

  const allRides = source.filter((r: any) => r.rideType === activeTab);

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

  const isBoatPage = activeTab === "boat";
  const isCarPage = activeTab === "car";

  return (
    <div className="rides-page">
      <div className="rides-header">
        <div className="rides-header-inner">
          <p className="section-label" style={{ color: isBoatPage ? "var(--boat)" : "var(--car)" }}>
            {isBoatPage ? "CARONAS DE LANCHA" : "CARONAS DE CARRO"}
          </p>
          <h1 className="page-title" style={{ marginBottom: 16 }}>
            {isBoatPage ? "Travessias de lancha" : "Caronas de carro"}
          </h1>

          {/* Type tabs — no "Todos" */}
          <div className="type-tabs" style={{ marginBottom: 16 }}>
            <button className={`type-tab type-tab-car ${activeTab === "car" ? "active-car" : ""}`} onClick={() => setActiveTab("car")}>
              <Car size={12} /> Carro
            </button>
            <button className={`type-tab type-tab-boat ${activeTab === "boat" ? "active-boat" : ""}`} onClick={() => setActiveTab("boat")}>
              <Anchor size={12} /> Lancha
            </button>
          </div>

          <div className="rides-search">
            <Search size={15} className="rides-search-icon" />
            <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Buscar por cidade..." />
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px" }}>
              <Calendar size={13} style={{ color: "var(--text3)" }} />
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: "var(--text1)", cursor: "pointer" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px" }}>
              <span style={{ fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>Até R$</span>
              <input
                type="number"
                placeholder="Sem limite"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: "var(--text1)", width: 80 }}
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", fontSize: 13, color: "var(--text1)", outline: "none", cursor: "pointer" }}
            >
              <option value="departure">Mais próximas</option>
              <option value="price">Menor preço</option>
              <option value="rating">Melhor avaliação</option>
            </select>
            {(dateFilter || maxPrice || sortBy !== "departure") && (
              <button
                onClick={() => { setDateFilter(""); setMaxPrice(""); setSortBy("departure"); }}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: "var(--text3)", cursor: "pointer" }}
              >
                Limpar filtros
              </button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button
                onClick={() => setViewMode("list")}
                style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: viewMode === "list" ? "var(--boat-light)" : "var(--surface)", color: viewMode === "list" ? "var(--boat)" : "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}
              >
                <List size={13} /> Lista
              </button>
              <button
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
        {viewMode === "map" && (
          <Suspense fallback={<div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>Carregando mapa...</div>}>
            <RouteMap
              height="480px"
              points={rides.flatMap((r: any) => {
                const pts = [];
                const getCityCoords = (city: string): [number, number] | null => {
                  const MAP: Record<string, [number, number]> = {
                    "santos": [-23.9618, -46.3322], "ilhabela": [-23.7781, -45.3581],
                    "angra dos reis": [-23.0067, -44.3181], "paraty": [-23.2178, -44.7131],
                    "ilha grande": [-23.1711, -44.1927], "bertioga": [-23.8542, -46.1388],
                    "são paulo": [-23.5505, -46.6333], "campinas": [-22.9056, -47.0608],
                    "são josé dos campos": [-23.1794, -45.8869], "sjc": [-23.1794, -45.8869],
                    "taubaté": [-23.0260, -45.5553], "pindamonhangaba": [-22.9239, -45.4614],
                    "guarulhos": [-23.4543, -46.5333], "rio de janeiro": [-22.9068, -43.1729],
                    "guarujá": [-23.9932, -46.2567], "ubatuba": [-23.4336, -45.0838],
                    "são sebastião": [-23.7969, -45.4081],
                  };
                  return MAP[city.toLowerCase()] ?? null;
                };
                const oC = r.originLat ? [Number(r.originLat), Number(r.originLng)] as [number,number] : getCityCoords(r.originCity);
                const dC = r.destLat ? [Number(r.destLat), Number(r.destLng)] as [number,number] : getCityCoords(r.destinationCity);
                if (oC) pts.push({ lat: oC[0], lng: oC[1], city: r.originCity, type: r.rideType as "boat" | "car" });
                if (dC) pts.push({ lat: dC[0], lng: dC[1], city: r.destinationCity, type: r.rideType as "boat" | "car" });
                return pts;
              })}
            />
          </Suspense>
        )}
        {isLoading ? (
          <div className="ride-grid-v2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rcv2-skeleton" />
            ))}
          </div>
        ) : viewMode === "map" ? null : rides.length === 0 ? (
          <div className="rides-empty">
            {isBoatPage ? <Anchor size={44} className="empty-state-icon" /> : <Car size={44} className="empty-state-icon" />}
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>Nenhuma carona encontrada</p>
            <p style={{ fontSize: 13 }}>Tente outra cidade ou volte mais tarde</p>
          </div>
        ) : (
          <>
            <p className="rides-count">{filtered.length} viagem{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>
            <div className="ride-grid-v2">
              {rides.map((ride: any, i: number) => {
                const isBoat = ride.rideType === "boat";
                const accent = isBoat ? "var(--boat)" : "var(--car)";
                const accentLight = isBoat ? "var(--boat-light)" : "var(--car-light)";
                const soldOut = ride.availableSeats === 0;
                return (
                  <Link key={ride.id} href={`/viagens/${ride.id}`}>
                    <div className="rcv2 fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                      {/* Left accent bar */}
                      <div className="rcv2-bar" style={{ background: accent }} />

                      <div className="rcv2-body">
                        {/* Top row: type pill + seats + rating */}
                        <div className="rcv2-top">
                          <span className="rcv2-type-pill" style={{ background: accentLight, color: accent }}>
                            {isBoat ? <Anchor size={10} /> : <Car size={10} />}
                            {isBoat ? "Lancha" : "Carro"}
                          </span>
                          <div className="rcv2-top-right">
                            {ride.avgRating > 0 && (
                              <span className="rcv2-rating">
                                <Star size={11} fill="var(--amber)" color="var(--amber)" />
                                {Number(ride.avgRating).toFixed(1)}
                              </span>
                            )}
                            <span className="rcv2-seats" style={{
                              background: soldOut ? "color-mix(in srgb, var(--red) 12%, transparent)" : "color-mix(in srgb, var(--green) 10%, transparent)",
                              color: soldOut ? "var(--red)" : "var(--car)",
                            }}>
                              <Users size={10} />
                              {soldOut ? "Esgotado" : `${ride.availableSeats} vagas`}
                            </span>
                          </div>
                        </div>

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

                        {/* Meta row */}
                        <div className="rcv2-meta">
                          <span>
                            <Clock size={12} style={{ color: accent }} />
                            {format(new Date(ride.departureTime), "dd 'de' MMM · HH:mm", { locale: ptBR })}
                          </span>
                          <span>
                            {isBoat
                              ? <><Anchor size={12} style={{ color: accent }} />{ride.boatName || "Lancha"} · {ride.captainName}</>
                              : <><Car size={12} style={{ color: accent }} />{ride.carName || "Carro"} · {ride.captainName}</>
                            }
                          </span>
                        </div>

                        {/* Footer: price + CTA */}
                        <div className="rcv2-footer">
                          <div>
                            <span className="rcv2-price" style={{ color: accent }}>
                              R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="rcv2-per"> / pessoa</span>
                          </div>
                          <button
                            className="rcv2-cta"
                            style={{ background: accent, opacity: soldOut ? 0.4 : 1 }}
                            disabled={soldOut}
                          >
                            {soldOut ? "Esgotado" : "Reservar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
