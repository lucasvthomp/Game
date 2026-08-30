import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, CheckCircle2, Waves } from "lucide-react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wrap">
        <div className="footer-utility">
          <div className="footer-utility-copy">
            <span className="footer-utility-mark"><MaritimeIcon variant="anchor" size={20} /></span>
            <div>
              <p className="footer-kicker">MARCAMAR · LITORAL PAULISTA</p>
              <strong>O caminho mais simples é pela água.</strong>
            </div>
          </div>
          <Link href="/lanchas"><span className="footer-primary-link">Encontrar uma lancha <ArrowRight size={15} /></span></Link>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo"><div className="footer-logo-icon"><MaritimeIcon variant="anchor" size={16} /></div><span className="footer-logo-text">Marcamar</span></div>
            <p className="footer-tagline">Travessias locais de lancha, com clareza do ponto de embarque ao desembarque.</p>
            <div className="footer-region"><MaritimeIcon variant="palm" size={16} /> Litoral paulista · São Paulo, Brasil</div>
            <div className="footer-status"><CheckCircle2 size={14} /><span>Serviço em construção contínua</span></div>
          </div>

          <div className="footer-links-group">
            <p className="footer-group-title">Viajar</p>
            <Link href="/lanchas"><span className="footer-link">Encontrar lanchas</span></Link>
            <Link href="/rotas"><span className="footer-link">Rotas e pontos</span></Link>
            <Link href="/viagens"><span className="footer-link">Todas as viagens</span></Link>
            <Link href="/solicitar-rota"><span className="footer-link">Pedir uma rota</span></Link>
          </div>

          <div className="footer-links-group">
            <p className="footer-group-title">Para capitães</p>
            <Link href="/perfil-capitao"><span className="footer-link">Publicar uma lancha</span></Link>
            <Link href="/minha-lancha"><span className="footer-link">Gerenciar viagens</span></Link>
            <Link href="/comercial"><span className="footer-link">Transporte comercial <ArrowUpRight size={12} /></span></Link>
          </div>

          <div className="footer-links-group">
            <p className="footer-group-title">Ajuda</p>
            <Link href="/como-funciona"><span className="footer-link">Como funciona</span></Link>
            <Link href="/seguranca"><span className="footer-link">Segurança</span></Link>
            <Link href="/ajuda"><span className="footer-link">Central de ajuda</span></Link>
            <Link href="/entrar"><span className="footer-link">Entrar na conta</span></Link>
          </div>
        </div>

        <div className="footer-note">
          <Waves size={17} />
          <p><strong>Feito para a costa.</strong> Marcamar conecta passageiros e operadores locais em pontos de embarque reconhecíveis.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {year} Marcamar</span>
          <div className="footer-bottom-links">
            <Link href="/termos"><span className="footer-bottom-link">Termos</span></Link>
            <Link href="/privacidade"><span className="footer-bottom-link">Privacidade</span></Link>
            <Link href="/ajuda"><span className="footer-bottom-link">Ajuda</span></Link>
          </div>
          <span className="footer-bottom-note">Litoral paulista · SP</span>
        </div>
      </div>
    </footer>
  );
}
