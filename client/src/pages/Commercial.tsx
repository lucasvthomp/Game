import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { MaritimeIcon } from "@/components/MaritimeIcon";
import { MaritimeIllustration } from "@/components/MaritimeIllustration";

export default function Commercial() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await apiRequest("POST", "/api/commercial-waitlist", {
        email,
        fullName: email.split("@")[0] || "Interesse comercial",
        interest: "both",
      });
      setStatus("success");
      setEmail("");
    } catch (requestError: any) {
      setStatus("error");
      setError(requestError?.message || "Não foi possível cadastrar agora.");
    }
  };

  return (
    <div className="commercial-page commercial-page-v2">
      <main className="commercial-coming-soon">
        {status === "success" ? (
          <div className="commercial-coming-content">
            <span className="commercial-coming-icon commercial-coming-icon-success"><CheckCircle2 size={30} /></span>
            <p className="home-v2-kicker">TRANSPORTE COMERCIAL</p>
            <h1>Você está na lista.</h1>
            <p>Quando o serviço estiver pronto, avisaremos por email.</p>
            <button type="button" className="commercial-coming-reset" onClick={() => setStatus("idle")}>Cadastrar outro email <ArrowRight size={15} /></button>
          </div>
        ) : (
          <div className="commercial-coming-content">
            <span className="commercial-coming-icon"><MaritimeIllustration variant="lancha" size={112} /><span className="commercial-coming-clock"><MaritimeIcon variant="clock" size={24} /></span></span>
            <p className="home-v2-kicker">TRANSPORTE COMERCIAL</p>
            <h1>Em construção.</h1>
            <p>Estamos preparando travessias para pessoas e cargas. Entre na lista para saber quando chegar.</p>
            <form className="commercial-coming-form" onSubmit={submit}>
              <label className="sr-only" htmlFor="commercial-email">Seu email</label>
              <span className="commercial-coming-input"><Mail size={17} /><input id="commercial-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (status !== "idle") setStatus("idle"); }} required placeholder="voce@email.com" autoComplete="email" /></span>
              <button className="home-v2-coral-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Cadastrando…" : "Avisar-me"} <ArrowRight size={16} /></button>
            </form>
            <small className="commercial-coming-note">Sem spam. Apenas uma mensagem quando estiver disponível.</small>
            {status === "error" && <p className="commercial-form-error">{error}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
