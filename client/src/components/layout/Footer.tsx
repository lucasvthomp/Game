import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const columns = [
  {
    title: "Explorar",
    links: [["/lanchas", "Encontrar lanchas"], ["/rotas", "Rotas e pontos"], ["/como-funciona", "Como funciona"], ["/solicitar-rota", "Pedir uma rota"]],
  },
  {
    title: "Conta",
    links: [["/entrar", "Entrar"], ["/cadastro", "Criar conta"], ["/minhas-reservas", "Minhas reservas"], ["/notificacoes", "Notificações"]],
  },
  {
    title: "Ajuda",
    links: [["/seguranca", "Segurança"], ["/ajuda", "Central de ajuda"], ["/comercial", "Transporte comercial"], ["/termos", "Termos"]],
  },
  {
    title: "Capitães",
    links: [["/perfil-capitao", "Ser capitão"], ["/minha-lancha", "Painel da lancha"], ["/recorrentes", "Saídas recorrentes"], ["/privacidade", "Privacidade"]],
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer footer-clean">
      <div className="footer-wrap footer-clean-wrap">
        <div className="footer-grid footer-clean-grid">
          <div className="footer-brand">
            <div className="footer-logo"><span className="footer-logo-icon"><MaritimeIcon variant="anchor" size={17} /></span><span className="footer-logo-text">Marcamar</span></div>
            <p className="footer-tagline">Travessias locais de lancha pela costa de São Paulo.</p>
            <span className="footer-region"><MaritimeIcon variant="palm" size={15} /> São Paulo · Brasil</span>
            <span className="footer-status"><CheckCircle2 size={14} /> Serviço em construção contínua</span>
          </div>
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
            <Link href="/ajuda"><span className="footer-bottom-link">Ajuda</span></Link>
          </div>
          <span className="footer-bottom-note">Litoral paulista</span>
        </div>
      </div>
    </footer>
  );
}
