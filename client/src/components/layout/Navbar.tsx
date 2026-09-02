import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, Moon, Sun, Bell, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

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

  const { data: notificationData } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => apiRequest("GET", "/api/notifications"),
    enabled: !!user,
  });
  const unreadNotifications = (notificationData?.notifications || []).filter((item: any) => !item.readAt).length;

  const role = user?.role;
  const isCaptain = role === "captain" || role === "both";
  const links = [
    { href: "/rotas", label: "Rotas" },
    { href: "/comercial", label: "Comercial" },
    { href: "/ajuda", label: "Ajuda" },
    ...(isCaptain ? [{ href: "/minha-lancha", label: "Minha lancha" }] : []),
    ...(user ? [{ href: "/minhas-reservas", label: "Reservas" }] : []),
  ];
  const isActive = (href: string) => href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <nav className="nav-root">
      <div className="brazil-stripe" style={{ opacity: 0.5 }} />
      <div className="nav-inner">
        <Link href="/"><div className="nav-logo"><div className="nav-logo-icon"><MaritimeIcon variant="anchor" size={17} aria-hidden="true" /></div><span className="nav-logo-meta"><span className="nav-logo-text">Marcamar</span></span></div></Link>
        <div className="nav-links hidden md-flex">{links.map((link) => <Link key={link.href} href={link.href}><span className={"nav-link " + (isActive(link.href) ? "active" : "")} aria-current={isActive(link.href) ? "page" : undefined}>{link.label}</span></Link>)}</div>
        <div className="nav-auth hidden md-flex">
          <button className="nav-theme-btn" onClick={() => setDark((value) => !value)} title={dark ? "Modo claro" : "Modo escuro"} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>{user && <Link href="/notificacoes"><span className="nav-notification-link" title="Notificações" aria-label="Notificações"><Bell size={17} />{unreadNotifications > 0 && <span className="nav-notification-count">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}</span></Link>}
          {user ? <><Link href="/perfil"><div className="nav-avatar nav-account"><div className="nav-avatar-dot">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.fullName[0]}</div><span className="nav-avatar-copy"><strong>{user.fullName.split(" ")[0]}</strong><small>{isCaptain ? "Capitão" : "Passageiro"}</small></span><ChevronDown size={14} /></div></Link><button className="nav-logout" onClick={() => logout()}>Sair</button></> : <><Link href="/entrar"><span className="nav-login">Entrar</span></Link><Link href="/cadastro"><span className="nav-signup">Cadastrar</span></Link></>}
        </div>
        <div className="hidden md-flex" style={{ display: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="md-hidden"><button className="nav-theme-btn" onClick={() => setDark((value) => !value)} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}>{dark ? <Sun size={16} /> : <Moon size={22} />}</button><button className="nav-hamburger" onClick={() => setOpen((value) => !value)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      {open && <div id="mobile-navigation" className="nav-mobile">{user && <div className="nav-mobile-profile"><div className="nav-avatar-dot">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.fullName[0]}</div><span><strong>{user.fullName}</strong><small>{isCaptain ? "Capitão Marcamar" : "Passageiro"}</small></span></div>}{links.map((link) => <Link key={link.href} href={link.href}><span className={"nav-mobile-link " + (isActive(link.href) ? "active" : "")} aria-current={isActive(link.href) ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</span></Link>)}{user && <><Link href="/perfil"><span className="nav-mobile-link" onClick={() => setOpen(false)}>Perfil</span></Link><Link href="/notificacoes"><span className="nav-mobile-link" onClick={() => setOpen(false)}>Notificações{unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}</span></Link></>}<div className="nav-mobile-divider" />{user ? <button className="nav-mobile-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "var(--text2)", cursor: "pointer" }} onClick={() => { logout(); setOpen(false); }}>Sair</button> : <div className="nav-mobile-actions"><Link href="/entrar"><span className="nav-mobile-btn" onClick={() => setOpen(false)}>Entrar</span></Link><Link href="/cadastro"><span className="nav-mobile-btn" style={{ background: "var(--boat)", color: "#fff", fontWeight: 700 }} onClick={() => setOpen(false)}>Cadastrar</span></Link></div>}</div>}
    </nav>
  );
}
