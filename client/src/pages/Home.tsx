import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Star, ChevronRight, Anchor, Calendar, Shield, MapPin, ArrowRight, Check, Navigation, Zap, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import RidesMap, { type RideMarker } from "@/components/map/RidesMap";
import { BOAT_MEDIA } from "@/lib/boat-media";
import { SiteAutocomplete } from "@/components/SiteSelect";

const COASTAL_SP_CITIES = [
  "Ubatuba",
  "Caraguatatuba",
  "São Sebastião",
  "Ilhabela",
  "Bertioga",
  "Guarujá",
  "Santos",
  "São Vicente",
  "Praia Grande",
  "Mongaguá",
  "Itanhaém",
  "Peruíbe",
  "Iguape",
  "Ilha Comprida",
  "Cananéia",
];

export default function Home() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

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
    const params = new URLSearchParams();
    if (searchFrom) params.set("from", searchFrom);
    if (searchTo)   params.set("to", searchTo);
    window.location.href = `/lanchas?${params.toString()}`;
  };

  return (
    <div className="page-wrapper">
      <div className="brazil-stripe" />

      {/* ─── HERO ─── */}
      <section className="hero-pro">
        <video className="hero-video" autoPlay muted playsInline preload="auto" poster={BOAT_MEDIA.dock} aria-hidden="true">
          <source src="https://videos.pexels.com/video-files/5579142/5579142-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" aria-hidden="true" />
        <div className="hero-float-anchor"><Anchor size={120} /></div>

        <div className="hero-pro-shell">
        <div className="hero-pro-inner fade-up">
          <h1 className="hero-pro-title">
            O caminho fica<br />
            melhor compartilhado.
          </h1>
          <p className="hero-pro-sub">
            Encontre uma travessia, veja o que está publicado e combine o embarque<br />
            com um operador independente — tudo em um só lugar.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-fields">
              <div className="hero-search-field">
                <MapPin size={14} className="search-field-icon" />
                <SiteAutocomplete
                  value={searchFrom}
                  onChange={setSearchFrom}
                  options={COASTAL_SP_CITIES}
                  placeholder="De onde?"
                  ariaLabel="Cidade de origem"
                />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-field">
                <MapPin size={14} className="search-field-icon" />
                <SiteAutocomplete
                  value={searchTo}
                  onChange={setSearchTo}
                  options={COASTAL_SP_CITIES}
                  placeholder="Para onde?"
                  ariaLabel="Cidade de destino"
                />
              </div>
              <button type="submit" className="hero-search-btn">
                Buscar <ArrowRight size={14} />
              </button>
            </div>
          </form>

          <div className="hero-pro-utility">
            <span><Shield size={13} /> Informação antes do embarque</span>
            <span><Anchor size={13} /> Operadores independentes</span>
          </div>
        </div>

        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg2)" />
          </svg>
        </div>
      </section>

      {/* ─── EVERYDAY WATER ─── */}
      <section className="everyday-water-section">
        <div className="everyday-water-inner">
          <div className="everyday-water-copy reveal">
            <p className="everyday-water-kicker"><span /> TRAVESSIAS DO DIA A DIA</p>
            <h2>Nem toda viagem precisa de estrada.</h2>
            <p className="everyday-water-lead">Quem cruza a água toda semana precisa de menos improviso. A Marcamar aproxima quem precisa chegar e quem já faz a travessia — com rota, horário e conversa no mesmo lugar.</p>

            <div className="everyday-water-route" aria-label="Rota em destaque entre Ilhabela e São Sebastião">
              <div className="everyday-water-stop">
                <span>SAÍDA</span>
                <strong>Ilhabela</strong>
              </div>
              <svg className="everyday-water-route-line" viewBox="0 0 160 42" role="img" aria-label="Travessia pela água">
                <path d="M4 21 C38 4 54 38 82 21 S126 5 156 21" />
                <circle cx="4" cy="21" r="3" />
                <circle cx="156" cy="21" r="3" />
              </svg>
              <div className="everyday-water-stop everyday-water-stop-end">
                <span>CHEGADA</span>
                <strong>São Sebastião</strong>
              </div>
            </div>

            <div className="everyday-water-actions">
              <Link href="/lanchas"><span className="everyday-water-link">Ver travessias <ArrowRight size={15} /></span></Link>
              <span className="everyday-water-note-inline"><Anchor size={14} /> Publicadas por quem navega</span>
            </div>
          </div>

          <div className="everyday-water-visual reveal reveal-delay-1" aria-label="Cenas de uma travessia cotidiana">
            <figure className="everyday-water-main-image">
              <img src={BOAT_MEDIA.dock} alt="Passageiros caminhando junto a um barco no cais" />
              <figcaption>O caminho começa no cais.</figcaption>
            </figure>
            <figure className="everyday-water-inset everyday-water-inset-boarding">
              <img src={BOAT_MEDIA.boarding} alt="Passageiros embarcando em uma balsa" />
              <figcaption>Embarque sem adivinhação.</figcaption>
            </figure>
            <figure className="everyday-water-inset everyday-water-inset-passenger">
              <img src={BOAT_MEDIA.passenger} alt="Passageira sentada dentro de uma balsa" />
              <figcaption>Tempo para seguir o dia.</figcaption>
            </figure>
            <figure className="everyday-water-inset everyday-water-inset-commute">
              <img src={BOAT_MEDIA.commute} alt="Pessoa observando a cidade pela janela de uma balsa" loading="lazy" decoding="async" />
              <figcaption>Um trajeto no meio do dia.</figcaption>
            </figure>
            <figure className="everyday-water-inset everyday-water-inset-window">
              <img src={BOAT_MEDIA.boarding} alt="Passageiros junto à rampa de uma balsa" loading="lazy" decoding="async" />
              <figcaption>Cada embarque tem seu ritmo.</figcaption>
            </figure>
            <figure className="everyday-water-inset everyday-water-inset-interior">
              <img src={BOAT_MEDIA.passenger} alt="Passageiros sentados dentro de uma balsa" loading="lazy" decoding="async" />
              <figcaption>A travessia também é pausa.</figcaption>
            </figure>
            <div className="everyday-water-sticker"><Anchor size={14} /> água como caminho</div>
          </div>
        </div>
      </section>

      {/* ─── MAP SECTION (real Leaflet) ─── */}
      <section className="map-section">
        <div className="map-chart-note map-chart-note-top" aria-hidden="true">PILOTO / MAPA DE ROTAS</div>
        <div className="map-chart-note map-chart-note-bottom" aria-hidden="true"><Navigation size={15} /> litoral paulista</div>
        <div className="map-section-inner" style={{ margin: "0 auto", padding: "0 24px" }}>
          <div className="fade-up">
            <p className="map-text-label">Cobertura de rotas</p>
            <h2 className="map-text-title">Rotas reais do piloto Marcamar</h2>
            <p className="map-text-desc">O mapa mostra apenas viagens publicadas na plataforma. À medida que operadores entrarem no piloto, novas rotas aparecerão aqui.</p>
            <div className="map-features">
              {[
                { dot: "boat", title: "Piloto aquático", desc: "Ilhabela e São Sebastião como ponto de partida" },
                { dot: "boat", title: "Disponibilidade publicada", desc: "Horário, capacidade e preço dependem de viagens reais" },
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
            <div className="map-published-legend">
              <span className="map-published-legend-dot" />
              Travessias publicadas
            </div>
          </div>
          <div className="map-media-stage scale-in" style={{ animationDelay: "120ms" }}>
            <figure className="map-media-photo map-media-photo-a" aria-hidden="true">
                <img src={BOAT_MEDIA.boarding} alt="" loading="lazy" decoding="async" />
            </figure>
            <figure className="map-media-video map-media-video-a" aria-hidden="true">
              <video autoPlay muted loop playsInline preload="metadata" poster={BOAT_MEDIA.dock}>
                <source src="https://videos.pexels.com/video-files/13842416/13842416-hd_1920_1080_30fps.mp4" type="video/mp4" />
              </video>
            </figure>
            <RidesMap rides={mapRides} height="380px" />
          </div>
        </div>
      </section>

      {/* ─── LIVE FEED ─── */}
      <section className="section-pro live-feed-section" style={{ background: "var(--bg)" }}>
        <div className="section-inner">
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
            <div className="live-feed-empty">
              <div className="live-feed-empty-photo">
                <img src={BOAT_MEDIA.boarding} alt="Passageiros se preparando para embarcar" />
                <span>primeiro embarque</span>
              </div>
              <div className="live-feed-empty-photo-secondary" aria-hidden="true">
                <img src={BOAT_MEDIA.boarding} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="live-feed-empty-copy">
                <div className="live-feed-empty-kicker"><Anchor size={14} /> oferta em construção</div>
                <p className="live-feed-empty-title">Ainda não há travessias publicadas.</p>
                <p className="live-feed-empty-desc">Estamos começando com um piloto concentrado. Operadores podem cadastrar sua rota para formar a primeira oferta local.</p>
              </div>
              <div className="live-feed-empty-tail" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section-pro how-it-works-section" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section-inner">
          <div className="section-label-row fade-up">
            <p className="section-label" style={{ color: "var(--text3)" }}>COMO FUNCIONA</p>
            <h2 className="section-title-pro">Simples assim</h2>
          </div>
          <div className="steps-media-curve" aria-hidden="true">
            <figure className="steps-media-frame steps-media-frame-a">
              <img src={BOAT_MEDIA.boarding} alt="" />
            </figure>
            <figure className="steps-media-frame steps-media-frame-b">
              <video autoPlay muted loop playsInline preload="metadata" poster={BOAT_MEDIA.dock}>
                <source src="https://videos.pexels.com/video-files/13842416/13842416-hd_1920_1080_30fps.mp4" type="video/mp4" />
              </video>
            </figure>
            <figure className="steps-media-frame steps-media-frame-c">
              <img src={BOAT_MEDIA.commute} alt="" loading="lazy" decoding="async" />
            </figure>
          </div>
          <div className="steps-pro">
            <div className="steps-waterline" aria-hidden="true">
              <svg viewBox="0 0 1000 110" preserveAspectRatio="none">
                <path d="M8 62 C 128 12, 218 100, 350 51 S 614 17, 748 64 S 890 99, 992 39" />
              </svg>
            </div>
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
            <div className="recurring-pro-visual">
              <div className="recurring-route-sheet" aria-label="Exemplo visual de rota recorrente em planejamento">
                <svg className="recurring-route-doodle" viewBox="0 0 520 330" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M20 276 C 126 214, 180 300, 278 246 S 398 173, 504 202" />
                  <path d="M48 304 C 142 265, 202 318, 300 278 S 406 233, 486 250" />
                </svg>
                <div className="recurring-route-video" aria-hidden="true">
                  <video autoPlay muted loop playsInline preload="metadata" poster={BOAT_MEDIA.dock}>
                    <source src="https://videos.pexels.com/video-files/13842416/13842416-hd_1920_1080_30fps.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="recurring-route-sheet-photo">
                  <img src={BOAT_MEDIA.passenger} alt="Passageiro a bordo durante uma travessia" />
                </div>
                <div className="recurring-route-sheet-body">
                  <div className="recurring-route-sheet-head">
                    <span><Calendar size={14} /> rota em preparação</span>
                    <strong>horário a definir</strong>
                  </div>
                  <div className="recurring-route-line">
                    <span>ILHABELA</span>
                    <i />
                    <span>SÃO SEBASTIÃO</span>
                  </div>
                  <p>Quando o piloto tiver rotas repetidas, esta área poderá aproximar passageiros e operadores que fazem o mesmo trajeto com frequência.</p>
                  <div className="recurring-route-sheet-footer">
                    <span>frequência a definir</span>
                    <span>disponibilidade publicada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST ─── */}
      <section className="section-pro trust-section" style={{ background: "var(--bg)" }}>
        <div className="section-inner">
          <div className="section-label-row fade-up" style={{ marginBottom: 32 }}>
            <p className="section-label" style={{ color: "var(--text3)" }}>POR QUE USAR</p>
            <h2 className="section-title-pro">Por que a Marcamar?</h2>
          </div>
          <div className="trust-grid">
            <svg className="trust-grid-curve" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 50 C 130 10, 210 74, 345 43 S 580 8, 704 47 S 870 77, 1000 28" />
            </svg>
            {[
              { icon: <Shield size={22} />,   title: "Confiança como produto", desc: "A visão começa separando identidade, qualificação marítima, embarcação e capacidade.", color: "var(--boat)" },
              { icon: <Star size={22} />,     title: "Informação antes do embarque", desc: "Rota, horário, preço, capacidade e perfil do operador devem estar claros para decidir.", color: "var(--boat)" },
              { icon: <Globe size={22} />,    title: "Piloto concentrado", desc: "Começamos em uma região pequena para aprender com viagens reais antes de expandir.", color: "var(--boat)" },
              { icon: <Clock size={22} />,    title: "Conversas registradas", desc: "Cada reserva tem um contexto de mensagens para alinhar ponto de encontro e execução.", color: "var(--boat)" },
            ].map((t, i) => (
              <div key={i} className={`trust-card trust-card-${i} reveal reveal-delay-${i + 1}`}>
                <div className="trust-card-media" aria-hidden="true">
                  <img src={[
                    BOAT_MEDIA.dock,
                    BOAT_MEDIA.boarding,
                    BOAT_MEDIA.passenger,
                    BOAT_MEDIA.dock,
                  ][i]} alt="" loading="lazy" decoding="async" />
                </div>
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
          <div className="cta-pro-orbit" aria-hidden="true">
            <Anchor size={42} />
            <span>primeira oferta local</span>
            <span>quem navega, publica</span>
          </div>
          <div className="cta-pro-grid cta-pro-grid-single fade-up">
            <div className="cta-pro-card cta-pro-boat reveal reveal-delay-1">
              <div className="cta-pro-photo" aria-hidden="true">
                <img src={BOAT_MEDIA.dock} alt="" />
                <span>água como caminho</span>
              </div>
              <div className="cta-pro-video" aria-hidden="true">
                <video autoPlay muted loop playsInline preload="metadata" poster={BOAT_MEDIA.dock}>
                  <source src="https://videos.pexels.com/video-files/13842416/13842416-hd_1920_1080_30fps.mp4" type="video/mp4" />
                </video>
              </div>
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
  return (
    <div className="ride-card-pro boat-card fade-up" style={{ animationDelay: `${i * 70}ms` }}>
      <Link href={`/viagens/${ride.id}`}>
        <div className="ride-card-pro-inner">
          <div className="ride-card-pro-route">
            <div className="ride-card-pro-city">{ride.originCity}</div>
            <div className="ride-card-pro-arrow">
              <div className="arrow-line-pro" />
              <Anchor size={12} color="var(--boat)" />
              <div className="arrow-line-pro" />
            </div>
            <div className="ride-card-pro-city">{ride.destinationCity}</div>
          </div>
          <div className="ride-card-pro-meta">
            <span><Clock size={11} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
            <span><Anchor size={10} />{ride.boatName} · Cap. {ride.captainName}</span>
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

