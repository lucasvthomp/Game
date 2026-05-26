import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Clock, Star, ChevronRight, Anchor, Users } from "lucide-react";

const PLACEHOLDER_RIDES = [
  { id: 1, originCity: "Bertioga", destinationCity: "Ilhabela", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), returnTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(), pricePerSeat: "85.00", availableSeats: 4, totalSeats: 6, captainName: "Rafael M.", boatName: "Veneza III", avgRating: 4.9 },
  { id: 2, originCity: "Santos", destinationCity: "Ilha Grande", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(), returnTime: null, pricePerSeat: "120.00", availableSeats: 2, totalSeats: 8, captainName: "Carlos P.", boatName: "Acqua Viva", avgRating: 4.7 },
  { id: 3, originCity: "Angra dos Reis", destinationCity: "Paraty", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 44).toISOString(), returnTime: new Date(Date.now() + 1000 * 60 * 60 * 52).toISOString(), pricePerSeat: "65.00", availableSeats: 6, totalSeats: 10, captainName: "Bruno S.", boatName: "Mar Aberto", avgRating: 5.0 },
  { id: 4, originCity: "Guarujá", destinationCity: "Ubatuba", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(), returnTime: null, pricePerSeat: "95.00", availableSeats: 3, totalSeats: 6, captainName: "Diego F.", boatName: "Brisa do Mar", avgRating: 4.8 },
];

export default function Home() {
  const { data } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const liveRides = data?.rides?.slice(0, 4) || [];
  const rides = liveRides.length > 0 ? liveRides : PLACEHOLDER_RIDES;

  return (
    <div className="page-wrapper">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-wave">
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
              <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="rgba(14,165,233,0.05)" />
              <path d="M0,55 C300,20 600,70 900,45 C1100,28 1300,60 1440,50 L1440,80 L0,80 Z" fill="rgba(2,132,199,0.04)" />
            </svg>
          </div>
        </div>

        <div className="hero-content fade-up">
          <div className="hero-eyebrow">
            <Anchor size={12} />
            <span>Caronas de lancha · Brasil</span>
          </div>

          <h1 className="hero-title">
            Viaje de lancha.<br />
            <span className="gradient-text">Sem complicação.</span>
          </h1>

          <p className="hero-sub">
            Capitães verificados publicam rotas. Você reserva um assento e embarca. Como uma carona — mas no mar.
          </p>

          <div className="hero-actions">
            <Link href="/viagens">
              <span className="btn-primary">
                Ver viagens disponíveis <ChevronRight size={15} />
              </span>
            </Link>
            <Link href="/cadastro">
              <span className="btn-ghost">Sou capitão</span>
            </Link>
          </div>

          <div className="hero-stats">
            {[["Capitães verificados", "✓"], ["Rotas agendadas", "📅"], ["Sem taxas ocultas", "R$"]].map(([label, icon]) => (
              <div key={label} className="hero-stat">
                <span className="stat-icon">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIDES FEED ── */}
      <section className="section rides-section">
        <div className="section-inner">
          <div className="section-header fade-up">
            <div>
              <p className="section-label">PRÓXIMAS SAÍDAS</p>
              <h2 className="section-title">Viagens disponíveis</h2>
            </div>
            <Link href="/viagens">
              <span className="link-more">Ver todas <ChevronRight size={14} /></span>
            </Link>
          </div>

          <div className="ride-grid">
            {rides.map((ride: any, i: number) => (
              <div key={ride.id} className="ride-card fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <Link href={`/viagens/${ride.id}`}>
                  <div className="ride-card-inner">
                    <div className="ride-top">
                      <span className={`badge ${ride.availableSeats > 0 ? "badge-green" : "badge-red"}`}>
                        {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
                      </span>
                      {ride.avgRating > 0 && (
                        <span className="rating">
                          <Star size={11} fill="#FBBF24" color="#FBBF24" />
                          {ride.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="ride-route">
                      <div className="ride-city">{ride.originCity}</div>
                      <div className="ride-arrow">
                        <div className="arrow-line" />
                        <Anchor size={12} color="#0EA5E9" />
                        <div className="arrow-line" />
                      </div>
                      <div className="ride-city">{ride.destinationCity}</div>
                    </div>

                    <div className="ride-meta">
                      <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
                      <span><Anchor size={12} /> {ride.boatName} · Cap. {ride.captainName}</span>
                    </div>

                    <div className="ride-footer">
                      <div className="ride-price">
                        <span className="price-amount">R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
                        <span className="price-label">/ pessoa</span>
                      </div>
                      <span className="btn-reserve">Reservar →</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section">
        <div className="section-inner">
          <div className="section-header fade-up" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column", alignItems: "center" }}>
            <p className="section-label">COMO FUNCIONA</p>
            <h2 className="section-title">Em quatro passos</h2>
          </div>
          <div className="steps-grid">
            {[
              { n: "01", title: "Capitão publica a rota", desc: "Define origem, destino, horário, preço e vagas." },
              { n: "02", title: "Você encontra a viagem", desc: "Navegue pelas rotas disponíveis e veja avaliações." },
              { n: "03", title: "Reserva em segundos", desc: "Escolha quantas vagas precisa e confirme." },
              { n: "04", title: "Hora de embarcar", desc: "No dia, encontre o capitão e aproveite o mar." },
            ].map((step, i) => (
              <div key={i} className="step fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="step-num">{step.n}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section fade-up">
        <div className="cta-inner">
          <div className="cta-icon"><Anchor size={28} color="#fff" /></div>
          <h2 className="cta-title">Você tem uma lancha?</h2>
          <p className="cta-sub">Publique suas rotas, encontre passageiros e divida os custos do passeio.</p>
          <Link href="/cadastro">
            <span className="btn-white">Cadastrar como capitão</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
