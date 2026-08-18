import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Star, ChevronRight, Anchor, Car, Calendar, Shield, MapPin, ArrowRight, Check, Navigation, Zap, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import RidesMap, { type RideMarker } from "@/components/map/RidesMap";

export default function Home() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchType, setSearchType] = useState<"car" | "boat">("boat");

  const { data } = useQuery({
    queryKey: ["/api/rides"],
    queryFn: () => apiRequest("GET", "/api/rides"),
  });

  const liveRides: any[] = data?.rides || [];
  const boatRides = liveRides.filter((r: any) => r.rideType === "boat").slice(0, 3);

  // The map is water-first: only published boat rides appear on the pilot surface.
  const mapRides: RideMarker[] = liveRides.filter((r: any) => r.rideType === "boat");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

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
      <div className="brazil-stripe" />

      {/* ─── HERO ─── */}
      <section className="hero-pro">
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/videos/marcamar-hero-boat.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" aria-hidden="true" />
        <div className="hero-float-anchor"><Anchor size={120} /></div>
        <div className="hero-float-car"><Car size={100} /></div>

        <div className="hero-pro-shell">
        <div className="hero-pro-inner fade-up">
          <div className="hero-pro-eyebrow">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--boat)", display: "inline-block" }} />
            Piloto water-first · litoral paulista
          </div>
          <h1 className="hero-pro-title">
            O caminho fica<br />
            <span className="hero-pro-gradient">melhor compartilhado.</span>
          </h1>
          <p className="hero-pro-sub">
            Encontre uma travessia, veja o que está publicado e combine o embarque<br />
            com um operador independente — tudo em um só lugar.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-type">
              <button type="button" className={`search-type-btn ${searchType === "car" ? "active-car" : ""}`} onClick={() => setSearchType("car")} style={{ minHeight: 44 }}>
                <Car size={12} /> Carro · futuro
              </button>
              <button type="button" className={`search-type-btn ${searchType === "boat" ? "active-boat" : ""}`} onClick={() => setSearchType("boat")} style={{ minHeight: 44 }}>
                <Anchor size={12} /> Lancha · piloto
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
              <button type="submit" className={`hero-search-btn ${searchType === "boat" ? "hero-search-btn-boat" : "hero-search-btn-car"}`}>
                Buscar <ArrowRight size={14} />
              </button>
            </div>
          </form>

          <div className="hero-pro-links">
            <Link href="/caronas"><span className="hero-quick-link hero-quick-link-car"><Car size={12} /> Carro</span></Link>
            <Link href="/lanchas"><span className="hero-quick-link hero-quick-link-boat"><Anchor size={12} /> Lancha</span></Link>
            <Link href="/recorrentes"><span className="hero-quick-link"><Calendar size={12} /> Recorrentes</span></Link>
          </div>
          <div className="hero-pro-utility">
            <span><Shield size={13} /> Informação antes do embarque</span>
            <span><Anchor size={13} /> Operadores independentes</span>
          </div>
        </div>

        <aside className="hero-pro-rail fade-up" style={{ animationDelay: "120ms" }}>
          <div className="hero-rail-card">
            <div className="hero-rail-header">
              <span className="hero-rail-kicker"><span className="hero-rail-dot" /> O piloto começa por</span>
              <Anchor size={18} />
            </div>
            <div className="hero-rail-route">
              <div>
                <span>Região</span>
                <strong>Ilhabela</strong>
              </div>
              <div className="hero-rail-route-line" aria-hidden="true"><span /><Anchor size={15} /></div>
              <div>
                <span>Litoral norte</span>
                <strong>São Sebastião</strong>
              </div>
            </div>
            <p className="hero-rail-copy">
              A disponibilidade aparece conforme operadores publicam viagens reais na plataforma.
            </p>
            <Link href="/lanchas">
              <span className="hero-rail-link">Explorar travessias <ArrowRight size={14} /></span>
            </Link>
          </div>
          <div className="hero-rail-note"><MapPin size={14} /> Uma operação local, construída com quem navega</div>
        </aside>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg2)" />
          </svg>
        </div>
      </section>

      {/* ─── PILOT STATUS ─── */}
      <div className="pilot-status">
        <div className="pilot-status-inner">
          {[
            { title: 'Piloto regional', label: 'Foco inicial em Ilhabela e São Sebastião' },
            { title: 'Confiança em construção', label: 'Perfis e documentação entram na operação com revisão manual' },
            { title: 'Sem frota própria', label: 'A Marcamar conecta passageiros e operadores independentes' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 16px', maxWidth: 260 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text1)' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SPLIT LANE ─── */}
      <div className="split-lane">
        <Link href="/caronas">
          <div className="split-panel split-panel-car reveal">
            <div className="split-panel-accent" />
            <div className="split-panel-icon"><Car size={26} /></div>
            <p className="split-panel-label">Carro · em breve</p>
            <h2 className="split-panel-title">Uma próxima fase</h2>
            <p className="split-panel-desc">A camada de caronas terrestres continua no produto, mas o piloto atual está concentrado no transporte por água.</p>
            <span className="split-panel-btn">Conhecer a área futura <ArrowRight size={13} /></span>
          </div>
        </Link>
        <Link href="/lanchas">
          <div className="split-panel split-panel-boat reveal reveal-delay-1">
            <div className="split-panel-accent" />
            <div className="split-panel-icon"><Anchor size={26} /></div>
            <p className="split-panel-label">Marcamar · piloto na água</p>
            <h2 className="split-panel-title">Navegue com mais confiança</h2>
            <p className="split-panel-desc">Encontre opções de travessia, compare rota e disponibilidade e converse com o operador antes do embarque.</p>
            <span className="split-panel-btn">Ver travessias <ArrowRight size={13} /></span>
          </div>
        </Link>
      </div>

      {/* ─── MAP SECTION (real Leaflet) ─── */}
      <section className="map-section">
        <div className="map-section-inner" style={{ margin: "0 auto", padding: "0 24px" }}>
          <div className="fade-up">
            <p className="map-text-label">Cobertura de rotas</p>
            <h2 className="map-text-title">Rotas reais do piloto Marcamar</h2>
            <p className="map-text-desc">O mapa mostra apenas viagens publicadas na plataforma. À medida que operadores entrarem no piloto, novas rotas aparecerão aqui.</p>
            <div className="map-features">
              {[
                { dot: "boat", title: "Piloto aquático", desc: "Ilhabela e São Sebastião como ponto de partida" },
                { dot: "boat", title: "Disponibilidade publicada", desc: "Horário, capacidade e preço dependem de viagens reais" },
                { dot: "car",  title: "Carro em planejamento", desc: "A aba permanece para uma próxima etapa do produto" },
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
            <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text2)" }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--car)", display: "inline-block" }} />
                Carro · futuro
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text2)" }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--boat)", display: "inline-block" }} />
                Travessias publicadas
              </div>
            </div>
          </div>
          <div className="scale-in" style={{ animationDelay: "120ms" }}>
            <RidesMap rides={mapRides} height="380px" />
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
                ÁREA FUTURA
              </p>
              <h2 className="section-title-pro">Caronas de carro em breve</h2>
            </div>
            <Link href="/caronas"><span className="link-more-pro">Ver todas <ChevronRight size={14} /></span></Link>
          </div>
          <div style={{ padding: "24px", border: "1px dashed var(--border)", borderRadius: 16, background: "var(--bg2)", color: "var(--text2)" }}>
            <p style={{ fontWeight: 700, color: "var(--text1)", marginBottom: 6 }}>Esta área fica reservada para a expansão terrestre.</p>
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>O produto atual não inventa viagens, motoristas ou preços: quando houver caronas de carro publicadas, elas aparecerão aqui.</p>
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
          {boatRides.length > 0 ? (
            <div className="ride-grid-pro">
              {boatRides.map((ride: any, i: number) => <RideCard key={ride.id} ride={ride} i={i} />)}
            </div>
          ) : (
            <div style={{ padding: "24px", border: "1px dashed var(--border)", borderRadius: 16, background: "var(--bg2)", color: "var(--text2)" }}>
              <p style={{ fontWeight: 700, color: "var(--text1)", marginBottom: 6 }}>Ainda não há travessias publicadas.</p>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>Estamos começando com um piloto concentrado. Operadores podem cadastrar sua rota para formar a primeira oferta local.</p>
            </div>
          )}
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
              { icon: <Anchor size={20} />,    step: "01", title: "Encontre a travessia", desc: "Começamos por rotas e pedidos de transporte na água, com foco no litoral paulista." },
              { icon: <Navigation size={20} />, step: "02", title: "Confira a opção",      desc: "Veja rota, horário, capacidade, preço e o perfil do operador quando houver uma viagem publicada." },
              { icon: <Zap size={20} />,        step: "03", title: "Solicite sua viagem",  desc: "Reserve uma vaga disponível e mantenha os detalhes da solicitação registrados." },
              { icon: <Shield size={20} />,     step: "04", title: "Alinhe o embarque",   desc: "Use as mensagens da reserva para combinar ponto de encontro e próximos passos." },
            ].map((s, i) => (
              <div key={i} className={`step-pro reveal reveal-delay-${i + 1}`}>
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
              <p className="recurring-pro-sub">A camada de rotas recorrentes está sendo preparada para moradores e operadores com trajetos regulares.</p>
              <div className="recurring-pro-checks">
                {["Começa pelo transporte na água", "Rotas repetidas do piloto", "Perfis e disponibilidade claros"].map(c => (
                  <div key={c} className="recurring-check-item"><Check size={14} /> {c}</div>
                ))}
              </div>
              <Link href="/recorrentes">
                <span className="btn-boat-solid">Ver rotas recorrentes <ArrowRight size={14} /></span>
              </Link>
            </div>
            <div className="recurring-pro-visual" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="recurring-preview-card" style={{ width: "100%" }}>
                <div className="recurring-preview-label-row">
                  <Calendar size={13} color="var(--boat)" />
                  <p className="recurring-preview-label">Recorrentes em planejamento</p>
                </div>
                <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.5, marginTop: 12 }}>
                  Quando o piloto tiver rotas repetidas, esta área poderá aproximar passageiros e operadores que fazem o mesmo trajeto com frequência.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST ─── */}
      <section className="section-pro" style={{ background: "var(--bg)" }}>
        <div className="section-inner">
          <div className="section-label-row fade-up" style={{ marginBottom: 32 }}>
            <p className="section-label" style={{ color: "var(--text3)" }}>POR QUE USAR</p>
            <h2 className="section-title-pro">Por que a Marcamar?</h2>
          </div>
          <div className="trust-grid">
            {[
              { icon: <Shield size={22} />,   title: "Confiança como produto", desc: "A visão começa separando identidade, qualificação marítima, embarcação e capacidade.", color: "var(--boat)" },
              { icon: <Star size={22} />,     title: "Informação antes do embarque", desc: "Rota, horário, preço, capacidade e perfil do operador devem estar claros para decidir.", color: "var(--boat)" },
              { icon: <Globe size={22} />,    title: "Piloto concentrado", desc: "Começamos em uma região pequena para aprender com viagens reais antes de expandir.", color: "var(--boat)" },
              { icon: <Clock size={22} />,    title: "Conversas registradas", desc: "Cada reserva tem um contexto de mensagens para alinhar ponto de encontro e execução.", color: "var(--boat)" },
            ].map((t, i) => (
              <div key={i} className={`trust-card reveal reveal-delay-${i + 1}`}>
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
            <div className="cta-pro-card cta-pro-car reveal">
              <div className="cta-pro-icon-wrap"><Car size={24} /></div>
              <h3>Você opera no transporte terrestre?</h3>
              <p>A área de carro fica preservada no produto para uma próxima fase, depois que o piloto aquático validar a operação.</p>
              <Link href="/caronas"><span className="cta-pro-btn cta-pro-btn-car">Conhecer a área futura</span></Link>
            </div>
            <div className="cta-pro-card cta-pro-boat reveal reveal-delay-1">
              <div className="cta-pro-icon-wrap"><Anchor size={24} /></div>
              <h3>Você tem lancha?</h3>
              <p>Ajude a formar a primeira oferta local: publique uma travessia e apresente rota, capacidade e condições com clareza.</p>
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
