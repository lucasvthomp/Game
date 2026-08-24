import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Anchor, ArrowLeft, CheckCircle2, Clock3, Inbox, Send } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { SiteAutocomplete } from "@/components/SiteSelect";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const COASTAL_SP_CITIES = [
  "Ubatuba",
  "Caraguatatuba",
  "São Sebastião",
  "Ilhabela",
  "Bertioga",
  "Guarujá",
  "Santos",
  "São Vicente",
  "Praia Grande",
  "Mongaguá",
  "Itanhaém",
  "Peruíbe",
  "Iguape",
  "Ilha Comprida",
  "Cananéia",
  "Bonete",
  "Castelhanos",
];

type FormState = {
  origin: string;
  destination: string;
  requestedDate: string;
  passengers: string;
  notes: string;
};

const statusCopy: Record<string, { label: string; tone: string }> = {
  open: { label: "Recebido", tone: "request-status-open" },
  reviewing: { label: "Em análise", tone: "request-status-reviewing" },
  matched: { label: "Possibilidade encontrada", tone: "request-status-matched" },
  closed: { label: "Encerrado", tone: "request-status-closed" },
};

export default function RouteRequest() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const [form, setForm] = useState<FormState>({
    origin: params.get("from") || "",
    destination: params.get("to") || "",
    requestedDate: params.get("date") || "",
    passengers: params.get("passengers") || "1",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const requestsQuery = useQuery({
    queryKey: ["/api/my/route-requests"],
    queryFn: () => apiRequest("GET", "/api/my/route-requests"),
    enabled: Boolean(user),
  });

  const mutation = useMutation({
    mutationFn: (payload: FormState) =>
      apiRequest("POST", "/api/route-requests", {
        ...payload,
        passengers: Number(payload.passengers),
        requestedDate: payload.requestedDate || null,
      }),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/my/route-requests"] });
    },
  });

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  };

  if (!authLoading && !user) {
    return (
      <div className="page-wrapper route-request-page">
        <div className="section-inner route-request-gate">
          <div className="route-request-card">
            <div className="route-request-icon"><Anchor size={22} /></div>
            <p className="section-label">PEDIDO DE ROTA</p>
            <h1 className="page-title">Entre para pedir uma nova travessia</h1>
            <p className="page-sub">Assim conseguimos acompanhar seu pedido e avisar quando um operador demonstrar interesse.</p>
            <div className="route-request-actions">
              <Link href="/entrar"><span className="btn-boat-solid">Entrar para continuar <ArrowLeft size={15} /></span></Link>
              <Link href="/cadastro"><span className="btn-secondary">Criar conta</span></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const requests = requestsQuery.data?.requests || [];

  return (
    <div className="page-wrapper route-request-page">
      <div className="section-inner">
        <div className="route-request-hero">
          <div>
            <p className="section-label">MARCAMAR · PEDIDO DE ROTA</p>
            <h1 className="page-title">Não encontrou sua travessia?</h1>
            <p className="page-sub">Conte para a gente de onde você sai, para onde precisa chegar e quando. Vamos levar o pedido aos operadores da região.</p>
          </div>
          <div className="route-request-hero-mark"><Anchor size={34} /></div>
        </div>

        <div className="route-request-grid">
          <section className="route-request-card">
            <div className="route-request-card-heading">
              <div className="route-request-icon"><Send size={18} /></div>
              <div>
                <h2>Solicitar uma rota</h2>
                <p>O pedido não confirma uma viagem. Ele abre uma oportunidade para a rede.</p>
              </div>
            </div>

            {submitted && (
              <div className="route-request-success" role="status">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Pedido enviado.</strong>
                  <span>Vamos avisar quando houver uma possibilidade para esse trecho.</span>
                </div>
              </div>
            )}

            {mutation.isError && <p className="form-error" role="alert">{(mutation.error as Error).message}</p>}

            <form className="route-request-form" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
              <div className="route-request-form-row">
                <label>
                  Origem
                  <SiteAutocomplete value={form.origin} onChange={(value) => update("origin", value)} options={COASTAL_SP_CITIES} placeholder="Ex.: Ilhabela" ariaLabel="Origem da rota" />
                </label>
                <label>
                  Destino
                  <SiteAutocomplete value={form.destination} onChange={(value) => update("destination", value)} options={COASTAL_SP_CITIES} placeholder="Ex.: Bonete" ariaLabel="Destino da rota" />
                </label>
              </div>
              <div className="route-request-form-row">
                <label>
                  Quando você precisa?
                  <input type="date" min={new Date().toISOString().slice(0, 10)} value={form.requestedDate} onChange={(event) => update("requestedDate", event.target.value)} />
                </label>
                <label>
                  Passageiros
                  <input type="number" min="1" max="12" value={form.passengers} onChange={(event) => update("passengers", event.target.value)} />
                </label>
              </div>
              <label>
                Observações <span className="route-request-optional">opcional</span>
                <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} maxLength={1000} placeholder="Horário preferido, ponto de embarque ou alguma necessidade importante." rows={4} />
              </label>
              <div className="route-request-form-footer">
                <span>Você está conectado como {user?.fullName}.</span>
                <button className="btn-boat-solid" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Enviando..." : "Enviar pedido"} <Send size={15} />
                </button>
              </div>
            </form>
          </section>

          <aside className="route-request-card route-request-info">
            <div className="route-request-card-heading">
              <div className="route-request-icon"><Inbox size={18} /></div>
              <div>
                <h2>Seus pedidos</h2>
                <p>Acompanhe o que você já pediu à rede Marcamar.</p>
              </div>
            </div>
            {requestsQuery.isLoading ? <p className="route-request-empty">Carregando pedidos...</p> : requests.length === 0 ? (
              <p className="route-request-empty">Você ainda não enviou nenhum pedido de rota.</p>
            ) : (
              <div className="route-request-list">
                {requests.map((request: any) => {
                  const status = statusCopy[request.status] || statusCopy.open;
                  return (
                    <div className="route-request-list-item" key={request.id}>
                      <div className="route-request-list-route">
                        <strong>{request.origin}</strong><span>→</span><strong>{request.destination}</strong>
                      </div>
                      <div className="route-request-list-meta">
                        <span><Clock3 size={13} /> {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString("pt-BR") : "Data flexível"}</span>
                        <span>{request.passengers} passageiro{request.passengers === 1 ? "" : "s"}</span>
                        <span className={`request-status ${status.tone}`}>{status.label}</span>
                      </div>
                      {request.adminNotes && <p className="route-request-admin-note">{request.adminNotes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>

        <Link href="/lanchas"><span className="route-request-back"><ArrowLeft size={14} /> Voltar para as viagens</span></Link>
      </div>
    </div>
  );
}
