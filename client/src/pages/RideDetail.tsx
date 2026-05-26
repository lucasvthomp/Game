import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Clock, MapPin, Users, Star, ChevronLeft, CheckCircle, Shield, AlertCircle } from "lucide-react";
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

  if (isLoading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020D18" }}>
      <div style={{ color: "#334155" }}>Carregando viagem...</div>
    </div>
  );

  if (!data?.ride) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020D18" }}>
      <div style={{ textAlign: "center" }}>
        <AlertCircle size={40} color="#334155" style={{ marginBottom: 12 }} />
        <p style={{ color: "#475569" }}>Viagem não encontrada.</p>
      </div>
    </div>
  );

  const { ride, captain, captainProfile, avgRating } = data;
  const reviews = reviewsData?.reviews || [];
  const totalPrice = (parseFloat(ride.pricePerSeat) * seats).toFixed(2).replace(".", ",");
  const isCaptainOwner = user?.id === ride.captainId;

  return (
    <div style={{ minHeight: "100vh", background: "#020D18" }}>
      {/* Back */}
      <div style={{ borderBottom: "1px solid #0F2336", padding: "16px 24px" }}>
        <button onClick={() => navigate("/viagens")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
          <ChevronLeft size={16} /> Todas as viagens
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px" }}>

        {/* Route Hero */}
        <div style={{ background: "linear-gradient(135deg, #071829 0%, #04111F 100%)", border: "1px solid #0F2336", borderRadius: 20, padding: "32px 28px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(34,197,94,0.08)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.2)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
              {ride.availableSeats} vagas disponíveis
            </span>
            {captainProfile?.verified && (
              <span style={{ background: "rgba(56,189,248,0.08)", color: "#38BDF8", border: "1px solid rgba(56,189,248,0.2)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Shield size={11} /> Capitão verificado
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div>
              <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>ORIGEM</div>
              <div style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 4vw, 2rem)", color: "#F0F9FF", letterSpacing: "-0.5px" }}>{ride.originCity}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Anchor size={18} color="#0EA5E9" />
              <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, #0F2336, #1E3A5F, #0F2336)" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>DESTINO</div>
              <div style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 4vw, 2rem)", color: "#F0F9FF", letterSpacing: "-0.5px" }}>{ride.destinationCity}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
              <Clock size={15} color="#0EA5E9" />
              <span>Ida: <strong style={{ color: "#94A3B8" }}>{format(new Date(ride.departureTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</strong></span>
            </div>
            {ride.returnTime && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
                <Clock size={15} color="#334155" />
                <span>Volta: <strong style={{ color: "#94A3B8" }}>{format(new Date(ride.returnTime), "HH:mm")}</strong></span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 14 }}>
              <Users size={15} color="#0EA5E9" />
              <span>{ride.totalSeats} assentos totais</span>
            </div>
          </div>

          {ride.description && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #0F2336", color: "#64748B", fontSize: 14, lineHeight: 1.7 }}>
              {ride.description}
            </div>
          )}
        </div>

        {/* Captain card */}
        <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <p style={{ color: "#334155", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>CAPITÃO</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #0369A1, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Anchor size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#F0F9FF", fontSize: "1.05rem" }}>{captain.fullName}</div>
              <div style={{ color: "#475569", fontSize: 13 }}>@{captain.username}</div>
            </div>
            {avgRating > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#FBBF24", fontWeight: 800, fontSize: "1.1rem", justifyContent: "flex-end" }}>
                  <Star size={16} fill="#FBBF24" /> {avgRating.toFixed(1)}
                </div>
                <div style={{ color: "#334155", fontSize: 11 }}>{reviews.length} avaliações</div>
              </div>
            )}
          </div>
          {captainProfile && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #0F2336", display: "flex", gap: 20, flexWrap: "wrap" }}>
              <span style={{ color: "#475569", fontSize: 13 }}>
                <span style={{ color: "#334155" }}>Lancha:</span> <strong style={{ color: "#94A3B8" }}>{captainProfile.boatName}{captainProfile.boatModel ? ` · ${captainProfile.boatModel}` : ""}</strong>
              </span>
              <span style={{ color: "#475569", fontSize: 13 }}>
                <span style={{ color: "#334155" }}>Capacidade:</span> <strong style={{ color: "#94A3B8" }}>{captainProfile.boatCapacity} pessoas</strong>
              </span>
            </div>
          )}
          {captainProfile?.bio && (
            <p style={{ marginTop: 12, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>{captainProfile.bio}</p>
          )}
        </div>

        {/* Reservation box */}
        {success ? (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 16, padding: 28, display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <CheckCircle size={32} color="#4ADE80" />
            <div>
              <div style={{ fontWeight: 800, color: "#4ADE80", fontSize: "1.05rem" }}>Reserva confirmada!</div>
              <div style={{ color: "#475569", fontSize: 14, marginTop: 2 }}>Veja os detalhes em "Minhas Reservas".</div>
            </div>
          </div>
        ) : !user ? (
          <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 16 }}>
            <p style={{ color: "#475569", marginBottom: 16 }}>Faça login para reservar um assento</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <a href="/entrar" style={{ background: "#0284C7", color: "#fff", padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Entrar</a>
              <a href="/cadastro" style={{ background: "#071829", border: "1px solid #1E3A5F", color: "#94A3B8", padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Cadastrar</a>
            </div>
          </div>
        ) : isCaptainOwner ? (
          <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 20, color: "#475569", fontSize: 14, textAlign: "center", marginBottom: 16 }}>
            Esta é sua viagem.
          </div>
        ) : ride.status === "active" && ride.availableSeats > 0 ? (
          <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <p style={{ color: "#334155", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>RESERVAR ASSENTO</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <label style={{ color: "#64748B", fontSize: 14, whiteSpace: "nowrap" }}>Quantos assentos?</label>
              <select value={seats} onChange={e => setSeats(parseInt(e.target.value))}
                style={{ background: "#040F1C", border: "1px solid #1E3A5F", borderRadius: 8, padding: "9px 14px", color: "#E2E8F0", fontSize: 14, flex: 1 }}>
                {Array.from({ length: Math.min(ride.availableSeats, 8) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? "assento" : "assentos"}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, background: "#040F1C", borderRadius: 10, padding: "12px 16px" }}>
              <span style={{ color: "#475569", fontSize: 14 }}>{seats} × R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
              <span style={{ fontWeight: 900, color: "#38BDF8", fontSize: "1.2rem" }}>R$ {totalPrice}</span>
            </div>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", color: "#F87171", fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}
            <button onClick={() => { setError(""); reserveMutation.mutate(); }} disabled={reserveMutation.isPending}
              style={{ width: "100%", background: "linear-gradient(135deg, #0284C7, #0369A1)", color: "#fff", border: "none", borderRadius: 12, padding: 15, fontWeight: 800, fontSize: 15, cursor: reserveMutation.isPending ? "not-allowed" : "pointer", opacity: reserveMutation.isPending ? 0.7 : 1 }}>
              {reserveMutation.isPending ? "Confirmando..." : `Confirmar reserva · R$ ${totalPrice}`}
            </button>
          </div>
        ) : null}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 24 }}>
            <p style={{ color: "#334155", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20 }}>AVALIAÇÕES DO CAPITÃO</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {reviews.slice(0, 5).map((rev: any, i: number) => (
                <div key={rev.id} style={{ paddingBottom: i < reviews.length - 1 ? 18 : 0, borderBottom: i < reviews.length - 1 ? "1px solid #0F2336" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={13} color="#FBBF24" fill={j < rev.rating ? "#FBBF24" : "none"} />
                      ))}
                    </div>
                    <span style={{ color: "#334155", fontSize: 12 }}>
                      {format(new Date(rev.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  {rev.comment && <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
