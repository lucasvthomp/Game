import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const exploreLinks = [
  ["/lanchas", "Encontrar lanchas"],
  ["/rotas", "Rotas e pontos"],
  ["/como-funciona", "Como funciona"],
  ["/solicitar-rota", "Pedir uma rota"],
] as const;

const accountLinks = [
  ["/entrar", "Entrar"],
  ["/cadastro", "Criar conta"],
  ["/minhas-reservas", "Minhas reservas"],
  ["/notificacoes", "Notificações"],
] as const;

const supportLinks = [
  ["/seguranca", "Segurança"],
  ["/ajuda", "Central de ajuda"],
  ["/comercial", "Transporte comercial"],
  ["/termos", "Termos"],
  ["/privacidade", "Privacidade"],
] as const;

const captainLinks = [
  ["/perfil-capitao", "Ser capitão"],
  ["/minha-lancha", "Painel da lancha"],
  ["/recorrentes", "Saídas recorrentes"],
] as const;

function FooterLinks({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div className="footer-links-group">
      <p className="footer-group-title">{title}</p>
      {links.map(([href, label]) => <Link key={href} href={href}><span className="footer-link">{label}</span></Link>)}
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer footer-clean">
      <div className="footer-wrap footer-clean-wrap">
        <div className="footer-utility footer-clean-utility">
          <div className="footer-utility-copy">
            <span className="footer-utility-mark"><MaritimeIcon variant="lancha" size={22} /></span>
            <div>
              <p className="footer-kicker">PELA COSTA, COM CLAREZA</p>
              <strong>O próximo embarque começa aqui.</strong>
            </div>
          </div>
          <Link href="/lanchas"><span className="footer-primary-link">Encontrar uma saída <ArrowRight size={15} /></span></Link>
        </div>

        <div className="footer-grid footer-clean-grid">
          <div className="footer-brand">
            <div className="footer-logo"><span className="footer-logo-icon"><MaritimeIcon variant="anchor" size={17} /></span><span className="footer-logo-text">Marcamar</span></div>
            <p className="footer-tagline">Travessias locais de lancha, do ponto de embarque ao desembarque.</p>
            <span className="footer-region"><MaritimeIcon variant="palm" size={15} /> São Paulo · Brasil</span>
            <span className="footer-status"><CheckCircle2 size={14} /> Serviço em construção contínua</span>
          </div>

          <FooterLinks title="Explorar" links={exploreLinks} />
          <FooterLinks title="Sua conta" links={accountLinks} />
          <FooterLinks title="Ajuda" links={supportLinks} />
          <FooterLinks title="Para capitães" links={captainLinks} />
        </div>

        <div className="footer-note footer-clean-note">
          <MaritimeIcon variant="wave" size={18} />
          <p><strong>Feito para a costa.</strong> Os pontos e horários são publicados por operadores locais.</p>
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
