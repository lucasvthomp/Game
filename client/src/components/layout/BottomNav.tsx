import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Anchor, CalendarCheck, User } from "lucide-react";

export default function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  const tabs = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/lanchas", icon: Anchor, label: "Lanchas" },
    { href: "/minhas-reservas", icon: CalendarCheck, label: "Reservas" },
    { href: "/perfil", icon: User, label: "Perfil" },
  ];

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav style={{
      display: "none",
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--card)", borderTop: "1px solid var(--border)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }} className="bottom-nav">
      {tabs.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}>
          <button style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, padding: "10px 0", background: "none", border: "none", cursor: "pointer",
            color: isActive(href) ? "var(--boat)" : "var(--text3)",
            transition: "color 150ms ease",
          }}>
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: isActive(href) ? 700 : 500 }}>{label}</span>
          </button>
        </Link>
      ))}
    </nav>
  );
}

