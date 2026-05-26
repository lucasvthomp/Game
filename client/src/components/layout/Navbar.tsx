import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/viagens", label: "Viagens" },
    ...(user?.role === "captain" ? [{ href: "/minha-lancha", label: "Minha Lancha" }] : []),
    ...(user ? [{ href: "/minhas-reservas", label: "Reservas" }] : []),
  ];

  return (
    <nav className="nav-root">
      <div className="nav-inner">
        <Link href="/">
          <div className="nav-logo">
            <div className="nav-logo-icon"><Anchor size={16} color="#fff" /></div>
            <span className="nav-logo-text">LanchaCarona</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nav-links hidden md-flex">
          {links.map(l => (
            <Link key={l.href} href={l.href}>
              <span className={`nav-link ${location === l.href ? "active" : ""}`}>{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="nav-auth hidden md-flex">
          {user ? (
            <>
              <Link href="/perfil">
                <div className="nav-avatar">
                  <div className="nav-avatar-dot">{user.fullName[0]}</div>
                  <span>{user.fullName.split(" ")[0]}</span>
                </div>
              </Link>
              <button className="nav-logout" onClick={() => logout()}>Sair</button>
            </>
          ) : (
            <>
              <Link href="/entrar"><span className="nav-login">Entrar</span></Link>
              <Link href="/cadastro"><span className="nav-signup">Cadastrar</span></Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger md-hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href}>
              <span className={`nav-mobile-link ${location === l.href ? "active" : ""}`} onClick={() => setOpen(false)}>{l.label}</span>
            </Link>
          ))}
          {user && (
            <Link href="/perfil">
              <span className="nav-mobile-link" onClick={() => setOpen(false)}>Perfil</span>
            </Link>
          )}
          <div className="nav-mobile-divider" />
          {user ? (
            <button className="nav-mobile-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "#475569", cursor: "pointer" }}
              onClick={() => { logout(); setOpen(false); }}>Sair</button>
          ) : (
            <div className="nav-mobile-actions">
              <Link href="/entrar"><span className="nav-mobile-btn" style={{ background: "#071525", border: "1px solid #0D2035", color: "#94A3B8" }} onClick={() => setOpen(false)}>Entrar</span></Link>
              <Link href="/cadastro"><span className="nav-mobile-btn" style={{ background: "#0284C7", color: "#fff", fontWeight: 700 }} onClick={() => setOpen(false)}>Cadastrar</span></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
