import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Anchor, Upload, CheckCircle } from "lucide-react";

export default function CaptainProfile() {
  const { user, refetch } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    licenseNumber: "", boatName: "", boatModel: "", boatCapacity: "", bio: "",
  });
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [boatImage, setBoatImage] = useState<File | null>(null);

  const { data: existingProfile } = useQuery({
    queryKey: ["/api/captain/profile"],
    queryFn: async () => {
      const res = await fetch("/api/captain/profile", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!user) { navigate("/entrar"); return null; }
  if (existingProfile?.profile) { navigate("/minha-lancha"); return null; }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!licenseImage) { setError("Foto da habilitação é obrigatória."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("licenseImage", licenseImage);
      if (boatImage) fd.append("boatImage", boatImage);

      const res = await fetch("/api/captain/profile", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      await refetch();
      setTimeout(() => navigate("/minha-lancha"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
        <CheckCircle size={56} color="#22C55E" />
        <h2 style={{ color: "#F0F9FF", fontWeight: 700, fontSize: "1.5rem" }}>Perfil criado!</h2>
        <p style={{ color: "#64748B" }}>Redirecionando para o painel...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Anchor size={36} color="#38BDF8" style={{ marginBottom: 12 }} />
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 8 }}>Perfil de Capitão</h1>
        <p style={{ color: "#64748B" }}>Preencha seus dados para começar a oferecer caronas</p>
      </div>

      <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 32 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Número da habilitação náutica *</label>
            <input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} required placeholder="ex: HN-123456" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Foto da habilitação *</label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#0A2847", border: "1px dashed #1E3A5F", borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>
              <Upload size={18} color="#38BDF8" />
              <span style={{ color: licenseImage ? "#22C55E" : "#64748B", fontSize: 14 }}>
                {licenseImage ? licenseImage.name : "Clique para enviar (JPG, PNG)"}
              </span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setLicenseImage(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label style={labelStyle}>Nome da lancha *</label>
            <input value={form.boatName} onChange={e => setForm(f => ({ ...f, boatName: e.target.value }))} required placeholder="ex: Veneza III" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Modelo da lancha</label>
            <input value={form.boatModel} onChange={e => setForm(f => ({ ...f, boatModel: e.target.value }))} placeholder="ex: Focker 275" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Capacidade (passageiros) *</label>
            <input type="number" min="1" max="30" value={form.boatCapacity} onChange={e => setForm(f => ({ ...f, boatCapacity: e.target.value }))} required placeholder="ex: 8" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Foto da lancha</label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#0A2847", border: "1px dashed #1E3A5F", borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>
              <Upload size={18} color="#64748B" />
              <span style={{ color: boatImage ? "#22C55E" : "#64748B", fontSize: 14 }}>
                {boatImage ? boatImage.name : "Clique para enviar (opcional)"}
              </span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setBoatImage(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label style={labelStyle}>Bio / apresentação</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Conte um pouco sobre você e sua experiência..."
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#FCA5A5", fontSize: 14 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ background: "#0284C7", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Enviando..." : "Criar perfil de capitão"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "#0A2847", border: "1px solid #1E3A5F", borderRadius: 8, padding: "10px 14px", color: "#E2E8F0", fontSize: 14, outline: "none" };
