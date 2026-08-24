import { useState } from "react";
import { SiteSelect } from "@/components/SiteSelect";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Car, Upload, CheckCircle } from "lucide-react";

export default function DriverProfile() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    licenseNumber: "",
    carMake: "",
    carModel: "",
    carYear: "",
    carColor: "",
    carCapacity: "4",
    bio: "",
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [carImageFile, setCarImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["/api/driver/profile"],
    queryFn: () => apiRequest("GET", "/api/driver/profile"),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (licenseFile) fd.append("licenseImage", licenseFile);
      if (carImageFile) fd.append("carImage", carImageFile);
      const res = await fetch("/api/driver/profile", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao salvar perfil");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/driver/profile"] });
      navigate("/meu-carro");
    },
    onError: (e: any) => setError(e.message || "Erro ao salvar perfil"),
  });

  if (!user) return (
    <div className="auth-required">
      <p>Faça login para cadastrar seu perfil de motorista.</p>
      <a href="/entrar" className="btn-primary">Entrar</a>
    </div>
  );

  if (existing?.profile) return (
    <div className="page-wrapper">
      <div className="section-inner" style={{ maxWidth: 560, paddingTop: 80 }}>
        <div className="success-banner">
          <CheckCircle size={40} color="var(--car)" />
          <h2>Perfil de motorista cadastrado!</h2>
          <p>{existing.profile.carMake} {existing.profile.carModel} · {existing.profile.carCapacity} passageiros</p>
          <a href="/meu-carro" className="btn-car-solid">Ir para minha garagem</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="profile-form-page">
        <div className="profile-form-header">
          <div className="profile-form-icon" style={{ background: "var(--car-light)", color: "var(--car)" }}>
            <Car size={28} />
          </div>
          <h1 className="profile-form-title">Perfil de Motorista</h1>
          <p className="profile-form-sub">Compartilhe caronas de carro. Divida o trajeto e os custos.</p>
        </div>

        <form
          className="profile-form"
          onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        >
          <div className="form-section-title">Dados da CNH</div>
          <div className="form-group">
            <label>Número da CNH *</label>
            <input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="Ex: 12345678901" required />
          </div>
          <div className="form-group">
            <label>Foto da CNH *</label>
            <label className="file-upload-label">
              <Upload size={16} />
              {licenseFile ? licenseFile.name : "Selecionar arquivo"}
              <input type="file" accept="image/*" onChange={e => setLicenseFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
            </label>
          </div>

          <div className="form-section-title" style={{ marginTop: 24 }}>Dados do Veículo</div>
          <div className="form-row">
            <div className="form-group">
              <label>Marca *</label>
              <input value={form.carMake} onChange={e => setForm({ ...form, carMake: e.target.value })} placeholder="Ex: Toyota" required />
            </div>
            <div className="form-group">
              <label>Modelo *</label>
              <input value={form.carModel} onChange={e => setForm({ ...form, carModel: e.target.value })} placeholder="Ex: Corolla" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ano</label>
              <input type="number" value={form.carYear} onChange={e => setForm({ ...form, carYear: e.target.value })} placeholder="Ex: 2020" min="1990" max="2026" />
            </div>
            <div className="form-group">
              <label>Cor</label>
              <input value={form.carColor} onChange={e => setForm({ ...form, carColor: e.target.value })} placeholder="Ex: Prata" />
            </div>
          </div>
          <div className="form-group">
            <label>Capacidade de passageiros *</label>
            <SiteSelect value={form.carCapacity} onChange={(carCapacity) => setForm({ ...form, carCapacity })} options={[2,3,4,5,6,7].map((n) => ({ value: String(n), label: n + " passageiros" }))} ariaLabel="Capacidade de passageiros" />
          </div>
          <div className="form-group">
            <label>Foto do carro</label>
            <label className="file-upload-label">
              <Upload size={16} />
              {carImageFile ? carImageFile.name : "Selecionar foto"}
              <input type="file" accept="image/*" onChange={e => setCarImageFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
            </label>
          </div>
          <div className="form-group">
            <label>Sobre você (opcional)</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Ex: Motorista há 10 anos, viajo para SJC todo dia útil..." rows={3} />
          </div>

          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-car-solid" disabled={mutation.isPending} style={{ width: "100%", marginTop: 8 }}>
            {mutation.isPending ? "Salvando..." : "Cadastrar perfil de motorista"}
          </button>
        </form>
      </div>
    </div>
  );
}
