import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useSearch } from "wouter";
import { Anchor, Clock, Star, Search, Car, Users, ArrowRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

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

  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides", activeTab],
    queryFn: () => apiRequest("GET", `/api/rides?type=${activeTab}`),
  });

  const liveRides = data?.rides || [];
  const source = liveRides.length > 0 ? liveRides : PLACEHOLDER_RIDES;

  const rides = source.filter((r: any) => {
    const matchType = r.rideType === activeTab;
    const matchSearch = !searchText.trim() || r.originCity.toLowerCase().includes(searchText.toLowerCase()) || r.destinationCity.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchSearch;
  });

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
        </div>
      </div>

      <div className="rides-body">
        {isLoading ? (
          <div className="ride-grid-v2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rcv2-skeleton" />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div className="rides-empty">
            {isBoatPage ? <Anchor size={44} className="empty-state-icon" /> : <Car size={44} className="empty-state-icon" />}
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>Nenhuma carona encontrada</p>
            <p style={{ fontSize: 13 }}>Tente outra cidade ou volte mais tarde</p>
          </div>
        ) : (
          <>
            <p className="rides-count">{rides.length} {rides.length === 1 ? "carona encontrada" : "caronas encontradas"}</p>
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
                                <Star size={11} fill="#FBBF24" color="#FBBF24" />
                                {Number(ride.avgRating).toFixed(1)}
                              </span>
                            )}
                            <span className="rcv2-seats" style={{
                              background: soldOut ? "rgba(255,64,64,0.1)" : "rgba(0,232,122,0.08)",
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
