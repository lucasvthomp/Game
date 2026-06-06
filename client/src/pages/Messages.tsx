import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Send, ChevronLeft, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Messages() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: [`/api/messages/${reservationId}`],
    queryFn: () => apiRequest("GET", `/api/messages/${reservationId}`),
    refetchInterval: 4000,
    enabled: !!user,
  });

  const { data: reservationData } = useQuery({
    queryKey: ["/api/my/reservations"],
    queryFn: () => apiRequest("GET", "/api/my/reservations"),
    enabled: !!user,
  });

  const reservation = reservationData?.reservations?.find((r: any) => r.id === parseInt(reservationId || "0"))?.ride;

  const messages = data?.messages || [];

  const sendMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/messages/${reservationId}`, { body: text.trim() }),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: [`/api/messages/${reservationId}`] }); },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!user) { navigate("/entrar"); return null; }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", background: "var(--card)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 60, zIndex: 10 }}>
        <button onClick={() => navigate(-1 as any)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <ChevronLeft size={18} /> Voltar
        </button>
        <span style={{ fontWeight: 700, color: "var(--text1)", fontSize: 16 }}>Mensagens</span>
      </div>
      {reservation && (
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "10px 20px", fontSize: 13, color: "var(--text2)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={12} /> {reservation.originCity} → {reservation.destinationCity}
          </span>
          {reservation.departureTime && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={12} /> {format(new Date(reservation.departureTime), "dd MMM, HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10, maxWidth: 600, width: "100%", margin: "0 auto" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 14, marginTop: 40 }}>
            Nenhuma mensagem ainda. Seja o primeiro a escrever!
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3 }}>{isMe ? "Você" : msg.senderName}</div>
              <div style={{
                maxWidth: "78%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: isMe ? "var(--boat)" : "var(--card)",
                color: isMe ? "#fff" : "var(--text1)",
                fontSize: 14, lineHeight: 1.5,
                border: isMe ? "none" : "1px solid var(--border)",
              }}>
                {msg.body}
              </div>
              <div style={{ fontSize: 11, color: isMe ? "rgba(255,255,255,0.6)" : "var(--text3)", marginTop: 3, textAlign: isMe ? "right" : "left" }}>
                {format(new Date(msg.createdAt || msg.sentAt || Date.now()), "HH:mm", { locale: ptBR })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", background: "var(--card)", borderTop: "1px solid var(--border)", position: "sticky", bottom: 0 }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 600, margin: "0 auto" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && text.trim() && sendMutation.mutate()}
            placeholder="Escreva uma mensagem..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 12,
              background: "var(--bg)", border: "1px solid var(--border)",
              color: "var(--text1)", fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={() => text.trim() && sendMutation.mutate()}
            disabled={!text.trim() || sendMutation.isPending}
            style={{
              width: 44, height: 44, borderRadius: 12, border: "none",
              background: "var(--boat)", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: !text.trim() ? 0.5 : 1,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
