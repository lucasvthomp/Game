import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Anchor, Clock, MapPin, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { BoatMediaCluster } from "@/components/layout/BoatMediaCluster";

export default function MyReservations() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/my/reservations"],
    queryFn: () => apiRequest("GET", "/api/my/reservations"),
    enabled: !!user,
  });
  const checkInMutation = useMutation({ mutationFn: (id: number) => apiRequest("POST", `/api/reservations/${id}/check-in`), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/my/reservations"] }) });
  const incidentMutation = useMutation({ mutationFn: ({ id, description }: { id: number; description: string }) => apiRequest("POST", `/api/reservations/${id}/incidents`, { type: "trip_issue", description }), onSuccess: () => alert("Incidente registrado. A equipe Marcamar foi informada.") });
  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/reservations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/my/reservations"] }),
  });

  if (!user) { navigate("/entrar"); return null; }

  const reservations = data?.reservations || [];
  const activeStatuses = ["confirmed", "payment_succeeded", "checked_in"];
  const active = reservations.filter((r: any) => activeStatuses.includes(r.status));
  const past = reservations.filter((r: any) => !activeStatuses.includes(r.status));

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Minhas Reservas</h1>
          <p className="page-sub">Suas travessias agendadas</p>
        </div>
        <BoatMediaCluster variant="compact" />
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text3)", textAlign: "center", padding: 60 }}>Carregando...</div>
      ) : reservations.length === 0 ? (
        <div className="card empty-state">
          <Anchor size={40} className="empty-state-icon" />
          <p style={{ fontWeight: 600, color: "var(--text3)" }}>Nenhuma reserva ainda.</p>
          <a href="/viagens" style={{ color: "var(--boat)", fontSize: 14, marginTop: 8, display: "inline-block" }}>Ver viagens disponíveis →</a>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p className="section-group-label">CONFIRMADAS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {active.map((res: any) => <ResCard key={res.id} res={res} onCancel={() => { if (confirm("Cancelar esta reserva?")) cancelMutation.mutate(res.id); }} messagesHref={`/mensagens/${res.id}`} onCheckIn={() => checkInMutation.mutate(res.id)} onIncident={() => { const description = window.prompt("Descreva o que aconteceu"); if (description?.trim()) incidentMutation.mutate({ id: res.id, description: description.trim() }); }} />)}
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

function ResCard({ res, onCancel, messagesHref, onCheckIn, onIncident }: { res: any; onCancel?: () => void; messagesHref?: string; onCheckIn?: () => void; onIncident?: () => void }) {
  const ride = res.ride;
  const isActive = ["confirmed", "payment_succeeded", "checked_in"].includes(res.status);
  const statusLabel = res.status === "checked_in" ? "Check-in realizado" : res.status === "payment_succeeded" ? "Pagamento confirmado" : res.status === "confirmed" ? "Confirmada" : res.status === "completed" ? "Concluída" : "Cancelada";
  return (
    <div className={`res-card ${isActive ? "" : "cancelled"}`}>
      <div style={{ flex: 1 }}>
        <div className="res-route">
          <MapPin size={14} color="var(--boat)" />
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
        <span className={`status-pill ${isActive ? "status-active" : "status-cancelled"}`}>
          {statusLabel}
        </span>
        <div className="res-price">R$ {parseFloat(res.totalPrice).toFixed(2).replace(".", ",")}</div>
        {messagesHref && (
          <Link href={messagesHref}>
            <button style={{ padding: "7px 14px", borderRadius: 8, background: "color-mix(in srgb, var(--boat) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--boat) 22%, transparent)", color: "var(--boat)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Mensagens
            </button>
          </Link>
        )}
        {onCheckIn && res.status === "confirmed" && (
          <button className="btn-secondary" onClick={onCheckIn} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px" }}><CheckCircle size={12} /> Check-in</button>
        )}
        {onIncident && ["confirmed", "checked_in"].includes(res.status) && (
          <button className="btn-danger" onClick={onIncident} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px" }}><AlertTriangle size={12} /> Reportar incidente</button>
        )}
        {onCancel && (
          <button className="btn-danger" onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "5px 10px" }}>
            <Trash2 size={12} /> Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

