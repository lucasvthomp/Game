import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const columns = [
  {
    title: "Descobrir",
    links: [["/lanchas", "Lanchas"], ["/rotas", "Rotas"], ["/viagens", "Viagens"], ["/solicitar-rota", "Pedir rota"], ["/comercial", "Comercial"]],
  },
  {
    title: "Sua conta",
    links: [["/entrar", "Entrar"], ["/cadastro", "Cadastro"], ["/perfil", "Perfil"], ["/minhas-reservas", "Reservas"], ["/notificacoes", "Avisos"]],
  },
  {
    title: "Suporte",
    links: [["/ajuda", "Ajuda"], ["/seguranca", "Segurança"], ["/acessibilidade", "Acessibilidade"], ["/termos", "Termos"], ["/privacidade", "Privacidade"]],
  },
  {
    title: "Para capitães",
    links: [["/perfil-capitao", "Ser capitão"], ["/minha-lancha", "Painel"], ["/recorrentes", "Recorrentes"]],
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer footer-clean">
      <div className="footer-wrap footer-clean-wrap">
        <div className="footer-clean-head">
          <div className="footer-brand">
            <div className="footer-logo"><span className="footer-logo-icon"><MaritimeIcon variant="anchor" size={17} /></span><span className="footer-logo-text">Marcamar</span></div>
            <p className="footer-tagline">Lancha local no litoral paulista.</p>
            <span className="footer-region"><MaritimeIcon variant="palm" size={15} /> São Paulo · Brasil</span>
            <span className="footer-status"><CheckCircle2 size={14} /> Serviço em construção contínua</span>
          </div>
          <div className="footer-clean-note">
            <span className="footer-clean-note-icon"><MaritimeIcon variant="wave" size={18} /></span>
            <div><strong>Escolha o ponto. Veja os detalhes.</strong><span>Escolha o ponto, veja os detalhes e combine o cais.</span></div>
          </div>
        </div>
        <div className="footer-grid footer-clean-grid">
          {columns.map((column) => (
            <div className="footer-links-group" key={column.title}>
              <p className="footer-group-title">{column.title}</p>
              {column.links.map(([href, label]) => <Link key={href} href={href}><span className="footer-link">{label}</span></Link>)}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner footer-clean-bottom">
          <span>© {year} Marcamar</span>
          <div className="footer-bottom-links">
            <Link href="/termos"><span className="footer-bottom-link">Termos</span></Link>
            <Link href="/privacidade"><span className="footer-bottom-link">Privacidade</span></Link>
            <Link href="/acessibilidade"><span className="footer-bottom-link">Acessibilidade</span></Link>
            <Link href="/ajuda"><span className="footer-bottom-link">Ajuda</span></Link>
          </div>
          <span className="footer-bottom-note">Litoral paulista</span>
        </div>
      </div>
    </footer>
  );
}
