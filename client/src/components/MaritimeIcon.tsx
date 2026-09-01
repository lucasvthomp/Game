import type { SVGProps } from "react";

export type MaritimeIconVariant = "lancha" | "dock" | "buoy" | "route" | "wave" | "palm" | "beach" | "anchor" | "clock" | "pinpoint";

type MaritimeIconProps = SVGProps<SVGSVGElement> & {
  variant?: MaritimeIconVariant;
  size?: number;
};

/**
 * Marcamar's small icon language: compact, filled silhouettes with a single
 * highlight and offset shadow. It stays crisp at 16px and still reads as a
 * little 3D sticker at larger sizes.
 */
const paths: Record<MaritimeIconVariant, JSX.Element> = {
  lancha: (
    <>
      <path d="M3.5 15.5h17l-2.7 4.3H7.2l-3.7-4.3Z" fill="currentColor" stroke="none" opacity=".25" transform="translate(1 1)" />
      <path d="M3.5 15.5h17l-2.7 4.3H7.2l-3.7-4.3Z" fill="currentColor" stroke="none" />
      <path d="M6.5 14.7h10.9l2.2 1.6H5.5l1-1.6Z" fill="#fff" stroke="none" opacity=".32" />
      <path d="M7.3 14.5h9.1l-1.8-4.3H9.1l-1.8 4.3Z" fill="currentColor" stroke="none" opacity=".82" />
      <path d="M9.6 10.2h5.2l1.3 4.2H8.3l1.3-4.2Z" fill="#fff" stroke="none" opacity=".62" />
      <path d="M11 5.7h1.8v4.1h-1.8z" fill="currentColor" stroke="none" />
      <path d="M10.1 5.7h3.7v1.2h-3.7z" fill="currentColor" stroke="none" opacity=".9" />
      <path d="M3 22c2.5-1.1 4.8-1.1 7 0 2.3 1.1 4.6 1.1 6.8 0 1.7-.8 3.3-.9 5.2-.2" opacity=".35" />
    </>
  ),
  dock: (
    <>
      <path d="M4 18.5h16v2H4zM6 11.5h12l2 2H4l2-2Z" fill="currentColor" stroke="none" opacity=".25" transform="translate(0 1)" />
      <path d="M4 18.5h16v2H4zM6 11.5h12l2 2H4l2-2Z" fill="currentColor" stroke="none" />
      <path d="M6.7 8.3h10.6l.9 3.2H5.8l.9-3.2Z" fill="currentColor" stroke="none" opacity=".82" />
      <path d="M9 5.3h6l1.3 3H7.7l1.3-3Z" fill="#fff" stroke="none" opacity=".6" />
      <path d="M7 13.5v5M11 13.5v5M15 13.5v5M19 13.5v5" opacity=".82" />
      <path d="M3 22c2.5-1.1 4.8-1.1 7 0 2.3 1.1 4.6 1.1 6.8 0 1.7-.8 3.3-.9 5.2-.2" opacity=".35" />
    </>
  ),
  buoy: (
    <>
      <path d="M7.5 6.5a4.5 4.5 0 0 1 9 0v8a4.5 4.5 0 0 1-9 0v-8Z" fill="currentColor" stroke="none" opacity=".25" transform="translate(1 1)" />
      <path d="M7.5 6.5a4.5 4.5 0 0 1 9 0v8a4.5 4.5 0 0 1-9 0v-8Z" fill="currentColor" stroke="none" />
      <path d="M7.7 9h8.6v3H7.7z" fill="#fff" stroke="none" opacity=".68" />
      <path d="M12 3.3v14.6M8.2 8.3h7.6" />
      <path d="M5.2 20.5c2.1-1.2 4.3-1.2 6.4 0 2.1 1.2 4.3 1.2 6.4 0" opacity=".42" />
    </>
  ),
  route: (
    <>
      <path d="M4 18.5c2.6-4.7 5.4-7 8.3-7 2.4 0 4.3 1 7.7-3.5" stroke="currentColor" strokeWidth="3.2" opacity=".22" transform="translate(1 1)" />
      <path d="M4 18.5c2.6-4.7 5.4-7 8.3-7 2.4 0 4.3 1 7.7-3.5" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="4" cy="18.5" r="2.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="8" r="2.8" fill="currentColor" stroke="none" />
      <circle cx="3.3" cy="17.7" r=".85" fill="#fff" stroke="none" opacity=".7" />
      <circle cx="19.3" cy="7.3" r=".85" fill="#fff" stroke="none" opacity=".7" />
    </>
  ),
  wave: (
    <>
      <path d="M2.5 10c2.2 0 2.2-1.8 4.5-1.8S9.2 10 11.5 10s2.2-1.8 4.5-1.8S18.2 10 21.5 10l-1.1 3.3c-2.1 0-2.6-1.7-4.4-1.7-2.2 0-2.2 1.7-4.5 1.7S9.3 11.6 7 11.6c-1.8 0-2.4 1.7-3.9 1.7L2.5 10Z" fill="currentColor" stroke="none" opacity=".25" transform="translate(0 1.5)" />
      <path d="M2.5 10c2.2 0 2.2-1.8 4.5-1.8S9.2 10 11.5 10s2.2-1.8 4.5-1.8S18.2 10 21.5 10l-1.1 3.3c-2.1 0-2.6-1.7-4.4-1.7-2.2 0-2.2 1.7-4.5 1.7S9.3 11.6 7 11.6c-1.8 0-2.4 1.7-3.9 1.7L2.5 10Z" fill="currentColor" stroke="none" />
      <path d="M3 17c2.1 0 2.1-1.5 4.2-1.5S9.3 17 11.5 17s2.1-1.5 4.2-1.5S17.8 17 21 17" opacity=".48" />
      <path d="M6 21h12" opacity=".32" />
    </>
  ),
  palm: (
    <>
      <path d="M10.4 21c.4-4.3.8-7.7 1.6-11.6l1.7.1c-.3 4.1-.1 7.6.3 11.5h-3.6Z" fill="currentColor" stroke="none" opacity=".25" transform="translate(1 0)" />
      <path d="M10.4 21c.4-4.3.8-7.7 1.6-11.6l1.7.1c-.3 4.1-.1 7.6.3 11.5h-3.6Z" fill="currentColor" stroke="none" />
      <path d="M12 10C9.3 7.1 6 7 3.5 8.6c2.8.3 5 1.1 6.4 2.8L12 10Z" fill="currentColor" stroke="none" />
      <path d="M12 10c2.8-3 6-3.3 8.6-1.8-2.4.2-4.5 1.1-6.1 2.8L12 10Z" fill="currentColor" stroke="none" opacity=".82" />
      <path d="M12 10c-.7-3.4.8-5.6 2.9-6.9.4 2.2-.3 4.3-2.1 5.9L12 10Z" fill="currentColor" stroke="none" opacity=".66" />
      <path d="M8 21h8" opacity=".34" />
    </>
  ),
  beach: (
    <>
      <circle cx="17.5" cy="6" r="3.1" fill="currentColor" stroke="none" opacity=".2" transform="translate(1 1)" />
      <circle cx="17.5" cy="6" r="3.1" fill="currentColor" stroke="none" />
      <path d="M3 16c2.2-1.8 4.5-1.8 6.8 0s4.6 1.8 6.8 0 4.6-1.8 6.8 0v4.1H3V16Z" fill="currentColor" stroke="none" opacity=".25" transform="translate(0 1)" />
      <path d="M3 16c2.2-1.8 4.5-1.8 6.8 0s4.6 1.8 6.8 0 4.6-1.8 6.8 0v4.1H3V16Z" fill="currentColor" stroke="none" />
      <path d="M3 17.2c2.2-1.8 4.5-1.8 6.8 0s4.6 1.8 6.8 0 4.6-1.8 6.8 0" stroke="#fff" opacity=".58" />
      <path d="M5 13.4h6" />
    </>
  ),
  anchor: (
    <>
      <path d="M10.5 5h3v11.5h-3zM7.5 8h9v2h-9z" fill="currentColor" stroke="none" opacity=".25" transform="translate(1 1)" />
      <path d="M10.5 5h3v11.5h-3zM7.5 8h9v2h-9z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="3.5" r="2.2" fill="currentColor" stroke="none" />
      <path d="M6 12.5a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2.2" />
      <path d="M3.5 16.5c1.8.8 3.7.8 5.5 0M15 16.5c1.8.8 3.7.8 5.5 0" opacity=".46" />
      <circle cx="11.3" cy="2.8" r=".6" fill="#fff" stroke="none" opacity=".75" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.3" fill="currentColor" stroke="none" opacity=".2" transform="translate(1 1)" />
      <circle cx="12" cy="12" r="9.3" fill="currentColor" stroke="none" opacity=".14" />
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v5l3.5 2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v1M22 12h-1M12 22v-1M2 12h1" opacity=".45" />
    </>
  ),
  pinpoint: (
    <>
      <path d="M12 21s6.5-6.1 6.5-11.25a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21Z" fill="currentColor" stroke="none" opacity=".24" transform="translate(1 1)" />
      <path d="M12 21s6.5-6.1 6.5-11.25a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21Z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.75" r="2.6" fill="#fff" stroke="none" opacity=".82" />
      <circle cx="11.5" cy="9.2" r=".7" fill="currentColor" stroke="none" opacity=".8" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
    >
      {paths[variant]}
    </svg>
  );
}
