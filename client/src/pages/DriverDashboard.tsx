import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Car, Plus, Clock, Users, ChevronRight, TrendingUp, Star, MapPin, X } from "lucide-react";
import { useState } from "react";

const EMPTY_FORM = {
  originCity: "", destinationCity: "", departureTime: "", returnTime: "",
  pricePerSeat: "", totalSeats: "3", description: "",
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
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
      setForm(EMPTY_FORM);
      setError("");
    },
    onError: (e: any) => setError(e.message || "Erro ao criar viagem"),
  });

  const cancelMutation = useMutation({
    mutationFn: (rideId: number) => apiRequest("DELETE", `/api/rides/${rideId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/rides/mine"] }),
  });

  if (!user) return (
    <div className="auth-required fade-up">
      <p>Faça login para acessar seu painel.</p>
      <Link href="/entrar"><span className="btn-primary">Entrar</span></Link>
    </div>
  );

  if (!profileData?.profile) return (
    <div className="page-wrapper">
      <div className="dash-empty-profile fade-up">
        <div className="dep-icon"><Car size={32} /></div>
        <h2>Complete seu perfil de motorista</h2>
        <p>Para publicar caronas de carro, primeiro cadastre seu veículo e CNH.</p>
        <Link href="/perfil-motorista">
          <span className="btn-primary btn-primary-car">Cadastrar perfil</span>
        </Link>
      </div>
    </div>
  );

  const profile = profileData.profile;
  const rides: any[] = ridesData?.rides || [];
  const activeRides = rides.filter(r => r.status === "active");
  const totalEarnings = rides.reduce((sum: number, r: any) => {
    const seats = (r.totalSeats || 0) - (r.availableSeats || 0);
    return sum + seats * parseFloat(r.pricePerSeat || "0");
  }, 0);

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="dash-header">
        <div className="section-inner">
          <div className="dash-header-top">
            <div className="dash-profile-row">
              <div className="dash-avatar dash-avatar-car">
                <Car size={22} />
              </div>
              <div>
                <h1 className="dash-name">{user.fullName}</h1>
                <p className="dash-sub">{profile.carMake} {profile.carModel} {profile.carYear ? `· ${profile.carYear}` : ""} {profile.carColor ? `· ${profile.carColor}` : ""}</p>
                <p className="dash-sub">{profile.carCapacity} lugares</p>
              </div>
              {!profile.verified && (
                <span className="badge-verify">Verificação pendente</span>
              )}
            </div>
            <button className="btn-primary btn-primary-car dash-new-btn" onClick={() => setShowForm(v => !v)}>
              {showForm ? <><X size={14} /> Fechar</> : <><Plus size={14} /> Nova carona</>}
            </button>
          </div>

          {/* Stats */}
          <div className="dash-stats">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: "var(--car-light)", color: "var(--car)" }}><Car size={18} /></div>
              <div>
                <div className="dash-stat-value">{rides.length}</div>
                <div className="dash-stat-label">Caronas publicadas</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: "#DCFCE7", color: "#15803D" }}><TrendingUp size={18} /></div>
              <div>
                <div className="dash-stat-value">{activeRides.length}</div>
                <div className="dash-stat-label">Ativas agora</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: "var(--boat-light)", color: "var(--boat)" }}><Star size={18} /></div>
              <div>
                <div className="dash-stat-value">R$ {totalEarnings.toFixed(0)}</div>
                <div className="dash-stat-label">Estimativa arrecadada</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: "var(--boat-light)", color: "var(--boat)" }}><Users size={18} /></div>
              <div>
                <div className="dash-stat-value">
                  {rides.reduce((s: number, r: any) => s + ((r.totalSeats || 0) - (r.availableSeats || 0)), 0)}
                </div>
                <div className="dash-stat-label">Passageiros levados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-inner" style={{ padding: "28px 24px" }}>

        {/* Create form */}
        {showForm && (
          <div className="dash-form-card fade-up">
            <h3 className="dash-form-title">Nova carona de carro</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Origem *</label>
                <div className="field-with-icon">
                  <MapPin size={14} />
                  <input value={form.originCity} onChange={e => setForm({ ...form, originCity: e.target.value })} placeholder="Cidade de partida" />
                </div>
              </div>
              <div className="form-group">
                <label>Destino *</label>
                <div className="field-with-icon">
                  <MapPin size={14} />
                  <input value={form.destinationCity} onChange={e => setForm({ ...form, destinationCity: e.target.value })} placeholder="Cidade de destino" />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Saída *</label>
                <input type="datetime-local" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Retorno (opcional)</label>
                <input type="datetime-local" value={form.returnTime} onChange={e => setForm({ ...form, returnTime: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Preço por pessoa (R$) *</label>
                <input type="number" value={form.pricePerSeat} onChange={e => setForm({ ...form, pricePerSeat: e.target.value })} placeholder="Ex: 25,00" step="0.01" min="1" />
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
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ponto de encontro, bagagem permitida..." rows={2} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary btn-primary-car" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Publicando..." : "Publicar carona"}
              </button>
              <button className="btn-secondary" onClick={() => { setShowForm(false); setError(""); }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Rides list */}
        <div className="dash-section-title">
          <h2>Minhas caronas</h2>
          <span className="dash-count">{rides.length} total</span>
        </div>

        {rides.length === 0 ? (
          <div className="dash-empty fade-up">
            <Car size={40} />
            <p>Nenhuma carona publicada ainda.</p>
            <p className="dash-empty-sub">Clique em "Nova carona" para começar.</p>
          </div>
        ) : (
          <div className="dash-rides-list">
            {rides.map((ride: any) => {
              const seatsUsed = (ride.totalSeats || 0) - (ride.availableSeats || 0);
              const pct = ride.totalSeats > 0 ? (seatsUsed / ride.totalSeats) * 100 : 0;
              return (
                <div key={ride.id} className="dash-ride-card fade-up">
                  <div className="dash-ride-card-left">
                    <div className="dash-ride-route">
                      <strong>{ride.originCity}</strong>
                      <ChevronRight size={14} />
                      <strong>{ride.destinationCity}</strong>
                    </div>
                    <div className="dash-ride-meta-row">
                      <span><Clock size={11} /> {format(new Date(ride.departureTime), "dd MMM · HH:mm", { locale: ptBR })}</span>
                      <span><Users size={11} /> {seatsUsed}/{ride.totalSeats} vagas</span>
                      <span>R$ {parseFloat(ride.pricePerSeat).toFixed(2).replace(".", ",")} / pessoa</span>
                    </div>
                    <div className="dash-ride-progress">
                      <div className="dash-progress-bar">
                        <div className="dash-progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--car)" : "var(--border2)" }} />
                      </div>
                      <span className="dash-progress-label">{Math.round(pct)}% ocupado</span>
                    </div>
                  </div>
                  <div className="dash-ride-card-right">
                    <span className={`badge ${ride.status === "active" ? "badge-green" : "badge-red"}`}>
                      {ride.status === "active" ? "Ativa" : "Cancelada"}
                    </span>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <Link href={`/viagens/${ride.id}`}>
                        <span className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>Ver</span>
                      </Link>
                      {ride.status === "active" && (
                        <button className="btn-cancel" onClick={() => cancelMutation.mutate(ride.id)} disabled={cancelMutation.isPending}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
