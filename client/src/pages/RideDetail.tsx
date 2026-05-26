import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Clock, Users, Star, ChevronLeft, CheckCircle, Shield, AlertCircle, MapPin } from "lucide-react";
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
    onSuccess: () => { setSuccess(true); qc.invalidateQueries({ queryKey: [`/api/rides/${id}`] }); qc.invalidateQueries({ queryKey: ["/api/my/reservations"] }); },
    onError: (err: any) => setError(err.message),
  });

  if (isLoading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030B14", color: "#334155" }}>
      Carregando...
    </div>
  );
  if (!data?.ride) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030B14", flexDirection: "column", gap: 12 }}>
      <AlertCircle size={40} color="#1E3A5F" />
      <p style={{ color: "#475569" }}>Viagem não encontrada.</p>
    </div>
  );

  const { ride, captain, captainProfile, avgRating } = data;
  const reviews = reviewsData?.reviews || [];
  const totalPrice = (parseFloat(ride.pricePerSeat) * seats).toFixed(2).replace(".", ",");

  return (
    <div className="detail-page">
      <div className="detail-back">
        <button className="detail-back-btn" onClick={() => navigate("/viagens")}>
          <ChevronLeft size={16} /> Todas as viagens
        </button>
      </div>

      <div className="detail-body">
        {/* Route card */}
        <div className="detail-card fade-up">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge badge-green">{ride.availableSeats} vagas disponíveis</span>
            {captainProfile?.verified && (
              <span className="badge" style={{ background: "rgba(56,189,248,0.08)", color: "#38BDF8", border: "1px solid rgba(56,189,248,0.15)", display: "flex", alignItems: "center", gap: 4 }}>
                <Shield size={10} /> Verificado
              </span>
            )}
          </div>

          <div className="detail-route-grid">
            <div>
              <div className="detail-city-label">ORIGEM</div>
              <div className="detail-city">{ride.originCity}</div>
            </div>
            <div className="detail-anchor">
              <div className="detail-anchor-line" />
              <Anchor size={16} color="#0EA5E9" />
              <div className="detail-anchor-line" />
            </div>
            <div className="detail-city-right">
              <div className="detail-city-label">DESTINO</div>
              <div className="detail-city">{ride.destinationCity}</div>
            </div>
          </div>

          <div className="detail-meta-row">
            <div className="detail-meta-item">
              <Clock size={14} color="#0EA5E9" />
              Ida: <strong>{format(new Date(ride.departureTime), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}</strong>
            </div>
            {ride.returnTime && (
              <div className="detail-meta-item">
                <Clock size={14} color="#334155" />
                Volta: <strong>{format(new Date(ride.returnTime), "HH:mm")}</strong>
              </div>
            )}
            <div className="detail-meta-item">
              <Users size={14} color="#0EA5E9" />
              <strong>{ride.totalSeats}</strong> assentos
            </div>
          </div>

          {ride.description && <div className="detail-description">{ride.description}</div>}
        </div>

        {/* Captain card */}
        <div className="detail-card fade-up" style={{ animationDelay: "80ms" }}>
          <p className="section-label" style={{ marginBottom: 16 }}>CAPITÃO</p>
          <div className="captain-row">
            <div className="captain-avatar"><Anchor size={20} color="#fff" /></div>
            <div className="captain-info">
              <div className="captain-name">{captain.fullName}</div>
              <div className="captain-user">@{captain.username}</div>
            </div>
            {avgRating > 0 && (
              <div style={{ textAlign: "right" }}>
                <div className="rating" style={{ fontSize: 14, justifyContent: "flex-end" }}>
                  <Star size={15} fill="#FBBF24" color="#FBBF24" /> {avgRating.toFixed(1)}
                </div>
                <div style={{ color: "#334155", fontSize: 11, marginTop: 2 }}>{reviews.length} avaliações</div>
              </div>
            )}
          </div>
          {captainProfile && (
            <div className="captain-meta">
              <span><strong>Lancha:</strong> {captainProfile.boatName}{captainProfile.boatModel ? ` · ${captainProfile.boatModel}` : ""}</span>
              <span><strong>Capacidade:</strong> {captainProfile.boatCapacity} pessoas</span>
            </div>
          )}
          {captainProfile?.bio && <p style={{ marginTop: 12, color: "#475569", fontSize: 13, lineHeight: 1.7 }}>{captainProfile.bio}</p>}
        </div>

        {/* Booking */}
        {success ? (
          <div className="booking-success fade-up">
            <CheckCircle size={30} color="#4ADE80" />
            <div>
              <div className="booking-success-title">Reserva confirmada!</div>
              <div className="booking-success-sub">Acesse "Reservas" para ver os detalhes.</div>
            </div>
          </div>
        ) : !user ? (
          <div className="detail-card fade-up">
            <div className="login-prompt">
              <p>Faça login para reservar um assento</p>
              <div className="login-prompt-actions">
                <a href="/entrar" style={{ background: "#0284C7", color: "#fff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Entrar</a>
                <a href="/cadastro" style={{ background: "#071525", border: "1px solid #0D2035", color: "#94A3B8", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Cadastrar</a>
              </div>
            </div>
          </div>
        ) : user.id === ride.captainId ? (
          <div className="detail-card" style={{ textAlign: "center", padding: 20, color: "#475569", fontSize: 14 }}>Esta é sua viagem.</div>
        ) : ride.status === "active" && ride.availableSeats > 0 ? (
          <div className="detail-card fade-up" style={{ animationDelay: "160ms" }}>
            <p className="section-label" style={{ marginBottom: 16, padding: "0 4px" }}>RESERVAR ASSENTO</p>
            <div className="booking-box">
              <div className="booking-select-row">
                <label>Assentos:</label>
                <select value={seats} onChange={e => setSeats(parseInt(e.target.value))}>
                  {Array.from({ length: Math.min(ride.availableSeats, 8) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? "assento" : "assentos"}</option>
                  ))}
                </select>
              </div>
              <div className="booking-total">
                <span>{seats} × R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
                <span className="booking-total-amount">R$ {totalPrice}</span>
              </div>
              {error && <div className="booking-error">{error}</div>}
              <button className="booking-btn" onClick={() => { setError(""); reserveMutation.mutate(); }} disabled={reserveMutation.isPending}>
                {reserveMutation.isPending ? "Confirmando..." : `Confirmar reserva · R$ ${totalPrice}`}
              </button>
            </div>
          </div>
        ) : null}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="detail-card fade-up" style={{ animationDelay: "200ms" }}>
            <p className="section-label" style={{ marginBottom: 16 }}>AVALIAÇÕES DO CAPITÃO</p>
            <div className="reviews-list">
              {reviews.slice(0, 5).map((rev: any) => (
                <div key={rev.id} className="review-item">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="review-stars">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={13} color="#FBBF24" fill={j < rev.rating ? "#FBBF24" : "none"} />
                      ))}
                    </div>
                    <span className="review-date">{format(new Date(rev.createdAt), "dd/MM/yyyy")}</span>
                  </div>
                  {rev.comment && <p className="review-comment">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
