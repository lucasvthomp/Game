import { useState, type ChangeEvent, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { CheckCircle2, Upload } from "lucide-react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

const INITIAL_FORM = { licenseNumber: "", boatName: "", boatModel: "", boatCapacity: "", bio: "" };

export default function CaptainProfile() {
  const { user, refetch } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [boatImage, setBoatImage] = useState<File | null>(null);

  const setField = (key: keyof typeof INITIAL_FORM) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const { data: existing } = useQuery({
    queryKey: ["/api/captain/profile"],
    queryFn: async () => {
      const response = await fetch("/api/captain/profile", { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    },
  });

  if (!user) {
    navigate("/entrar");
    return null;
  }
  if (existing?.profile) {
    navigate("/minha-lancha");
    return null;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!licenseImage) {
      setError("Foto da habilitação é obrigatória.");
      return;
    }
    setLoading(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("licenseImage", licenseImage);
      if (boatImage) body.append("boatImage", boatImage);
      const response = await fetch("/api/captain/profile", { method: "POST", body, credentials: "include" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível criar o perfil.");
      setSuccess(true);
      await refetch();
      window.setTimeout(() => navigate("/minha-lancha"), 1200);
    } catch (requestError: any) {
      setError(requestError?.message || "Não foi possível criar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="captain-profile-page captain-profile-success-page">
        <div className="captain-profile-success">
          <span className="captain-profile-success-icon"><CheckCircle2 size={30} /></span>
          <p className="profile-page-kicker"><MaritimeIcon variant="anchor" size={15} /> PERFIL DA LANCHA</p>
          <h1>Perfil criado.</h1>
          <p>Estamos abrindo seu painel de capitão.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="captain-profile-page">
      <header className="captain-profile-header">
        <span className="captain-profile-header-icon"><MaritimeIcon variant="anchor" size={26} /></span>
        <div>
          <p className="profile-page-kicker"><MaritimeIcon variant="anchor" size={15} /> PERFIL DA LANCHA</p>
          <h1>Comece a publicar.</h1>
          <p>Informe só o essencial para apresentar sua lancha com clareza.</p>
        </div>
      </header>

      <section className="card captain-profile-card">
        <form onSubmit={submit}>
          <div className="captain-profile-section">
            <div className="captain-profile-section-heading">
              <span className="captain-profile-step">1</span>
              <div><h2>Habilitação</h2><p>Usada apenas para validar seu cadastro.</p></div>
            </div>
            <div className="captain-profile-fields">
              <div>
                <label className="field-label" htmlFor="license-number">NÚMERO DA HABILITAÇÃO NÁUTICA *</label>
                <input id="license-number" className="field-input" value={form.licenseNumber} onChange={setField("licenseNumber")} required placeholder="HN-123456" />
              </div>
              <div>
                <label className="field-label" htmlFor="license-image">FOTO DA HABILITAÇÃO *</label>
                <label className={"file-label captain-upload-field " + (licenseImage ? "is-selected" : "")} htmlFor="license-image">
                  <Upload size={16} />
                  <span>{licenseImage ? licenseImage.name : "Selecionar foto"}</span>
                  <input id="license-image" type="file" accept="image/*" onChange={(event) => setLicenseImage(event.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </div>

          <div className="captain-profile-section">
            <div className="captain-profile-section-heading">
              <span className="captain-profile-step">2</span>
              <div><h2>Sua lancha</h2><p>Essas informações aparecem antes da reserva.</p></div>
            </div>
            <div className="captain-profile-fields">
              <div>
                <label className="field-label" htmlFor="boat-name">NOME DA LANCHA *</label>
                <input id="boat-name" className="field-input" value={form.boatName} onChange={setField("boatName")} required placeholder="Vento Sul" />
              </div>
              <div>
                <label className="field-label" htmlFor="boat-model">MODELO</label>
                <input id="boat-model" className="field-input" value={form.boatModel} onChange={setField("boatModel")} placeholder="Lancha de pesca" />
              </div>
              <div>
                <label className="field-label" htmlFor="boat-capacity">CAPACIDADE *</label>
                <input id="boat-capacity" className="field-input" type="number" min="1" max="30" value={form.boatCapacity} onChange={setField("boatCapacity")} required placeholder="8" />
              </div>
              <div>
                <label className="field-label" htmlFor="boat-image">FOTO DA LANCHA <span>(opcional)</span></label>
                <label className={"file-label captain-upload-field " + (boatImage ? "is-selected" : "")} htmlFor="boat-image">
                  <Upload size={16} />
                  <span>{boatImage ? boatImage.name : "Selecionar foto"}</span>
                  <input id="boat-image" type="file" accept="image/*" onChange={(event) => setBoatImage(event.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="captain-profile-fields-full">
                <label className="field-label" htmlFor="captain-bio">APRESENTAÇÃO <span>(opcional)</span></label>
                <textarea id="captain-bio" className="field-input captain-profile-textarea" value={form.bio} onChange={setField("bio")} placeholder="Conte brevemente sobre sua experiência e a lancha." />
              </div>
            </div>
          </div>

          {error && <div className="alert-error captain-profile-alert">{error}</div>}
          <div className="captain-profile-actions">
            <button type="submit" disabled={loading} className="form-submit">{loading ? "Enviando..." : "Criar perfil de capitão"}</button>
            <p>Você poderá atualizar esses dados depois.</p>
          </div>
        </form>
      </section>
    </main>
  );
}
