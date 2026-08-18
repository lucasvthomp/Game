import { Link } from "wouter";
import { Anchor } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Anchor size={12} color="#fff" />
            </div>
            <span className="footer-logo-text">Marcamar</span>
          </div>
          <p className="footer-tagline">
            Transporte compartilhado na água, começando por um piloto regional no litoral paulista.
          </p>
        </div>

        <div className="footer-links-group">
          <p className="footer-group-title">Encontrar uma viagem</p>
          <Link href="/lanchas"><span className="footer-link">Travessias de lancha</span></Link>
          <Link href="/recorrentes"><span className="footer-link">Rotas recorrentes</span></Link>
          <Link href="/viagens"><span className="footer-link">Todas as viagens</span></Link>
        </div>

        <div className="footer-links-group">
          <p className="footer-group-title">Oferecer uma viagem</p>
          <Link href="/perfil-capitao"><span className="footer-link">Cadastro de capitão</span></Link>
          <Link href="/minha-lancha"><span className="footer-link">Painel do capitão</span></Link>
        </div>

        <div className="footer-links-group">
          <p className="footer-group-title">Conta</p>
          <Link href="/cadastro"><span className="footer-link">Criar conta</span></Link>
          <Link href="/entrar"><span className="footer-link">Entrar</span></Link>
          <Link href="/perfil"><span className="footer-link">Meu perfil</span></Link>
          <Link href="/minhas-reservas"><span className="footer-link">Minhas reservas</span></Link>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {year} Marcamar. Todos os direitos reservados.</span>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link">Termos de uso</a>
            <a href="#" className="footer-bottom-link">Privacidade</a>
            <a href="#" className="footer-bottom-link">Ajuda</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

