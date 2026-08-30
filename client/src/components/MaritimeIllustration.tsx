import type { SVGProps } from "react";

export type MaritimeIllustrationVariant = "lancha" | "palm" | "beach" | "anchor" | "clock" | "pinpoint";

type MaritimeIllustrationProps = SVGProps<SVGSVGElement> & {
  variant: MaritimeIllustrationVariant;
  size?: number;
};

const art: Record<MaritimeIllustrationVariant, JSX.Element> = {
  lancha: (
    <>
      <ellipse cx="48" cy="79" rx="29" ry="5" fill="var(--text1)" opacity=".08" />
      <path d="M16 54h61l-9.5 15H31Z" fill="var(--boat-dark)" />
      <path d="M16 54h61l-6 8H23Z" fill="var(--boat)" />
      <path d="M28 51h29l8 3H24Z" fill="var(--card)" opacity=".95" />
      <path d="M34 50V36h21v14" fill="var(--car)" opacity=".9" />
      <path d="M37 38h15v9H37Z" fill="var(--mv-sand)" opacity=".8" />
      <path d="M64 44v19M61 44h7" stroke="var(--text1)" strokeWidth="3" strokeLinecap="round" opacity=".65" />
      <path d="M10 73c8-4 14-4 22 0s14 4 22 0 14-4 22 0 14 4 22 0" fill="none" stroke="var(--boat)" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <path d="M30 63h35" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </>
  ),
  palm: (
    <>
      <circle cx="69" cy="25" r="11" fill="var(--car)" opacity=".82" />
      <ellipse cx="46" cy="78" rx="26" ry="5" fill="var(--text1)" opacity=".08" />
      <path d="M40 78c4-17 6-30 6-43" fill="none" stroke="var(--car-dark, var(--car))" strokeWidth="6" strokeLinecap="round" />
      <path d="M46 36C35 28 26 29 18 35c11-1 18 2 25 7M47 35c6-13 17-17 27-15-8 4-15 10-21 19M46 37C48 24 56 18 66 17c-6 7-10 13-11 22M45 37C33 35 23 38 17 46c10-4 19-4 28-1" fill="none" stroke="var(--boat)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 78h37" stroke="var(--boat-dark)" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    </>
  ),
  beach: (
    <>
      <circle cx="69" cy="24" r="12" fill="var(--car)" opacity=".82" />
      <path d="M11 67c11-7 22-7 33 0s22 7 33 0 22-7 33 0" fill="none" stroke="var(--boat)" strokeWidth="5" strokeLinecap="round" />
      <path d="M10 78c11-7 22-7 33 0s22 7 33 0 22-7 33 0" fill="none" stroke="var(--boat-light)" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 65 43 38l13 27" fill="var(--car)" opacity=".92" />
      <path d="M43 38v34" stroke="var(--text1)" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      <path d="M30 65h27" stroke="var(--card)" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    </>
  ),
  anchor: (
    <>
      <ellipse cx="48" cy="80" rx="25" ry="4" fill="var(--text1)" opacity=".08" />
      <circle cx="48" cy="19" r="9" fill="var(--car)" opacity=".88" />
      <path d="M48 28v35M39 36h18" fill="none" stroke="var(--boat-dark)" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 51c0 16 10 25 24 25s24-9 24-25" fill="none" stroke="var(--boat)" strokeWidth="7" strokeLinecap="round" />
      <path d="M20 69c8 5 16 6 24 2M52 71c8 4 16 3 24-2" fill="none" stroke="var(--boat)" strokeWidth="4" strokeLinecap="round" opacity=".65" />
      <circle cx="48" cy="19" r="3" fill="var(--card)" opacity=".8" />
    </>
  ),
  clock: (
    <>
      <ellipse cx="50" cy="79" rx="25" ry="4" fill="var(--text1)" opacity=".08" />
      <circle cx="48" cy="45" r="27" fill="var(--boat-light)" stroke="var(--boat)" strokeWidth="4" />
      <circle cx="48" cy="45" r="21" fill="var(--card)" opacity=".92" />
      <path d="M48 45V31M48 45l12 7" stroke="var(--boat-dark)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="48" cy="45" r="4" fill="var(--car)" />
      <path d="M48 13v5M80 45h-5M48 77v-5M16 45h5" stroke="var(--boat)" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    </>
  ),
  pinpoint: (
    <>
      <ellipse cx="48" cy="82" rx="22" ry="4" fill="var(--text1)" opacity=".08" />
      <path d="M48 77S72 57 72 39a24 24 0 1 0-48 0c0 18 24 38 24 38Z" fill="var(--boat)" />
      <path d="M48 70S66 54 66 40a18 18 0 1 0-36 0c0 14 18 30 18 30Z" fill="var(--boat-light)" opacity=".9" />
      <circle cx="48" cy="39" r="8" fill="var(--car)" />
      <circle cx="45" cy="36" r="3" fill="#fff" opacity=".72" />
    </>
  ),
};

export function MaritimeIllustration({ variant, size = 96, className, ...props }: MaritimeIllustrationProps) {
  return (
    <svg
      {...props}
      className={"maritime-illustration-2d" + (className ? " " + className : "")}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      shapeRendering="geometricPrecision"
      role={props["aria-label"] ? "img" : undefined}
      aria-hidden={props["aria-label"] ? undefined : true}
    >
      {art[variant]}
    </svg>
  );
}
