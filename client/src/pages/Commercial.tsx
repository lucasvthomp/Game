import { useState } from "react";
import { ArrowRight, Anchor, BriefcaseBusiness, CheckCircle2, Package, UsersRound } from "lucide-react";
import { SiteSelect } from "@/components/SiteSelect";
import { apiRequest } from "@/lib/queryClient";

const INTEREST_OPTIONS = [
  { value: "people", label: "Transporte de pessoas" },
  { value: "cargo", label: "Transporte de cargas" },
  { value: "both", label: "Pessoas e cargas" },
];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  company: "",
  phone: "",
  interest: "people",
  notes: "",
};

export default function Commercial() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const set = (field: keyof typeof INITIAL_FORM) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status !== "idle") setStatus("idle");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await apiRequest("POST", "/api/commercial-waitlist", form);
      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Não foi possível entrar na lista agora.");
    }
  };

  return (
    <div className="commercial-page">
      <section className="commercial-hero content-page-v2-hero">
        <div className="commercial-hero-copy content-page-v2-hero-copy">
          <p className="home-v2-kicker">PRÓXIMO TRECHO DO MARCAMAR</p>
          <h1>Transporte comercial pela costa.</h1>
          <p>
            Estamos preparando uma rede de lanchas para transportar pessoas, encomendas e cargas leves entre os pontos do litoral.
            Entre na lista e seja avisado quando abrirmos o piloto comercial.
          </p>
          <div className="commercial-proof-row">
            <span><UsersRound size={16} /> Pessoas</span>
            <span><Package size={16} /> Cargas leves</span>
            <span><Anchor size={16} /> Lanchas locais</span>
          </div>
        </div>
        <div className="commercial-hero-panel" aria-hidden="true">
          <div className="commercial-panel-orbit commercial-panel-orbit-a" />
          <div className="commercial-panel-orbit commercial-panel-orbit-b" />
          <div className="commercial-panel-icon"><BriefcaseBusiness size={30} /></div>
          <strong>Lista de espera</strong>
          <span>Primeiro acesso ao piloto comercial</span>
        </div>
      </section>

      <section className="commercial-body">
        <div className="commercial-form-card">
          {status === "success" ? (
            <div className="commercial-success">
              <div className="commercial-success-icon"><CheckCircle2 size={28} /></div>
              <p className="home-v2-kicker">INSCRIÇÃO RECEBIDA</p>
              <h2>Você está na lista.</h2>
              <p>Vamos avisar quando o transporte comercial estiver pronto para o seu perfil.</p>
              <button type="button" className="home-v2-coral-button" onClick={() => setStatus("idle")}>Cadastrar outra empresa <ArrowRight size={16} /></button>
            </div>
          ) : (
            <>
              <div className="commercial-form-heading">
                <p className="home-v2-kicker">ENTRE NO PILOTO</p>
                <h2>Conte como você quer usar.</h2>
                <p>Sem compromisso. Usaremos estes dados apenas para organizar os primeiros testes comerciais.</p>
              </div>
              <form onSubmit={submit} className="commercial-form">
                <label>
                  <span>Nome *</span>
                  <input value={form.fullName} onChange={(event) => set("fullName")(event.target.value)} required placeholder="Seu nome" />
                </label>
                <label>
                  <span>Email *</span>
                  <input type="email" value={form.email} onChange={(event) => set("email")(event.target.value)} required placeholder="voce@empresa.com" />
                </label>
                <label>
                  <span>Empresa ou operação</span>
                  <input value={form.company} onChange={(event) => set("company")(event.target.value)} placeholder="Nome da empresa (opcional)" />
                </label>
                <label>
                  <span>WhatsApp</span>
                  <input value={form.phone} onChange={(event) => set("phone")(event.target.value)} placeholder="+55 12 99999-9999" />
                </label>
                <label className="commercial-form-wide">
                  <span>Interesse principal *</span>
                  <SiteSelect value={form.interest} onChange={set("interest")} options={INTEREST_OPTIONS} ariaLabel="Interesse comercial" />
                </label>
                <label className="commercial-form-wide">
                  <span>O que você precisa transportar?</span>
                  <textarea value={form.notes} onChange={(event) => set("notes")(event.target.value)} rows={4} placeholder="Ex.: pequenas encomendas entre Ilhabela e São Sebastião." />
                </label>
                {status === "error" && <p className="commercial-form-error">{error}</p>}
                <button className="home-v2-coral-button commercial-submit" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Entrando na lista…" : "Entrar na lista"} <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}
        </div>
        <aside className="commercial-side-note">
          <p className="home-v2-kicker">COMO VAI FUNCIONAR</p>
          <h2>Uma operação pensada para o litoral.</h2>
          <div className="commercial-side-step"><span>01</span><p>Você conta a rota e o tipo de carga ou passageiro.</p></div>
          <div className="commercial-side-step"><span>02</span><p>A gente reúne demanda por região e horário.</p></div>
          <div className="commercial-side-step"><span>03</span><p>O piloto abre quando houver uma operação segura e previsível.</p></div>
        </aside>
      </section>
    </div>
  );
}
