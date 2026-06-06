import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Star, ChevronRight, Anchor, Car, Calendar, Shield, MapPin, Users, ArrowRight, Check, Navigation, Zap, Globe } from "lucide-react";
import { useState, Suspense, lazy } from "react";

const RouteMap = lazy(() => import("@/components/RouteMap"));

const BRAZIL_MAP_POINTS = [
  // Boat routes — origin/destination pairs
  { lat: -23.95, lng: -46.33, city: "Santos",    type: "boat" as const, route: "Santos → Ilhabela",      price: "85,00" },
  { lat: -23.77, lng: -45.36, city: "Ilhabela",  type: "boat" as const, route: "Santos → Ilhabela",      price: "85,00" },
  { lat: -23.00, lng: -44.32, city: "Paraty",    type: "boat" as const, route: "Angra → Paraty",         price: "65,00" },
  { lat: -23.01, lng: -44.31, city: "Angra dos Reis", type: "boat" as const, route: "Angra → Paraty",    price: "65,00" },
  // Car routes — origin/destination pairs
  { lat: -22.90, lng: -47.07, city: "Campinas",         type: "car" as const, route: "Campinas → SP",    price: "22,00" },
  { lat: -23.55, lng: -46.63, city: "São Paulo",        type: "car" as const, route: "Campinas → SP",    price: "22,00" },
  { lat: -23.19, lng: -45.88, city: "São José dos Campos", type: "car" as const, route: "SJC → SP",      price: "18,00" },
  { lat: -23.55, lng: -46.63, city: "São Paulo",        type: "car" as const, route: "SJC → SP",         price: "18,00" },
];

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
    const base = searchType === "car" ? "/caronas" : "/lanchas";
    const params = new URLSearchParams();
    if (searchFrom) params.set("from", searchFrom);
    if (searchTo)   params.set("to", searchTo);
    window.location.href = `${base}?${params.toString()}`;
  };

  return (
    <div className="page-wrapper">

      {/* Brazil flag stripe */}
      <div className="brazil-stripe" />

      {/* ─── HERO ─── */}
      <section className="hero-pro">
        {/* Decorative floating icons */}
        <div className="hero-float-anchor">
          <Anchor size={120} />
        </div>
        <div className="hero-float-car">
          <Car size={100} />
        </div>

        <div className="hero-pro-inner fade-up">

          <div className="hero-pro-eyebrow">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--boat)", display: "inline-block" }} />
            Brasil · Carro & Lancha · Verificados
          </div>

          <h1 className="hero-pro-title">
            Compartilhe o<br />
            <span className="hero-pro-gradient">caminho</span>
          </h1>

          <p className="hero-pro-sub">
            Caronas de carro e de lancha por todo o Brasil.<br />
            Motoristas e capitães verificados.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-type">
              <button type="button" className={`search-type-btn ${searchType === "car" ? "active-car" : ""}`} onClick={() => setSearchType("car")} style={{ minHeight: 44 }}>
                <Car size={12} /> Carro
              </button>
              <button type="button" className={`search-type-btn ${searchType === "boat" ? "active-boat" : ""}`} onClick={() => setSearchType("boat")} style={{ minHeight: 44 }}>
                <Anchor size={12} /> Lancha
              </button>
            </div>
            <div className="hero-search-fields">
              <div className="hero-search-field">
                <MapPin size={14} className="search-field-icon" />
                <input value={searchFrom} onChange={e => setSearchFrom(e.target.value)} placeholder="De onde?" />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-field">
                <MapPin size={14} className="search-field-icon" />
                <input value={searchTo} onChange={e => setSearchTo(e.target.value)} placeholder="Para onde?" />
              </div>
              <button type="submit" className="hero-search-btn">
                Buscar <ArrowRight size={14} />
              </button>
            </div>
          </form>

          <div className="hero-pro-links">
            <Link href="/caronas"><span className="hero-quick-link hero-quick-link-car"><Car size={12} /> Carro</span></Link>
            <Link href="/lanchas"><span className="hero-quick-link hero-quick-link-boat"><Anchor size={12} /> Lancha</span></Link>
            <Link href="/recorrentes"><span className="hero-quick-link"><Calendar size={12} /> Recorrentes</span></Link>
          </div>
        </div>

        {/* wave transition */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg2)" />
          </svg>
        </div>
      </section>

      {/* ─── SPLIT LANE ─── */}
      <div className="split-lane">
        <Link href="/caronas">
          <div className="split-panel split-panel-car">
            <div className="split-panel-accent" />
            <div className="split-panel-icon"><Car size={26} /></div>
            <p className="split-panel-label">Caronas de Carro</p>
            <h2 className="split-panel-title">Divida o trajeto</h2>
            <p className="split-panel-desc">Motoristas verificados em rotas diárias. Economize no combustível e pedágio.</p>
            <span className="split-panel-btn">Encontrar carona <ArrowRight size={13} /></span>
          </div>
        </Link>
        <Link href="/lanchas">
          <div className="split-panel split-panel-boat">
            <div className="split-panel-accent" />
            <div className="split-panel-icon"><Anchor size={26} /></div>
            <p className="split-panel-label">Caronas de Lancha</p>
            <h2 className="split-panel-title">Navegue pelo litoral</h2>
            <p className="split-panel-desc">Capitães credenciados em travessias costeiras. Ilhabela, Angra, Paraty.</p>
            <span className="split-panel-btn">Ver travessias <ArrowRight size={13} /></span>
          </div>
        </Link>
      </div>

      {/* ─── MAP SECTION ─── */}
      <section className="home-map-section">
        <div className="home-map-inner">
          <div className="home-map-text fade-up">
            <p className="section-label" style={{ color: "var(--boat)", marginBottom: 10 }}>
              <MapPin size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
              COBERTURA DE ROTAS
            </p>
            <h2>Litoral e interior do Brasil</h2>
            <p>Clique nos pins para ver detalhes de cada rota. Azul são travessias de lancha, dourado são caronas de carro.</p>
            <div className="home-map-pills">
              <span className="home-map-pill home-map-pill-boat"><Anchor size={11} /> Rotas marítimas</span>
              <span className="home-map-pill home-map-pill-car"><Car size={11} /> Rotas terrestres</span>
            </div>
            <div className="map-features" style={{ marginTop: 8 }}>
              {[
                { dot: "boat", title: "Santos → Ilhabela",     desc: "Travessia costeira — 90 min" },
                { dot: "boat", title: "Angra → Paraty",         desc: "Litoral verde — 75 min" },
                { dot: "car",  title: "Campinas → São Paulo",   desc: "Anhanguera / Bandeirantes" },
                { dot: "car",  title: "SJC → São Paulo",        desc: "Dutra / Ayrton Senna" },
              ].map((f, i) => (
                <div key={i} className="map-feature-item fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`map-feature-dot map-feature-dot-${f.dot}`} />
                  <div className="map-feature-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="home-map-container scale-in" style={{ animationDelay: "100ms" }}>
            <Suspense fallback={
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)", borderRadius: 20, color: "var(--text3)", fontSize: 14 }}>
                Carregando mapa...
              </div>
            }>
              <RouteMap points={BRAZIL_MAP_POINTS} center={[-23.4, -45.8]} zoom={7} height="100%" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── LIVE FEED ─── */}
      <section className="section-pro" style={{ background: "var(--bg)" }}>
        <div className="section-inner">
          <div className="feed-header fade-up">
            <div>
              <p className="section-label" style={{ color: "var(--car)" }}>
                <Car size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                SAÍDAS DE CARRO
              </p>
              <h2 className="section-title-pro">Próximas caronas</h2>
            </div>
            <Link href="/caronas"><span className="link-more-pro">Ver todas <ChevronRight size={14} /></span></Link>
          </div>
          <div className="ride-grid-pro">
            {carRides.map((ride: any, i: number) => <RideCard key={ride.id} ride={ride} i={i} />)}
          </div>

          <div className="feed-header fade-up" style={{ marginTop: 56 }}>
            <div>
              <p className="section-label" style={{ color: "var(--boat)" }}>
                <Anchor size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                SAÍDAS DE LANCHA
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="section-pro" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section-inner">
          <div className="section-label-row fade-up">
            <p className="section-label" style={{ color: "var(--text3)" }}>COMO FUNCIONA</p>
            <h2 className="section-title-pro">Simples assim</h2>
          </div>
          <div className="steps-pro">
            {[
              { icon: <Car size={20} />,        step: "01", title: "Escolha o tipo",     desc: "Carro para rotas terrestres, lancha para travessias no litoral." },
              { icon: <Navigation size={20} />, step: "02", title: "Busque sua rota",    desc: "Filtre por cidade, data e tipo. Veja preço e vagas em tempo real." },
              { icon: <Zap size={20} />,        step: "03", title: "Reserve um assento", desc: "Confirme quantas vagas precisa com poucos cliques." },
              { icon: <Shield size={20} />,     step: "04", title: "Viaje com segurança", desc: "Motoristas e capitães verificados. Avaliações reais após cada viagem." },
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

      {/* ─── RECURRING ─── */}
      <section className="recurring-pro-section">
        <div className="section-inner" style={{ padding: "0 24px" }}>
          <div className="recurring-pro-inner fade-up">
            <div>
              <p className="section-label" style={{ color: "var(--boat)" }}>ROTAS RECORRENTES</p>
              <h2 className="recurring-pro-title">Vai todo dia pro mesmo lugar?</h2>
              <p className="recurring-pro-sub">
                Cadastre sua rota semanal e encontre companheiros fixos. Menos gasto, menos trânsito.
              </p>
              <div className="recurring-pro-checks">
                {["De carro ou de lancha", "Horários flexíveis", "Companheiros verificados"].map(c => (
                  <div key={c} className="recurring-check-item"><Check size={14} /> {c}</div>
                ))}
              </div>
              <Link href="/recorrentes">
                <span className="btn-boat-solid">Ver rotas recorrentes <ArrowRight size={14} /></span>
              </Link>
            </div>
            <div className="recurring-pro-visual">
              {[
                { label: "Pindamonhangaba → SJC", days: [1,2,3,4,5], time: "07:30 · 18:00", peers: "3 companheiros", type: "car" as const },
                { label: "Santos → Ilhabela",     days: [2,4,5],     time: "06:00",         peers: "2 companheiros", type: "boat" as const },
              ].map((card, ci) => (
                <div key={ci} className="recurring-preview-card">
                  <div className="recurring-preview-label-row">
                    {card.type === "car" ? <Car size={13} color="var(--car)" /> : <Anchor size={13} color="var(--boat)" />}
                    <p className="recurring-preview-label">{card.label}</p>
                  </div>
                  <div className="day-row">
                    {DAY_LABELS.map((d, i) => (
                      <span key={d} className={`day-pill-pro ${card.days.includes(i + 1) ? "active" : ""}`} style={{ animationDelay: `${ci * 250 + i * 90}ms` }}>
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

      {/* ─── TRUST ─── */}
      <section className="section-pro" style={{ background: "var(--bg)" }}>
        <div className="section-inner">
          <div className="section-label-row fade-up" style={{ marginBottom: 32 }}>
            <p className="section-label" style={{ color: "var(--text3)" }}>POR QUE USAR</p>
            <h2 className="section-title-pro">Por que a LanchaCarona?</h2>
          </div>
          <div className="trust-grid">
            {[
              { icon: <Shield size={22} />,   title: "Verificação rigorosa",      desc: "CNH e licença marítima confirmadas antes de qualquer publicação.", color: "var(--car)" },
              { icon: <Star size={22} />,     title: "Avaliações reais",           desc: "Passageiros avaliam após cada viagem. Histórico público.", color: "var(--boat)" },
              { icon: <Globe size={22} />,    title: "Comunidade brasileira",      desc: "Motoristas e capitães de todo o litoral e interior do país.", color: "var(--boat)" },
              { icon: <Clock size={22} />,    title: "Sem espera",                 desc: "Viagens agendadas com antecedência. Sem surpresa no preço.", color: "var(--car)" },
            ].map((t, i) => (
              <div key={i} className="trust-card fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="trust-icon" style={{ background: `${t.color}15`, color: t.color }}>{t.icon}</div>
                <h3 className="trust-title">{t.title}</h3>
                <p className="trust-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-pro-section">
        <div className="section-inner">
          <div className="cta-pro-grid fade-up">
            <div className="cta-pro-card cta-pro-car">
              <div className="cta-pro-icon-wrap"><Car size={24} /></div>
              <h3>Você tem carro?</h3>
              <p>Publique sua rota. Divida o custo de combustível e pedágio com passageiros verificados.</p>
              <Link href="/cadastro"><span className="cta-pro-btn cta-pro-btn-car">Cadastrar como motorista</span></Link>
            </div>
            <div className="cta-pro-card cta-pro-boat">
              <div className="cta-pro-icon-wrap"><Anchor size={24} /></div>
              <h3>Você tem lancha?</h3>
              <p>Publique suas travessias costeiras e encontre passageiros para dividir a experiência.</p>
              <Link href="/cadastro"><span className="cta-pro-btn cta-pro-btn-boat">Cadastrar como capitão</span></Link>
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
    <div className={`ride-card-pro ${isBoat ? "boat-card" : "car-card"} fade-up`} style={{ animationDelay: `${i * 70}ms` }}>
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
            <span>{isBoat ? <><Anchor size={10} />{ride.boatName} · Cap. {ride.captainName}</> : <><Car size={10} />{ride.carName} · {ride.captainName}</>}</span>
          </div>
          <div className="ride-card-pro-footer">
            <div>
              <span className="ride-card-pro-price">R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}</span>
              <span className="ride-card-pro-per"> / pessoa</span>
            </div>
            {ride.avgRating > 0 && (
              <div className="ride-card-pro-rating"><Star size={11} fill="currentColor" style={{ color: "var(--amber)" }} /> {ride.avgRating.toFixed(1)}</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
