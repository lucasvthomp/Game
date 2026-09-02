import { ArrowRight, Check, LifeBuoy } from "lucide-react";
import { Link } from "wouter";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const principles = [
  { icon: <MaritimeIcon variant="shield" size={22} />, title: "Perfil do operador", copy: "Veja quem publicou a saída antes de reservar." },
  { icon: <MaritimeIcon variant="lancha" size={22} />, title: "Lancha e capacidade", copy: "Capacidade, descrição e condições aparecem antes do embarque." },
  { icon: <MaritimeIcon variant="dock" size={22} />, title: "Ponto de embarque", copy: "Alinhe o cais e os próximos passos pela conversa da viagem." },
  { icon: <MaritimeIcon variant="route" size={22} />, title: "Condições do mar", copy: "Consulte o operador e fontes oficiais antes de sair." },
  { icon: <MaritimeIcon variant="shield" size={22} />, title: "Suporte quando importa", copy: "Tenha um canal claro para dúvidas, ajustes e incidentes." },
];

export default function Safety() {
  return (
    <div className="content-page-v2 content-page-safety-v2 content-page-compact">
      <header className="content-page-compact-header">
        <span className="content-page-compact-icon"><LifeBuoy size={23} /></span>
        <div>
          <p className="home-v2-kicker">SEGURANÇA</p>
          <h1>Segurança que começa antes do cais.</h1>
          <p>As informações essenciais para decidir com calma no litoral.</p>
        </div>
      </header>

      <section className="content-page-v2-section">
        <div className="content-page-v2-section-heading"><p className="home-v2-kicker">O QUE FICA VISÍVEL</p><h2>Informação para decidir.</h2><p>O Marcamar deixa os detalhes importantes no mesmo lugar.</p></div>
        <div className="safety-principles-grid">{principles.map((item) => <article key={item.title} className="safety-principle"><span className="content-step-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      </section>

      <section className="content-page-v2-split safety-guidance-v2">
        <div><p className="home-v2-kicker">RESPONSABILIDADE COMPARTILHADA</p><h2>O app não substitui o operador.</h2><p>As condições podem mudar. Confirme o ponto de encontro, siga as orientações da tripulação, use colete quando indicado e consulte informações marítimas oficiais.</p></div>
        <div className="content-guidance-list"><span><Check size={16} /> Chegue com antecedência ao ponto combinado</span><span><Check size={16} /> Confirme qualquer alteração de horário</span><span><Check size={16} /> Não embarque se as condições parecerem inseguras</span><span><Check size={16} /> Em emergência, procure os serviços oficiais</span></div>
      </section>

      <section className="content-page-v2-callout safety-service-cta"><div className="content-callout-icon"><MaritimeIcon variant="shield" size={23} /></div><div><p className="home-v2-kicker">PRONTO PARA COMEÇAR?</p><h2>Encontre uma travessia local.</h2><p>Veja as saídas publicadas e escolha seu próximo trecho.</p></div><Link href="/lanchas"><span className="home-v2-coral-button">Buscar lanchas <ArrowRight size={17} /></span></Link></section>
    </div>
  );
}
