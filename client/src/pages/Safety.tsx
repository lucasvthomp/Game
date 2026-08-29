import { Anchor, ArrowRight, Check, LifeBuoy } from "lucide-react";
import { Link } from "wouter";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const principles = [
  { icon: <MaritimeIcon variant="buoy" size={22} />, title: "Identidade e perfil", copy: "O perfil do operador é a base para entender quem publica a viagem." },
  { icon: <MaritimeIcon variant="lancha" size={22} />, title: "Lancha e capacidade", copy: "Capacidade, descrição e o que está publicado aparecem antes da reserva." },
  { icon: <MaritimeIcon variant="dock" size={22} />, title: "Ponto de embarque", copy: "A conversa da reserva ajuda a alinhar o cais e os próximos passos." },
  { icon: <MaritimeIcon variant="route" size={22} />, title: "Condições marítimas", copy: "Consulte o operador e as fontes oficiais antes de qualquer travessia." },
];

export default function Safety() {
  return (
    <div className="content-page-v2 content-page-safety-v2">
      <section className="content-page-v2-hero">
        <div className="content-page-v2-hero-copy">
          <div className="home-v2-eyebrow content-eyebrow"><LifeBuoy size={15} /> Segurança antes do embarque</div>
          <h1>Clareza é parte<br />da <em>viagem.</em></h1>
          <p>O Marcamar organiza as informações que ajudam passageiros e operadores a tomar decisões melhores no litoral.</p>
          <div className="content-page-v2-actions"><Link href="/rotas"><span className="home-v2-coral-button">Ver rotas e pontos <ArrowRight size={17} /></span></Link><Link href="/ajuda"><span className="content-page-v2-secondary-link">Precisa de ajuda? <ArrowRight size={16} /></span></Link></div>
        </div>
        <div className="safety-hero-panel"><MaritimeIcon variant="wave" size={25} /><strong>Antes de sair</strong><span>Confira rota, horário, operador, capacidade e condições.</span></div>
      </section>

      <section className="content-page-v2-section">
        <div className="content-page-v2-section-heading"><p className="home-v2-kicker">O QUE FICA VISÍVEL</p><h2>Informação para decidir.</h2><p>O piloto foi desenhado para deixar os detalhes importantes no mesmo lugar.</p></div>
        <div className="safety-principles-grid">{principles.map((item) => <article key={item.title} className="safety-principle"><span className="content-step-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      </section>

      <section className="content-page-v2-split safety-guidance-v2">
        <div><p className="home-v2-kicker">RESPONSABILIDADE COMPARTILHADA</p><h2>O app não substitui o operador.</h2><p>As condições podem mudar. Confirme o ponto de encontro, siga as orientações da tripulação, use colete quando indicado e consulte informações marítimas oficiais.</p></div>
        <div className="content-guidance-list"><span><Check size={16} /> Chegue com antecedência ao ponto combinado</span><span><Check size={16} /> Confirme qualquer alteração de horário</span><span><Check size={16} /> Não embarque se as condições parecerem inseguras</span><span><Check size={16} /> Em emergência, procure os serviços oficiais</span></div>
      </section>

      <section className="content-page-v2-callout"><div className="content-callout-icon"><Anchor size={22} /></div><div><p className="home-v2-kicker">PRONTO PARA COMEÇAR?</p><h2>Encontre uma travessia local.</h2><p>Veja as rotas publicadas e escolha o próximo trecho pelo mar.</p></div><Link href="/lanchas"><span className="home-v2-coral-button">Buscar lanchas <ArrowRight size={17} /></span></Link></section>
    </div>
  );
}
