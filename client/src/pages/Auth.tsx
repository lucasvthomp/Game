import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Anchor } from "lucide-react";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="auth-google-mark">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.52A9.74 9.74 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.51 13.58A5.86 5.86 0 0 1 6.2 12c0-.55.11-1.08.31-1.58V7.9H3.27A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.02 4.1l3.24-2.52Z" />
      <path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.73 5.4l3.24 2.52C7.29 8.1 9.45 6.38 12 6.38Z" />
    </svg>
  );
}

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (authError === "google") return "Não foi possível entrar com o Google. Tente novamente.";
    if (authError === "google_unavailable") return "O login com Google ainda não está configurado.";
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", fullName: "", phone: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    apiRequest("GET", "/api/auth/providers")
      .then(data => setGoogleAvailable(Boolean(data.google)))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
      navigate("/viagens");
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--boat)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Anchor size={22} color="#fff" />
          </div>
          <div className="auth-title">{mode === "login" ? "Bem-vindo de volta" : "Criar conta"}</div>
          <div className="auth-sub">{mode === "login" ? "Entre na sua conta Marcamar" : "Junte-se ao piloto de transporte compartilhado na água"}</div>
        </div>

        <div className="auth-card">
          <button
            className="auth-google-button"
            type="button"
            disabled={!googleAvailable}
            onClick={() => { window.location.href = "/api/auth/google"; }}
          >
            <GoogleMark />
            <span>{googleAvailable ? "Continuar com Google" : "Google — configuração pendente"}</span>
          </button>
          <div className="auth-divider"><span>ou use email e senha</span></div>
          <form onSubmit={submit}>
            {mode === "register" && (
              <>
                <div className="form-field">
                  <label className="form-label">NOME COMPLETO *</label>
                  <input className="form-input" value={form.fullName} onChange={set("fullName")} required placeholder="João da Silva" />
                </div>
                <div className="form-field">
                  <label className="form-label">USUÁRIO *</label>
                  <input className="form-input" value={form.username} onChange={set("username")} required placeholder="joaosilva" />
                </div>
              </>
            )}
            <div className="form-field">
              <label className="form-label">EMAIL *</label>
              <input className="form-input" type="email" value={form.email} onChange={set("email")} required placeholder="seu@email.com" />
            </div>
            <div className="form-field">
              <label className="form-label">SENHA *</label>
              <input className="form-input" type="password" value={form.password} onChange={set("password")} required placeholder="Mínimo 6 caracteres" />
            </div>
            {mode === "register" && (
              <div className="form-field">
                <label className="form-label">TELEFONE (WhatsApp)</label>
                <input className="form-input" value={form.phone} onChange={set("phone")} placeholder="+55 11 99999-9999" />
              </div>
            )}
            {error && <div className="form-error">{error}</div>}
            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login"
              ? <>Não tem conta? <a href="/cadastro">Cadastre-se</a></>
              : <>Já tem conta? <a href="/entrar">Entrar</a></>}
          </div>
        </div>
      </div>
    </div>
  );
}

