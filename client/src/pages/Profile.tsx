import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Anchor, Calendar, LogOut, ChevronRight, User } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) { navigate("/entrar"); return null; }

  return (
    <div className="profile-page">
      <h1 className="page-title" style={{ marginBottom: 28 }}>Perfil</h1>

      {/* User card */}
      <div className="profile-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div className="profile-avatar">
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{user.fullName[0]}</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#F8FAFC" }}>{user.fullName}</div>
            <div style={{ color: "#475569", fontSize: 13 }}>@{user.username}</div>
            <span style={{ display: "inline-block", marginTop: 5, padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: user.role === "captain" ? "rgba(14,165,233,0.08)" : "rgba(148,163,184,0.08)", color: user.role === "captain" ? "#38BDF8" : "#64748B", border: `1px solid ${user.role === "captain" ? "rgba(14,165,233,0.15)" : "rgba(148,163,184,0.1)"}` }}>
              {user.role === "captain" ? "Capitão" : "Passageiro"}
            </span>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #0D2035", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
            <span style={{ color: "#334155", minWidth: 72 }}>Email</span>
            <span style={{ color: "#94A3B8" }}>{user.email}</span>
          </div>
          {user.phone && (
            <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
              <span style={{ color: "#334155", minWidth: 72 }}>Telefone</span>
              <span style={{ color: "#94A3B8" }}>{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="profile-list">
        {user.role !== "captain" && (
          <Link href="/perfil-capitao">
            <button className="profile-action">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(14,165,233,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Anchor size={18} color="#0EA5E9" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="profile-action-title">Quero ser capitão</div>
                <div className="profile-action-sub">Complete seu perfil e publique viagens</div>
              </div>
              <ChevronRight size={16} color="#334155" />
            </button>
          </Link>
        )}
        {user.role === "captain" && (
          <Link href="/minha-lancha">
            <button className="profile-action">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(14,165,233,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Anchor size={18} color="#0EA5E9" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="profile-action-title">Minha Lancha</div>
                <div className="profile-action-sub">Gerenciar viagens e passageiros</div>
              </div>
              <ChevronRight size={16} color="#334155" />
            </button>
          </Link>
        )}
        <Link href="/minhas-reservas">
          <button className="profile-action">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(14,165,233,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} color="#0EA5E9" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-action-title">Minhas Reservas</div>
              <div className="profile-action-sub">Ver caronas agendadas</div>
            </div>
            <ChevronRight size={16} color="#334155" />
          </button>
        </Link>
        <button className="profile-action profile-action-danger" onClick={async () => { await logout(); navigate("/"); }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={18} color="#F87171" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="profile-action-title" style={{ color: "#F87171" }}>Sair da conta</div>
          </div>
        </button>
      </div>
    </div>
  );
}
