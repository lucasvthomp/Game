import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor } from "lucide-react";

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", fullName: "", phone: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

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
          <div className="auth-sub">{mode === "login" ? "Entre na sua conta LanchaCarona" : "Junte-se à comunidade de caronas no mar"}</div>
        </div>

        <div className="auth-card">
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
