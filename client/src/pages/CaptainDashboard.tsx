import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Anchor, Plus, Clock, Users, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function CaptainDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    originCity: "", destinationCity: "", departureTime: "", returnTime: "",
    pricePerSeat: "", totalSeats: "", description: "",
  });

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

  const createRideMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/rides", {
      ...form,
      pricePerSeat: parseFloat(form.pricePerSeat),
      totalSeats: parseInt(form.totalSeats),
      returnTime: form.returnTime || undefined,
    }),
    onSuccess: () => {
      setSuccess("Viagem criada com sucesso!");
      setShowForm(false);
      setForm({ originCity: "", destinationCity: "", departureTime: "", returnTime: "", pricePerSeat: "", totalSeats: "", description: "" });
      qc.invalidateQueries({ queryKey: ["/api/my/rides"] });
    },
    onError: (err: any) => setError(err.message),
  });

  const cancelRideMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rides/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/my/rides"] }),
  });

  if (!user) { navigate("/entrar"); return null; }
  if (user.role !== "captain") { navigate("/perfil-capitao"); return null; }

  const rides = ridesData?.rides || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 4 }}>Minha Lancha</h1>
          <p style={{ color: "#64748B" }}>Gerencie suas viagens</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#0284C7", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}
        >
          <Plus size={18} />
          Nova viagem
        </button>
      </div>

      {success && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, color: "#22C55E" }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Create ride form */}
      {showForm && (
        <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, color: "#F0F9FF", marginBottom: 20 }}>Nova viagem</h3>
          <form onSubmit={(e) => { e.preventDefault(); setError(""); createRideMutation.mutate(); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Cidade de origem *</label>
              <input value={form.originCity} onChange={e => setForm(f => ({ ...f, originCity: e.target.value }))} required placeholder="ex: Bertioga" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cidade de destino *</label>
              <input value={form.destinationCity} onChange={e => setForm(f => ({ ...f, destinationCity: e.target.value }))} required placeholder="ex: Ilhabela" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data/hora de saída *</label>
              <input type="datetime-local" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data/hora de retorno</label>
              <input type="datetime-local" value={form.returnTime} onChange={e => setForm(f => ({ ...f, returnTime: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Preço por pessoa (R$) *</label>
              <input type="number" min="1" step="0.01" value={form.pricePerSeat} onChange={e => setForm(f => ({ ...f, pricePerSeat: e.target.value }))} required placeholder="50.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Total de assentos *</label>
              <input type="number" min="1" max="20" value={form.totalSeats} onChange={e => setForm(f => ({ ...f, totalSeats: e.target.value }))} required placeholder="6" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Descrição (opcional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes sobre a viagem, ponto de encontro, o que levar..."
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
            </div>
            {error && <div style={{ gridColumn: "1 / -1", color: "#F87171", fontSize: 14 }}>{error}</div>}
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
              <button type="submit" disabled={createRideMutation.isPending}
                style={{ background: "#0284C7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                {createRideMutation.isPending ? "Criando..." : "Criar viagem"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: "none", border: "1px solid #1E3A5F", color: "#94A3B8", borderRadius: 8, padding: "10px 24px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rides list */}
      {rides.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#475569", background: "#071E36", borderRadius: 16, border: "1px solid #1E3A5F" }}>
          <Anchor size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>Você ainda não criou nenhuma viagem.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rides.map((ride: any) => (
            <div key={ride.id} style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 14, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#F0F9FF", marginBottom: 8 }}>
                    {ride.originCity} → {ride.destinationCity}
                  </div>
                  <div style={{ display: "flex", gap: 20, color: "#64748B", fontSize: 14, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={13} /> {format(new Date(ride.departureTime), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Users size={13} /> {ride.confirmedSeats}/{ride.totalSeats} reservados
                    </span>
                    <span style={{ color: "#38BDF8", fontWeight: 600 }}>
                      R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")} /pessoa
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: ride.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: ride.status === "active" ? "#22C55E" : "#F87171",
                  }}>
                    {ride.status === "active" ? "Ativa" : ride.status === "cancelled" ? "Cancelada" : "Concluída"}
                  </span>
                  {ride.status === "active" && (
                    <button
                      onClick={() => { if (confirm("Cancelar esta viagem?")) cancelRideMutation.mutate(ride.id); }}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "#0A2847", border: "1px solid #1E3A5F", borderRadius: 8, padding: "10px 14px", color: "#E2E8F0", fontSize: 14, outline: "none" };
