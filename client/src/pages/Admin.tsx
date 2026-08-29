import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Verification = { id: number; userId: number; verified: boolean; createdAt: string; boatName?: string; boatModel?: string };

export default function Admin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/verifications"],
    queryFn: () => apiRequest("GET", "/api/admin/verifications"),
  });
  const { data: routeData } = useQuery({ queryKey: ["/api/admin/maritime-routes"], queryFn: () => apiRequest("GET", "/api/admin/maritime-routes") });
  const { data: incidentData } = useQuery({ queryKey: ["/api/admin/incidents"], queryFn: () => apiRequest("GET", "/api/admin/incidents") });
  const { data: routeRequestData } = useQuery({ queryKey: ["/api/admin/route-requests"], queryFn: () => apiRequest("GET", "/api/admin/route-requests") });
  const routeRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest("PATCH", `/api/admin/route-requests/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/route-requests"] }),
  });
  const mutation = useMutation({
    mutationFn: ({ id, verified }: { id: number; verified: boolean }) =>
      apiRequest("PATCH", `/api/admin/verifications/captain/${id}`, { verified }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/verifications"] }),
  });

  const captainItems = (data?.captains || []) as Verification[];

  return (
    <div className="page-wrapper admin-page">
      <div className="section-inner">
        <div className="admin-heading">
          <div className="admin-heading-icon"><ShieldCheck size={24} /></div>
          <div><p className="section-label">MARCAMAR · ADMIN</p><h1 className="page-title">Verificações</h1><p className="page-sub">Revise documentos e ative operadores antes da publicação.</p></div>
        </div>
        <section className="admin-section">
          <div className="admin-section-heading"><h2>Rotas marítimas</h2><span>{routeData?.routes?.length || 0}</span></div>
          {(routeData?.routes || []).map((route: any) => (
            <div className="admin-verification-card" key={route.id}>
              <div><strong>{route.name}</strong><span>Rota #{route.id} · {route.region || "Sem região"}</span></div>
              <div className="admin-verification-actions">
                <span className={route.active ? "admin-status verified" : "admin-status"}>{route.active ? "Publicada" : "Rascunho"}</span>
                <button className="admin-verify-button" onClick={() => apiRequest("PATCH", `/api/admin/maritime-routes/${route.id}`, { active: !route.active }).then(() => qc.invalidateQueries({ queryKey: ["/api/admin/maritime-routes"] }))}>{route.active ? "Desativar" : "Publicar"}</button>
              </div>
            </div>
          ))}
        </section>
        <section className="admin-section">
          <div className="admin-section-heading"><h2>Pedidos de rota</h2><span>{routeRequestData?.requests?.length || 0}</span></div>
          {(routeRequestData?.requests || []).length === 0 ? <p className="admin-empty">Nenhum pedido de rota pendente.</p> : (routeRequestData?.requests || []).map((request: any) => {
            const nextStatus: Record<string, string | undefined> = { open: "reviewing", reviewing: "matched", matched: "closed", closed: undefined };
            const next = nextStatus[request.status];
            return (
              <div className="admin-verification-card" key={request.id}>
                <div>
                  <strong>{request.origin} → {request.destination}</strong>
                  <span>{request.user?.fullName || "Passageiro"} · {request.passengers} passageiro{request.passengers === 1 ? "" : "s"} · {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString("pt-BR") : "Data flexível"}</span>
                  {request.notes && <span>{request.notes}</span>}
                </div>
                <div className="admin-verification-actions">
                  <span className={`admin-status ${request.status === "matched" ? "verified" : ""}`}>{request.status}</span>
                  {next && <button className="admin-verify-button" onClick={() => routeRequestMutation.mutate({ id: request.id, status: next })}>{next === "reviewing" ? "Analisar" : next === "matched" ? "Marcar possibilidade" : "Encerrar"}</button>}
                </div>
              </div>
            );
          })}
        </section>
        <section className="admin-section">
          <div className="admin-section-heading"><h2>Incidentes</h2><span>{incidentData?.incidents?.length || 0}</span></div>
          {(incidentData?.incidents || []).length === 0 ? <p className="admin-empty">Nenhum incidente registrado.</p> : (incidentData?.incidents || []).map((incident: any) => (
            <div className="admin-verification-card" key={incident.id}>
              <div><strong>{incident.type}</strong><span>Reserva #{incident.reservationId} · {incident.description}</span></div>
              <div className="admin-verification-actions">
                <span className={incident.status === "resolved" || incident.status === "dismissed" ? "admin-status verified" : "admin-status"}>{incident.status}</span>
                {incident.status === "open" && <button className="admin-verify-button" onClick={() => apiRequest("PATCH", `/api/admin/incidents/${incident.id}`, { status: "investigating" }).then(() => qc.invalidateQueries({ queryKey: ["/api/admin/incidents"] }))}>Investigar</button>}
                {incident.status === "investigating" && <button className="admin-verify-button" onClick={() => apiRequest("PATCH", `/api/admin/incidents/${incident.id}`, { status: "resolved" }).then(() => qc.invalidateQueries({ queryKey: ["/api/admin/incidents"] }))}>Resolver</button>}
              </div>
            </div>
          ))}
        </section>
        {isLoading ? <p className="admin-empty">Carregando verificações...</p> : (
          <section className="admin-section">
            <div className="admin-section-heading"><h2>Capitães</h2><span>{captainItems.length}</span></div>
            {captainItems.length === 0 ? <p className="admin-empty">Nenhum perfil enviado.</p> : captainItems.map((item) => (
              <div className="admin-verification-card" key={item.id}>
                <div><strong>{item.boatName || "Lancha sem nome"}</strong><span>Perfil #{item.id} · Usuário #{item.userId}</span></div>
                <div className="admin-verification-actions">
                  <span className={item.verified ? "admin-status verified" : "admin-status"}>{item.verified ? "Verificado" : "Pendente"}</span>
                  <button className="admin-verify-button" onClick={() => mutation.mutate({ id: item.id, verified: !item.verified })}>{item.verified ? <X size={14} /> : <Check size={14} />}{item.verified ? "Revogar" : "Aprovar"}</button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
