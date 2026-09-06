import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { MaritimeIcon } from "@/components/MaritimeIcon";
import { MaritimeIllustration } from "@/components/MaritimeIllustration";
import WaterSurface from "@/components/WaterSurface";
import { apiRequest } from "@/lib/queryClient";
import { PILOT_ROUTES } from "@shared/pilot-routes";
import { COASTAL_POINT_NAMES } from "@shared/coastal-locations";

function timeLabel(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Horário a confirmar" : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dateLabel(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Próxima saída" : date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function priceLabel(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? "R$ " + amount.toFixed(0).replace(".", ",") : "Consulte";
}

export default function Home() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPassengers, setSearchPassengers] = useState("1");
  const { data } = useQuery({ queryKey: ["/api/rides", "home-boat"], queryFn: () => apiRequest("GET", "/api/rides?type=boat") });
  const boatRides = ((data?.rides ?? []) as any[])
    .filter((ride) => ride.rideType === "boat")
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
    .slice(0, 4);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchFrom) params.set("from", searchFrom);
    if (searchTo) params.set("to", searchTo);
    if (searchDate) params.set("date", searchDate);
    if (searchPassengers) params.set("passengers", searchPassengers);
    window.location.href = "/lanchas?" + params.toString();
  };

  return (
    <div className="home-clean">
      <section className="home-clean-intro">
        <svg className="home-clean-water-svg" aria-hidden="true" focusable="false">
          <defs>
            <filter id="marcamar-water-physics" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="8" result="waterNoise">
                <animate attributeName="baseFrequency" values="0.008 0.02;0.012 0.028;0.008 0.02" dur="11s" repeatCount="indefinite" />
                <animate attributeName="seed" values="8;16;8" dur="17s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="waterNoise" scale="24" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <div className="home-clean-water-texture" aria-hidden="true" />
        <div className="home-clean-water-ripple" aria-hidden="true" />
        <WaterSurface />
        <div className="home-clean-shell">
          <div className="home-clean-heading home-clean-heading-simple">
            <div className="home-clean-heading-copy">
              <h1>Viaje pela costa.<br /><em>Sem complicar.</em></h1>
              <p>Encontre uma lancha, veja o ponto de embarque e reserve sua travessia com clareza.</p>
            </div>
          </div>

          <form className="home-clean-search" onSubmit={handleSearch}>
            <label className="home-clean-search-field">
              <MaritimeIcon variant="pinpoint" size={18} />
              <span><small>SAÍDA</small><SiteAutocomplete value={searchFrom} onChange={setSearchFrom} options={COASTAL_POINT_NAMES} placeholder="De onde?" ariaLabel="Ponto de saída" /></span>
            </label>
            <label className="home-clean-search-field">
              <MaritimeIcon variant="beach" size={18} />
              <span><small>CHEGADA</small><SiteAutocomplete value={searchTo} onChange={setSearchTo} options={COASTAL_POINT_NAMES} placeholder="Para onde?" ariaLabel="Ponto de chegada" /></span>
            </label>
            <label className="home-clean-search-field home-clean-search-date">
              <MaritimeIcon variant="clock" size={18} />
              <span><small>DATA</small><input type="date" value={searchDate} onChange={(event) => setSearchDate(event.target.value)} aria-label="Data da viagem" /></span>
            </label>
            <label className="home-clean-search-field home-clean-search-passengers">
              <MaritimeIcon variant="lancha" size={18} />
              <span><small>PASSAGEIROS</small><input type="number" min="1" max="12" value={searchPassengers} onChange={(event) => setSearchPassengers(event.target.value)} aria-label="Quantidade de passageiros" /></span>
            </label>
            <button type="submit" className="home-clean-search-button">Buscar lanchas <ArrowRight size={17} /></button>
          </form>

          <div className="home-clean-trust">
            <span><Check size={15} /> Ponto e horário visíveis</span>
            <span><Check size={15} /> Capacidade publicada</span>
            <span><Check size={15} /> Operadores locais</span>
          </div>
        </div>
      </section>

      <main className="home-clean-main">
        <section className="home-clean-services" aria-label="Atalhos Marcamar">
          <Link href="/lanchas"><article className="home-clean-service-card">
            <div><h2>Encontrar uma lancha</h2><p>Compare saídas, horários e valores para o seu trecho.</p><span>Buscar saídas <ArrowRight size={15} /></span></div>
            <MaritimeIllustration variant="lancha" size={88} />
          </article></Link>
          <Link href="/rotas"><article className="home-clean-service-card">
            <div><h2>Explorar pontos</h2><p>Veja praias e píeres costeiros no mapa.</p><span>Ver rotas <ArrowRight size={15} /></span></div>
            <MaritimeIllustration variant="beach" size={88} />
          </article></Link>
          <Link href="/solicitar-rota"><article className="home-clean-service-card">
            <div><h2>Pedir uma rota</h2><p>Não encontrou? Conte qual caminho você precisa.</p><span>Solicitar <ArrowRight size={15} /></span></div>
            <MaritimeIllustration variant="palm" size={88} />
          </article></Link>
        </section>

        <section className="home-clean-departures">
          <div className="home-clean-section-head">
            <div><p className="home-clean-kicker">SAÍDAS PUBLICADAS</p><h2>Próximas travessias</h2></div>
            <Link href="/lanchas"><span className="home-clean-link">Ver todas <ArrowRight size={15} /></span></Link>
          </div>

          <div className="home-clean-route-list">
            {boatRides.length > 0 ? boatRides.map((ride) => (
              <Link key={ride.id} href={"/viagens/" + ride.id}>
                <span className="home-clean-route-row">
                  <span className="home-clean-route-main">
                    <span className="home-clean-route-cities"><strong>{ride.originCity}</strong><ArrowRight size={15} /><strong>{ride.destinationCity}</strong></span>
                    <span className="home-clean-route-meta"><MaritimeIcon variant="clock" size={14} /> {dateLabel(ride.departureTime)} · {timeLabel(ride.departureTime)}</span>
                  </span>
                  <span className="home-clean-route-side"><strong>{priceLabel(ride.pricePerSeat)}</strong><small>{ride.availableSeats ?? ride.totalSeats} lugares</small></span>
                  <ArrowRight className="home-clean-route-arrow" size={18} />
                </span>
              </Link>
            )) : PILOT_ROUTES.slice(0, 4).map((route) => (
              <Link key={route.id} href={"/lanchas?from=" + encodeURIComponent(route.origin) + "&to=" + encodeURIComponent(route.destination)}>
                <span className="home-clean-route-row">
                  <span className="home-clean-route-main">
                    <span className="home-clean-route-cities"><strong>{route.origin}</strong><ArrowRight size={15} /><strong>{route.destination}</strong></span>
                    <span className="home-clean-route-meta"><MaritimeIcon variant="beach" size={14} /> {route.region}</span>
                  </span>
                  <span className="home-clean-route-side"><strong>Consulte</strong><small>rota disponível</small></span>
                  <ArrowRight className="home-clean-route-arrow" size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-clean-how home-clean-bottom-section" aria-labelledby="how-title">
          <div className="home-clean-section-head home-clean-bottom-head">
            <div>
              <p className="home-clean-kicker">SIMPLES ASSIM</p>
              <h2 id="how-title">Do ponto à lancha.</h2>
              <p className="home-clean-section-lede">Uma jornada curta, com cada decisão no lugar certo.</p>
            </div>
            <span className="home-clean-section-count">3 passos</span>
          </div>
          <div className="home-clean-steps-v2">
            <article className="home-clean-step-v2">
              <span className="home-clean-step-number">01</span>
              <span className="home-clean-step-icon"><MaritimeIllustration variant="pinpoint" size={54} /></span>
              <div><strong>Escolha o trecho</strong><p>Informe de onde sai, para onde vai e a data.</p></div>
              <ArrowRight className="home-clean-step-arrow" size={17} />
            </article>
            <article className="home-clean-step-v2">
              <span className="home-clean-step-number">02</span>
              <span className="home-clean-step-icon"><MaritimeIllustration variant="clock" size={54} /></span>
              <div><strong>Confira antes</strong><p>Veja horário, valor, vagas e quem conduz.</p></div>
              <ArrowRight className="home-clean-step-arrow" size={17} />
            </article>
            <article className="home-clean-step-v2">
              <span className="home-clean-step-number">03</span>
              <span className="home-clean-step-icon"><MaritimeIllustration variant="lancha" size={54} /></span>
              <div><strong>Vá para o cais</strong><p>Combine o embarque e siga pela água.</p></div>
              <ArrowRight className="home-clean-step-arrow" size={17} />
            </article>
          </div>
        </section>

        <section className="home-clean-info home-clean-boarding" aria-labelledby="boarding-title">
          <div className="home-clean-boarding-head">
            <div>
              <p className="home-clean-kicker">NO CAIS</p>
              <h2 id="boarding-title">Tudo claro antes de sair.</h2>
              <p className="home-clean-section-lede">O que você precisa saber fica visível antes de confirmar.</p>
            </div>
            <Link href="/ajuda"><span className="home-clean-outline-button">Abrir ajuda <ArrowRight size={15} /></span></Link>
          </div>
          <div className="home-clean-boarding-grid">
            <article>
              <span className="home-clean-boarding-icon"><MaritimeIcon variant="pinpoint" size={22} /></span>
              <div><strong>Ponto costeiro</strong><p>Escolha praias e píeres. O mapa bloqueia pontos em terra.</p></div>
            </article>
            <article>
              <span className="home-clean-boarding-icon"><MaritimeIcon variant="lancha" size={22} /></span>
              <div><strong>Detalhes visíveis</strong><p>Veja quem conduz, horário, valor e vagas antes de reservar.</p></div>
            </article>
            <article>
              <span className="home-clean-boarding-icon"><MaritimeIcon variant="buoy" size={22} /></span>
              <div><strong>Segurança primeiro</strong><p>Confirme o embarque com o capitão e consulte as condições do mar.</p></div>
            </article>
          </div>
          <Link href="/seguranca"><span className="home-clean-info-more">Conheça nossos cuidados de segurança <ArrowRight size={15} /></span></Link>
        </section>
      </main>
    </div>
  );
}
