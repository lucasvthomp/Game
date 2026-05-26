import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Clock, Star, Shield, ChevronRight, Anchor, Wind, Users } from "lucide-react";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });
  const rides = data?.rides?.slice(0, 4) || [];

  return (
    <div style={{ overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 24px 60px", background: "#020D18" }}>
        {/* Background gradient blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(6,98,148,0.35) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "-10%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(2,132,199,0.2) 0%, transparent 70%)" }} />
          {/* Water shimmer lines */}
          <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.07 }} viewBox="0 0 1440 120" preserveAspectRatio="none" height="120" width="100%">
            <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" fill="#38BDF8" />
            <path d="M0,80 C240,40 480,120 720,80 C960,40 1200,120 1440,80 L1440,120 L0,120 Z" fill="#0EA5E9" opacity="0.5" />
          </svg>
        </div>

        <div style={{ position: "relative", maxWidth: 560, zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.18)", borderRadius: 100, padding: "5px 14px", marginBottom: 28, backdropFilter: "blur(8px)" }}>
            <Wind size={13} color="#38BDF8" />
            <span style={{ color: "#7DD3FC", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>CARONAS DE LANCHA • BRASIL</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.6rem, 8vw, 4.2rem)", fontWeight: 900, lineHeight: 1.05, color: "#F0F9FF", marginBottom: 20, letterSpacing: "-1.5px" }}>
            Sua próxima<br />
            <span style={{ background: "linear-gradient(90deg, #38BDF8, #0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              aventura no mar
            </span><br />
            começa aqui.
          </h1>

          <p style={{ color: "#94A3B8", fontSize: "clamp(1rem, 3vw, 1.1rem)", lineHeight: 1.75, marginBottom: 40, maxWidth: 440 }}>
            Capitães verificados publicam viagens de lancha agendadas. Você reserva um assento e embarca. Simples assim.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/viagens">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0284C7", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 32px rgba(2,132,199,0.4)" }}>
                Ver viagens disponíveis <ChevronRight size={16} />
              </span>
            </Link>
            <Link href="/cadastro">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#CBD5E1", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>
                Sou capitão
              </span>
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 48, flexWrap: "wrap" }}>
            {[["Capitães verificados", Shield], ["Vagas em tempo real", Users], ["Sem taxas ocultas", Anchor]].map(([label, Icon]: any, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon size={14} color="#38BDF8" />
                <span style={{ color: "#64748B", fontSize: 13 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIDE FEED ── */}
      {rides.length > 0 && (
        <section style={{ background: "#040F1C", padding: "72px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ color: "#38BDF8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>PRÓXIMAS SAÍDAS</p>
                <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: "#F0F9FF", letterSpacing: "-0.5px" }}>Viagens disponíveis</h2>
              </div>
              <Link href="/viagens">
                <span style={{ color: "#38BDF8", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  Ver todas <ChevronRight size={14} />
                </span>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {rides.map((ride: any) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 24px", background: "#020D18" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#38BDF8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>COMO FUNCIONA</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, color: "#F0F9FF", letterSpacing: "-0.5px" }}>Do convite ao embarque</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
            {[
              { n: "01", title: "Capitão publica a viagem", desc: "Define rota, horário, preço e número de vagas disponíveis." },
              { n: "02", title: "Você escolhe seu assento", desc: "Navegue pelas viagens, veja avaliações do capitão e reserve." },
              { n: "03", title: "Confirmação imediata", desc: "Reserva confirmada na hora. Você recebe todos os detalhes." },
              { n: "04", title: "Hora de embarcar", desc: "No dia marcado, encontre o capitão e aproveite a viagem." },
            ].map((step, i) => (
              <div key={i} style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "rgba(56,189,248,0.06)", position: "absolute", top: 10, right: 16, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{step.n}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8", letterSpacing: "0.1em", marginBottom: 12 }}>PASSO {step.n}</div>
                <div style={{ fontWeight: 700, color: "#E2E8F0", fontSize: "1rem", marginBottom: 10 }}>{step.title}</div>
                <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Você tem uma lancha?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 32, fontSize: "1.05rem" }}>
          Publique suas viagens, encontre passageiros e cubra os custos do seu passeio.
        </p>
        <Link href="/cadastro">
          <span style={{ background: "#fff", color: "#0284C7", padding: "14px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-block" }}>
            Cadastrar como capitão
          </span>
        </Link>
      </section>

    </div>
  );
}

function RideCard({ ride }: { ride: any }) {
  return (
    <Link href={`/viagens/${ride.id}`}>
      <div style={{ background: "#071829", border: "1px solid #0F2336", borderRadius: 16, padding: 22, cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", gap: 16, transition: "border-color 0.2s" }}>
        {/* Route */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ background: ride.availableSeats > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: ride.availableSeats > 0 ? "#4ADE80" : "#F87171", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
              {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
            </span>
            {ride.avgRating > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#FBBF24", fontSize: 12, fontWeight: 700 }}>
                <Star size={11} fill="#FBBF24" /> {ride.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#F0F9FF", letterSpacing: "-0.3px" }}>
            {ride.originCity}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0" }}>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, #1E3A5F, transparent)" }} />
            <MapPin size={12} color="#38BDF8" />
            <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, #1E3A5F)" }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#F0F9FF", letterSpacing: "-0.3px" }}>
            {ride.destinationCity}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#64748B", fontSize: 13 }}>
            <Clock size={12} color="#38BDF8" />
            {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#64748B", fontSize: 13 }}>
            <Anchor size={12} color="#38BDF8" />
            {ride.boatName || "Lancha"} · {ride.captainName}
          </div>
        </div>

        {/* Price */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "#38BDF8", letterSpacing: "-0.5px" }}>
              R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}
            </div>
            <div style={{ color: "#475569", fontSize: 11 }}>por pessoa</div>
          </div>
          <span style={{ background: "rgba(2,132,199,0.15)", border: "1px solid rgba(2,132,199,0.25)", color: "#38BDF8", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            Reservar →
          </span>
        </div>
      </div>
    </Link>
  );
}
