import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Anchor } from "lucide-react";

interface Props { mode: "login" | "register" }

export default function Auth({ mode }: Props) {
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "", password: "", username: "", fullName: "", phone: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate("/viagens");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Anchor size={32} color="#38BDF8" style={{ marginBottom: 12 }} />
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#F0F9FF", marginBottom: 8 }}>
            {mode === "login" ? "Entrar na conta" : "Criar conta"}
          </h1>
          <p style={{ color: "#64748B" }}>
            {mode === "login" ? "Bem-vindo de volta!" : "Junte-se à comunidade LanchaCarona"}
          </p>
        </div>

        <div style={{ background: "#071E36", border: "1px solid #1E3A5F", borderRadius: 16, padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <>
                <div>
                  <label style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Nome completo *</label>
                  <input value={form.fullName} onChange={set("fullName")} required placeholder="João da Silva"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Nome de usuário *</label>
                  <input value={form.username} onChange={set("username")} required placeholder="joaosilva"
                    style={inputStyle} />
                </div>
              </>
            )}
            <div>
              <label style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Email *</label>
              <input type="email" value={form.email} onChange={set("email")} required placeholder="seu@email.com"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Senha *</label>
              <input type="password" value={form.password} onChange={set("password")} required placeholder="Mínimo 6 caracteres"
                style={inputStyle} />
            </div>
            {mode === "register" && (
              <div>
                <label style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Telefone (WhatsApp)</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+55 11 99999-9999"
                  style={inputStyle} />
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#FCA5A5", fontSize: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: "#0284C7", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, color: "#64748B", fontSize: 14 }}>
            {mode === "login" ? (
              <>Não tem conta? <a href="/cadastro" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>Cadastre-se</a></>
            ) : (
              <>Já tem conta? <a href="/entrar" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>Entrar</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0A2847",
  border: "1px solid #1E3A5F",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#E2E8F0",
  fontSize: 15,
  outline: "none",
};
