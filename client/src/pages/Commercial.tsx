import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Commercial() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
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
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Não foi possível cadastrar agora.");
    }
  };

  return (
    <div className="commercial-page commercial-page-simple">
      <main className="commercial-waitlist-shell">
        {status === "success" ? (
          <div className="commercial-waitlist-success">
            <span className="commercial-waitlist-icon"><CheckCircle2 size={28} /></span>
            <p className="home-v2-kicker">MARCAMAR COMERCIAL</p>
            <h1>Você está na lista.</h1>
            <p>Vamos avisar quando estiver disponível.</p>
            <button type="button" className="commercial-waitlist-reset" onClick={() => setStatus("idle")}>Cadastrar outro email <ArrowRight size={15} /></button>
          </div>
        ) : (
          <>
            <span className="commercial-waitlist-icon"><Mail size={25} /></span>
            <p className="home-v2-kicker">MARCAMAR COMERCIAL</p>
            <h1>Em breve por aqui.</h1>
            <p>Deixe seu email e avisaremos quando o transporte comercial estiver disponível.</p>
            <form className="commercial-waitlist-form" onSubmit={submit}>
              <label className="sr-only" htmlFor="commercial-email">Seu email</label>
              <input id="commercial-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (status !== "idle") setStatus("idle"); }} required placeholder="voce@email.com" autoComplete="email" />
              <button className="home-v2-coral-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Cadastrando…" : "Avisar-me"} <ArrowRight size={16} /></button>
            </form>
            {status === "error" && <p className="commercial-form-error">{error}</p>}
          </>
        )}
      </main>
    </div>
  );
}
