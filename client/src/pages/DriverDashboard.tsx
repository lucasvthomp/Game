import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Car, Plus, Clock, Users, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function DriverDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    originCity: "", destinationCity: "", departureTime: "", returnTime: "",
    pricePerSeat: "", totalSeats: "3", description: "",
  });
  const [error, setError] = useState("");

  const { data: profileData } = useQuery({
    queryKey: ["/api/driver/profile"],
    queryFn: () => apiRequest("GET", "/api/driver/profile"),
    enabled: !!user,
  });

  const { data: ridesData } = useQuery({
    queryKey: ["/api/rides/mine"],
    queryFn: () => apiRequest("GET", "/api/rides/mine"),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/rides", {
      ...form,
      rideType: "car",
      totalSeats: parseInt(form.totalSeats),
      pricePerSeat: parseFloat(form.pricePerSeat),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rides/mine"] });
      setShowForm(false);
      setForm({ originCity: "", destinationCity: "", departureTime: "", returnTime: "", pricePerSeat: "", totalSeats: "3", description: "" });
    },
    onError: (e: any) => setError(e.message || "Erro ao criar viagem"),
  });

  const cancelMutation = useMutation({
    mutationFn: (rideId: number) => apiRequest("DELETE", `/api/rides/${rideId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/rides/mine"] }),
  });

  if (!user) return (
    <div className="auth-required">
      <p>Faça login para acessar sua garagem.</p>
      <a href="/entrar" className="btn-primary">Entrar</a>
    </div>
  );

  if (!profileData?.profile) return (
    <div className="page-wrapper">
      <div className="section-inner" style={{ maxWidth: 560, paddingTop: 80, textAlign: "center" }}>
        <Car size={48} color="var(--car)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Complete seu perfil de motorista</h2>
        <p style={{ color: "var(--text2)", marginBottom: 24 }}>Para publicar caronas de carro, primeiro cadastre seu veículo e CNH.</p>
        <Link href="/perfil-motorista">
          <span className="btn-car-solid">Cadastrar perfil</span>
        </Link>
      </div>
    </div>
  );

  const profile = profileData.profile;
  const rides = ridesData?.rides || [];

  return (
    <div className="page-wrapper">
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div className="dashboard-header-inner">
            <div className="dashboard-profile-card" style={{ borderColor: "var(--car-light)" }}>
              <div className="dashboard-profile-icon" style={{ background: "var(--car-light)", color: "var(--car)" }}>
                <Car size={24} />
              </div>
              <div>
                <h2 className="dashboard-profile-name">{user.fullName}</h2>
                <p className="dashboard-profile-detail">{profile.carMake} {profile.carModel} · {profile.carCapacity} lugares</p>
                {profile.carColor && <p className="dashboard-profile-detail">{profile.carColor} · {profile.carYear}</p>}
              </div>
              {!profile.verified && (
                <span className="badge-pending" style={{ marginLeft: "auto" }}>Verificação pendente</span>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-body">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Minhas caronas de carro</h3>
            <button className="btn-car-solid" onClick={() => setShowForm(!showForm)}>
              <Plus size={15} /> {showForm ? "Cancelar" : "Nova carona"}
            </button>
          </div>

          {showForm && (
            <div className="create-ride-form" style={{ borderColor: "var(--car-light)", background: "linear-gradient(135deg, var(--car-light) 0%, #fff 60%)" }}>
              <h4 style={{ marginBottom: 16, color: "var(--car-dark)", fontWeight: 700 }}>Nova carona de carro</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Origem *</label>
                  <input value={form.originCity} onChange={e => setForm({ ...form, originCity: e.target.value })} placeholder="Cidade de partida" required />
                </div>
                <div className="form-group">
                  <label>Destino *</label>
                  <input value={form.destinationCity} onChange={e => setForm({ ...form, destinationCity: e.target.value })} placeholder="Cidade de destino" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data e hora de saída *</label>
                  <input type="datetime-local" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Retorno (opcional)</label>
                  <input type="datetime-local" value={form.returnTime} onChange={e => setForm({ ...form, returnTime: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preço por pessoa (R$) *</label>
                  <input type="number" value={form.pricePerSeat} onChange={e => setForm({ ...form, pricePerSeat: e.target.value })} placeholder="Ex: 25.00" step="0.01" min="1" required />
                </div>
                <div className="form-group">
                  <label>Vagas *</label>
                  <select value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? "vaga" : "vagas"}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Ponto de encontro, bagagem permitida..." rows={2} />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button className="btn-car-solid" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Publicando..." : "Publicar carona"}
              </button>
            </div>
          )}

          {rides.length === 0 ? (
            <div className="dashboard-empty">
              <Car size={40} style={{ color: "var(--text3)", marginBottom: 12 }} />
              <p>Você ainda não publicou nenhuma carona de carro.</p>
              <p style={{ fontSize: 13, color: "var(--text3)" }}>Clique em "Nova carona" para começar.</p>
            </div>
          ) : (
            <div className="dashboard-rides-list">
              {rides.map((ride: any) => (
                <div key={ride.id} className="dashboard-ride-item" style={{ borderLeft: "3px solid var(--car)" }}>
                  <div className="dashboard-ride-route">
                    <span className="dashboard-city">{ride.originCity}</span>
                    <Car size={14} color="var(--car)" />
                    <span className="dashboard-city">{ride.destinationCity}</span>
                  </div>
                  <div className="dashboard-ride-meta">
                    <span><Clock size={12} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
                    <span><Users size={12} /> {ride.availableSeats}/{ride.totalSeats} vagas</span>
                    <span>R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")} / pessoa</span>
                    <span className={`badge ${ride.status === "active" ? "badge-green" : "badge-red"}`}>{ride.status === "active" ? "Ativa" : "Cancelada"}</span>
                  </div>
                  <div className="dashboard-ride-actions">
                    <Link href={`/viagens/${ride.id}`}>
                      <span className="link-more">Ver <ChevronRight size={12} /></span>
                    </Link>
                    {ride.status === "active" && (
                      <button className="btn-cancel" onClick={() => cancelMutation.mutate(ride.id)} disabled={cancelMutation.isPending}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
