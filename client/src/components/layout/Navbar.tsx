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
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const role = user?.role;
  const isCaptain = role === "captain" || role === "both";
  const links = [
    { href: "/#como-funciona", label: "Como funciona" },
    { href: "/rotas", label: "Rotas e pontos" },
    { href: "/#seguranca", label: "Segurança" },
    { href: "/#ajuda", label: "Ajuda" },
    ...(isCaptain ? [{ href: "/minha-lancha", label: "Minha Lancha" }] : []),
    ...(user ? [{ href: "/minhas-reservas", label: "Reservas" }] : []),
  ];
  const isActive = (href: string) => href === "/rotas" ? location === href : href.startsWith("/#") && location === "/";

  return (
    <nav className="nav-root">
      <div className="brazil-stripe" style={{ opacity: 0.5 }} />
      <div className="nav-inner">
        <Link href="/"><div className="nav-logo"><div className="nav-logo-icon"><Anchor size={14} color="#fff" /></div><span className="nav-logo-text">Marcamar</span></div></Link>
        <div className="nav-links hidden md-flex">{links.map((link) => <Link key={link.href} href={link.href}><span className={"nav-link " + (isActive(link.href) ? "active" : "")}>{link.label}</span></Link>)}</div>
        <div className="nav-auth hidden md-flex">
          <button className="nav-theme-btn" onClick={() => setDark((value) => !value)} title={dark ? "Modo claro" : "Modo escuro"}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          {user ? <><Link href="/perfil"><div className="nav-avatar"><div className="nav-avatar-dot">{user.fullName[0]}</div><span>{user.fullName.split(" ")[0]}</span></div></Link><button className="nav-logout" onClick={() => logout()}>Sair</button></> : <><Link href="/entrar"><span className="nav-login">Entrar</span></Link><Link href="/cadastro"><span className="nav-signup">Cadastrar</span></Link></>}
        </div>
        <div className="hidden md-flex" style={{ display: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="md-hidden"><button className="nav-theme-btn" onClick={() => setDark((value) => !value)}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button><button className="nav-hamburger" onClick={() => setOpen((value) => !value)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      {open && <div className="nav-mobile">{links.map((link) => <Link key={link.href} href={link.href}><span className={"nav-mobile-link " + (isActive(link.href) ? "active" : "")} onClick={() => setOpen(false)}>{link.label}</span></Link>)}{user && <Link href="/perfil"><span className="nav-mobile-link" onClick={() => setOpen(false)}>Perfil</span></Link>}<div className="nav-mobile-divider" />{user ? <button className="nav-mobile-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "var(--text2)", cursor: "pointer" }} onClick={() => { logout(); setOpen(false); }}>Sair</button> : <div className="nav-mobile-actions"><Link href="/entrar"><span className="nav-mobile-btn" onClick={() => setOpen(false)}>Entrar</span></Link><Link href="/cadastro"><span className="nav-mobile-btn" style={{ background: "var(--boat)", color: "#fff", fontWeight: 700 }} onClick={() => setOpen(false)}>Cadastrar</span></Link></div>}</div>}
    </nav>
  );
}
