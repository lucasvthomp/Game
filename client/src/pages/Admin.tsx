import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Check, FileCheck2, ShieldCheck, Trophy, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Captain = { id: number; userId: number; verified: boolean; topCaptain?: boolean; createdAt: string; boatName?: string; boatModel?: string };
type Submission = { id: number; userId: number; kind: string; status: string; subjectName?: string; documentUrl?: string; provider?: string; reviewerNotes?: string; createdAt: string };

const kindLabel: Record<string, string> = {
  identity: "Identidade",
  criminal_background: "Certidão criminal",
  boat_license: "Habilitação náutica",
  boat_registration: "Registro da embarcação",
};

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  needs_review: "Revisar",
  verified: "Aprovado",
  rejected: "Recusado",
};

export default function Admin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["/api/admin/verifications"], queryFn: () => apiRequest("GET", "/api/admin/verifications") });
  const { data: routeData } = useQuery({ queryKey: ["/api/admin/maritime-routes"], queryFn: () => apiRequest("GET", "/api/admin/maritime-routes") });
  const { data: incidentData } = useQuery({ queryKey: ["/api/admin/incidents"], queryFn: () => apiRequest("GET", "/api/admin/incidents") });
  const { data: routeRequestData } = useQuery({ queryKey: ["/api/admin/route-requests"], queryFn: () => apiRequest("GET", "/api/admin/route-requests") });

  const invalidate = (key: string) => qc.invalidateQueries({ queryKey: [key] });
  const captainMutation = useMutation({
    mutationFn: ({ id, verified, topCaptain }: { id: number; verified: boolean; topCaptain?: boolean }) => apiRequest("PATCH", `/api/admin/verifications/captain/${id}`, { verified, topCaptain }),
    onSuccess: () => invalidate("/api/admin/verifications"),
  });
  const submissionMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest("PATCH", `/api/admin/verifications/submissions/${id}`, { status }),
    onSuccess: () => invalidate("/api/admin/verifications"),
  });
  const routeRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest("PATCH", `/api/admin/route-requests/${id}`, { status }),
    onSuccess: () => invalidate("/api/admin/route-requests"),
  });

  const captains = (data?.captains || []) as Captain[];
  const submissions = (data?.submissions || []) as Submission[];

  return (
    <div className="page-wrapper admin-page">
      <div className="section-inner">
        <div className="admin-heading">
          <div className="admin-heading-icon"><ShieldCheck size={24} /></div>
          <div><p className="section-label">MARCAMAR · EQUIPE</p><h1 className="page-title">Painel de revisão</h1><p className="page-sub">Aprove documentos, acompanhe pedidos e mantenha cada decisão registrada.</p></div>
        </div>

        <section className="admin-section admin-verification-intro">
          <div className="admin-section-heading"><div><h2>Fila de verificações</h2><p className="admin-section-help">O piloto usa revisão humana. Nenhum documento é marcado como aprovado automaticamente.</p></div><span>{submissions.filter((item) => item.status === "pending" || item.status === "needs_review").length}</span></div>
          {submissions.length === 0 ? <p className="admin-empty">Nenhum documento enviado.</p> : submissions.map((item) => (
            <div className="admin-verification-card" key={item.id}>
              <div>
                <strong><FileCheck2 size={15} /> {kindLabel[item.kind] || item.kind}</strong>
                <span>{item.subjectName || "Usuário"} · usuário #{item.userId} · {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                <span>{item.provider === "manual" ? "Revisão manual" : item.provider}</span>
                {item.documentUrl && <a href={item.documentUrl} target="_blank" rel="noreferrer">Abrir documento</a>}
              </div>
              <div className="admin-verification-actions">
                <span className={item.status === "verified" ? "admin-status verified" : "admin-status"}>{statusLabel[item.status] || item.status}</span>
                {item.status !== "verified" && <button className="admin-verify-button" onClick={() => submissionMutation.mutate({ id: item.id, status: "verified" })}><Check size={14} /> Aprovar</button>}
                {item.status !== "rejected" && <button className="admin-verify-button" onClick={() => submissionMutation.mutate({ id: item.id, status: "rejected" })}><X size={14} /> Recusar</button>}
                {item.status === "pending" && <button className="admin-verify-button" onClick={() => submissionMutation.mutate({ id: item.id, status: "needs_review" })}>Revisar</button>}
              </div>
            </div>
          ))}
        </section>

        <section className="admin-section">
          <div className="admin-section-heading"><h2>Capitães</h2><span>{captains.length}</span></div>
          {isLoading ? <p className="admin-empty">Carregando...</p> : captains.length === 0 ? <p className="admin-empty">Nenhum perfil enviado.</p> : captains.map((item) => (
            <div className="admin-verification-card" key={item.id}>
              <div><strong><BadgeCheck size={15} /> {item.boatName || "Lancha sem nome"}</strong><span>Perfil #{item.id} · Usuário #{item.userId} · {item.boatModel || "modelo não informado"}</span></div>
              <div className="admin-verification-actions">
                <span className={item.verified ? "admin-status verified" : "admin-status"}>{item.verified ? "Publicado" : "Aguardando documentos"}</span>
                <button className="admin-verify-button" onClick={() => captainMutation.mutate({ id: item.id, verified: !item.verified, topCaptain: item.topCaptain })}>{item.verified ? <X size={14} /> : <Check size={14} />}{item.verified ? "Revogar" : "Publicar"}</button>
                <button className="admin-verify-button admin-top-toggle" onClick={() => captainMutation.mutate({ id: item.id, verified: item.verified, topCaptain: !item.topCaptain })}><Trophy size={14} />{item.topCaptain ? "Remover destaque" : "Marcar top"}</button>
              </div>
            </div>
          ))}
        </section>

        <section className="admin-section">
          <div className="admin-section-heading"><h2>Rotas marítimas</h2><span>{routeData?.routes?.length || 0}</span></div>
          {(routeData?.routes || []).map((route: any) => <div className="admin-verification-card" key={route.id}><div><strong>{route.name}</strong><span>Rota #{route.id} · {route.region || "São Paulo"}</span></div><div className="admin-verification-actions"><span className={route.active ? "admin-status verified" : "admin-status"}>{route.active ? "Publicada" : "Rascunho"}</span><button className="admin-verify-button" onClick={() => apiRequest("PATCH", `/api/admin/maritime-routes/${route.id}`, { active: !route.active }).then(() => invalidate("/api/admin/maritime-routes"))}>{route.active ? "Desativar" : "Publicar"}</button></div></div>)}
        </section>

        <section className="admin-section">
          <div className="admin-section-heading"><h2>Pedidos de rota</h2><span>{routeRequestData?.requests?.length || 0}</span></div>
          {(routeRequestData?.requests || []).length === 0 ? <p className="admin-empty">Nenhum pedido de rota pendente.</p> : (routeRequestData?.requests || []).map((request: any) => {
            const next: Record<string, string | undefined> = { open: "reviewing", reviewing: "matched", matched: "closed", closed: undefined };
            return <div className="admin-verification-card" key={request.id}><div><strong>{request.origin} → {request.destination}</strong><span>{request.user?.fullName || "Passageiro"} · {request.passengers} pessoa(s) · {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString("pt-BR") : "Data flexível"}</span></div><div className="admin-verification-actions"><span className={request.status === "matched" ? "admin-status verified" : "admin-status"}>{request.status}</span>{next[request.status] && <button className="admin-verify-button" onClick={() => routeRequestMutation.mutate({ id: request.id, status: next[request.status]! })}>Avançar</button>}</div></div>;
          })}
        </section>

        <section className="admin-section">
          <div className="admin-section-heading"><h2>Incidentes</h2><span>{incidentData?.incidents?.length || 0}</span></div>
          {(incidentData?.incidents || []).length === 0 ? <p className="admin-empty">Nenhum incidente registrado.</p> : (incidentData?.incidents || []).map((incident: any) => <div className="admin-verification-card" key={incident.id}><div><strong>{incident.type}</strong><span>Reserva #{incident.reservationId} · {incident.description}</span></div><div className="admin-verification-actions"><span className={incident.status === "resolved" || incident.status === "dismissed" ? "admin-status verified" : "admin-status"}>{incident.status}</span>{incident.status === "open" && <button className="admin-verify-button" onClick={() => apiRequest("PATCH", `/api/admin/incidents/${incident.id}`, { status: "investigating" }).then(() => invalidate("/api/admin/incidents"))}>Investigar</button>}{incident.status === "investigating" && <button className="admin-verify-button" onClick={() => apiRequest("PATCH", `/api/admin/incidents/${incident.id}`, { status: "resolved" }).then(() => invalidate("/api/admin/incidents"))}>Resolver</button>}</div></div>)}
        </section>
      </div>
    </div>
  );
}
