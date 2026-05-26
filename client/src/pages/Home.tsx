import { Link } from "wouter";
import { Anchor, MapPin, Clock, Users, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const rides = data?.rides?.slice(0, 3) || [];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #061629 0%, #082040 50%, #0A2847 100%)", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 120%, rgba(14,116,144,0.15) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 680, zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 24, padding: "6px 16px", marginBottom: 28 }}>
            <Anchor size={14} color="#38BDF8" />
            <span style={{ color: "#38BDF8", fontSize: 13, fontWeight: 500 }}>Caronas de lancha pelo Brasil</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 800, color: "#F0F9FF", lineHeight: 1.1, marginBottom: 20 }}>
            Encontre sua<br />
            <span style={{ color: "#38BDF8" }}>carona de lancha</span>
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "clamp(1rem, 2.5vw, 1.15rem)", lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
            Capitães verificados publicam viagens agendadas. Você reserva um assento e vai junto. Simples, seguro e acessível.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/viagens">
              <span style={{ background: "#0284C7", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "inline-block" }}>
                Ver Viagens
              </span>
            </Link>
            <Link href="/cadastro">
              <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#E2E8F0", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "inline-block" }}>
                Sou Capitão
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 12 }}>Como funciona</h2>
        <p style={{ textAlign: "center", color: "#64748B", marginBottom: 56 }}>Em três passos simples</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
          {[
            { icon: <MapPin size={28} color="#38BDF8" />, title: "Encontre uma viagem", desc: "Navegue entre as caronas disponíveis por rota e data." },
            { icon: <Users size={28} color="#38BDF8" />, title: "Reserve seu assento", desc: "Escolha quantos assentos precisa e confirme sua reserva." },
            { icon: <Anchor size={28} color="#38BDF8" />, title: "Embarque!", desc: "No dia da viagem, encontre o capitão no local combinado e aproveite." },
          ].map((step, i) => (
            <div key={i} style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                {step.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#F0F9FF", marginBottom: 10 }}>{step.title}</div>
              <div style={{ color: "#64748B", lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent rides */}
      {rides.length > 0 && (
        <div style={{ background: "#061629", padding: "60px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 32 }}>Próximas viagens</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {rides.map((ride: any) => (
                <Link key={ride.id} href={`/viagens/${ride.id}`}>
                  <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 14, padding: 24, cursor: "pointer", transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ background: "rgba(56,189,248,0.1)", color: "#38BDF8", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {ride.availableSeats} vagas
                      </span>
                      {ride.avgRating > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FBBF24", fontSize: 13 }}>
                          <Star size={13} fill="#FBBF24" /> {ride.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#F0F9FF", marginBottom: 8 }}>
                      {ride.originCity} → {ride.destinationCity}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 14, marginBottom: 4 }}>
                      <Clock size={14} />
                      {format(new Date(ride.departureTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 14, marginBottom: 16 }}>
                      <Anchor size={14} />
                      {ride.boatName || "Lancha"} · Capitão {ride.captainName}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#38BDF8" }}>
                      R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
                      <span style={{ color: "#64748B", fontSize: 13, fontWeight: 400 }}>/pessoa</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Link href="/viagens">
                <span style={{ color: "#38BDF8", fontWeight: 600, cursor: "pointer" }}>Ver todas as viagens →</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
