import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { useLocation } from "wouter";
import { Anchor, ArrowRight, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Map, Plus, Trash2, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, lazy, Suspense, type ChangeEvent, type FormEvent } from "react";
import { BoatMediaCluster } from "@/components/layout/BoatMediaCluster";
import { MaritimeIcon } from "@/components/MaritimeIcon";
import type { LatLng } from "@/components/map/LocationPicker";
import { getCityCoords } from "@/components/map/leafletSetup";
import { COASTAL_POINT_NAMES } from "@shared/coastal-locations";

const LocationPicker = lazy(() => import("@/components/map/LocationPicker"));

const BLANK = {
  originCity: "",
  destinationCity: "",
  departureTime: "",
  returnTime: "",
  pricePerSeat: "",
  totalSeats: "",
  description: "",
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatDeparture = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  return format(date, "EEE, dd MMM · HH:mm", { locale: ptBR });
};

const statusLabel = (status: string) => {
  if (status === "confirmed") return "Confirmado";
  if (status === "pending") return "Pendente";
  if (status === "cancelled") return "Cancelado";
  return status;
};

function RidePassengers({ rideId }: { rideId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/rides/" + rideId + "/reservations"],
    queryFn: () => apiRequest("GET", "/api/rides/" + rideId + "/reservations"),
  });

  if (isLoading) {
    return <div className="captain-passengers-message">Carregando reservas...</div>;
  }

  const reservations = data?.reservations || [];
  if (!reservations.length) {
    return <div className="captain-passengers-message">Nenhuma reserva ainda para esta saída.</div>;
  }

  return (
    <div className="captain-passengers" aria-label="Passageiros da viagem">
      {reservations.map((reservation: any) => (
        <div key={reservation.id} className="captain-passenger-row">
          <div className="captain-passenger-avatar" aria-hidden="true">
            {(reservation.passengerName || reservation.userName || "P").charAt(0).toUpperCase()}
          </div>
          <div className="captain-passenger-info">
            <strong>{reservation.passengerName || reservation.userName || "Passageiro"}</strong>
            <span>
              {reservation.seats} lugar{reservation.seats > 1 ? "es" : ""} ·{" "}
              {formatCurrency(parseFloat(reservation.totalPrice || "0"))}
            </span>
          </div>
          <span className={"captain-reservation-status captain-reservation-status-" + reservation.status}>
            {statusLabel(reservation.status)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CaptainDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(BLANK);
  const [originPin, setOriginPin] = useState<LatLng | null>(null);
  const [destPin, setDestPin] = useState<LatLng | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [expandedRide, setExpandedRide] = useState<number | null>(null);

  const setField = (key: keyof typeof BLANK) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const setLocation = (field: "originCity" | "destinationCity", setPin: (value: LatLng | null) => void) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    const coords = getCityCoords(value);
    setPin(coords ? { lat: coords[0], lng: coords[1] } : null);
  };

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
    mutationFn: () =>
      apiRequest("POST", "/api/rides", {
        ...form,
        pricePerSeat: parseFloat(form.pricePerSeat),
        totalSeats: parseInt(form.totalSeats, 10),
        returnTime: form.returnTime || undefined,
        originLat: originPin?.lat ?? null,
        originLng: originPin?.lng ?? null,
        destLat: destPin?.lat ?? null,
        destLng: destPin?.lng ?? null,
      }),
    onSuccess: () => {
      setSuccess("Saída publicada com sucesso.");
      setError("");
      setShowForm(false);
      setForm(BLANK);
      setOriginPin(null);
      setDestPin(null);
      setShowMap(false);
      queryClient.invalidateQueries({ queryKey: ["/api/my/rides"] });
    },
    onError: (mutationError: any) => {
      setError(mutationError?.message || "Não foi possível publicar a saída.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", "/api/rides/" + id),
    onSuccess: () => {
      setSuccess("Saída cancelada. Os passageiros serão avisados.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["/api/my/rides"] });
    },
    onError: (mutationError: any) => setError(mutationError?.message || "Não foi possível cancelar a saída."),
  });

  if (!user) {
    navigate("/entrar");
    return null;
  }

  if (!["captain", "both"].includes(user.role)) {
    navigate("/perfil-capitao");
    return null;
  }

  const rides = ridesData?.rides || [];
  const activeRides = rides.filter((ride: any) => ride.status === "active");
  const totalEarnings = activeRides.reduce(
    (sum: number, ride: any) => sum + parseFloat(ride.pricePerSeat || "0") * (ride.confirmedSeats || 0),
    0,
  );
  const totalPassengers = rides.reduce((sum: number, ride: any) => sum + (ride.confirmedSeats || 0), 0);
  const nextRide = activeRides
    .filter((ride: any) => new Date(ride.departureTime).getTime() >= Date.now())
    .sort((a: any, b: any) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0];

  const openForm = () => {
    setShowForm((visible) => !visible);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setShowForm(false);
    setOriginPin(null);
    setDestPin(null);
    setShowMap(false);
    setError("");
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    createMutation.mutate();
  };

  const cancelRide = (id: number) => {
    if (confirm("Cancelar esta saída? Os passageiros serão notificados.")) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <main className="dashboard-page captain-dashboard-page">
      <section className="captain-dashboard-intro">
        <div className="captain-dashboard-heading">
          <p className="captain-dashboard-kicker">
            <MaritimeIcon variant="anchor" size={16} /> PAINEL DA LANCHA
          </p>
          <h1>Olá, {(user.fullName || "capitão").split(" ")[0]}.</h1>
          <p>Publique saídas, acompanhe reservas e mantenha sua operação no rumo certo.</p>
          <span className="dashboard-live-pill"><i /> Painel operacional</span>
        </div>
        <BoatMediaCluster variant="compact" />
        <button className="btn-add captain-dashboard-primary" onClick={openForm}>
          <Plus size={17} /> {showForm ? "Fechar publicação" : "Publicar saída"}
        </button>
      </section>

      <section className="dashboard-stats captain-dashboard-stats" aria-label="Resumo da operação">
        <div className="card dashboard-stat-card captain-stat-card">
          <span className="captain-stat-icon"><MaritimeIcon variant="route" size={22} /></span>
          <div><strong>{activeRides.length}</strong><span>Saídas ativas</span></div>
        </div>
        <div className="card dashboard-stat-card captain-stat-card">
          <span className="captain-stat-icon"><Users size={21} /></span>
          <div><strong>{totalPassengers}</strong><span>Passageiros confirmados</span></div>
        </div>
        <div className="card dashboard-stat-card captain-stat-card">
          <span className="captain-stat-icon"><TrendingUp size={21} /></span>
          <div><strong>{formatCurrency(totalEarnings)}</strong><span>Receita estimada</span></div>
        </div>
      </section>

      {nextRide && (
        <section className="captain-next-card" aria-labelledby="next-ride-title">
          <div className="captain-next-card-heading">
            <span className="captain-next-badge"><MaritimeIcon variant="clock" size={15} /> Próxima saída</span>
            <span className="captain-next-date">{formatDeparture(nextRide.departureTime)}</span>
          </div>
          <div className="captain-next-card-body">
            <div>
              <p className="captain-next-label">ROTA</p>
              <h2 id="next-ride-title">{nextRide.originCity} <ArrowRight size={18} /> {nextRide.destinationCity}</h2>
            </div>
            <div className="captain-next-metrics">
              <span><Users size={16} /> {nextRide.confirmedSeats || 0}/{nextRide.totalSeats} lugares</span>
              <span><strong>{formatCurrency(parseFloat(nextRide.pricePerSeat || "0"))}</strong> por pessoa</span>
            </div>
            <button className="captain-next-action" onClick={() => setExpandedRide(expandedRide === nextRide.id ? null : nextRide.id)}>
              {expandedRide === nextRide.id ? "Ocultar reservas" : "Ver reservas"}
              {expandedRide === nextRide.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          {expandedRide === nextRide.id && <RidePassengers rideId={nextRide.id} />}
        </section>
      )}

      {success && <div className="alert-success captain-alert"><CheckCircle2 size={16} /> {success}</div>}

      {showForm && (
        <section className="card dashboard-ride-form captain-form-card" aria-labelledby="publish-ride-title">
          <div className="captain-form-header">
            <div>
              <p className="section-label">NOVA SAÍDA</p>
              <h2 id="publish-ride-title">Publique uma rota simples</h2>
              <p>Escolha os pontos de embarque e informe os detalhes essenciais.</p>
            </div>
            <span className="captain-form-step">1 · detalhes</span>
          </div>
          <form onSubmit={submitForm}>
            <div className="captain-form-grid">
              <div>
                <label className="field-label">ORIGEM *</label>
                <SiteAutocomplete value={form.originCity} onChange={setLocation("originCity", setOriginPin)} options={COASTAL_POINT_NAMES} placeholder="Ex.: Praia do Perequê" ariaLabel="Ponto de embarque" />
              </div>
              <div>
                <label className="field-label">DESTINO *</label>
                <SiteAutocomplete value={form.destinationCity} onChange={setLocation("destinationCity", setDestPin)} options={COASTAL_POINT_NAMES} placeholder="Ex.: Praia do Bonete" ariaLabel="Ponto de desembarque" />
              </div>
              <div>
                <label className="field-label">DATA / HORA DE SAÍDA *</label>
                <input className="field-input" type="datetime-local" value={form.departureTime} onChange={setField("departureTime")} required />
              </div>
              <div>
                <label className="field-label">RETORNO <span>(opcional)</span></label>
                <input className="field-input" type="datetime-local" value={form.returnTime} onChange={setField("returnTime")} />
              </div>
              <div>
                <label className="field-label">PREÇO / PESSOA (R$) *</label>
                <input className="field-input" type="number" min="1" step="0.01" value={form.pricePerSeat} onChange={setField("pricePerSeat")} placeholder="85" required />
              </div>
              <div>
                <label className="field-label">LUGARES DISPONÍVEIS *</label>
                <input className="field-input" type="number" min="1" max="20" value={form.totalSeats} onChange={setField("totalSeats")} placeholder="6" required />
              </div>
              <div className="captain-form-full">
                <label className="field-label">NOTA PARA PASSAGEIROS <span>(opcional)</span></label>
                <textarea className="field-input captain-form-textarea" value={form.description} onChange={setField("description")} placeholder="Ponto de encontro, o que levar, informações extras..." />
              </div>
              <div className="captain-form-full captain-map-control">
                <div className="captain-map-copy">
                  <span className="captain-map-icon"><Map size={16} /></span>
                  <div><strong>Quer marcar o ponto exato?</strong><span>Você pode indicar a praia acima ou ajustar a localização no mapa.</span></div>
                </div>
                <button type="button" className="captain-map-toggle" onClick={() => setShowMap((visible) => !visible)}>
                  <Map size={14} /> {showMap ? "Esconder mapa" : "Marcar no mapa"}
                </button>
                {showMap && (
                  <div className="captain-map-grid">
                    <Suspense fallback={<div className="captain-map-loading">Carregando mapa...</div>}>
                      <LocationPicker label="Origem (clique para marcar)" variant="origin" value={originPin} onChange={setOriginPin} />
                      <LocationPicker label="Destino (clique para marcar)" variant="dest" value={destPin} onChange={setDestPin} />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
            {error && <div className="alert-error captain-alert">{error}</div>}
            <div className="captain-form-actions">
              <button type="submit" disabled={createMutation.isPending} className="btn-add">
                {createMutation.isPending ? "Publicando..." : "Publicar saída"} <ArrowRight size={16} />
              </button>
              <button type="button" className="captain-secondary-button" onClick={closeForm}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      <section className="captain-rides-section" aria-labelledby="captain-rides-title">
        <div className="dashboard-section-heading captain-rides-heading">
          <div>
            <p className="section-label">OPERAÇÃO</p>
            <h2 id="captain-rides-title">Suas saídas</h2>
            <p>Tenha uma visão rápida de horários, lugares e reservas.</p>
          </div>
          <span className="dashboard-count-pill">{rides.length} publicada{rides.length === 1 ? "" : "s"}</span>
        </div>

        {rides.length === 0 ? (
          <div className="card captain-empty-state">
            <span className="captain-empty-icon"><MaritimeIcon variant="lancha" size={34} /></span>
            <div>
              <h3>Seu painel começa com uma saída.</h3>
              <p>Publique uma rota em poucos passos e deixe os passageiros encontrarem você.</p>
            </div>
            <button className="captain-secondary-button captain-empty-action" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Publicar saída
            </button>
          </div>
        ) : (
          <div className="captain-ride-list">
            {rides.map((ride: any) => {
              const isExpanded = expandedRide === ride.id;
              const isActive = ride.status === "active";
              return (
                <article key={ride.id} className="captain-ride-card fade-up">
                  <div className="captain-ride-card-top">
                    <span className="captain-ride-route-icon"><MaritimeIcon variant="route" size={22} /></span>
                    <div className="captain-ride-route">
                      <span className="captain-ride-eyebrow">ROTA</span>
                      <h3>{ride.originCity} <ArrowRight size={16} /> {ride.destinationCity}</h3>
                      <div className="captain-ride-meta">
                        <span><Calendar size={15} /> {formatDeparture(ride.departureTime)}</span>
                        <span><Users size={15} /> {ride.confirmedSeats || 0}/{ride.totalSeats} lugares</span>
                      </div>
                    </div>
                    <div className="captain-ride-price">
                      <strong>{formatCurrency(parseFloat(ride.pricePerSeat || "0"))}</strong>
                      <span>por pessoa</span>
                    </div>
                  </div>
                  <div className="captain-ride-card-bottom">
                    <span className={"status-pill " + (isActive ? "status-active" : ride.status === "cancelled" ? "status-cancelled" : "status-completed")}>
                      {isActive ? "Ativa" : ride.status === "cancelled" ? "Cancelada" : "Concluída"}
                    </span>
                    <div className="captain-ride-actions">
                      <button className="captain-passenger-toggle" onClick={() => setExpandedRide(isExpanded ? null : ride.id)}>
                        <Users size={15} /> {isExpanded ? "Ocultar reservas" : "Ver reservas"}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {isActive && (
                        <button className="captain-cancel-button" onClick={() => cancelRide(ride.id)} disabled={cancelMutation.isPending}>
                          <Trash2 size={14} /> Cancelar saída
                        </button>
                      )}
                    </div>
                  </div>
                  {isExpanded && <RidePassengers rideId={ride.id} />}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
