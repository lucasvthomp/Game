import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MaritimeIcon } from "@/components/MaritimeIcon";

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
  const [form, setForm] = useState({ email: "", password: "", username: "", fullName: "", homeCity: "", phone: "" });

  const setField = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  useEffect(() => {
    apiRequest("GET", "/api/auth/providers")
      .then((data) => setGoogleAvailable(Boolean(data.google)))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
      navigate("/viagens");
    } catch (requestError: any) {
      setError(requestError?.message || "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page-clean">
      <section className="auth-box auth-box-clean">
        <div className="auth-logo auth-logo-clean">
          <span className="auth-brand-icon"><MaritimeIcon variant="lancha" size={25} /></span>
          <p className="auth-kicker">{mode === "login" ? "BEM-VINDO DE VOLTA" : "COMECE PELO SEU PERFIL"}</p>
          <h1 className="auth-title">{mode === "login" ? "Entrar na conta" : "Criar sua conta"}</h1>
          <p className="auth-sub">{mode === "login" ? "Acesse suas reservas e próximos embarques." : "Um perfil simples para reservar travessias pela costa."}</p>
        </div>

        <div className="auth-card auth-card-clean">
          <button className="auth-google-button" type="button" disabled={!googleAvailable} onClick={() => { window.location.href = "/api/auth/google"; }}>
            <GoogleMark />
            <span>{googleAvailable ? "Continuar com Google" : "Google indisponível"}</span>
          </button>
          <div className="auth-divider"><span>ou use email/usuário e senha</span></div>

          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="auth-form-grid">
                <div className="form-field auth-form-full">
                  <label className="form-label" htmlFor="full-name">NOME COMPLETO *</label>
                  <input id="full-name" className="form-input" value={form.fullName} onChange={setField("fullName")} required placeholder="João da Silva" autoComplete="name" />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="username">USUÁRIO *</label>
                  <input id="username" className="form-input" value={form.username} onChange={setField("username")} required placeholder="joaosilva" autoComplete="username" />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="home-city">CIDADE *</label>
                  <input id="home-city" className="form-input" value={form.homeCity} onChange={setField("homeCity")} required placeholder="São Sebastião" autoComplete="address-level2" />
                </div>
              </div>
            )}

            <div className={mode === "register" ? "auth-form-grid" : ""}>
              <div className="form-field">
                <label className="form-label" htmlFor="auth-email">{mode === "login" ? "EMAIL OU USUÁRIO *" : "EMAIL *"}</label>
                <input id="auth-email" className="form-input" type={mode === "login" ? "text" : "email"} value={form.email} onChange={setField("email")} required placeholder={mode === "login" ? "seu@email.com ou marcamar-admin" : "seu@email.com"} autoComplete={mode === "login" ? "username" : "email"} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="auth-password">SENHA *</label>
                <input id="auth-password" className="form-input" type="password" value={form.password} onChange={setField("password")} required placeholder="Mínimo 6 caracteres" autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </div>
              {mode === "register" && (
                <div className="form-field auth-form-full">
                  <label className="form-label" htmlFor="auth-phone">TELEFONE <span>(opcional)</span></label>
                  <input id="auth-phone" className="form-input" value={form.phone} onChange={setField("phone")} placeholder="+55 11 99999-9999" autoComplete="tel" />
                </div>
              )}
            </div>

            {error && <div className="form-error">{error}</div>}
            <button className="form-submit auth-submit-clean" type="submit" disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? <>Não tem conta? <a href="/cadastro">Cadastre-se</a></> : <>Já tem conta? <a href="/entrar">Entrar</a></>}
          </div>
        </div>

        <p className="auth-footnote"><CheckCircle2 size={14} /> Seus dados ficam protegidos e você controla suas informações.</p>
      </section>
    </main>
  );
}
