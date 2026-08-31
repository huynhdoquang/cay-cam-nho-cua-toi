import type { ReactNode } from "react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Hand-drawn stroke icon set — no external assets. */
export function Icon({ name, size = 18, className = "" }: IconProps) {
  const p = PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {p}
    </svg>
  );
}

const PATHS: Record<string, ReactNode> = {
  berry: (
    <>
      <circle cx="9" cy="14.5" r="4.6" />
      <circle cx="15.5" cy="13" r="4.2" />
      <circle cx="12.2" cy="18" r="4" />
      <path d="M12 6c1.5-2 4-2.4 5.5-2-.4 1.5-2.3 3.6-4.5 3.5M12 6v3" />
    </>
  ),
  flame: <path d="M12 3c.5 3-3.5 5-3.5 9a3.5 3.5 0 0 0 7 0c0-1.5-.6-2.6-1.2-3.6C15.8 9.6 17 11 17 13.5a5 5 0 0 1-10 0C7 8 11 6.5 12 3z" />,
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19" />
    </>
  ),
  leaf: (
    <>
      <path d="M4.5 19.5C4.5 10 11 4.5 20 4.5c0 9-6.5 15-15.5 15z" />
      <path d="M4.5 19.5C8 15 12 11.5 16.5 8.5" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13C12 8.5 8.8 6.5 5 6.8c.3 3.8 2.8 6.2 7 6.2zM12 11.5c0-3.8 2.8-5.6 6.5-5.3-.2 3.5-2.6 5.8-6.5 5.8z" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.5" />
      <path d="M9 4.5V3.2A1.2 1.2 0 0 1 10.2 2h3.6A1.2 1.2 0 0 1 15 3.2v1.3M8.7 10.5h6.6M8.7 14h4.6" />
    </>
  ),
  basket: (
    <>
      <path d="M4.5 10.5h15l-1.6 8a2.5 2.5 0 0 1-2.4 2H8.5a2.5 2.5 0 0 1-2.4-2z" />
      <path d="M8 10.5 12 4l4 6.5M4.5 14h15" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5c-2-1.8-5-2-8-1.2v13c3-.8 6-.6 8 1.2 2-1.8 5-2 8-1.2v-13c-3-.8-6-.6-8 1.2z" />
      <path d="M12 6.5v13" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="10" rx="2.5" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  sound: (
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.2A2.7 2.7 0 0 1 12 7.3c1.5 0 2.7 1 2.7 2.4 0 1.8-2.7 2-2.7 4M12 17.2v.1" />
    </>
  ),
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M12 3l-2 2m2-2 2 2M12 21l-2-2m2 2 2-2" />,
  seed: (
    <>
      <path d="M12 21c-4 0-6.5-2.8-6.5-6.5S9 8 12 4c3 4 6.5 6.5 6.5 10.5S16 21 12 21z" />
      <path d="M12 21V11" />
    </>
  ),
  fence: <path d="M5 20V7l1.8-2.5L8.5 7v13M15.5 20V7l1.8-2.5L19 7v13M3.5 11h17M3.5 16h17" />,
  lantern: (
    <>
      <path d="M12 21v-3M8.5 18h7M9 10.5h6l-1 5h-4z" />
      <path d="M9.5 10.5a2.5 2.5 0 0 1 5 0M12 5.5V4" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  mushroom: (
    <>
      <path d="M4 11.5a8 8 0 0 1 16 0c0 1-1 1.5-2 1.5H6c-1 0-2-.5-2-1.5z" />
      <path d="M9.5 13v4.5a2.5 2.5 0 0 0 5 0V13" />
      <path d="M9 8.5h.01M14.5 7.5h.01M12.5 10.5h.01" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="9" r="2.4" />
      <path d="M12 6.6V4M12 11.4V14M9.6 9H7M14.4 9H17M10.3 7.3 8.5 5.5M13.7 7.3l1.8-1.8M10.3 10.7l-1.8 1.8M13.7 10.7l1.8 1.8" />
      <path d="M12 14v7M12 18c2.5 0 4-1.2 4.5-3-2.4-.3-4 .8-4.5 3z" />
    </>
  ),
  spark: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />,
  trash: <path d="M5 7h14M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l1 12a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8l1-12" />,
  drop: <path d="M12 3.5S6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5z" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.8l-5.3 2.8 1.1-5.8L3.5 9.7l5.9-.8z" />,
  fertilizer: (
    <>
      <path d="M7 8h10l1 12a1.8 1.8 0 0 1-1.8 2H7.8A1.8 1.8 0 0 1 6 20z" />
      <path d="M9 8V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V8" />
      <path d="M12 17.5v-3.2M12 14.3c0-2-1.3-2.8-3-2.6.2 1.7 1.3 2.6 3 2.6zm0-.5c0-1.7 1.2-2.5 2.8-2.3-.2 1.5-1.2 2.3-2.8 2.3z" />
    </>
  ),
  hat: (
    <>
      <path d="M4 16.5a8 8 0 0 1 16 0" />
      <path d="M2.8 16.5h18.4v2.2H2.8z" />
      <circle cx="12" cy="6.5" r="1.4" />
    </>
  ),
  shirt: <path d="m8.5 4-4.5 3 2 3.5 2-1V20h8v-10.5l2 1 2-3.5L15.5 4a3.5 3.5 0 0 1-7 0z" />,
  frog: (
    <>
      <path d="M4 14a8 8 0 0 1 16 0c0 3.5-3.5 6-8 6s-8-2.5-8-6z" />
      <circle cx="8" cy="7.5" r="2.4" />
      <circle cx="16" cy="7.5" r="2.4" />
      <path d="M9 14.5c2 1.4 4 1.4 6 0" />
    </>
  ),
  citrus: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 5.5c.3-1.6 1.5-2.5 3-2.5-.2 1.5-1.3 2.7-3 2.5zM12 13v-7.5M12 13l5.3-5.3M12 13h7.5M12 13l5.3 5.3M12 13v7.5M12 13l-5.3 5.3M12 13H4.5M12 13 6.7 7.7" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  water: (
    <>
      <path d="M6 12 4 5.5 15 8l6.5 2L14 12z" />
      <path d="M6 12c0 4 2.5 7 6 7s6-3 6-7" />
    </>
  ),
  coins: (
    <>
      <circle cx="9" cy="9.5" r="5.5" />
      <path d="M14.8 7.3a5.5 5.5 0 1 1-7.4 7.5M9 7v5M7 9.5h4" />
    </>
  ),
};
