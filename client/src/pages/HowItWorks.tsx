import { ArrowRight, Check, Waves } from "lucide-react";
import { Link } from "wouter";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const passengerSteps = [
  { number: "01", icon: <MaritimeIcon variant="route" size={22} />, title: "Escolha o trecho", copy: "Busque a saída, a chegada, a data e quantas pessoas vão embarcar." },
  { number: "02", icon: <MaritimeIcon variant="buoy" size={22} />, title: "Confira a viagem", copy: "Compare horário, capacidade, preço e as informações publicadas pelo operador." },
  { number: "03", icon: <MaritimeIcon variant="dock" size={22} />, title: "Combine o cais", copy: "Depois da reserva, use a conversa da viagem para alinhar o ponto de encontro." },
];

export default function HowItWorks() {
  return (
    <div className="content-page-v2 content-page-how-v2 content-page-compact">
      <header className="content-page-compact-header">
        <span className="content-page-compact-icon"><Waves size={23} /></span>
        <div>
          <p className="home-v2-kicker">COMO FUNCIONA</p>
          <h1>Do ponto ao embarque.</h1>
          <p>Escolha uma saída, confira os detalhes e combine o cais com tranquilidade.</p>
        </div>
      </header>

      <section className="content-page-v2-section">
        <div className="content-page-v2-section-heading"><p className="home-v2-kicker">PARA PASSAGEIROS</p><h2>Três passos simples.</h2><p>Você sabe o que procurar e o que esperar em cada etapa.</p></div>
        <div className="content-step-grid-v2">
          {passengerSteps.map((step) => <article key={step.number} className="content-step-v2"><span className="content-step-number">{step.number}</span><span className="content-step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}
        </div>
      </section>

      <section className="content-page-v2-split">
        <div><p className="home-v2-kicker">PARA OPERADORES</p><h2>Publique o que você já faz.</h2><p>Capitães independentes podem apresentar a rota, a capacidade e os detalhes que ajudam uma pessoa a decidir com segurança.</p><Link href="/perfil-capitao"><span className="content-page-v2-secondary-link">Conhecer o cadastro de capitão <ArrowRight size={16} /></span></Link></div>
        <div className="content-check-list"><span><Check size={16} /> Rota e horário publicados</span><span><Check size={16} /> Capacidade da lancha visível</span><span><Check size={16} /> Conversa depois da reserva</span><span><Check size={16} /> Verificação como camada do piloto</span></div>
      </section>

      <section className="content-page-v2-callout"><div className="content-callout-icon"><MaritimeIcon variant="buoy" size={22} /></div><div><p className="home-v2-kicker">NÃO ENCONTROU?</p><h2>Peça a rota que falta.</h2><p>Os pedidos ajudam a descobrir quais conexões precisam existir no próximo trecho do piloto.</p></div><Link href="/solicitar-rota"><span className="home-v2-coral-button">Solicitar uma rota <ArrowRight size={17} /></span></Link></section>
    </div>
  );
}
