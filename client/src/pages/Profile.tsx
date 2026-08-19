import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Anchor, Calendar, LogOut, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BoatMediaCluster } from "@/components/layout/BoatMediaCluster";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const updateMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/me", { fullName, phone }),
    onSuccess: () => { setEditing(false); qc.invalidateQueries({ queryKey: ["/api/me"] }); },
  });

  if (!user) { navigate("/entrar"); return null; }

  return (
    <div className="profile-page">
      <div className="profile-page-heading">
        <div>
          <h1 className="page-title" style={{ marginBottom: 8 }}>Perfil</h1>
          <p className="page-sub">Seu ponto de partida para viajar e publicar na água.</p>
        </div>
        <BoatMediaCluster variant="compact" />
      </div>

      {/* User card */}
      <div className="profile-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div className="profile-avatar">
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{user.fullName[0]}</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text1)" }}>{user.fullName}</div>
            <div style={{ color: "var(--text2)", fontSize: 13 }}>@{user.username}</div>
            <span style={{ display: "inline-block", marginTop: 5, padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: user.role === "captain" ? "color-mix(in srgb, var(--boat) 10%, transparent)" : "var(--surface)", color: user.role === "captain" ? "var(--boat)" : "var(--text2)", border: `1px solid ${user.role === "captain" ? "color-mix(in srgb, var(--boat) 22%, transparent)" : "var(--border)"}` }}>
              {user.role === "captain" ? "Capitão" : "Passageiro"}
            </span>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
            <span style={{ color: "var(--text3)", minWidth: 72 }}>Email</span>
            <span style={{ color: "var(--text2)" }}>{user.email}</span>
          </div>
          {user.phone && !editing && (
            <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
              <span style={{ color: "var(--text3)", minWidth: 72 }}>Telefone</span>
              <span style={{ color: "var(--text2)" }}>{user.phone}</span>
            </div>
          )}
        </div>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome completo" className="form-input" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone / WhatsApp" className="form-input" />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => updateMutation.mutate()} className="btn-car-solid" style={{ padding: "8px 18px", fontSize: 13 }} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary" style={{ padding: "8px 18px", fontSize: 13 }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setFullName(user.fullName); setPhone(user.phone || ""); setEditing(true); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "var(--text2)", cursor: "pointer", marginTop: 8 }}>
            Editar perfil
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="profile-list">
        {user.role !== "captain" && (
          <Link href="/perfil-capitao">
            <button className="profile-action">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "color-mix(in srgb, var(--boat) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Anchor size={18} color="var(--boat)" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="profile-action-title">Quero ser capitão</div>
                <div className="profile-action-sub">Complete seu perfil e publique viagens</div>
              </div>
              <ChevronRight size={16} color="var(--text3)" />
            </button>
          </Link>
        )}
        {user.role === "captain" && (
          <Link href="/minha-lancha">
            <button className="profile-action">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "color-mix(in srgb, var(--boat) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Anchor size={18} color="var(--boat)" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="profile-action-title">Minha Lancha</div>
                <div className="profile-action-sub">Gerenciar viagens e passageiros</div>
              </div>
              <ChevronRight size={16} color="var(--text3)" />
            </button>
          </Link>
        )}
        <Link href="/minhas-reservas">
          <button className="profile-action">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "color-mix(in srgb, var(--boat) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} color="var(--boat)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-action-title">Minhas Reservas</div>
              <div className="profile-action-sub">Ver caronas agendadas</div>
            </div>
            <ChevronRight size={16} color="var(--text3)" />
          </button>
        </Link>
        <button className="profile-action profile-action-danger" onClick={async () => { await logout(); navigate("/"); }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "color-mix(in srgb, var(--red) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={18} color="var(--red)" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="profile-action-title" style={{ color: "var(--red)" }}>Sair da conta</div>
          </div>
        </button>
      </div>
    </div>
  );
}

