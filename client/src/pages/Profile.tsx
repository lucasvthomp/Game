import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { BadgeCheck, Bell, Camera, Calendar, ChevronRight, LogOut, Upload } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MaritimeIcon } from "@/components/MaritimeIcon";

export default function Profile() {
  const { user, logout, refetch } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarState, setAvatarState] = useState<"idle" | "uploading" | "error">("idle");
  const [avatarError, setAvatarError] = useState("");
  const isCaptain = user?.role === "captain" || user?.role === "both";
  const { data: captainData } = useQuery({
    queryKey: ["/api/captain/profile"],
    queryFn: () => apiRequest("GET", "/api/captain/profile"),
    enabled: !!user && isCaptain,
    retry: false,
  });
  const captainVerified = Boolean(captainData?.profile?.verified);

  const updateMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/me", { fullName, phone }),
    onSuccess: async () => { setEditing(false); await refetch(); qc.invalidateQueries({ queryKey: ["/api/me"] }); },
  });

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarState("error");
      setAvatarError("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarState("error");
      setAvatarError("A imagem precisa ter no máximo 5 MB.");
      return;
    }
    setAvatarState("uploading");
    setAvatarError("");
    try {
      const body = new FormData();
      body.append("avatar", file);
      const response = await fetch("/api/me/avatar", { method: "POST", body, credentials: "include" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar sua foto.");
      await refetch();
      setAvatarState("idle");
    } catch (error: any) {
      setAvatarState("error");
      setAvatarError(error.message || "Não foi possível salvar sua foto.");
    }
  };

  if (!user) { navigate("/entrar"); return null; }

  return (
    <div className="profile-page">
      <div className="profile-page-heading">
        <div>
          <p className="profile-page-kicker"><MaritimeIcon variant="anchor" size={15} /> SUA CONTA</p>
          <h1 className="page-title" style={{ marginBottom: 8 }}>Perfil</h1>
          <p className="page-sub">Sua identidade, reservas e acesso de capitão em um só lugar.</p>
        </div>
      </div>

      <div className="profile-card profile-card-identity" style={{ marginBottom: 16 }}>
        <div className="profile-card-heading">
          <span><MaritimeIcon variant="anchor" size={15} /> IDENTIDADE MARCAMAR</span>
          <small>Visível nos pedidos e reservas</small>
        </div>
        <div className="profile-identity-row">
          <div className="profile-avatar profile-avatar-large">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={`Foto de ${user.fullName}`} /> : <span>{user.fullName[0]}</span>}
            <label className="profile-avatar-edit" htmlFor="profile-avatar-input" title="Trocar foto" aria-label="Trocar foto de perfil">
              <Camera size={13} />
            </label>
            <input id="profile-avatar-input" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} />
          </div>
          <div className="profile-identity-copy">
            <div className="profile-name-line"><strong>{user.fullName}</strong>{captainVerified && <span className="profile-verified"><BadgeCheck size={14} /> Capitã verificada</span>}</div>
            <div className="profile-username">@{user.username}</div>
            <div className="profile-role-pill"><MaritimeIcon variant="anchor" size={12} /> {isCaptain ? "Capitão" : "Passageiro"}</div>
            <label className="profile-upload-button" htmlFor="profile-avatar-input"><Upload size={13} /> {avatarState === "uploading" ? "Enviando…" : "Adicionar foto"}</label>
            {avatarState === "error" && <p className="profile-avatar-error">{avatarError}</p>}
          </div>
        </div>
        <div className="profile-details">
          <div><span>Email</span><strong>{user.email}</strong></div>
          {user.phone && !editing && <div><span>Telefone</span><strong>{user.phone}</strong></div>}
        </div>
        {editing ? (
          <div className="profile-edit-fields">
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome completo" className="form-input" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone / WhatsApp" className="form-input" />
            <div className="profile-edit-actions"><button onClick={() => updateMutation.mutate()} className="btn-boat-solid" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Salvando..." : "Salvar"}</button><button onClick={() => setEditing(false)} className="btn-secondary">Cancelar</button></div>
          </div>
        ) : (
          <button onClick={() => { setFullName(user.fullName); setPhone(user.phone || ""); setEditing(true); }} className="profile-edit-trigger">Editar perfil</button>
        )}
      </div>

      <div className="profile-list">
        <Link href={isCaptain ? "/minha-lancha" : "/perfil-capitao"}><button className="profile-action"><div className="profile-action-icon"><MaritimeIcon variant="lancha" size={18} /></div><div><div className="profile-action-title">{isCaptain ? "Minha Lancha" : "Quero ser capitão"}</div><div className="profile-action-sub">{isCaptain ? "Gerenciar viagens e passageiros" : "Complete seu perfil e publique viagens"}</div></div><ChevronRight size={16} color="var(--text3)" /></button></Link>
        <Link href="/minhas-reservas"><button className="profile-action"><div className="profile-action-icon"><Calendar size={18} /></div><div><div className="profile-action-title">Minhas Reservas</div><div className="profile-action-sub">Ver travessias agendadas</div></div><ChevronRight size={16} color="var(--text3)" /></button></Link>
        <Link href="/notificacoes"><button className="profile-action"><div className="profile-action-icon"><Bell size={18} /></div><div><div className="profile-action-title">Notificações</div><div className="profile-action-sub">Atualizações de reservas e pedidos de rota</div></div><ChevronRight size={16} color="var(--text3)" /></button></Link>
        <button className="profile-action profile-action-danger" onClick={async () => { await logout(); navigate("/"); }}><div className="profile-action-icon"><LogOut size={18} /></div><div><div className="profile-action-title">Sair da conta</div></div></button>
      </div>
    </div>
  );
}
