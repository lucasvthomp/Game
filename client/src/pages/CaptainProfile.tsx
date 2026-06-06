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
  const [form, setForm] = useState({ licenseNumber: "", boatName: "", boatModel: "", boatCapacity: "", bio: "" });
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [boatImage, setBoatImage] = useState<File | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const { data: existing } = useQuery({
    queryKey: ["/api/captain/profile"],
    queryFn: async () => { const r = await fetch("/api/captain/profile", { credentials: "include" }); if (!r.ok) return null; return r.json(); },
  });

  if (!user) { navigate("/entrar"); return null; }
  if (existing?.profile) { navigate("/minha-lancha"); return null; }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
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
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "var(--bg)" }}>
      <CheckCircle size={52} color="var(--green)" />
      <h2 style={{ color: "var(--text1)", fontWeight: 800 }}>Perfil criado!</h2>
      <p style={{ color: "var(--text2)" }}>Redirecionando...</p>
    </div>
  );

  return (
    <div className="captain-page">
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--boat)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Anchor size={24} color="#fff" />
        </div>
        <h1 className="page-title">Perfil de Capitão</h1>
        <p className="page-sub">Preencha seus dados para começar a publicar viagens</p>
      </div>

      <div className="card">
        <form onSubmit={submit}>
          <div className="card-section">
            <p className="section-label" style={{ marginBottom: 16 }}>HABILITAÇÃO</p>
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">NÚMERO DA HABILITAÇÃO NÁUTICA *</label>
              <input className="field-input" value={form.licenseNumber} onChange={set("licenseNumber")} required placeholder="ex: HN-123456" />
            </div>
            <div>
              <label className="field-label">FOTO DA HABILITAÇÃO *</label>
              <label className="file-label">
                <Upload size={16} color={licenseImage ? "var(--green)" : "var(--text3)"} />
                <span className={licenseImage ? "file-chosen" : "file-placeholder"}>
                  {licenseImage ? licenseImage.name : "Clique para enviar foto (JPG, PNG)"}
                </span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setLicenseImage(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="card-section">
            <p className="section-label" style={{ marginBottom: 16 }}>SUA LANCHA</p>
            <div className="form-grid">
              <div>
                <label className="field-label">NOME DA LANCHA *</label>
                <input className="field-input" value={form.boatName} onChange={set("boatName")} required placeholder="ex: Veneza III" />
              </div>
              <div>
                <label className="field-label">MODELO</label>
                <input className="field-input" value={form.boatModel} onChange={set("boatModel")} placeholder="ex: Focker 275" />
              </div>
              <div>
                <label className="field-label">CAPACIDADE (passageiros) *</label>
                <input className="field-input" type="number" min="1" max="30" value={form.boatCapacity} onChange={set("boatCapacity")} required placeholder="ex: 8" />
              </div>
              <div>
                <label className="field-label">FOTO DA LANCHA</label>
                <label className="file-label" style={{ height: "100%", minHeight: 42 }}>
                  <Upload size={14} color={boatImage ? "var(--green)" : "var(--text3)"} />
                  <span className={boatImage ? "file-chosen" : "file-placeholder"} style={{ fontSize: 12 }}>
                    {boatImage ? boatImage.name : "Opcional"}
                  </span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setBoatImage(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="form-full">
                <label className="field-label">BIO / APRESENTAÇÃO</label>
                <textarea className="field-input" value={form.bio} onChange={set("bio")} placeholder="Sua experiência, tipo de passeios, etc..." style={{ minHeight: 80, resize: "vertical" }} />
              </div>
            </div>
          </div>

          <div className="card-section">
            {error && <div className="alert-error">{error}</div>}
            <button type="submit" disabled={loading} className="form-submit">
              {loading ? "Enviando..." : "Criar perfil de capitão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
