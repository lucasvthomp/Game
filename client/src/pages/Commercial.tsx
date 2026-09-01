import { useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { MaritimeIcon } from "@/components/MaritimeIcon";

export default function Commercial() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [spotlight, setSpotlight] = useState({ x: 50, y: 35 });

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

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((event.clientY - rect.top) / rect.height) * 100),
    });
  };

  const shellStyle = {
    "--spot-x": spotlight.x + "%",
    "--spot-y": spotlight.y + "%",
  } as CSSProperties;

  return (
    <div className="commercial-page commercial-page-simple commercial-page-clean" onPointerMove={handlePointerMove}>
      <main className="commercial-waitlist-shell" style={shellStyle}>
        <div className="commercial-waitlist-water" aria-hidden="true" />
        <div className="commercial-waitlist-orbit commercial-waitlist-orbit-one" aria-hidden="true" />
        <div className="commercial-waitlist-orbit commercial-waitlist-orbit-two" aria-hidden="true" />
        <div className="commercial-waitlist-content">
          {status === "success" ? (
            <div className="commercial-waitlist-success">
              <span className="commercial-waitlist-icon commercial-waitlist-icon-success"><CheckCircle2 size={28} /></span>
              <p className="home-v2-kicker">TRANSPORTE COMERCIAL</p>
              <h1>Você está na lista.</h1>
              <p>Quando estiver pronto, avisaremos por email.</p>
              <button type="button" className="commercial-waitlist-reset" onClick={() => setStatus("idle")}>Cadastrar outro email <ArrowRight size={15} /></button>
            </div>
          ) : (
            <>
              <span className="commercial-waitlist-icon commercial-waitlist-icon-boat"><MaritimeIcon variant="lancha" size={30} /></span>
              <p className="home-v2-kicker">TRANSPORTE COMERCIAL</p>
              <h1>A costa também<br /><em>move negócios.</em></h1>
              <p>Estamos preparando uma forma simples de transportar pessoas e cargas pela água.</p>
              <form className="commercial-waitlist-form" onSubmit={submit}>
                <label className="sr-only" htmlFor="commercial-email">Seu email</label>
                <span className="commercial-waitlist-input"><Mail size={17} /><input id="commercial-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (status !== "idle") setStatus("idle"); }} required placeholder="voce@email.com" autoComplete="email" /></span>
                <button className="home-v2-coral-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Cadastrando…" : "Avise-me"} <ArrowRight size={16} /></button>
              </form>
              <small className="commercial-waitlist-note">Sem spam. Só avisaremos quando estiver disponível.</small>
              {status === "error" && <p className="commercial-form-error">{error}</p>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
