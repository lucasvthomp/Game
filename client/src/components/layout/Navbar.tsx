import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (href: string, label: string) => (
    <Link href={href}>
      <span
        style={{
          color: location === href ? "#38BDF8" : "#94A3B8",
          fontWeight: location === href ? 600 : 400,
          cursor: "pointer",
          fontSize: 15,
          transition: "color 0.15s",
        }}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <nav style={{ background: "#061629", borderBottom: "1px solid #1E3A5F", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <Link href="/">
          <span style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Anchor size={22} color="#38BDF8" />
            <span style={{ fontWeight: 700, fontSize: 18, color: "#F0F9FF", letterSpacing: "-0.3px" }}>LanchaCarona</span>
          </span>
        </Link>

        {/* Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
          {navLink("/viagens", "Viagens")}
          {user ? (
            <>
              {user.role === "captain" && navLink("/minha-lancha", "Minha Lancha")}
              {navLink("/minhas-reservas", "Minhas Reservas")}
              {navLink("/perfil", "Perfil")}
              <button
                onClick={() => logout()}
                style={{ background: "none", border: "1px solid #1E3A5F", color: "#94A3B8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              {navLink("/entrar", "Entrar")}
              <Link href="/cadastro">
                <span style={{ background: "#0284C7", color: "#fff", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  Cadastrar
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} className="md:hidden">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#061629", borderTop: "1px solid #1E3A5F", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {navLink("/viagens", "Viagens")}
          {user ? (
            <>
              {user.role === "captain" && navLink("/minha-lancha", "Minha Lancha")}
              {navLink("/minhas-reservas", "Minhas Reservas")}
              {navLink("/perfil", "Perfil")}
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#94A3B8", textAlign: "left", cursor: "pointer", fontSize: 15 }}>
                Sair
              </button>
            </>
          ) : (
            <>
              {navLink("/entrar", "Entrar")}
              {navLink("/cadastro", "Cadastrar")}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
