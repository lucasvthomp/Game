import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Star, ChevronRight, Anchor, Car, Calendar, Shield, MapPin, Users, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

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

const STATS = [
  { value: "12.400+", label: "Viagens realizadas" },
  { value: "3.200+", label: "Motoristas e capitães" },
  { value: "4.8", label: "Avaliação média" },
  { value: "R$ 0", label: "Taxa de cadastro" },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

export default function Home() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchType, setSearchType] = useState<"car" | "boat">("car");

  const { data } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const liveRides: any[] = data?.rides?.slice(0, 6) || [];
  const boatRides = liveRides.length > 0 ? liveRides.filter((r: any) => r.rideType === "boat").slice(0, 3) : PLACEHOLDER_BOAT_RIDES;
  const carRides  = liveRides.length > 0 ? liveRides.filter((r: any) => r.rideType === "car").slice(0, 3)  : PLACEHOLDER_CAR_RIDES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchFrom) params.set("from", searchFrom);
    if (searchTo)   params.set("to", searchTo);
    const base = searchType === "car" ? "/caronas" : "/lanchas";
    window.location.href = `${base}?${params.toString()}`;
  };

  return (
    <div className="page-wrapper">

      {/* ─── HERO ─── */}
      <section className="hero-pro">
        <div className="hero-pro-bg">
          {/* Soft radial blobs */}
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          {/* Grid pattern */}
          <div className="hero-grid-lines" />
          {/* SVG map/road illustration */}
          <svg className="hero-bg-svg" viewBox="0 0 900 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Road curves */}
            <path d="M-40 340 Q200 200 400 280 Q600 360 900 180" stroke="var(--car)" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.18" />
            <path d="M-40 360 Q200 220 400 300 Q600 380 900 200" stroke="var(--car)" strokeWidth="1" opacity="0.10" />
            {/* Coastal wave lines */}
            <path d="M0 380 Q120 340 240 370 Q360 400 480 360 Q600 320 720 350 Q840 380 920 340" stroke="var(--boat)" strokeWidth="2" opacity="0.18" />
            <path d="M0 395 Q140 360 280 385 Q420 410 560 375 Q700 340 900 365" stroke="var(--boat)" strokeWidth="1" opacity="0.10" />
            {/* Location dots */}
            <circle cx="180" cy="295" r="4" fill="var(--car)" opacity="0.25" />
            <circle cx="180" cy="295" r="8" stroke="var(--car)" strokeWidth="1.5" opacity="0.12" />
            <circle cx="520" cy="265" r="4" fill="var(--car)" opacity="0.25" />
            <circle cx="520" cy="265" r="8" stroke="var(--car)" strokeWidth="1.5" opacity="0.12" />
            <circle cx="320" cy="355" r="4" fill="var(--boat)" opacity="0.25" />
            <circle cx="320" cy="355" r="8" stroke="var(--boat)" strokeWidth="1.5" opacity="0.12" />
            <circle cx="700" cy="325" r="4" fill="var(--boat)" opacity="0.25" />
            <circle cx="700" cy="325" r="8" stroke="var(--boat)" strokeWidth="1.5" opacity="0.12" />
            {/* Connection line between dots */}
            <line x1="180" y1="295" x2="520" y2="265" stroke="var(--car)" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />
            <line x1="320" y1="355" x2="700" y2="325" stroke="var(--boat)" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />
          </svg>
        </div>

        <div className="hero-pro-inner fade-up">
          <div className="hero-pro-eyebrow">
            <Car size={11} color="var(--car)" />
            <span style={{ color: "var(--car)", fontWeight: 700 }}>Carro</span>
            <span style={{ color: "var(--border2)" }}>·</span>
            <Anchor size={11} color="var(--boat)" />
            <span style={{ color: "var(--boat)", fontWeight: 700 }}>Lancha</span>
            <span style={{ color: "var(--border2)" }}>·</span>
            <span>Caronas verificadas · Brasil</span>
          </div>

          <h1 className="hero-pro-title">
            A melhor forma de<br />
            <span className="hero-pro-gradient">compartilhar o caminho</span>
          </h1>

          <p className="hero-pro-sub">
            Caronas de carro para o trabalho. Travessias de lancha pelo litoral.<br />
            Motoristas e capitães verificados, preços transparentes.
          </p>

          {/* Search widget */}
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-type">
              <button type="button" className={`search-type-btn search-type-car ${searchType === "car" ? "active-car" : ""}`} onClick={() => setSearchType("car")}>
                <Car size={12} /> Carro
              </button>
              <button type="button" className={`search-type-btn search-type-boat ${searchType === "boat" ? "active-boat" : ""}`} onClick={() => setSearchType("boat")}>
                <Anchor size={12} /> Lancha
              </button>
            </div>
            <div className="hero-search-fields">
              <div className="hero-search-field">
                <MapPin size={14} className="search-field-icon" />
                <input value={searchFrom} onChange={e => setSearchFrom(e.target.value)} placeholder="De onde você sai?" />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-field">
                <MapPin size={14} className="search-field-icon" />
                <input value={searchTo} onChange={e => setSearchTo(e.target.value)} placeholder="Para onde vai?" />
              </div>
              <button type="submit" className="hero-search-btn">
                Buscar <ArrowRight size={14} />
              </button>
            </div>
          </form>

          <div className="hero-pro-links">
            <Link href="/caronas">
              <span className="hero-quick-link hero-quick-link-car"><Car size={12} /> Caronas de carro <ChevronRight size={12} /></span>
            </Link>
            <Link href="/lanchas">
              <span className="hero-quick-link hero-quick-link-boat"><Anchor size={12} /> Caronas de lancha <ChevronRight size={12} /></span>
            </Link>
            <Link href="/recorrentes">
              <span className="hero-quick-link"><Calendar size={12} /> Rotas recorrentes <ChevronRight size={12} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          {STATS.map(s => (
            <div key={s.label} className="stats-bar-item">
              <span className="stats-bar-value">{s.value}</span>
              <span className="stats-bar-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section-pro">
        <div className="section-inner">
          <div className="section-label-row fade-up">
            <p className="section-label">COMO FUNCIONA</p>
            <h2 className="section-title-pro">Pronto em minutos</h2>
          </div>
          <div className="steps-pro fade-up">
            {[
              { icon: <Car size={20} />,      step: "01", title: "Escolha o tipo", desc: "Carro para rotas terrestres, lancha para o litoral." },
              { icon: <MapPin size={20} />,   step: "02", title: "Busque sua rota", desc: "Encontre viagens disponíveis com preço por assento." },
              { icon: <Calendar size={20} />, step: "03", title: "Reserve o lugar", desc: "Confirme quantas vagas precisa em poucos cliques." },
              { icon: <Shield size={20} />,   step: "04", title: "Viaje com segurança", desc: "Todos os motoristas e capitães são verificados." },
            ].map((s, i) => (
              <div key={i} className="step-pro fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="step-pro-num">{s.step}</div>
                <div className="step-pro-icon">{s.icon}</div>
                <div className="step-pro-title">{s.title}</div>
                <div className="step-pro-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RIDE FEED ─── */}
      <section className="section-pro" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section-inner">
          <div className="feed-header fade-up">
            <div>
              <p className="section-label" style={{ color: "var(--car)" }}>
                <Car size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                CARONAS DE CARRO
              </p>
              <h2 className="section-title-pro">Próximas saídas</h2>
            </div>
            <Link href="/caronas"><span className="link-more-pro">Ver todas <ChevronRight size={14} /></span></Link>
          </div>
          <div className="ride-grid-pro">
            {carRides.map((ride: any, i: number) => <RideCard key={ride.id} ride={ride} i={i} />)}
          </div>

          <div className="feed-header fade-up" style={{ marginTop: 48 }}>
            <div>
              <p className="section-label" style={{ color: "var(--boat)" }}>
                <Anchor size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                CARONAS DE LANCHA
              </p>
              <h2 className="section-title-pro">Próximas travessias</h2>
            </div>
            <Link href="/lanchas"><span className="link-more-pro">Ver todas <ChevronRight size={14} /></span></Link>
          </div>
          <div className="ride-grid-pro">
            {boatRides.map((ride: any, i: number) => <RideCard key={ride.id} ride={ride} i={i} />)}
          </div>
        </div>
      </section>

      {/* ─── RECURRING CALLOUT ─── */}
      <section className="recurring-pro-section">
        <div className="section-inner">
          <div className="recurring-pro-inner fade-up">
            <div className="recurring-pro-text">
              <p className="section-label" style={{ color: "var(--boat)" }}>ROTAS RECORRENTES</p>
              <h2 className="recurring-pro-title">Vai todo dia pro mesmo lugar?</h2>
              <p className="recurring-pro-sub">
                Cadastre sua rota de segunda a sexta e encontre companheiros fixos. Menos gasto, menos trânsito, mais conversa.
              </p>
              <div className="recurring-pro-checks">
                {["Rotas de carro e lancha", "Horários flexíveis", "Companheiros verificados"].map(c => (
                  <div key={c} className="recurring-check-item">
                    <Check size={14} /> {c}
                  </div>
                ))}
              </div>
              <Link href="/recorrentes">
                <span className="btn-boat-solid">Ver rotas recorrentes <ArrowRight size={14} /></span>
              </Link>
            </div>

            <div className="recurring-pro-visual">
              {[
                { label: "Carro — Pindamonhangaba → SJC", days: [1,2,3,4,5], time: "07:30 · 18:00", peers: "3 companheiros", type: "car" as const },
                { label: "Lancha — Santos → Ilhabela",    days: [2,4,5],     time: "06:00",         peers: "2 companheiros", type: "boat" as const },
              ].map((card, ci) => (
                <div key={ci} className="recurring-preview-card">
                  <div className="recurring-preview-label-row">
                    {card.type === "car" ? <Car size={13} color="var(--car)" /> : <Anchor size={13} color="var(--boat)" />}
                    <p className="recurring-preview-label">{card.label}</p>
                  </div>
                  <div className="day-row">
                    {DAY_LABELS.map((d, i) => (
                      <span key={d} className={`day-pill-pro ${card.days.includes(i + 1) ? "active" : ""}`}
                        style={{ animationDelay: `${ci * 300 + i * 100}ms` }}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="recurring-preview-meta">
                    <span>{card.time}</span>
                    <span>{card.peers}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST SECTION ─── */}
      <section className="section-pro">
        <div className="section-inner">
          <div className="section-label-row fade-up" style={{ marginBottom: 40 }}>
            <p className="section-label">POR QUE USAR</p>
            <h2 className="section-title-pro">Seguro, simples e barato</h2>
          </div>
          <div className="trust-grid fade-up">
            {[
              { icon: <Shield size={22} />,   title: "Verificação rigorosa",    desc: "CNH e licença marítima confirmadas antes de qualquer publicação.", color: "var(--car)" },
              { icon: <Star size={22} />,     title: "Avaliações reais",        desc: "Passageiros avaliam após cada viagem. Histórico público e transparente.", color: "var(--boat)" },
              { icon: <Users size={22} />,    title: "Comunidade brasileira",   desc: "Motoristas e capitães de todo o litoral e interior do Brasil.", color: "var(--boat-dark)" },
              { icon: <Clock size={22} />,    title: "Agendado com antecedência", desc: "Viagens planejadas. Sem espera, sem surpresa.", color: "var(--car-dark)" },
            ].map((t, i) => (
              <div key={i} className="trust-card fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="trust-icon" style={{ background: `${t.color}18`, color: t.color }}>{t.icon}</div>
                <h3 className="trust-title">{t.title}</h3>
                <p className="trust-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA DUAL ─── */}
      <section className="cta-pro-section">
        <div className="section-inner">
          <div className="cta-pro-grid fade-up">
            <div className="cta-pro-card cta-pro-car">
              <div className="cta-pro-icon-wrap"><Car size={24} /></div>
              <h3>Você tem carro?</h3>
              <p>Publique sua rota diária. Divida os custos de combustível e pedágio com passageiros verificados.</p>
              <Link href="/cadastro">
                <span className="cta-pro-btn cta-pro-btn-car">Cadastrar como motorista</span>
              </Link>
            </div>
            <div className="cta-pro-card cta-pro-boat">
              <div className="cta-pro-icon-wrap"><Anchor size={24} /></div>
              <h3>Você tem lancha?</h3>
              <p>Publique suas travessias costeiras e encontre passageiros para dividir a experiência.</p>
              <Link href="/cadastro">
                <span className="cta-pro-btn cta-pro-btn-boat">Cadastrar como capitão</span>
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
    <div className="ride-card-pro fade-up" style={{ animationDelay: `${i * 70}ms` }}>
      <Link href={`/viagens/${ride.id}`}>
        <div className="ride-card-pro-inner">
          <div className="ride-card-pro-top">
            <span className={`type-pill ${isBoat ? "type-pill-boat" : "type-pill-car"}`}>
              {isBoat ? <Anchor size={10} /> : <Car size={10} />}
              {isBoat ? "Lancha" : "Carro"}
            </span>
            <span className={`avail-pill ${ride.availableSeats > 0 ? "avail-yes" : "avail-no"}`}>
              {ride.availableSeats > 0 ? `${ride.availableSeats} vagas` : "Esgotado"}
            </span>
          </div>

          <div className="ride-card-pro-route">
            <div className="ride-card-pro-city">{ride.originCity}</div>
            <div className="ride-card-pro-arrow">
              <div className="arrow-line-pro" />
              {isBoat ? <Anchor size={12} color="var(--boat)" /> : <Car size={12} color="var(--car)" />}
              <div className="arrow-line-pro" />
            </div>
            <div className="ride-card-pro-city">{ride.destinationCity}</div>
          </div>

          <div className="ride-card-pro-meta">
            <span><Clock size={11} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
            <span>
              {isBoat ? <>{ride.boatName} · Cap. {ride.captainName}</> : <>{ride.carName} · {ride.captainName}</>}
            </span>
          </div>

          <div className="ride-card-pro-footer">
            <div>
              <span className="ride-card-pro-price">R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
              <span className="ride-card-pro-per"> / pessoa</span>
            </div>
            <div className="ride-card-pro-rating">
              {ride.avgRating > 0 && <><Star size={11} fill="var(--boat)" color="var(--boat)" /> {ride.avgRating.toFixed(1)}</>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
