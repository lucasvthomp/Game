import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { MaritimeIcon, type MaritimeIconVariant } from "@/components/MaritimeIcon";

export default function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  const tabs: Array<{ href: string; icon: MaritimeIconVariant; label: string }> = [
    { href: "/", icon: "wave", label: "Início" },
    { href: "/lanchas", icon: "lancha", label: "Lanchas" },
    { href: "/minhas-reservas", icon: "ticket", label: "Reservas" },
    { href: "/perfil", icon: "passengers", label: "Perfil" },
  ];

  const visibleTabs = user ? tabs : tabs.filter((tab) => tab.href !== "/minhas-reservas" && tab.href !== "/perfil");
  const isActive = (href: string) => href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {visibleTabs.map(({ href, icon, label }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href}>
            <span className={"bottom-nav-item" + (active ? " active" : "")} aria-current={active ? "page" : undefined}>
              <span className="bottom-nav-icon"><MaritimeIcon variant={icon} size={21} /></span>
              <span className="bottom-nav-label">{label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
