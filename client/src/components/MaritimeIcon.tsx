import type { SVGProps } from "react";

export type MaritimeIconVariant = "lancha" | "dock" | "buoy" | "route" | "wave";

type MaritimeIconProps = SVGProps<SVGSVGElement> & {
  variant?: MaritimeIconVariant;
  size?: number;
};

const paths: Record<MaritimeIconVariant, JSX.Element> = {
  lancha: (
    <>
      <path d="M4 16.5h16l-2.2 3H8.2L4 16.5Z" fill="currentColor" opacity=".18" />
      <path d="M4 16.5h16l-2.2 3H8.2L4 16.5Z" />
      <path d="M7 14.5h10.5M8.5 12.25h7M9.5 10.25h5" />
      <path d="M16.75 6.5v5.75M15 6.5h3.5M15.75 4.5h2" />
      <path d="M3 22c2.5-1.2 4.9-1.2 7.2 0 2.3 1.2 4.7 1.2 7 0 1.6-.8 3.2-.9 4.8-.25" opacity=".45" />
    </>
  ),
  dock: (
    <>
      <path d="M4 18.5h16M6 18.5v-7M10 18.5v-7M14 18.5v-7M18 18.5v-7" />
      <path d="M3 11.5h18M7 8.5h10M8.5 5.5h7" />
      <path d="M4 22c2.5-1.2 4.9-1.2 7.2 0 2.3 1.2 4.7 1.2 7 0 1.6-.8 3.2-.9 4.8-.25" opacity=".45" />
    </>
  ),
  buoy: (
    <>
      <path d="M12 3.5v14.25M8.25 8.5h7.5M8.5 12h7" />
      <path d="M7.5 6.5a4.5 4.5 0 0 1 9 0v8a4.5 4.5 0 0 1-9 0v-8Z" />
      <path d="M5.5 20.5c2.2-1.3 4.4-1.3 6.5 0 2.1 1.3 4.3 1.3 6.5 0" opacity=".45" />
    </>
  ),
  route: (
    <>
      <path d="M4 18.5c2.6-4.7 5.4-7 8.3-7 2.4 0 4.3 1 7.7-3.5" />
      <circle cx="4" cy="18.5" r="2.25" fill="currentColor" />
      <circle cx="20" cy="8" r="2.25" fill="currentColor" />
      <path d="M8 21.5h8" opacity=".45" />
    </>
  ),
  wave: (
    <>
      <path d="M3 9.5c2.1 0 2.1-1.5 4.2-1.5s2.1 1.5 4.2 1.5 2.1-1.5 4.2-1.5 2.1 1.5 4.2 1.5" />
      <path d="M3 15c2.1 0 2.1-1.5 4.2-1.5s2.1 1.5 4.2 1.5 2.1-1.5 4.2-1.5 2.1 1.5 4.2 1.5" opacity=".52" />
      <path d="M6 20.5h12" opacity=".35" />
    </>
  ),
};

export function MaritimeIcon({ variant = "lancha", size = 32, className, ...props }: MaritimeIconProps) {
  return (
    <svg
      {...props}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
    >
      {paths[variant]}
    </svg>
  );
}
