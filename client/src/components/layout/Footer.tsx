import { Link } from "wouter";
import { Anchor, ArrowUpRight, Waves } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-spotlight">
        <div className="footer-spotlight-copy">
          <span className="footer-spotlight-mark"><Waves size={18} /></span>
          <div><p className="footer-spotlight-kicker">MARCAMAR · LITORAL EM MOVIMENTO</p><h2>O litoral fica mais perto pela água.</h2></div>
        </div>
        <Link href="/lanchas"><span className="footer-spotlight-link">Encontrar uma lancha <ArrowUpRight size={15} /></span></Link>
      </div>
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo"><div className="footer-logo-icon"><Anchor size={13} color="#fff" /></div><span className="footer-logo-text">Marcamar</span></div>
          <p className="footer-tagline">Travessias locais de lancha, com clareza do ponto de embarque ao desembarque.</p>
          <div className="footer-region"><Waves size={14} /> Litoral paulista · São Paulo, Brasil</div>
        </div>
        <div className="footer-links-group"><p className="footer-group-title">Viajar</p><Link href="/lanchas"><span className="footer-link">Encontrar lanchas</span></Link><Link href="/rotas"><span className="footer-link">Rotas e pontos</span></Link><Link href="/viagens"><span className="footer-link">Todas as viagens</span></Link><Link href="/comercial"><span className="footer-link">Comercial <ArrowUpRight size={12} /></span></Link></div>
        <div className="footer-links-group"><p className="footer-group-title">Confiar</p><Link href="/como-funciona"><span className="footer-link">Como funciona</span></Link><Link href="/seguranca"><span className="footer-link">Segurança</span></Link><Link href="/ajuda"><span className="footer-link">Central de ajuda</span></Link></div>
        <div className="footer-links-group"><p className="footer-group-title">Sua conta</p><Link href="/cadastro"><span className="footer-link">Criar conta</span></Link><Link href="/entrar"><span className="footer-link">Entrar</span></Link><Link href="/perfil"><span className="footer-link">Perfil</span></Link><Link href="/minhas-reservas"><span className="footer-link">Minhas reservas</span></Link></div>
      </div>
      <div className="footer-bottom"><div className="footer-bottom-inner"><span>© {year} Marcamar</span><div className="footer-bottom-links"><Link href="/termos"><span className="footer-bottom-link">Termos</span></Link><Link href="/privacidade"><span className="footer-bottom-link">Privacidade</span></Link><Link href="/ajuda"><span className="footer-bottom-link">Ajuda</span></Link></div><span className="footer-bottom-note">Feito para a costa.</span></div></div>
    </footer>
  );
}
