import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Star, ChevronRight, Anchor, Car, Calendar, Shield, MapPin, Users, ArrowRight, Check, Navigation, Zap, Globe } from "lucide-react";
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

      {/* ─── HERO ─── */}
      <section className="hero-pro">
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
      <section className="map-section">
        <div className="map-section-inner">
          <div className="fade-up">
            <p className="map-text-label">Cobertura de rotas</p>
            <h2 className="map-text-title">Litoral e interior do Brasil</h2>
            <p className="map-text-desc">Do Vale do Paraíba ao litoral paulista, de Santos a Paraty — encontre caronas nas rotas que você já faz todo dia.</p>
            <div className="map-features">
              {[
                { dot: "car",  title: "Rotas terrestres",  desc: "São Paulo, Vale do Paraíba, Campinas e região" },
                { dot: "boat", title: "Rotas marítimas",   desc: "Santos, Ilhabela, Angra dos Reis, Paraty, Ilha Grande" },
                { dot: "car",  title: "Rotas recorrentes", desc: "Comute diariamente com os mesmos companheiros" },
              ].map((f, i) => (
                <div key={i} className="map-feature-item fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`map-feature-dot map-feature-dot-${f.dot}`} />
                  <div className="map-feature-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="map-canvas scale-in" style={{ animationDelay: "120ms" }}>
            <svg className="map-canvas-svg" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="dotgrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="0.5" cy="0.5" r="0.6" fill="var(--border2)" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="420" height="300" fill="url(#dotgrid)" />

              {/* Car routes */}
              <path className="map-route-line" d="M60 80 C110 100 140 115 160 130" stroke="var(--car)" strokeWidth="1.5" strokeDasharray="200" opacity="0.8" />
              <path className="map-route-line" d="M160 130 C185 155 215 178 240 200" stroke="var(--car)" strokeWidth="1.5" strokeDasharray="200" opacity="0.6" style={{ animationDelay: "200ms" }} />
              <path className="map-route-line" d="M320 60 C280 80 255 95 230 110" stroke="var(--car)" strokeWidth="1.2" strokeDasharray="200" opacity="0.5" style={{ animationDelay: "300ms" }} />

              {/* Boat routes */}
              <path className="map-route-line" d="M240 200 C280 215 330 210 360 180" stroke="var(--boat)" strokeWidth="1.5" strokeDasharray="200" opacity="0.8" style={{ animationDelay: "500ms" }} />
              <path className="map-route-line" d="M240 200 C265 220 290 238 310 240" stroke="var(--boat)" strokeWidth="1.2" strokeDasharray="200" opacity="0.6" style={{ animationDelay: "700ms" }} />
              <path className="map-route-line" d="M310 240 C340 258 370 255 390 250" stroke="var(--boat)" strokeWidth="1.2" strokeDasharray="200" opacity="0.5" style={{ animationDelay: "900ms" }} />

              {/* Car cities */}
              {[
                { cx: 60,  cy: 80,  label: "Campinas",  a: 0 },
                { cx: 160, cy: 130, label: "S.Paulo",   a: 200, big: true },
                { cx: 320, cy: 60,  label: "Taubaté",   a: 100 },
                { cx: 230, cy: 110, label: "SJCampos",  a: 150 },
              ].map((c, i) => (
                <g key={i}>
                  {c.big && <circle cx={c.cx} cy={c.cy} r="16" fill="var(--car)" opacity="0.06" className="map-dot-ping" style={{ animationDelay: `${c.a}ms` }} />}
                  <circle cx={c.cx} cy={c.cy} r={c.big ? 5 : 3.5} fill="var(--car)" opacity="0.9" />
                  <circle cx={c.cx} cy={c.cy} r={c.big ? 9 : 6.5} stroke="var(--car)" strokeWidth="1" fill="none" opacity="0.2" />
                  <text x={c.cx + (c.big ? 11 : 9)} y={c.cy + 4} fill="var(--text3)" fontSize="9" fontWeight="600">{c.label}</text>
                </g>
              ))}

              {/* Boat cities */}
              {[
                { cx: 240, cy: 200, label: "Santos",   a: 0, big: true },
                { cx: 360, cy: 180, label: "Ilhabela", a: 200 },
                { cx: 310, cy: 240, label: "Angra",    a: 300 },
                { cx: 390, cy: 250, label: "Paraty",   a: 400 },
              ].map((c, i) => (
                <g key={i}>
                  {c.big && <circle cx={c.cx} cy={c.cy} r="16" fill="var(--boat)" opacity="0.06" className="map-dot-ping" style={{ animationDelay: `${500 + c.a}ms` }} />}
                  <circle cx={c.cx} cy={c.cy} r={c.big ? 5 : 3.5} fill="var(--boat)" opacity="0.9" />
                  <circle cx={c.cx} cy={c.cy} r={c.big ? 9 : 6.5} stroke="var(--boat)" strokeWidth="1" fill="none" opacity="0.2" />
                  <text x={c.cx + (c.big ? 11 : 9)} y={c.cy + 4} fill="var(--text3)" fontSize="9" fontWeight="600">{c.label}</text>
                </g>
              ))}

              {/* Legend */}
              <circle cx="20" cy="286" r="4" fill="var(--car)" />
              <text x="28" y="290" fill="var(--text3)" fontSize="9" fontWeight="600">Carro</text>
              <circle cx="72" cy="286" r="4" fill="var(--boat)" />
              <text x="80" y="290" fill="var(--text3)" fontSize="9" fontWeight="600">Lancha</text>
            </svg>
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
