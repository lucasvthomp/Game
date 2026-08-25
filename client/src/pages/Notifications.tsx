import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Bell, CheckCheck, ChevronRight, Inbox, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { BoatMediaCluster } from "@/components/layout/BoatMediaCluster";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export default function Notifications() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => apiRequest("GET", "/api/notifications"),
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  if (!user) {
    navigate("/entrar");
    return null;
  }

  const notifications: NotificationItem[] = data?.notifications ?? [];
  const unread = notifications.filter((item) => !item.readAt).length;

  const openNotification = (item: NotificationItem) => {
    if (!item.readAt) markRead.mutate(item.id);
    if (item.href) navigate(item.href);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <Link href="/perfil">
            <span className="content-page-v2-secondary-link"><ArrowLeft size={16} /> Voltar ao perfil</span>
          </Link>
          <div className="notifications-heading-row">
            <div>
              <p className="home-v2-kicker">CENTRAL MARCAMAR</p>
              <h1 className="page-title">Notificações</h1>
              <p className="page-sub">Acompanhe atualizações das suas reservas e pedidos de rota.</p>
            </div>
            <BoatMediaCluster variant="compact" />
          </div>
        </div>
        <div className="notifications-summary">
          <Bell size={17} />
          <strong>{unread}</strong>
          <span>{unread === 1 ? "não lida" : "não lidas"}</span>
        </div>
      </div>

      <div className="notifications-list" aria-live="polite">
        {isLoading ? (
          <div className="notifications-empty"><Bell size={30} /><p>Carregando suas notificações…</p></div>
        ) : isError ? (
          <div className="notifications-empty"><Inbox size={30} /><p>Não foi possível carregar agora.</p><button className="btn-secondary" onClick={() => qc.invalidateQueries({ queryKey: ["/api/notifications"] })}>Tentar novamente</button></div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty"><Inbox size={36} /><h2>Tudo em dia por aqui.</h2><p>Quando houver uma atualização sobre suas viagens, ela aparecerá nesta central.</p><Link href="/lanchas"><span className="home-v2-coral-button">Encontrar uma lancha <ChevronRight size={16} /></span></Link></div>
        ) : (
          notifications.map((item) => (
            <article key={item.id} className={`notification-card ${item.readAt ? "is-read" : "is-unread"}`}>
              <button className="notification-card-button" onClick={() => openNotification(item)} aria-label={item.href ? `Abrir: ${item.title}` : item.title}>
                <span className="notification-icon"><Bell size={17} /></span>
                <span className="notification-copy">
                  <span className="notification-title-row"><strong>{item.title}</strong>{!item.readAt && <span className="notification-dot" aria-label="Não lida" />}</span>
                  <span className="notification-body">{item.body}</span>
                  <span className="notification-time">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ptBR })}</span>
                </span>
                {item.href && <ChevronRight size={17} className="notification-arrow" />}
              </button>
              {!item.readAt && <button className="notification-read" onClick={() => markRead.mutate(item.id)} disabled={markRead.isPending}><CheckCheck size={14} /> Marcar como lida</button>}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
