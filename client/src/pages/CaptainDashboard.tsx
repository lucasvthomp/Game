import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Anchor, Plus, Clock, Users, Trash2, CheckCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const BLANK = { originCity: "", destinationCity: "", departureTime: "", returnTime: "", pricePerSeat: "", totalSeats: "", description: "" };

export default function CaptainDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(BLANK);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const { data: profileData } = useQuery({
    queryKey: ["/api/captain/profile"],
    queryFn: () => apiRequest("GET", "/api/captain/profile"),
    retry: false,
  });
  const { data: ridesData } = useQuery({
    queryKey: ["/api/my/rides"],
    queryFn: () => apiRequest("GET", "/api/my/rides"),
    enabled: !!profileData?.profile,
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/rides", { ...form, pricePerSeat: parseFloat(form.pricePerSeat), totalSeats: parseInt(form.totalSeats), returnTime: form.returnTime || undefined }),
    onSuccess: () => { setSuccess("Viagem criada!"); setShowForm(false); setForm(BLANK); qc.invalidateQueries({ queryKey: ["/api/my/rides"] }); },
    onError: (err: any) => setError(err.message),
  });
  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rides/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/my/rides"] }),
  });

  if (!user) { navigate("/entrar"); return null; }
  if (user.role !== "captain") { navigate("/perfil-capitao"); return null; }

  const rides = ridesData?.rides || [];
  const totalEarnings = rides.filter((r: any) => r.status === "active").reduce((s: number, r: any) => s + parseFloat(r.pricePerSeat) * r.confirmedSeats, 0);
  const totalPassengers = rides.reduce((s: number, r: any) => s + (r.confirmedSeats || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Minha Lancha</h1>
          <p className="page-sub">Gerencie suas viagens e passageiros</p>
        </div>
        <button className="btn-add" onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}>
          <Plus size={16} /> Nova viagem
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Viagens ativas", value: rides.filter((r: any) => r.status === "active").length, icon: <Anchor size={18} color="var(--boat)" /> },
          { label: "Passageiros", value: totalPassengers, icon: <Users size={18} color="var(--boat)" /> },
          { label: "Receita estimada", value: `R$ ${totalEarnings.toFixed(0)}`, icon: <TrendingUp size={18} color="var(--boat)" /> },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--boat) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--text1)", letterSpacing: "-0.5px" }}>{stat.value}</div>
              <div style={{ color: "var(--text2)", fontSize: 12 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {success && <div className="alert-success"><CheckCircle size={15} /> {success}</div>}

      {/* New ride form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-section">
            <p className="section-label" style={{ marginBottom: 16 }}>NOVA VIAGEM</p>
            <form onSubmit={e => { e.preventDefault(); setError(""); createMutation.mutate(); }}>
              <div className="form-grid">
                <div>
                  <label className="field-label">ORIGEM *</label>
                  <input className="field-input" value={form.originCity} onChange={set("originCity")} required placeholder="ex: Bertioga" />
                </div>
                <div>
                  <label className="field-label">DESTINO *</label>
                  <input className="field-input" value={form.destinationCity} onChange={set("destinationCity")} required placeholder="ex: Ilhabela" />
                </div>
                <div>
                  <label className="field-label">DATA / HORA DE SAÍDA *</label>
                  <input className="field-input" type="datetime-local" value={form.departureTime} onChange={set("departureTime")} required />
                </div>
                <div>
                  <label className="field-label">RETORNO (opcional)</label>
                  <input className="field-input" type="datetime-local" value={form.returnTime} onChange={set("returnTime")} />
                </div>
                <div>
                  <label className="field-label">PREÇO / PESSOA (R$) *</label>
                  <input className="field-input" type="number" min="1" step="0.01" value={form.pricePerSeat} onChange={set("pricePerSeat")} required placeholder="85.00" />
                </div>
                <div>
                  <label className="field-label">ASSENTOS DISPONÍVEIS *</label>
                  <input className="field-input" type="number" min="1" max="20" value={form.totalSeats} onChange={set("totalSeats")} required placeholder="6" />
                </div>
                <div className="form-full">
                  <label className="field-label">DESCRIÇÃO (opcional)</label>
                  <textarea className="field-input" value={form.description} onChange={set("description")} placeholder="Ponto de encontro, o que levar, informações extras..." style={{ minHeight: 72, resize: "vertical" }} />
                </div>
              </div>
              {error && <div className="alert-error" style={{ marginTop: 12 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button type="submit" disabled={createMutation.isPending} className="btn-add" style={{ flex: 1, justifyContent: "center" }}>
                  {createMutation.isPending ? "Criando..." : "Criar viagem"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ride list */}
      {rides.length === 0 ? (
        <div className="card empty-state">
          <Anchor size={40} className="empty-state-icon" />
          <p style={{ fontWeight: 600, color: "var(--text3)" }}>Nenhuma viagem criada ainda.</p>
          <p style={{ fontSize: 13, color: "var(--boat)", marginTop: 4 }}>Clique em "Nova viagem" para começar.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rides.map((ride: any) => (
            <div key={ride.id} className="ride-row fade-up">
              <div style={{ flex: 1 }}>
                <div className="ride-row-title">{ride.originCity} → {ride.destinationCity}</div>
                <div className="ride-row-meta">
                  <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd/MM/yyyy 'às' HH:mm")}</span>
                  <span><Users size={12} /> {ride.confirmedSeats}/{ride.totalSeats} reservados</span>
                  <span style={{ color: "var(--boat)", fontWeight: 700 }}>R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")}/pessoa</span>
                </div>
              </div>
              <div className="ride-row-actions">
                <span className={`status-pill ${ride.status === "active" ? "status-active" : ride.status === "cancelled" ? "status-cancelled" : "status-completed"}`}>
                  {ride.status === "active" ? "Ativa" : ride.status === "cancelled" ? "Cancelada" : "Concluída"}
                </span>
                {ride.status === "active" && (
                  <button className="btn-danger" onClick={() => { if (confirm("Cancelar esta viagem? Os passageiros serão notificados.")) cancelMutation.mutate(ride.id); }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
