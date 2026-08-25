import { useState } from "react";
import { SiteSelect } from "@/components/SiteSelect";
import { BoatMediaCluster } from "@/components/layout/BoatMediaCluster";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Anchor, Plus, Trash2, Users } from "lucide-react";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAY_INDICES = [1, 2, 3, 4, 5];

export default function Recurring() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const tab = "boat" as const;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    rideType: "boat",
    originCity: "",
    destinationCity: "",
    daysOfWeek: WEEKDAY_INDICES,
    departureTime: "07:30",
    returnTime: "",
    pricePerSeat: "",
    totalSeats: "3",
    description: "",
  });
  const [error, setError] = useState("");

  const { data: allData } = useQuery({
    queryKey: ["/api/recurring", tab],
    queryFn: () => apiRequest("GET", `/api/recurring?type=${tab}`),
  });

  const { data: mineData } = useQuery({
    queryKey: ["/api/recurring/mine"],
    queryFn: () => apiRequest("GET", "/api/recurring/mine"),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/recurring", {
      ...form,
      daysOfWeek: JSON.stringify(form.daysOfWeek),
      totalSeats: parseInt(form.totalSeats),
      pricePerSeat: form.pricePerSeat ? parseFloat(form.pricePerSeat) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/recurring"] });
      setShowForm(false);
    },
    onError: (e: any) => setError(e.message || "Erro ao cadastrar rota"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/recurring/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/recurring"] }),
  });

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter(d => d !== day)
        : [...f.daysOfWeek, day].sort(),
    }));
  };

  const liveSchedules = allData?.schedules || [];
  const schedules = liveSchedules;
  const mySchedules = (mineData?.schedules || []).filter((s: any) => s.rideType === tab);

  return (
    <div className="page-wrapper">
      <div className="rides-header">
        <div className="rides-header-inner">
          <div className="recurring-page-hero">
            <div>
              <p className="section-label" style={{ color: "var(--boat)", borderColor: "color-mix(in srgb, var(--amber) 28%, transparent)" }}>ROTAS RECORRENTES</p>
              <h1 className="page-title" style={{ marginBottom: 8 }}>Planeje uma travessia recorrente</h1>
              <p style={{ color: "var(--text2)", fontSize: 15, marginBottom: 20 }}>
                Combine horários que se repetem no litoral. Publique uma rota de lancha com dias, horários, vagas e preço para que passageiros possam se organizar com antecedência.
              </p>
            </div>
            <BoatMediaCluster variant="compact" />
          </div>

        </div>
      </div>

      <div className="rides-body">

        {/* My schedules */}
        {user && tab === "boat" && mySchedules.length > 0 && (
          <div className="my-schedules-section">
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--text1)" }}>Minhas rotas recorrentes</h3>
            <div className="recurring-list">
              {mySchedules.map((s: any) => (
                <ScheduleCard key={s.id} schedule={s} onDelete={() => deleteMutation.mutate(s.id)} isOwn />
              ))}
            </div>
          </div>
        )}

        {/* Add button */}
        {user && tab === "boat" && (
          <div style={{ marginBottom: 24 }}>
            <button className="btn-boat-solid" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} /> {showForm ? "Fechar formulário" : "Cadastrar minha rota recorrente"}
            </button>
          </div>
        )}

        {/* Create form */}
        {showForm && tab === "boat" && (
          <div className="create-ride-form" style={{ borderColor: "var(--boat)", borderTopWidth: 3, marginBottom: 32 }}>
            <h4 style={{ marginBottom: 16, color: "var(--boat)", fontWeight: 700 }}>Nova rota recorrente</h4>

            <div className="form-group">
              <label>Tipo de transporte</label>
              <p style={{ color: "var(--boat)", fontWeight: 700, fontSize: 13 }}>Lancha · piloto aquático</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Origem *</label>
                <input value={form.originCity} onChange={e => setForm(f => ({ ...f, originCity: e.target.value }))} placeholder="Cidade de partida" required />
              </div>
              <div className="form-group">
                <label>Destino *</label>
                <input value={form.destinationCity} onChange={e => setForm(f => ({ ...f, destinationCity: e.target.value }))} placeholder="Cidade de destino" required />
              </div>
            </div>

            <div className="form-group">
              <label>Dias da semana *</label>
              <div className="day-selector">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    className={`day-chip ${form.daysOfWeek.includes(i) ? "day-chip-active" : ""}`}
                    onClick={() => toggleDay(i)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Horário de saída *</label>
                <input type="time" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Horário de volta</label>
                <input type="time" value={form.returnTime} onChange={e => setForm(f => ({ ...f, returnTime: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preço por pessoa (R$)</label>
                <input type="number" value={form.pricePerSeat} onChange={e => setForm(f => ({ ...f, pricePerSeat: e.target.value }))} placeholder="Opcional" step="0.01" min="0" />
              </div>
              <div className="form-group">
                <label>Vagas</label>
                <SiteSelect value={form.totalSeats} onChange={(totalSeats) => setForm((f) => ({ ...f, totalSeats }))} options={[1,2,3,4,5,6,7,8].map((n) => ({ value: String(n), label: String(n) }))} ariaLabel="Número de vagas" />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Ponto de encontro, aceito pets, etc." rows={2} />
            </div>

            {error && <div className="form-error">{error}</div>}
            <button className="btn-boat-solid" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Cadastrando..." : "Cadastrar rota recorrente"}
            </button>
          </div>
        )}

        {/* All schedules */}
        <p className="rides-count">{schedules.length} {schedules.length === 1 ? "rota encontrada" : "rotas encontradas"}</p>
        {schedules.length > 0 ? (
          <div className="recurring-list">
            {schedules.map((s: any, i: number) => (
              <ScheduleCard key={s.id || i} schedule={s} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: 12, padding: "36px 24px", background: "var(--card)", border: "1px dashed var(--border)", borderRadius: 16 }}>
            <Calendar size={36} color="var(--boat)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700, marginBottom: 8, color: "var(--text1)" }}>Nenhuma rota recorrente publicada</p>
            <p style={{ maxWidth: 520, margin: "0 auto", fontSize: 13, lineHeight: 1.55, color: "var(--text2)" }}>Ainda não há uma rota recorrente publicada. Se você navega com frequência, cadastre a sua e ajude a criar conexões previsíveis no litoral.</p>
          </div>
        )}

        {!user && tab === "boat" && (
          <div style={{ textAlign: "center", marginTop: 32, padding: "24px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <Calendar size={32} color="var(--boat)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Quer participar do piloto?</p>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>Faça login para cadastrar uma rota aquática recorrente e avisar passageiros que contam com esse horário.</p>
            <a href="/entrar" className="btn-boat-solid">Entrar</a>
          </div>
        )}

      </div>
    </div>
  );
}

function ScheduleCard({ schedule: s, onDelete, isOwn }: { schedule: any; onDelete?: () => void; isOwn?: boolean }) {
  let days: number[] = [];
  try { days = JSON.parse(s.daysOfWeek); } catch { days = []; }

  return (
    <div className="recurring-card-full fade-up" style={{ borderLeft: "3px solid var(--boat)" }}>
      <div className="recurring-card-header">
        <span className="recurring-route">
          <strong>{s.originCity}</strong> → <strong>{s.destinationCity}</strong>
        </span>
        {s.userName && <span style={{ fontSize: 12, color: "var(--text3)" }}>por {s.userName}</span>}
        {isOwn && onDelete && (
          <button onClick={onDelete} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: "2px 4px" }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="recurring-days" style={{ marginTop: 10, marginBottom: 10 }}>
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
          <div key={d} className={`day-chip ${days.includes(i) ? "day-chip-active" : ""}`}>{d}</div>
        ))}
      </div>

      <div className="recurring-card-meta">
        <span>{s.departureTime}{s.returnTime ? ` · volta ${s.returnTime}` : ""}</span>
        {s.totalSeats && <span><Users size={11} /> {s.totalSeats} {s.totalSeats === 1 ? "vaga" : "vagas"}</span>}
        {s.pricePerSeat && <span>R$ {parseFloat(s.pricePerSeat).toFixed(2).replace(".", ",")} / pessoa</span>}
        {s.description && <span style={{ color: "var(--text3)", fontStyle: "italic" }}>{s.description}</span>}
      </div>
    </div>
  );
}

