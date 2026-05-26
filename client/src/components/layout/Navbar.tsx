import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => location === href;

  return (
    <nav style={{ background: "rgba(2,13,24,0.92)", borderBottom: "1px solid #0F2336", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        {/* Logo */}
        <Link href="/">
          <span style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #0369A1, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Anchor size={17} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#F0F9FF", letterSpacing: "-0.5px" }}>LanchaCarona</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
          <NavLink href="/viagens" active={isActive("/viagens")} label="Viagens" />
          {user && user.role === "captain" && <NavLink href="/minha-lancha" active={isActive("/minha-lancha")} label="Minha Lancha" />}
          {user && <NavLink href="/minhas-reservas" active={isActive("/minhas-reservas")} label="Reservas" />}
        </div>

        {/* Desktop auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
          {user ? (
            <>
              <Link href="/perfil">
                <span style={{ display: "flex", alignItems: "center", gap: 8, background: "#071829", border: "1px solid #1E3A5F", borderRadius: 10, padding: "7px 14px", cursor: "pointer" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                    {user.fullName[0]}
                  </div>
                  <span style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>{user.fullName.split(" ")[0]}</span>
                </span>
              </Link>
              <button onClick={() => logout()} style={{ background: "none", border: "none", color: "#334155", fontSize: 13, cursor: "pointer", padding: "7px 10px" }}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/entrar">
                <span style={{ color: "#64748B", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "7px 12px" }}>Entrar</span>
              </Link>
              <Link href="/cadastro">
                <span style={{ background: "#0284C7", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-block" }}>
                  Cadastrar
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 6 }} className="md:hidden">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#040F1C", borderTop: "1px solid #0F2336", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { href: "/viagens", label: "Viagens" },
            ...(user?.role === "captain" ? [{ href: "/minha-lancha", label: "Minha Lancha" }] : []),
            ...(user ? [{ href: "/minhas-reservas", label: "Minhas Reservas" }, { href: "/perfil", label: "Perfil" }] : []),
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <span onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 10, color: isActive(item.href) ? "#38BDF8" : "#64748B", fontWeight: isActive(item.href) ? 700 : 500, fontSize: 15, cursor: "pointer", background: isActive(item.href) ? "rgba(56,189,248,0.06)" : "none" }}>
                {item.label}
              </span>
            </Link>
          ))}
          <div style={{ borderTop: "1px solid #0F2336", marginTop: 8, paddingTop: 8 }}>
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#475569", fontSize: 15, cursor: "pointer", padding: "10px 14px", width: "100%", textAlign: "left" }}>
                Sair
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/entrar"><span onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center", background: "#071829", border: "1px solid #1E3A5F", color: "#94A3B8", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, display: "block" }}>Entrar</span></Link>
                <Link href="/cadastro"><span onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center", background: "#0284C7", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, display: "block" }}>Cadastrar</span></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href}>
      <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 8, color: active ? "#38BDF8" : "#475569", fontWeight: active ? 700 : 500, fontSize: 14, cursor: "pointer", background: active ? "rgba(56,189,248,0.08)" : "none", transition: "all 0.15s" }}>
        {label}
      </span>
    </Link>
  );
}
