import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { MaritimeIcon } from "@/components/MaritimeIcon";
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
        <div className="home-clean-shell">
          <div className="home-clean-brandline">
            <span className="home-clean-brandmark"><MaritimeIcon variant="lancha" size={20} /></span>
            <strong>Marcamar</strong>
            <span>litoral paulista</span>
          </div>

          <div className="home-clean-heading">
            <div className="home-clean-heading-copy">
              <p className="home-clean-kicker">TRANSPORTE LOCAL PELA ÁGUA</p>
              <h1>Viaje pela costa.<br /><em>Sem complicar.</em></h1>
              <p>Encontre uma lancha, veja o ponto de embarque e reserve sua travessia com clareza.</p>
            </div>
            <div className="home-clean-intro-note">
              <span className="home-clean-note-icon"><MaritimeIcon variant="pinpoint" size={22} /></span>
              <div><strong>Pontos que você reconhece</strong><span>Praias, píeres e comunidades do litoral.</span></div>
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

        <section className="home-clean-how">
          <div className="home-clean-section-head">
            <div><p className="home-clean-kicker">COMO FUNCIONA</p><h2>Três passos, só isso.</h2></div>
            <Link href="/como-funciona"><span className="home-clean-link">Entenda melhor <ArrowRight size={15} /></span></Link>
          </div>
          <div className="home-clean-steps">
            <article><span className="home-clean-step-icon"><MaritimeIcon variant="pinpoint" size={21} /></span><div><strong>Escolha o trecho</strong><p>Informe de onde sai, para onde vai e a data.</p></div></article>
            <article><span className="home-clean-step-icon"><MaritimeIcon variant="clock" size={21} /></span><div><strong>Confira antes</strong><p>Veja horário, valor, vagas e quem conduz.</p></div></article>
            <article><span className="home-clean-step-icon"><MaritimeIcon variant="lancha" size={21} /></span><div><strong>Vá para o cais</strong><p>Combine o embarque e siga pela água.</p></div></article>
          </div>
        </section>

        <section className="home-clean-callout">
          <span className="home-clean-callout-icon"><MaritimeIcon variant="palm" size={24} /></span>
          <div><p className="home-clean-kicker">NÃO ENCONTROU?</p><h2>Peça uma rota para o seu caminho.</h2><p>Conte de onde você sai e quando precisa viajar. A gente procura uma travessia.</p></div>
          <Link href="/solicitar-rota"><span className="home-clean-button">Solicitar rota <ArrowRight size={16} /></span></Link>
        </section>
      </main>
    </div>
  );
}
