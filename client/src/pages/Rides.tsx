import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useSearch } from "wouter";
import { Anchor, Clock, Star, Search, Car } from "lucide-react";
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

type TabType = "all" | "car" | "boat";

export default function Rides({ defaultType }: { defaultType?: "car" | "boat"; [key: string]: any }) {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const typeFromUrl = params.get("type") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(typeFromUrl || defaultType || "all");
  const [searchText, setSearchText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides", activeTab],
    queryFn: () => apiRequest("GET", `/api/rides${activeTab !== "all" ? `?type=${activeTab}` : ""}`),
  });

  const liveRides = data?.rides || [];
  const source = liveRides.length > 0 ? liveRides : PLACEHOLDER_RIDES;

  const rides = source.filter((r: any) => {
    const matchType = activeTab === "all" || r.rideType === activeTab;
    const matchSearch = !searchText.trim() || r.originCity.toLowerCase().includes(searchText.toLowerCase()) || r.destinationCity.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchSearch;
  });

  const isBoatPage = activeTab === "boat";
  const isCarPage = activeTab === "car";

  return (
    <div className="rides-page">
      <div className="rides-header">
        <div className="rides-header-inner">
          <p className="section-label">
            {isBoatPage ? "CARONAS DE LANCHA" : isCarPage ? "CARONAS DE CARRO" : "CARONAS DISPONÍVEIS"}
          </p>
          <h1 className="page-title" style={{ marginBottom: 16 }}>
            {isBoatPage ? "Travessias de lancha" : isCarPage ? "Caronas de carro" : "Encontre sua carona"}
          </h1>

          {/* Type tabs */}
          <div className="type-tabs" style={{ marginBottom: 16 }}>
            <button className={`type-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              Todos
            </button>
            <button className={`type-tab type-tab-car ${activeTab === "car" ? "active-car" : ""}`} onClick={() => setActiveTab("car")}>
              Carro
            </button>
            <button className={`type-tab type-tab-boat ${activeTab === "boat" ? "active-boat" : ""}`} onClick={() => setActiveTab("boat")}>
              Lancha
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
          <div className="ride-grid">
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, height: 240, opacity: 0.4 }} />
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
            <div className="ride-grid">
              {rides.map((ride: any, i: number) => {
                const isBoat = ride.rideType === "boat";
                return (
                  <Link key={ride.id} href={`/viagens/${ride.id}`}>
                    <div className="ride-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="ride-card-inner">
                        <div className="ride-top">
                          <span className={`type-badge ${isBoat ? "type-badge-boat" : "type-badge-car"}`}>
                            {isBoat ? "Lancha" : "Carro"}
                          </span>
                          <span className={`badge ${ride.availableSeats > 0 ? "badge-green" : "badge-red"}`}>
                            {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
                          </span>
                          {ride.avgRating > 0 && (
                            <span className="rating"><Star size={11} fill="#FBBF24" color="#FBBF24" /> {ride.avgRating.toFixed(1)}</span>
                          )}
                        </div>
                        <div className="ride-route">
                          <div className="ride-city">{ride.originCity}</div>
                          <div className="ride-arrow">
                            <div className="arrow-line" />
                            {isBoat ? <Anchor size={12} color="var(--boat)" /> : <Car size={12} color="var(--car)" />}
                            <div className="arrow-line" />
                          </div>
                          <div className="ride-city">{ride.destinationCity}</div>
                        </div>
                        <div className="ride-meta">
                          <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
                          <span>
                            {isBoat
                              ? <><Anchor size={12} /> {ride.boatName} · Cap. {ride.captainName}</>
                              : <><Car size={12} /> {ride.carName} · {ride.captainName}</>
                            }
                          </span>
                        </div>
                        <div className="ride-footer">
                          <div className="ride-price">
                            <span className="price-amount">R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
                            <span className="price-label">/ pessoa</span>
                          </div>
                          <span className={`btn-reserve ${isBoat ? "btn-reserve-boat" : "btn-reserve-car"}`}>Reservar →</span>
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
