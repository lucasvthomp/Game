import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Menu, X, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    // Light warm-minimal is the default (no attribute). Dark adds data-theme="dark".
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const role = user?.role;
  const isCaptain = role === "captain" || role === "both";
  const isDriver  = role === "driver"  || role === "both";

  const links = [
    { href: "/lanchas",   label: "Lancha" },
    { href: "/recorrentes", label: "Recorrentes" },
    { href: "/caronas",   label: "Carro · futuro" },
    ...(isCaptain ? [{ href: "/minha-lancha", label: "Minha Lancha" }] : []),
    ...(isDriver  ? [{ href: "/meu-carro",    label: "Meu Carro"    }] : []),
    ...(user      ? [{ href: "/minhas-reservas", label: "Reservas"  }] : []),
  ];

  return (
    <nav className="nav-root">
      <div className="brazil-stripe" style={{ opacity: 0.5 }} />
      <div className="nav-inner">
        <Link href="/">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <Anchor size={14} color="#fff" />
            </div>
            <span className="nav-logo-text">Marcamar</span>
          </div>
        </Link>

        <div className="nav-links hidden md-flex">
          {links.map(l => (
            <Link key={l.href} href={l.href}>
              <span className={`nav-link ${location === l.href ? "active" : ""}`}>{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-auth hidden md-flex">
          <button
            className="nav-theme-btn"
            onClick={() => setDark(d => !d)}
            title={dark ? "Modo claro" : "Modo escuro"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

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

        <div className="hidden md-flex" style={{ display: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="md-hidden">
          <button className="nav-theme-btn" onClick={() => setDark(d => !d)}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="nav-hamburger" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
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
            <button className="nav-mobile-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "var(--text2)", cursor: "pointer" }}
              onClick={() => { logout(); setOpen(false); }}>Sair</button>
          ) : (
            <div className="nav-mobile-actions">
              <Link href="/entrar"><span className="nav-mobile-btn" onClick={() => setOpen(false)}>Entrar</span></Link>
              <Link href="/cadastro"><span className="nav-mobile-btn" style={{ background: "var(--boat)", color: "#fff", fontWeight: 700 }} onClick={() => setOpen(false)}>Cadastrar</span></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
