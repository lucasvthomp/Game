import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Anchor, Clock, Star, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const PLACEHOLDER_RIDES = [
  { id: 1, originCity: "Bertioga", destinationCity: "Ilhabela", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), returnTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(), pricePerSeat: "85.00", availableSeats: 4, totalSeats: 6, captainName: "Rafael M.", boatName: "Veneza III", avgRating: 4.9 },
  { id: 2, originCity: "Santos", destinationCity: "Ilha Grande", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(), returnTime: null, pricePerSeat: "120.00", availableSeats: 2, totalSeats: 8, captainName: "Carlos P.", boatName: "Acqua Viva", avgRating: 4.7 },
  { id: 3, originCity: "Angra dos Reis", destinationCity: "Paraty", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 44).toISOString(), returnTime: new Date(Date.now() + 1000 * 60 * 60 * 52).toISOString(), pricePerSeat: "65.00", availableSeats: 6, totalSeats: 10, captainName: "Bruno S.", boatName: "Mar Aberto", avgRating: 5.0 },
  { id: 4, originCity: "Guarujá", destinationCity: "Ubatuba", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(), returnTime: null, pricePerSeat: "95.00", availableSeats: 3, totalSeats: 6, captainName: "Diego F.", boatName: "Brisa do Mar", avgRating: 4.8 },
  { id: 5, originCity: "Ilhabela", destinationCity: "São Sebastião", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), returnTime: null, pricePerSeat: "40.00", availableSeats: 5, totalSeats: 8, captainName: "Marcos T.", boatName: "Veleiro Sul", avgRating: 4.6 },
  { id: 6, originCity: "Paraty", destinationCity: "Angra dos Reis", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 80).toISOString(), returnTime: null, pricePerSeat: "55.00", availableSeats: 1, totalSeats: 6, captainName: "André L.", boatName: "Ondas do Sul", avgRating: 4.9 },
];

export default function Rides() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const liveRides = data?.rides || [];
  const source = liveRides.length > 0 ? liveRides : PLACEHOLDER_RIDES;
  const rides = source.filter((r: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.originCity.toLowerCase().includes(q) || r.destinationCity.toLowerCase().includes(q);
  });

  return (
    <div className="rides-page">
      <div className="rides-header">
        <div className="rides-header-inner">
          <p className="section-label">CARONAS DISPONÍVEIS</p>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Encontre sua viagem</h1>
          <div className="rides-search">
            <Search size={15} className="rides-search-icon" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cidade..." />
          </div>
        </div>
      </div>

      <div className="rides-body">
        {isLoading ? (
          <div className="ride-grid">
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: "#071525", border: "1px solid #0D2035", borderRadius: 18, height: 240, opacity: 0.3 }} />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div className="rides-empty">
            <Anchor size={44} className="empty-state-icon" />
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>Nenhuma viagem encontrada</p>
            <p style={{ fontSize: 13 }}>Tente outra cidade ou volte mais tarde</p>
          </div>
        ) : (
          <>
            <p className="rides-count">{rides.length} {rides.length === 1 ? "viagem encontrada" : "viagens encontradas"}</p>
            <div className="ride-grid">
              {rides.map((ride: any, i: number) => (
                <Link key={ride.id} href={`/viagens/${ride.id}`}>
                  <div className="ride-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="ride-card-inner">
                      <div className="ride-top">
                        <span className={`badge ${ride.availableSeats > 0 ? "badge-green" : "badge-red"}`}>
                          {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
                        </span>
                        {ride.avgRating > 0 && (
                          <span className="rating"><Star size={11} fill="#FBBF24" color="#FBBF24" /> {ride.avgRating.toFixed(1)}</span>
                        )}
                      </div>
                      <div className="ride-route">
                        <div className="ride-city">{ride.originCity}</div>
                        <div className="ride-arrow"><div className="arrow-line" /><MapPin size={11} color="#0EA5E9" /><div className="arrow-line" /></div>
                        <div className="ride-city">{ride.destinationCity}</div>
                      </div>
                      <div className="ride-meta">
                        <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
                        <span><Anchor size={12} /> {ride.boatName} · Cap. {ride.captainName}</span>
                      </div>
                      <div className="ride-footer">
                        <div className="ride-price">
                          <span className="price-amount">R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
                          <span className="price-label">/ pessoa</span>
                        </div>
                        <span className="btn-reserve">Reservar →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
