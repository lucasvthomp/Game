import { Accessibility, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const commitments = [
  ["Leitura clara", "Textos curtos, contrastes consistentes e foco visível para encontrar o que importa."],
  ["Navegação simples", "O fluxo de busca, reserva e suporte funciona sem depender de gestos complexos."],
  ["Apoio humano", "Se algo não funcionar para você, nossa central ajuda a encontrar outro caminho."],
];

export default function AccessibilityPage() {
  return (
    <div className="content-page-v2 content-page-compact accessibility-page-v2">
      <header className="content-page-compact-header">
        <span className="content-page-compact-icon"><Accessibility size={23} /></span>
        <div>
          <p className="home-v2-kicker">ACESSIBILIDADE</p>
          <h1>Um embarque mais simples para todos.</h1>
          <p>Estamos construindo o Marcamar para ser fácil de perceber, usar e pedir ajuda.</p>
        </div>
      </header>

      <section className="content-page-v2-section accessibility-intro-v2">
        <div className="content-page-v2-section-heading">
          <p className="home-v2-kicker">NOSSO COMPROMISSO</p>
          <h2>Clareza em cada etapa.</h2>
          <p>Do primeiro toque ao ponto de encontro, reduzimos ruído e deixamos as escolhas visíveis.</p>
        </div>
        <div className="accessibility-commitments-grid">
          {commitments.map(([title, copy]) => (
            <article key={title} className="accessibility-commitment">
              <span className="content-step-icon"><MaritimeIcon variant="buoy" size={21} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-page-v2-split accessibility-guidance-v2">
        <div>
          <p className="home-v2-kicker">PRECISA DE AJUDA?</p>
          <h2>Conte o que podemos melhorar.</h2>
          <p>Se você encontrou uma barreira, fale com a equipe. Cada relato ajuda a tornar as travessias mais acessíveis.</p>
        </div>
        <div className="accessibility-actions-v2">
          <span><Check size={16} /> Responderemos pelo canal informado</span>
          <Link href="/ajuda"><span className="home-v2-coral-button">Abrir central de ajuda <ArrowRight size={16} /></span></Link>
        </div>
      </section>
    </div>
  );
}
