import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteSelect } from "@/components/SiteSelect";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Car, Clock, Users, Star, ChevronLeft, CheckCircle, Shield, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { BoatMediaCluster } from "@/components/layout/BoatMediaCluster";
import RouteMap from "@/components/map/RouteMap";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = (hovered || value) > i;
        return (
          <Star
            key={i} size={26} color="var(--amber)" fill={filled ? "var(--amber)" : "none"}
            style={{ cursor: onChange ? "pointer" : "default", transition: "transform 0.1s", transform: hovered === i + 1 ? "scale(1.18)" : "scale(1)" }}
            onMouseEnter={() => onChange && setHovered(i + 1)}
            onMouseLeave={() => onChange && setHovered(0)}
            onClick={() => onChange && onChange(i + 1)}
          />
        );
      })}
    </div>
  );
}

function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} color="var(--amber)" fill={i < filled ? "var(--amber)" : "none"} />
      ))}
    </div>
  );
}

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

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

  const reviewMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/reviews", {
      rideId: parseInt(id!),
      captainId: data?.ride?.captainId,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    }),
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewError("");
      qc.invalidateQueries({ queryKey: [`/api/captain/${data?.ride?.captainId}/reviews`] });
    },
    onError: (err: any) => setReviewError(err.message || "Erro ao enviar avaliação."),
  });

  if (isLoading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text3)" }}>
      Carregando...
    </div>
  );
  if (!data?.ride) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 12 }}>
      <AlertCircle size={40} color="var(--boat)" />
      <p style={{ color: "var(--text2)" }}>Viagem não encontrada.</p>
    </div>
  );

  const { ride, captain, captainProfile, driverProfile } = data;
  const reviews = reviewsData?.reviews || [];
  const avgRating: number = reviewsData?.avgRating ?? data.avgRating ?? 0;
  const totalPrice = (parseFloat(ride.pricePerSeat) * seats).toFixed(2).replace(".", ",");

  const departurePassed = new Date(ride.departureTime) < new Date();
  const alreadyReviewed = user ? reviews.some((r: any) => r.reviewerId === user.id) : false;
  const canReview = user && user.id !== ride.captainId && departurePassed && !alreadyReviewed && !reviewSuccess;

  return (
    <div className="detail-page">
      <div className="detail-back">
        <button className="detail-back-btn" onClick={() => navigate("/viagens")}>
          <ChevronLeft size={16} /> Todas as viagens
        </button>
      </div>

      {ride.rideType === "boat" && (
        <div className="detail-media-rail">
          <div className="detail-media-copy">
            <p className="section-label" style={{ color: "var(--boat)" }}>A TRAVESSIA POR PERTO</p>
            <p>Confira o caminho, o ponto de encontro e quem está no comando antes de embarcar.</p>
          </div>
          <BoatMediaCluster variant="compact" />
        </div>
      )}

      <div className="detail-body">
        {/* Route card */}
        <div className="detail-card fade-up">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge badge-green">{ride.availableSeats} vagas disponíveis</span>
            {(captainProfile?.verified || driverProfile?.verified) && (
              <span className="badge" style={{ background: "color-mix(in srgb, var(--boat) 10%, transparent)", color: "var(--boat)", border: "1px solid color-mix(in srgb, var(--boat) 22%, transparent)", display: "flex", alignItems: "center", gap: 4 }}>
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
              {ride.rideType === "boat"
                ? <Anchor size={16} color="var(--boat)" />
                : <Car size={16} color="var(--car)" />}
              <div className="detail-anchor-line" />
            </div>
            <div className="detail-city-right">
              <div className="detail-city-label">DESTINO</div>
              <div className="detail-city">{ride.destinationCity}</div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <RouteMap
              origin={{ lat: ride.originLat, lng: ride.originLng, city: ride.originCity, label: ride.originCity }}
              dest={{ lat: ride.destLat, lng: ride.destLng, city: ride.destinationCity, label: ride.destinationCity }}
              type={ride.rideType as "boat" | "car"}
              height="260px"
            />
          </div>

          <div className="detail-meta-row">
            <div className="detail-meta-item">
              <Clock size={14} color="var(--boat)" />
              Ida: <strong>{format(new Date(ride.departureTime), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}</strong>
            </div>
            {ride.returnTime && (
              <div className="detail-meta-item">
                <Clock size={14} color="var(--text3)" />
                Volta: <strong>{format(new Date(ride.returnTime), "HH:mm")}</strong>
              </div>
            )}
            <div className="detail-meta-item">
              <Users size={14} color="var(--boat)" />
              <strong>{ride.totalSeats}</strong> assentos
            </div>
          </div>

          {ride.description && <div className="detail-description">{ride.description}</div>}
        </div>

        {/* Captain card */}
        <div className="detail-card fade-up" style={{ animationDelay: "80ms" }}>
          <p className="section-label" style={{ marginBottom: 16 }}>{ride.rideType === "boat" ? "CAPITÃO" : "MOTORISTA"}</p>
          <div className="captain-row">
            <div className="captain-avatar" style={ride.rideType === "car" ? { background: "var(--car)" } : {}}>
              {ride.rideType === "boat" ? <Anchor size={20} color="#fff" /> : <Car size={20} color="#fff" />}
            </div>
            <div className="captain-info">
              <div className="captain-name">{captain.fullName}</div>
              <div className="captain-user">@{captain.username}</div>
            </div>
            {avgRating > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <StarDisplay rating={avgRating} size={14} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--boat)" }}>{avgRating.toFixed(1)}</span>
                </div>
                <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 4 }}>{reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}</div>
              </div>
            )}
          </div>
          {ride.rideType === "boat" && captainProfile && (
            <div className="captain-meta">
              <span><strong>Lancha:</strong> {captainProfile.boatName}{captainProfile.boatModel ? ` · ${captainProfile.boatModel}` : ""}</span>
              <span><strong>Capacidade:</strong> {captainProfile.boatCapacity} pessoas</span>
            </div>
          )}
          {ride.rideType === "car" && driverProfile && (
            <div className="captain-meta">
              <span><strong>Veículo:</strong> {driverProfile.carMake} {driverProfile.carModel}{driverProfile.carColor ? ` · ${driverProfile.carColor}` : ""}{driverProfile.carYear ? ` (${driverProfile.carYear})` : ""}</span>
              <span><strong>Capacidade:</strong> {driverProfile.carCapacity} pessoas</span>
            </div>
          )}
          {(captainProfile?.bio || driverProfile?.bio) && (
            <p style={{ marginTop: 12, color: "var(--text2)", fontSize: 13, lineHeight: 1.7 }}>
              {ride.rideType === "boat" ? captainProfile?.bio : driverProfile?.bio}
            </p>
          )}
        </div>

        {/* Booking */}
        {success ? (
          <div className="booking-success fade-up">
            <CheckCircle size={30} color="var(--green)" />
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
                <a href="/entrar" style={{ background: "var(--boat)", color: "#fff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Entrar</a>
                <a href="/cadastro" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text2)", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Cadastrar</a>
              </div>
            </div>
          </div>
        ) : user.id === ride.captainId ? (
          <div className="detail-card" style={{ textAlign: "center", padding: 20, color: "var(--text2)", fontSize: 14 }}>Esta é sua viagem.</div>
        ) : ride.status === "active" && ride.availableSeats > 0 ? (
          <div className="detail-card fade-up" style={{ animationDelay: "160ms" }}>
            <p className="section-label" style={{ marginBottom: 16, padding: "0 4px" }}>RESERVAR ASSENTO</p>
            <div className="booking-box">
              <div className="booking-select-row">
                <label>Assentos:</label>
                <SiteSelect value={String(seats)} onChange={(value) => setSeats(parseInt(value))} options={Array.from({ length: Math.min(ride.availableSeats, 8) }, (_, i) => i + 1).map((n) => ({ value: String(n), label: n + (n === 1 ? " assento" : " assentos") }))} ariaLabel="Número de assentos" />
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <p className="section-label" style={{ margin: 0 }}>AVALIAÇÕES</p>
              {avgRating > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarDisplay rating={avgRating} size={14} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--boat)" }}>{avgRating.toFixed(1)}</span>
                  <span style={{ color: "var(--text3)", fontSize: 12 }}>({reviews.length})</span>
                </div>
              )}
            </div>
            <div className="reviews-list">
              {reviews.slice(0, 5).map((rev: any) => (
                <div key={rev.id} className="review-item">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>
                        {(rev.reviewerName || "P")[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text1)" }}>
                        {rev.reviewerName || "Passageiro"}
                      </span>
                    </div>
                    <span className="review-date">{format(new Date(rev.createdAt), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="review-stars" style={{ marginBottom: rev.comment ? 6 : 0 }}>
                    <StarDisplay rating={rev.rating} size={13} />
                  </div>
                  {rev.comment && <p className="review-comment" style={{ margin: 0 }}>{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review form */}
        {canReview && (
          <div className="detail-card fade-up" style={{ animationDelay: "240ms" }}>
            <p className="section-label" style={{ marginBottom: 16 }}>AVALIAR VIAGEM</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10 }}>Sua nota:</p>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Conte como foi a viagem..."
                rows={3}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "11px 14px",
                  color: "var(--text1)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              {reviewError && (
                <div className="booking-error">{reviewError}</div>
              )}
              <button
                className="booking-btn booking-btn-boat"
                disabled={reviewRating === 0 || reviewMutation.isPending}
                onClick={() => { setReviewError(""); reviewMutation.mutate(); }}
              >
                {reviewMutation.isPending ? "Enviando..." : "Enviar avaliação"}
              </button>
            </div>
          </div>
        )}

        {(reviewSuccess || (user && user.id !== ride.captainId && departurePassed && alreadyReviewed)) && !canReview && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "color-mix(in srgb, var(--boat) 9%, transparent)", border: "1px solid color-mix(in srgb, var(--boat) 25%, transparent)", borderRadius: 14, padding: "18px 22px", marginBottom: 12 }}>
            <CheckCircle size={22} color="var(--boat)" />
            <span style={{ fontSize: 14, color: "var(--text2)" }}>
              {reviewSuccess ? "Obrigado pela sua avaliação!" : "Você já avaliou esta viagem."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

