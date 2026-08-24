import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Anchor, CalendarDays, Check, Clock3, MapPin, ShieldCheck, UsersRound, Waves } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { apiRequest } from "@/lib/queryClient";
import { BOAT_MEDIA } from "@/lib/boat-media";
import { PILOT_ROUTES } from "@shared/pilot-routes";

const COASTAL_POINTS = ["São Sebastião", "Ilhabela", "Bonete", "Castelhanos", "Ubatuba", "Caraguatatuba", "Bertioga", "Santos", "Guarujá", "Cananéia"];

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
  return Number.isFinite(amount) ? "R$ " + amount.toFixed(0).replace(".", ",") : "Preço informado na viagem";
}

export default function Home() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPassengers, setSearchPassengers] = useState("1");
  const { data } = useQuery({ queryKey: ["/api/rides", "home-boat"], queryFn: () => apiRequest("GET", "/api/rides?type=boat") });
  const boatRides = ((data?.rides ?? []) as any[]).filter((ride) => ride.rideType === "boat").sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()).slice(0, 4);

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
    <div className="home-v2">
      <section className="home-v2-hero">
        <img className="home-v2-hero-image" src={BOAT_MEDIA.smallLancha} alt="Lancha de passageiros chegando ao píer" />
        <div className="home-v2-hero-scrim" aria-hidden="true" />
        <div className="home-v2-hero-inner">
          <div className="home-v2-eyebrow"><Waves size={15} /> Lanchas locais no litoral paulista</div>
          <h1>Seu caminho pela costa,<br /><em>de lancha.</em></h1>
          <p className="home-v2-hero-copy">Transporte rápido entre ilhas, praias e comunidades — com ponto de embarque, horário e capacidade claros.</p>
          <form className="home-v2-search" onSubmit={handleSearch}>
            <div className="home-v2-search-field"><MapPin size={17} aria-hidden="true" /><SiteAutocomplete value={searchFrom} onChange={setSearchFrom} options={COASTAL_POINTS} placeholder="De onde?" ariaLabel="Ponto de saída" /></div>
            <div className="home-v2-search-field"><MapPin size={17} aria-hidden="true" /><SiteAutocomplete value={searchTo} onChange={setSearchTo} options={COASTAL_POINTS} placeholder="Para onde?" ariaLabel="Ponto de chegada" /></div>
            <label className="home-v2-search-field home-v2-date-field"><CalendarDays size={17} aria-hidden="true" /><input type="date" value={searchDate} onChange={(event) => setSearchDate(event.target.value)} aria-label="Data da viagem" /></label>
            <label className="home-v2-search-field home-v2-passenger-field"><UsersRound size={17} aria-hidden="true" /><input type="number" min="1" max="12" value={searchPassengers} onChange={(event) => setSearchPassengers(event.target.value)} aria-label="Quantidade de passageiros" /></label>
            <button type="submit" className="home-v2-search-button">Buscar lanchas <ArrowRight size={17} /></button>
          </form>
          <div className="home-v2-proof"><span><ShieldCheck size={16} /> Informações antes do embarque</span><span><Anchor size={16} /> Operadores independentes</span><span><UsersRound size={16} /> Até 12 passageiros por lancha</span></div>
        </div>
      </section>

      <section className="home-v2-departures">
        <div className="home-v2-section-heading"><div><p className="home-v2-kicker">SAÍDAS PUBLICADAS</p><h2>Próximas travessias</h2></div><Link href="/lanchas"><span className="home-v2-text-link">Ver todas <ArrowRight size={16} /></span></Link></div>
        {boatRides.length > 0 ? (
          <div className="home-v2-route-list">{boatRides.map((ride) => (
            <Link key={ride.id} href={"/viagens/" + ride.id}><span className="home-v2-route-row"><span className="home-v2-route-main"><span className="home-v2-route-cities">{ride.originCity} <ArrowRight size={15} /> {ride.destinationCity}</span><span className="home-v2-route-meta"><CalendarDays size={14} /> {dateLabel(ride.departureTime)} · <Clock3 size={14} /> {timeLabel(ride.departureTime)}</span></span><span className="home-v2-route-side"><strong>{priceLabel(ride.pricePerSeat)}</strong><span>{ride.availableSeats ?? ride.totalSeats} lugares</span></span><ArrowRight className="home-v2-row-arrow" size={18} /></span></Link>
          ))}</div>
        ) : (
          <div className="home-v2-route-list">{PILOT_ROUTES.slice(0, 4).map((route) => (
            <Link key={route.id} href={"/lanchas?from=" + encodeURIComponent(route.origin) + "&to=" + encodeURIComponent(route.destination)}><span className="home-v2-route-row"><span className="home-v2-route-main"><span className="home-v2-route-cities">{route.origin} <ArrowRight size={15} /> {route.destination}</span><span className="home-v2-route-meta"><MapPin size={14} /> {route.region}</span></span><span className="home-v2-route-side"><strong>Consulte saídas</strong><span>Rota do piloto</span></span><ArrowRight className="home-v2-row-arrow" size={18} /></span></Link>
          ))}</div>
        )}
      </section>

      <section id="como-funciona" className="home-v2-how">
        <div className="home-v2-section-heading"><div><p className="home-v2-kicker">COMO FUNCIONA</p><h2>Um jeito simples de cruzar a água.</h2></div></div>
        <div className="home-v2-steps">
          {[
            { number: "01", icon: <MapPin size={20} />, title: "Escolha o trecho", copy: "Busque por saída, chegada e data. Os pontos são nomes que você reconhece no litoral." },
            { number: "02", icon: <Clock3 size={20} />, title: "Confira os detalhes", copy: "Veja horário, capacidade, valor e as informações do operador antes de pedir sua vaga." },
            { number: "03", icon: <Anchor size={20} />, title: "Combine o embarque", copy: "Depois da reserva, alinhe o ponto de encontro e siga para o cais com tranquilidade." },
          ].map((step) => <article key={step.number} className="home-v2-step"><span className="home-v2-step-number">{step.number}</span><span className="home-v2-step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}
        </div>
      </section>

      <section id="seguranca" className="home-v2-trust">
        <div className="home-v2-trust-mark"><ShieldCheck size={22} /></div>
        <div><p className="home-v2-kicker">FEITO PARA O LITORAL</p><h2>Clareza antes de entrar na lancha.</h2><p>O Marcamar organiza o que importa para uma travessia local: quem oferece, onde embarca, quando sai e quantas vagas existem.</p></div>
        <div className="home-v2-trust-list"><span><Check size={16} /> Rota e ponto visíveis</span><span><Check size={16} /> Capacidade publicada</span><span><Check size={16} /> Conversa registrada</span></div>
      </section>

      <section id="ajuda" className="home-v2-request">
        <div><p className="home-v2-kicker">NÃO ENCONTROU?</p><h2>Peça uma rota para o seu caminho.</h2><p>Conte de onde você sai, para onde precisa chegar e quando. A equipe Marcamar acompanha os pedidos do piloto.</p></div>
        <Link href="/solicitar-rota"><span className="home-v2-coral-button">Solicitar uma rota <ArrowRight size={17} /></span></Link>
      </section>
    </div>
  );
}
