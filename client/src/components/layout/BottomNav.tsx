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

  const visibleTabs = user ? tabs : tabs.filter((tab) => tab.href !== "/minhas-reservas" && tab.href !== "/perfil");
  const isActive = (href: string) => href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {visibleTabs.map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}>
          <span className={`bottom-nav-item${isActive(href) ? " active" : ""}`} aria-current={isActive(href) ? "page" : undefined}>
            <span className="bottom-nav-icon"><Icon size={20} strokeWidth={isActive(href) ? 2.4 : 1.9} /></span>
            <span className="bottom-nav-label">{label}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
