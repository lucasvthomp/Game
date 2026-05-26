import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { User, Anchor, Calendar, LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) { navigate("/entrar"); return null; }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 32 }}>Meu Perfil</h1>

      <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 32, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1E3A5F", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={28} color="#38BDF8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#F0F9FF" }}>{user.fullName}</div>
            <div style={{ color: "#64748B" }}>@{user.username}</div>
            <span style={{ background: user.role === "captain" ? "rgba(56,189,248,0.1)" : "rgba(148,163,184,0.1)", color: user.role === "captain" ? "#38BDF8" : "#94A3B8", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginTop: 4, display: "inline-block" }}>
              {user.role === "captain" ? "Capitão" : "Passageiro"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#94A3B8", fontSize: 15, borderTop: "1px solid #1E3A5F", paddingTop: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "#475569", minWidth: 80 }}>Email</span>
            <span style={{ color: "#E2E8F0" }}>{user.email}</span>
          </div>
          {user.phone && (
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "#475569", minWidth: 80 }}>Telefone</span>
              <span style={{ color: "#E2E8F0" }}>{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {user.role !== "captain" && (
          <Link href="/perfil-capitao">
            <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <Anchor size={20} color="#38BDF8" />
              <div>
                <div style={{ fontWeight: 600, color: "#F0F9FF" }}>Quero ser capitão</div>
                <div style={{ color: "#64748B", fontSize: 13 }}>Complete seu perfil e ofereça caronas</div>
              </div>
            </div>
          </Link>
        )}
        <Link href="/minhas-reservas">
          <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
            <Calendar size={20} color="#38BDF8" />
            <div>
              <div style={{ fontWeight: 600, color: "#F0F9FF" }}>Minhas reservas</div>
              <div style={{ color: "#64748B", fontSize: 13 }}>Ver suas caronas agendadas</div>
            </div>
          </div>
        </Link>
        <button onClick={handleLogout}
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left" }}>
          <LogOut size={20} color="#F87171" />
          <span style={{ fontWeight: 600, color: "#F87171" }}>Sair da conta</span>
        </button>
      </div>
    </div>
  );
}
