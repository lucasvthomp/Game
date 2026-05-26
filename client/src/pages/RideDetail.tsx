import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Clock, MapPin, Users, Star, ChevronLeft, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [`/api/rides/${id}`],
    queryFn: () => apiRequest("GET", `/api/rides/${id}`),
  });

  const { data: reviewsData } = useQuery({
    queryKey: [`/api/captain/${data?.ride?.captainId}/reviews`],
    queryFn: () => apiRequest("GET", `/api/captain/${data?.ride?.captainId}/reviews`),
    enabled: !!data?.ride?.captainId,
  });

  const reserveMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/reservations", { rideId: parseInt(id!), seats }),
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: [`/api/rides/${id}`] });
      qc.invalidateQueries({ queryKey: ["/api/my/reservations"] });
    },
    onError: (err: any) => setError(err.message),
  });

  if (isLoading) return <div style={{ textAlign: "center", padding: 80, color: "#64748B" }}>Carregando...</div>;
  if (!data?.ride) return <div style={{ textAlign: "center", padding: 80, color: "#64748B" }}>Viagem não encontrada.</div>;

  const { ride, captain, captainProfile, avgRating } = data;
  const reviews = reviewsData?.reviews || [];
  const totalPrice = (parseFloat(ride.pricePerSeat) * seats).toFixed(2).replace(".", ",");

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <button onClick={() => navigate("/viagens")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#64748B", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
        <ChevronLeft size={16} /> Voltar às viagens
      </button>

      {/* Main card */}
      <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 32, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F0F9FF", marginBottom: 8 }}>
              {ride.originCity} → {ride.destinationCity}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, color: "#64748B", fontSize: 15 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={15} color="#38BDF8" />
                Ida: {format(new Date(ride.departureTime), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              {ride.returnTime && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={15} color="#475569" />
                  Volta: {format(new Date(ride.returnTime), "HH:mm 'do mesmo dia'")}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={15} color="#38BDF8" />
                {ride.availableSeats} vagas disponíveis de {ride.totalSeats}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38BDF8" }}>
              R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
            </div>
            <div style={{ color: "#475569", fontSize: 14 }}>por pessoa</div>
          </div>
        </div>

        {ride.description && (
          <div style={{ background: "#0A2847", borderRadius: 10, padding: "14px 18px", marginBottom: 24, color: "#94A3B8", lineHeight: 1.6 }}>
            {ride.description}
          </div>
        )}

        {/* Captain info */}
        <div style={{ borderTop: "1px solid #1E3A5F", paddingTop: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: "#94A3B8", fontSize: 13, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Capitão</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#1E3A5F", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Anchor size={20} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#F0F9FF", fontSize: "1.05rem" }}>{captain.fullName}</div>
              <div style={{ color: "#475569", fontSize: 13 }}>@{captain.username}</div>
            </div>
            {avgRating > 0 && (
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "#FBBF24", fontWeight: 700 }}>
                <Star size={16} fill="#FBBF24" /> {avgRating.toFixed(1)}
              </span>
            )}
          </div>
          {captainProfile && (
            <div style={{ marginTop: 14, color: "#64748B", fontSize: 14, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <span><strong style={{ color: "#94A3B8" }}>Lancha:</strong> {captainProfile.boatName}{captainProfile.boatModel ? ` (${captainProfile.boatModel})` : ""}</span>
              <span><strong style={{ color: "#94A3B8" }}>Capacidade:</strong> {captainProfile.boatCapacity} pessoas</span>
            </div>
          )}
        </div>

        {/* Reservation */}
        {success ? (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle size={24} color="#22C55E" />
            <div>
              <div style={{ fontWeight: 700, color: "#22C55E" }}>Reserva confirmada!</div>
              <div style={{ color: "#64748B", fontSize: 14 }}>Sua vaga foi reservada. Veja em "Minhas Reservas".</div>
            </div>
          </div>
        ) : user && user.id !== ride.captainId && ride.status === "active" ? (
          <div style={{ background: "#0A2847", borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 600, color: "#F0F9FF", marginBottom: 14 }}>Reservar assento</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <label style={{ color: "#94A3B8", fontSize: 14 }}>Assentos:</label>
              <select value={seats} onChange={e => setSeats(parseInt(e.target.value))}
                style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 8, padding: "8px 12px", color: "#E2E8F0", fontSize: 14 }}>
                {Array.from({ length: Math.min(ride.availableSeats, 6) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? "assento" : "assentos"}</option>
                ))}
              </select>
              <span style={{ color: "#38BDF8", fontWeight: 700, fontSize: "1.1rem", marginLeft: "auto" }}>Total: R$ {totalPrice}</span>
            </div>
            {error && <div style={{ color: "#F87171", fontSize: 14, marginBottom: 10 }}>{error}</div>}
            <button
              onClick={() => { setError(""); reserveMutation.mutate(); }}
              disabled={reserveMutation.isPending || ride.availableSeats === 0}
              style={{ width: "100%", background: "#0284C7", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              {reserveMutation.isPending ? "Reservando..." : "Confirmar reserva"}
            </button>
          </div>
        ) : !user ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p style={{ color: "#64748B", marginBottom: 12 }}>Faça login para reservar</p>
            <a href="/entrar" style={{ background: "#0284C7", color: "#fff", padding: "10px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Entrar</a>
          </div>
        ) : null}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontWeight: 700, color: "#F0F9FF", marginBottom: 20 }}>Avaliações do capitão</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.map((rev: any) => (
              <div key={rev.id} style={{ borderBottom: "1px solid #1E3A5F", paddingBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} color="#FBBF24" fill={i < rev.rating ? "#FBBF24" : "none"} />
                  ))}
                  <span style={{ color: "#475569", fontSize: 12, marginLeft: 4 }}>
                    {format(new Date(rev.createdAt), "dd/MM/yyyy")}
                  </span>
                </div>
                {rev.comment && <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.5 }}>{rev.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
