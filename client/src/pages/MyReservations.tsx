import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Anchor, Clock, MapPin, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function MyReservations() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/my/reservations"],
    queryFn: () => apiRequest("GET", "/api/my/reservations"),
    enabled: !!user,
  });
  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/reservations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/my/reservations"] }),
  });

  if (!user) { navigate("/entrar"); return null; }

  const reservations = data?.reservations || [];
  const active = reservations.filter((r: any) => r.status === "confirmed");
  const past = reservations.filter((r: any) => r.status !== "confirmed");

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Minhas Reservas</h1>
          <p className="page-sub">Suas caronas agendadas</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "#334155", textAlign: "center", padding: 60 }}>Carregando...</div>
      ) : reservations.length === 0 ? (
        <div className="card empty-state">
          <Anchor size={40} className="empty-state-icon" />
          <p style={{ fontWeight: 600, color: "#334155" }}>Nenhuma reserva ainda.</p>
          <a href="/viagens" style={{ color: "#38BDF8", fontSize: 14, marginTop: 8, display: "inline-block" }}>Ver viagens disponíveis →</a>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p className="section-group-label">CONFIRMADAS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {active.map((res: any) => <ResCard key={res.id} res={res} onCancel={() => { if (confirm("Cancelar esta reserva?")) cancelMutation.mutate(res.id); }} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="section-group-label">HISTÓRICO</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {past.map((res: any) => <ResCard key={res.id} res={res} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResCard({ res, onCancel }: { res: any; onCancel?: () => void }) {
  const ride = res.ride;
  return (
    <div className={`res-card ${res.status !== "confirmed" ? "cancelled" : ""}`}>
      <div style={{ flex: 1 }}>
        <div className="res-route">
          <MapPin size={14} color="#0EA5E9" />
          {ride ? `${ride.originCity} → ${ride.destinationCity}` : "Viagem removida"}
        </div>
        {ride && (
          <div className="res-meta">
            <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd/MM/yyyy 'às' HH:mm")}</span>
            {res.captainName && <span>Cap. {res.captainName}</span>}
            <span>{res.seats} {res.seats === 1 ? "assento" : "assentos"}</span>
          </div>
        )}
      </div>
      <div className="res-right">
        <span className={`status-pill ${res.status === "confirmed" ? "status-active" : "status-cancelled"}`}>
          {res.status === "confirmed" ? "Confirmada" : "Cancelada"}
        </span>
        <div className="res-price">R$ {parseFloat(res.totalPrice).toFixed(2).replace(".", ",")}</div>
        {onCancel && (
          <button className="btn-danger" onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px" }}>
            <Trash2 size={12} /> Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
