import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Anchor, Clock, Star, MapPin, Search, SlidersHorizontal, Wind } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function Rides() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const rides = (data?.rides || []).filter((r: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.originCity.toLowerCase().includes(q) || r.destinationCity.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#020D18" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #040F1C 0%, #020D18 100%)", borderBottom: "1px solid #0F2336", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ color: "#38BDF8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>CARONAS DISPONÍVEIS</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 900, color: "#F0F9FF", letterSpacing: "-0.8px", marginBottom: 24 }}>
            Encontre sua viagem
          </h1>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cidade de origem ou destino..."
              style={{ width: "100%", background: "#071829", border: "1px solid #1E3A5F", borderRadius: 12, padding: "12px 14px 12px 42px", color: "#E2E8F0", fontSize: 14, outline: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px" }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, height: 220, opacity: 0.4 }} />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Wind size={48} color="#1E3A5F" style={{ marginBottom: 16 }} />
            <p style={{ color: "#334155", fontSize: "1.1rem", fontWeight: 600 }}>Nenhuma viagem encontrada</p>
            <p style={{ color: "#1E3A5F", fontSize: 14, marginTop: 6 }}>Tente outra cidade ou volte mais tarde</p>
          </div>
        ) : (
          <>
            <p style={{ color: "#334155", fontSize: 13, marginBottom: 20 }}>{rides.length} {rides.length === 1 ? "viagem encontrada" : "viagens encontradas"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
              {rides.map((ride: any) => (
                <Link key={ride.id} href={`/viagens/${ride.id}`}>
                  <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 24, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Badges */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        background: ride.availableSeats > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                        color: ride.availableSeats > 0 ? "#4ADE80" : "#F87171",
                        border: `1px solid ${ride.availableSeats > 0 ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                        padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                      }}>
                        {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
                      </span>
                      {ride.avgRating > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FBBF24", fontSize: 12, fontWeight: 700 }}>
                          <Star size={12} fill="#FBBF24" /> {ride.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Route */}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F0F9FF", letterSpacing: "-0.3px", marginBottom: 4 }}>
                        {ride.originCity}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ flex: 1, height: 1, background: "#0F2336" }} />
                        <MapPin size={12} color="#0EA5E9" />
                        <div style={{ flex: 1, height: 1, background: "#0F2336" }} />
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F0F9FF", letterSpacing: "-0.3px" }}>
                        {ride.destinationCity}
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13 }}>
                        <Clock size={13} color="#0EA5E9" />
                        {format(new Date(ride.departureTime), "dd 'de' MMM · HH:mm", { locale: ptBR })}
                      </span>
                      {ride.returnTime && (
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: 13 }}>
                          <Clock size={13} color="#334155" />
                          Volta {format(new Date(ride.returnTime), "HH:mm")}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13 }}>
                        <Anchor size={13} color="#0EA5E9" />
                        {ride.boatName || "Lancha"} · Cap. {ride.captainName}
                      </span>
                    </div>

                    {/* Price + CTA */}
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #0F2336" }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#38BDF8", letterSpacing: "-0.5px" }}>
                          R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
                        </div>
                        <div style={{ color: "#334155", fontSize: 11, fontWeight: 500 }}>por pessoa</div>
                      </div>
                      <span style={{ background: "#0284C7", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                        Reservar
                      </span>
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
