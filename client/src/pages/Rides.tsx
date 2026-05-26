import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Anchor, Clock, Users, Star, MapPin, Search } from "lucide-react";
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
    if (!search) return true;
    const q = search.toLowerCase();
    return r.originCity.toLowerCase().includes(q) || r.destinationCity.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 8 }}>Viagens disponíveis</h1>
      <p style={{ color: "#64748B", marginBottom: 32 }}>Encontre uma carona de lancha para a sua rota</p>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 420, marginBottom: 36 }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cidade..."
          style={{ width: "100%", background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 10, padding: "11px 14px 11px 42px", color: "#E2E8F0", fontSize: 15, outline: "none" }}
        />
      </div>

      {isLoading ? (
        <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>Carregando viagens...</div>
      ) : rides.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "#475569" }}>
          <Anchor size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem" }}>Nenhuma viagem disponível no momento.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
          {rides.map((ride: any) => (
            <Link key={ride.id} href={`/viagens/${ride.id}`}>
              <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 14, padding: 24, cursor: "pointer", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ background: ride.availableSeats > 0 ? "rgba(56,189,248,0.1)" : "rgba(239,68,68,0.1)", color: ride.availableSeats > 0 ? "#38BDF8" : "#F87171", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
                  </span>
                  {ride.avgRating > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FBBF24", fontSize: 13 }}>
                      <Star size={13} fill="#FBBF24" /> {ride.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "1.2rem", color: "#F0F9FF", marginBottom: 12 }}>
                  <MapPin size={16} color="#38BDF8" />
                  {ride.originCity} → {ride.destinationCity}
                </div>
                <div style={{ color: "#64748B", fontSize: 14, display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={14} />
                    {format(new Date(ride.departureTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  {ride.returnTime && (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color="#475569" />
                      Retorno: {format(new Date(ride.returnTime), "HH:mm")}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Anchor size={14} />
                    {ride.boatName || "Lancha"} · Cap. {ride.captainName}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#38BDF8" }}>
                    R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
                    <span style={{ color: "#475569", fontSize: 13, fontWeight: 400 }}>/pessoa</span>
                  </div>
                  <span style={{ background: "#0284C7", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    Ver detalhes
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
