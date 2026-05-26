import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Anchor, Clock, MapPin, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 8 }}>Minhas Reservas</h1>
      <p style={{ color: "#64748B", marginBottom: 32 }}>Suas caronas agendadas</p>

      {isLoading ? (
        <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>Carregando...</div>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "#475569", background: "#071E36", borderRadius: 16, border: "1px solid #1E3A5F" }}>
          <Anchor size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>Você ainda não tem nenhuma reserva.</p>
          <a href="/viagens" style={{ color: "#38BDF8", marginTop: 8, display: "inline-block" }}>Ver viagens disponíveis</a>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94A3B8", marginBottom: 16 }}>Confirmadas</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {active.map((res: any) => (
                  <ReservationCard key={res.id} res={res} onCancel={() => { if (confirm("Cancelar esta reserva?")) cancelMutation.mutate(res.id); }} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94A3B8", marginBottom: 16 }}>Histórico</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {past.map((res: any) => <ReservationCard key={res.id} res={res} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReservationCard({ res, onCancel }: { res: any; onCancel?: () => void }) {
  const ride = res.ride;
  const isCancelled = res.status === "cancelled";

  return (
    <div style={{ background: "#071E36", border: `1px solid ${isCancelled ? "rgba(239,68,68,0.2)" : "#1E3A5F"}`, borderRadius: 14, padding: 20, opacity: isCancelled ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#F0F9FF", fontSize: "1.05rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={15} color="#38BDF8" />
            {ride ? `${ride.originCity} → ${ride.destinationCity}` : "Viagem removida"}
          </div>
          {ride && (
            <div style={{ color: "#64748B", fontSize: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={13} />
                {format(new Date(ride.departureTime), "dd/MM/yyyy 'às' HH:mm")}
              </span>
              <span>Cap. {res.captainName}</span>
              <span>{res.seats} {res.seats === 1 ? "assento" : "assentos"}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: res.status === "confirmed" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: res.status === "confirmed" ? "#22C55E" : "#F87171",
          }}>
            {res.status === "confirmed" ? "Confirmada" : "Cancelada"}
          </span>
          <div style={{ color: "#38BDF8", fontWeight: 700, fontSize: "1.1rem" }}>
            R$ {parseFloat(res.totalPrice).toFixed(2).replace(".", ",")}
          </div>
          {onCancel && res.status === "confirmed" && (
            <button onClick={onCancel}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
              <Trash2 size={13} /> Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
