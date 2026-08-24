import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Verification = { id: number; userId: number; verified: boolean; createdAt: string; boatName?: string; boatModel?: string; carMake?: string; carModel?: string };

export default function Admin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/verifications"],
    queryFn: () => apiRequest("GET", "/api/admin/verifications"),
  });
  const { data: routeData } = useQuery({ queryKey: ["/api/admin/maritime-routes"], queryFn: () => apiRequest("GET", "/api/admin/maritime-routes") });
  const { data: incidentData } = useQuery({ queryKey: ["/api/admin/incidents"], queryFn: () => apiRequest("GET", "/api/admin/incidents") });
  const mutation = useMutation({
    mutationFn: ({ kind, id, verified }: { kind: "captain" | "driver"; id: number; verified: boolean }) =>
      apiRequest("PATCH", `/api/admin/verifications/${kind}/${id}`, { verified }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/verifications"] }),
  });

  const groups = [
    { kind: "captain" as const, label: "Capitães", items: (data?.captains || []) as Verification[], name: (item: Verification) => item.boatName || "Embarcação sem nome" },
    { kind: "driver" as const, label: "Motoristas", items: (data?.drivers || []) as Verification[], name: (item: Verification) => [item.carMake, item.carModel].filter(Boolean).join(" ") || "Veículo sem nome" },
  ];

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
        {isLoading ? <p className="admin-empty">Carregando verificações...</p> : groups.map((group) => (
          <section className="admin-section" key={group.kind}>
            <div className="admin-section-heading"><h2>{group.label}</h2><span>{group.items.length}</span></div>
            {group.items.length === 0 ? <p className="admin-empty">Nenhum perfil enviado.</p> : group.items.map((item) => (
              <div className="admin-verification-card" key={item.id}>
                <div><strong>{group.name(item)}</strong><span>Perfil #{item.id} · Usuário #{item.userId}</span></div>
                <div className="admin-verification-actions">
                  <span className={item.verified ? "admin-status verified" : "admin-status"}>{item.verified ? "Verificado" : "Pendente"}</span>
                  <button className="admin-verify-button" onClick={() => mutation.mutate({ kind: group.kind, id: item.id, verified: !item.verified })}>{item.verified ? <X size={14} /> : <Check size={14} />}{item.verified ? "Revogar" : "Aprovar"}</button>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
