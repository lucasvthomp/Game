import { ArrowRight, ChevronDown, LifeBuoy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const topics = [
  { id: "passageiro", icon: "lancha" as const, title: "Encontrar uma lancha", copy: "Busca, pontos, horários e valores.", href: "/lanchas" },
  { id: "reserva", icon: "clock" as const, title: "Minha reserva", copy: "Alterações, embarque e mensagens.", href: "/minhas-reservas" },
  { id: "capitao", icon: "anchor" as const, title: "Para capitães", copy: "Perfil, saídas e painel da lancha.", href: "/perfil-capitao" },
  { id: "seguranca", icon: "buoy" as const, title: "Segurança", copy: "Cuidados antes de sair pela água.", href: "/seguranca" },
];

const faqs = [
  { category: "passageiro", q: "Como encontro uma travessia?", a: "Use a busca da página inicial ou abra Rotas e pontos. Quando há uma saída publicada, você verá horário, capacidade, preço e quem conduz." },
  { category: "passageiro", q: "E se a rota que eu preciso não existir?", a: "Abra Pedir uma rota e informe origem, destino, data e quantidade de passageiros. O pedido entra no acompanhamento do piloto." },
  { category: "reserva", q: "Como combino o embarque?", a: "Depois da reserva, a conversa da viagem ajuda você e o operador a alinhar o ponto de encontro e os próximos passos." },
  { category: "seguranca", q: "O Marcamar garante a condição do mar?", a: "Não. Condições marítimas mudam. Consulte o operador e as informações oficiais antes de sair e siga as orientações da tripulação." },
  { category: "capitao", q: "Posso publicar uma viagem de lancha?", a: "Sim. Comece pelo cadastro de capitão. A equipe revisa o perfil antes que uma viagem seja publicada no piloto." },
];

export default function Help() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("todos");
  const [open, setOpen] = useState(0);
  const visibleFaqs = useMemo(
    () => faqs.filter((faq) => {
      const matchesTopic = topic === "todos" || faq.category === topic;
      const matchesQuery = !query || (faq.q + " " + faq.a).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"));
      return matchesTopic && matchesQuery;
    }),
    [query, topic],
  );

  return (
    <div className="content-page-v2 help-page-v2 content-page-compact help-dashboard-page">
      <header className="content-page-compact-header">
        <span className="content-page-compact-icon"><LifeBuoy size={23} /></span>
        <div>
          <p className="home-v2-kicker">CENTRAL DE AJUDA</p>
          <h1>Resolva em poucos passos.</h1>
          <p>Encontre uma resposta, veja sua reserva ou fale com o caminho certo.</p>
        </div>
      </header>

      <main className="help-dashboard">
        <section className="help-dashboard-search">
          <div><p className="home-v2-kicker">COM O QUE VOCÊ PRECISA?</p><h2>Busque por assunto.</h2></div>
          <label className="help-search-v2"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: ponto de embarque" aria-label="Buscar em ajuda" /></label>
        </section>

        <section className="help-topic-grid" aria-label="Assuntos de ajuda">
          <button type="button" className={"help-topic-filter" + (topic === "todos" ? " is-active" : "")} onClick={() => setTopic("todos")}><span className="help-topic-filter-icon"><MaritimeIcon variant="wave" size={20} /></span><strong>Todos os assuntos</strong><small>Veja as perguntas mais comuns</small></button>
          {topics.map((item) => (
            <button type="button" key={item.id} className={"help-topic-filter" + (topic === item.id ? " is-active" : "")} onClick={() => setTopic(item.id)}>
              <span className="help-topic-filter-icon"><MaritimeIcon variant={item.icon} size={20} /></span>
              <strong>{item.title}</strong><small>{item.copy}</small>
            </button>
          ))}
        </section>

        <section className="help-dashboard-main">
          <div className="help-faq-panel">
            <div className="help-panel-heading"><div><p className="home-v2-kicker">RESPOSTAS RÁPIDAS</p><h2>Perguntas frequentes</h2></div><span>{visibleFaqs.length} {visibleFaqs.length === 1 ? "resposta" : "respostas"}</span></div>
            <div className="help-faq-list-v2">
              {visibleFaqs.map((faq) => {
                const actualIndex = faqs.indexOf(faq);
                const isOpen = open === actualIndex;
                return (
                  <article key={faq.q} className={"help-faq-item-v2" + (isOpen ? " is-open" : "")}>
                    <button type="button" onClick={() => setOpen(isOpen ? -1 : actualIndex)} aria-expanded={isOpen}><span>{faq.q}</span><ChevronDown size={18} /></button>
                    {isOpen && <p>{faq.a}</p>}
                  </article>
                );
              })}
            </div>
            {visibleFaqs.length === 0 && <p className="help-empty-v2">Não encontramos uma resposta com esse termo.</p>}
          </div>

          <aside className="help-contact-panel">
            <span className="help-contact-icon"><MaritimeIcon variant="dock" size={25} /></span>
            <p className="home-v2-kicker">AINDA PRECISA?</p>
            <h2>Vamos encontrar o próximo passo.</h2>
            <p>Para uma saída que ainda não existe, conte origem, destino e data.</p>
            <Link href="/solicitar-rota"><span className="home-v2-coral-button">Pedir uma rota <ArrowRight size={16} /></span></Link>
            <Link href="/seguranca"><span className="help-contact-link">Ver cuidados de segurança <ArrowRight size={14} /></span></Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
