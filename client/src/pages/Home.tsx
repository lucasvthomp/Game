import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Clock, Star, ChevronRight, Anchor, Car, Users, Calendar, ArrowRight } from "lucide-react";

const PLACEHOLDER_BOAT_RIDES = [
  { id: 1, rideType: "boat", originCity: "Bertioga", destinationCity: "Ilhabela", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), pricePerSeat: "85.00", availableSeats: 4, captainName: "Rafael M.", boatName: "Veneza III", avgRating: 4.9 },
  { id: 2, rideType: "boat", originCity: "Santos", destinationCity: "Ilha Grande", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(), pricePerSeat: "120.00", availableSeats: 2, captainName: "Carlos P.", boatName: "Acqua Viva", avgRating: 4.7 },
  { id: 3, rideType: "boat", originCity: "Angra dos Reis", destinationCity: "Paraty", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 44).toISOString(), pricePerSeat: "65.00", availableSeats: 6, captainName: "Bruno S.", boatName: "Mar Aberto", avgRating: 5.0 },
];

const PLACEHOLDER_CAR_RIDES = [
  { id: 101, rideType: "car", originCity: "Pindamonhangaba", destinationCity: "São José dos Campos", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), pricePerSeat: "18.00", availableSeats: 3, captainName: "Fernanda R.", carName: "Honda Civic", avgRating: 4.8 },
  { id: 102, rideType: "car", originCity: "Taubaté", destinationCity: "Guarulhos", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), pricePerSeat: "25.00", availableSeats: 2, captainName: "Guilherme A.", carName: "Toyota Corolla", avgRating: 4.9 },
  { id: 103, rideType: "car", originCity: "Campinas", destinationCity: "São Paulo", departureTime: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(), pricePerSeat: "22.00", availableSeats: 1, captainName: "Juliana C.", carName: "VW Golf", avgRating: 4.7 },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

export default function Home() {
  const { data } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const liveRides: any[] = data?.rides?.slice(0, 6) || [];
  const boatRides = liveRides.length > 0
    ? liveRides.filter((r: any) => r.rideType === "boat").slice(0, 3)
    : PLACEHOLDER_BOAT_RIDES;
  const carRides = liveRides.length > 0
    ? liveRides.filter((r: any) => r.rideType === "car").slice(0, 3)
    : PLACEHOLDER_CAR_RIDES;

  return (
    <div className="page-wrapper">

      {/* ── SPLIT HERO ── */}
      <section className="hero-split">
        <div className="hero-panel hero-panel-car slide-left">
          <div className="hero-panel-content">
            <div className="hero-panel-icon">🚗</div>
            <h2 className="hero-panel-title">Caronas<br />de Carro</h2>
            <p className="hero-panel-sub">Divida o trecho, economize combustível e faça companhia na estrada.</p>
            <Link href="/caronas">
              <span className="hero-panel-btn btn-car">Ver caronas de carro <ArrowRight size={15} /></span>
            </Link>
          </div>
          <div className="hero-panel-deco hero-panel-deco-car">🛣️</div>
        </div>

        <div className="hero-center-brand">
          <div className="hero-brand-pill">
            <Anchor size={14} />
            <Car size={14} />
            <span>LanchaCarona</span>
          </div>
          <p className="hero-center-tagline">Caronas<br />que fazem sentido</p>
        </div>

        <div className="hero-panel hero-panel-boat slide-right">
          <div className="hero-panel-content">
            <div className="hero-panel-icon">⛵</div>
            <h2 className="hero-panel-title">Caronas<br />de Lancha</h2>
            <p className="hero-panel-sub">Capitães verificados publicam rotas costeiras. Você reserva um assento e embarca.</p>
            <Link href="/lanchas">
              <span className="hero-panel-btn btn-boat">Ver caronas de lancha <ArrowRight size={15} /></span>
            </Link>
          </div>
          <div className="hero-panel-deco hero-panel-deco-boat">🌊</div>
        </div>
      </section>

      {/* ── CATEGORY CARDS ── */}
      <section className="section category-section">
        <div className="section-inner">
          <div className="category-grid fade-up">
            <Link href="/caronas">
              <div className="category-card category-card-car">
                <div className="category-card-icon">🚗</div>
                <div className="category-card-body">
                  <h3 className="category-card-title">Caronas de Carro</h3>
                  <p className="category-card-desc">Rotas diárias entre cidades. Ideal para quem commuta todo dia. Divida o custo.</p>
                  <ul className="category-card-list">
                    <li>✓ Motoristas verificados</li>
                    <li>✓ Rotas recorrentes disponíveis</li>
                    <li>✓ Do seu bairro ao trabalho</li>
                  </ul>
                </div>
                <div className="category-card-cta">
                  Ver caronas de carro <ChevronRight size={15} />
                </div>
              </div>
            </Link>

            <Link href="/lanchas">
              <div className="category-card category-card-boat">
                <div className="category-card-icon">⛵</div>
                <div className="category-card-body">
                  <h3 className="category-card-title">Caronas de Lancha</h3>
                  <p className="category-card-desc">Travessias costeiras com capitães experientes. Único no Brasil.</p>
                  <ul className="category-card-list">
                    <li>✓ Capitães com licença marítima</li>
                    <li>✓ Ilhas, praias e enseadas</li>
                    <li>✓ Paraty, Ilha Grande, Ubatuba…</li>
                  </ul>
                </div>
                <div className="category-card-cta">
                  Ver caronas de lancha <ChevronRight size={15} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── RECURRING FEATURE ── */}
      <section className="recurring-section">
        <div className="section-inner">
          <div className="recurring-inner fade-up">
            <div className="recurring-text">
              <p className="section-label" style={{ color: "var(--amber)", borderColor: "rgba(217,119,6,0.25)" }}>NOVIDADE</p>
              <h2 className="recurring-title">Vai todo dia pro mesmo lugar?</h2>
              <p className="recurring-sub">
                Cadastre sua rota recorrente e encontre companheiros de viagem fixos.
                Funciona para carro e lancha — pra quem mora em Pindamonhangaba e trabalha em SJC, ou quem traversa de lancha toda semana.
              </p>
              <Link href="/recorrentes">
                <span className="btn-amber">
                  <Calendar size={14} /> Explorar rotas recorrentes
                </span>
              </Link>
            </div>

            <div className="recurring-visual">
              <div className="recurring-card">
                <div className="recurring-card-top">
                  <span className="badge-car-sm">🚗 Pindamonhangaba → SJC</span>
                </div>
                <div className="recurring-days">
                  {DAY_LABELS.map((d, i) => (
                    <div key={d} className="day-chip day-chip-active" style={{ animationDelay: `${i * 120}ms` }}>
                      {d}
                    </div>
                  ))}
                  <div className="day-chip">Sáb</div>
                  <div className="day-chip">Dom</div>
                </div>
                <div className="recurring-card-meta">
                  <span>🕐 07:30 saída · 18:00 volta</span>
                  <span>3 companheiros encontrados</span>
                </div>
              </div>

              <div className="recurring-card" style={{ marginTop: 12 }}>
                <div className="recurring-card-top">
                  <span className="badge-boat-sm">⛵ Santos → Ilhabela</span>
                </div>
                <div className="recurring-days">
                  <div className="day-chip">Seg</div>
                  {["Ter", "Qui"].map((d, i) => (
                    <div key={d} className="day-chip day-chip-active" style={{ animationDelay: `${(i + 1) * 120}ms` }}>
                      {d}
                    </div>
                  ))}
                  <div className="day-chip">Qua</div>
                  <div className="day-chip day-chip-active" style={{ animationDelay: "360ms" }}>Sex</div>
                  <div className="day-chip">Sáb</div>
                  <div className="day-chip">Dom</div>
                </div>
                <div className="recurring-card-meta">
                  <span>🕐 06:00 saída</span>
                  <span>2 passageiros fixos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE RIDES ── */}
      <section className="section rides-section">
        <div className="section-inner">

          {/* Car rides */}
          <div className="section-header fade-up" style={{ marginBottom: 20 }}>
            <div>
              <p className="section-label" style={{ color: "var(--car)", borderColor: "var(--car-light)" }}>🚗 CARONAS DE CARRO</p>
              <h2 className="section-title">Próximas saídas</h2>
            </div>
            <Link href="/caronas">
              <span className="link-more">Ver todas <ChevronRight size={14} /></span>
            </Link>
          </div>
          <div className="ride-grid" style={{ marginBottom: 48 }}>
            {carRides.map((ride: any, i: number) => (
              <RideCard key={ride.id} ride={ride} i={i} />
            ))}
          </div>

          {/* Boat rides */}
          <div className="section-header fade-up" style={{ marginBottom: 20 }}>
            <div>
              <p className="section-label" style={{ color: "var(--boat)", borderColor: "var(--boat-light)" }}>⛵ CARONAS DE LANCHA</p>
              <h2 className="section-title">Próximas travessias</h2>
            </div>
            <Link href="/lanchas">
              <span className="link-more">Ver todas <ChevronRight size={14} /></span>
            </Link>
          </div>
          <div className="ride-grid">
            {boatRides.map((ride: any, i: number) => (
              <RideCard key={ride.id} ride={ride} i={i} />
            ))}
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section">
        <div className="section-inner">
          <div className="section-header fade-up" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
            <p className="section-label">COMO FUNCIONA</p>
            <h2 className="section-title">Simples assim</h2>
          </div>
          <div className="steps-grid">
            {[
              { n: "01", title: "Motorista ou capitão publica a rota", desc: "Define origem, destino, horário, preço e vagas disponíveis." },
              { n: "02", title: "Você encontra a carona certa", desc: "Filtre por tipo (carro ou lancha), cidade e data." },
              { n: "03", title: "Reserva em segundos", desc: "Escolha quantas vagas precisa e confirme sua participação." },
              { n: "04", title: "Hora de ir", desc: "No dia combinado, encontre o motorista/capitão e aproveite a viagem." },
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

      {/* ── CTA DUAL ── */}
      <section className="cta-dual-section fade-up">
        <div className="section-inner">
          <div className="cta-dual-grid">
            <div className="cta-card cta-card-car">
              <div className="cta-card-icon">🚗</div>
              <h3>Você tem carro?</h3>
              <p>Publique sua rota diária e divida os custos com outros passageiros.</p>
              <Link href="/cadastro">
                <span className="cta-card-btn">Cadastrar como motorista</span>
              </Link>
            </div>
            <div className="cta-card cta-card-boat">
              <div className="cta-card-icon">⛵</div>
              <h3>Você tem lancha?</h3>
              <p>Publique suas rotas costeiras, encontre passageiros e divida os custos.</p>
              <Link href="/cadastro">
                <span className="cta-card-btn">Cadastrar como capitão</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function RideCard({ ride, i }: { ride: any; i: number }) {
  const isBoat = ride.rideType === "boat";
  return (
    <div className="ride-card fade-up" style={{ animationDelay: `${i * 80}ms` }}>
      <Link href={`/viagens/${ride.id}`}>
        <div className="ride-card-inner">
          <div className="ride-top">
            <span className={`type-badge ${isBoat ? "type-badge-boat" : "type-badge-car"}`}>
              {isBoat ? "⛵ Lancha" : "🚗 Carro"}
            </span>
            {ride.availableSeats > 0
              ? <span className="badge badge-green">{ride.availableSeats} vagas</span>
              : <span className="badge badge-red">Esgotado</span>
            }
            {ride.avgRating > 0 && (
              <span className="rating"><Star size={11} fill="#FBBF24" color="#FBBF24" />{ride.avgRating.toFixed(1)}</span>
            )}
          </div>

          <div className="ride-route">
            <div className="ride-city">{ride.originCity}</div>
            <div className="ride-arrow">
              <div className="arrow-line" />
              {isBoat ? <Anchor size={12} color="var(--boat)" /> : <Car size={12} color="var(--car)" />}
              <div className="arrow-line" />
            </div>
            <div className="ride-city">{ride.destinationCity}</div>
          </div>

          <div className="ride-meta">
            <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
            <span>
              {isBoat
                ? <><Anchor size={12} /> {ride.boatName} · Cap. {ride.captainName}</>
                : <><Car size={12} /> {ride.carName} · {ride.captainName}</>
              }
            </span>
          </div>

          <div className="ride-footer">
            <div className="ride-price">
              <span className="price-amount">R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
              <span className="price-label">/ pessoa</span>
            </div>
            <span className={`btn-reserve ${isBoat ? "btn-reserve-boat" : "btn-reserve-car"}`}>Reservar →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
