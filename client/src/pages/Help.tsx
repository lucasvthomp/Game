import { ArrowRight, ChevronDown, LifeBuoy, Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const faqs = [
  { q: "Como encontro uma travessia?", a: "Use a busca da página inicial ou abra Rotas e pontos para escolher uma conexão do litoral. Quando há uma viagem publicada, você verá horário, capacidade e preço." },
  { q: "E se a rota que eu preciso não existir?", a: "Abra Solicitar uma rota e informe origem, destino, data e quantidade de passageiros. O pedido entra no acompanhamento do piloto." },
  { q: "Como combino o embarque?", a: "Depois da reserva, a conversa da viagem ajuda você e o operador a alinhar o ponto de encontro e os próximos passos." },
  { q: "O Marcamar garante a condição do mar?", a: "Não. Condições marítimas mudam. Consulte o operador e as informações oficiais antes de sair e siga as orientações da tripulação." },
  { q: "Posso publicar uma viagem de lancha?", a: "Sim. Comece pelo cadastro de capitão. A equipe revisa o perfil antes que uma viagem seja publicada no piloto." },
];

export default function Help() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(0);
  const visibleFaqs = useMemo(() => faqs.filter((faq) => !query || (faq.q + " " + faq.a).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))), [query]);

  return (
    <div className="content-page-v2 help-page-v2">
      <section className="content-page-v2-hero help-hero-v2">
        <div className="content-page-v2-hero-copy"><div className="home-v2-eyebrow content-eyebrow"><LifeBuoy size={15} /> Ajuda do Marcamar</div><h1>Vamos deixar<br /><em>claro.</em></h1><p>Respostas rápidas sobre rotas, reservas, embarque e como participar do piloto.</p></div>
        <div className="help-hero-panel"><MaritimeIcon variant="wave" size={25} /><strong>Procure uma resposta</strong><span>Ou fale com a equipe pelo seu pedido de rota.</span></div>
      </section>
      <section className="content-page-v2-section help-faq-section">
        <label className="help-search-v2"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar em ajuda" aria-label="Buscar em ajuda" /></label>
        <div className="help-faq-list-v2">{visibleFaqs.map((faq, index) => { const actualIndex = faqs.indexOf(faq); const isOpen = open === actualIndex; return <article key={faq.q} className={"help-faq-item-v2" + (isOpen ? " is-open" : "")}><button type="button" onClick={() => setOpen(isOpen ? -1 : actualIndex)} aria-expanded={isOpen}><span>{faq.q}</span><ChevronDown size={18} /></button>{isOpen && <p>{faq.a}</p>}</article>; })}</div>
        {visibleFaqs.length === 0 && <p className="help-empty-v2">Não encontramos uma resposta com esse termo.</p>}
      </section>
      <section className="content-page-v2-callout"><div className="content-callout-icon"><MaritimeIcon variant="dock" size={22} /></div><div><p className="home-v2-kicker">AINDA PRECISA DE AJUDA?</p><h2>Conte qual rota está faltando.</h2><p>O pedido de rota é o melhor ponto de partida para a equipe entender o que você precisa.</p></div><Link href="/solicitar-rota"><span className="home-v2-coral-button">Solicitar uma rota <ArrowRight size={17} /></span></Link></section>
    </div>
  );
}
