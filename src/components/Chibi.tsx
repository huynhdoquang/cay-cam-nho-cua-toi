import type { PoseId } from "../game/types";

interface ChibiProps {
  pose: PoseId;
  hair?: string;
  shirt?: string;
  hat?: string | null;
  size?: number;
  className?: string;
  animated?: boolean;
}

const INK = "#3a2a1a";
const SKIN = "#ffe3c9";

const ANIM: Record<PoseId, string> = {
  sleep: "anim-bob", read: "anim-sway", drink: "anim-bob", exercise: "anim-hop",
  meditate: "anim-sway", eat: "anim-bob", clean: "anim-wiggle", walk: "anim-bob",
  study: "anim-bob", music: "anim-sway", plant: "anim-bob", write: "anim-sway",
  call: "anim-bob", stretch: "anim-hop",
  yoga: "anim-sway", dance: "anim-hop", cook: "anim-bob", draw: "anim-sway",
  brush: "anim-wiggle", pill: "anim-bob", save: "anim-bob", pet: "anim-bob",
  phone: "anim-sway",
};

/** Bé Cam — chibi mascot, fully parametric SVG (no image assets). */
export function Chibi({ pose, hair = "#7a4a21", shirt = "#58b84e", hat = null, size = 56, className = "", animated = true }: ChibiProps) {
  const happy = ["drink", "exercise", "meditate", "eat", "music", "plant", "call", "stretch", "yoga", "dance", "cook", "brush", "save", "pet", "phone"].includes(pose);
  const closed = pose === "sleep";
  const lookDown = ["read", "study", "write", "draw"].includes(pose);
  const sitting = pose === "meditate" || pose === "yoga";

  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className={`${className} chibi`} aria-hidden>
      <g className={animated ? ANIM[pose] : undefined}>
        {/* legs */}
        {sitting ? (
          <ellipse cx="36" cy="62" rx="11" ry="4.5" fill="#4a6ba8" stroke={INK} strokeWidth="2" />
        ) : (
          <>
            <rect x="29" y="56" width="6" height="10" rx="3" fill="#4a6ba8" stroke={INK} strokeWidth="2" className={["walk", "dance"].includes(pose) ? "leg-l" : undefined} />
            <rect x="37.5" y="56" width="6" height="10" rx="3" fill="#4a6ba8" stroke={INK} strokeWidth="2" className={["walk", "dance"].includes(pose) ? "leg-r" : undefined} />
          </>
        )}

        {/* body */}
        <rect x="26" y="42" width="20" height="17" rx="8.5" fill={shirt} stroke={INK} strokeWidth="2.2" />

        {/* pose-specific back props */}
        {pose === "clean" && (
          <g className="broom">
            <line x1="52" y1="26" x2="57" y2="55" stroke="#a9713a" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M53 52 L61 60 L52 62 Z" fill="#f2b33d" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        )}

        {/* arms */}
        <Arms pose={pose} />

        {/* head */}
        <circle cx="36" cy="26" r="16" fill={SKIN} stroke={INK} strokeWidth="2.4" />
        <path d="M20 26 a16 16 0 0 1 32 0 Z" fill={hair} stroke={INK} strokeWidth="2.2" />
        <circle cx="27" cy="26.5" r="4.4" fill={hair} />
        <circle cx="36" cy="25" r="4.4" fill={hair} />
        <circle cx="45" cy="26.5" r="4.4" fill={hair} />
        <circle cx="19.5" cy="30" r="3.4" fill={hair} stroke={INK} strokeWidth="2" />
        <circle cx="52.5" cy="30" r="3.4" fill={hair} stroke={INK} strokeWidth="2" />

        {/* hat */}
        {hat === "hat_frog" && (
          <g>
            <path d="M22 17 a14 9 0 0 1 28 0 Z" fill="#58b84e" stroke={INK} strokeWidth="2.2" />
            <circle cx="28" cy="9" r="3.6" fill="#58b84e" stroke={INK} strokeWidth="2" />
            <circle cx="44" cy="9" r="3.6" fill="#58b84e" stroke={INK} strokeWidth="2" />
            <circle cx="28" cy="9" r="1.3" fill={INK} />
            <circle cx="44" cy="9" r="1.3" fill={INK} />
          </g>
        )}
        {hat === "hat_orange" && (
          <g>
            <path d="M21.5 18 a14.5 10 0 0 1 29 0 Z" fill="#ff8c2e" stroke={INK} strokeWidth="2.2" />
            <circle cx="36" cy="6.5" r="3" fill="#ff8c2e" stroke={INK} strokeWidth="2" />
            <ellipse cx="41.5" cy="4.8" rx="3.4" ry="1.7" fill="#3e9142" transform="rotate(-28 41.5 4.8)" />
          </g>
        )}
        {hat === "hat_crown" && (
          <g>
            <path d="M24 18 L24 9 L29 13 L36 6 L43 13 L48 9 L48 18 Z" fill="#ffd93d" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="24" cy="9" r="1.8" fill="#e85a5a" stroke={INK} strokeWidth="1.4" />
            <circle cx="36" cy="6" r="1.8" fill="#4fb8e8" stroke={INK} strokeWidth="1.4" />
            <circle cx="48" cy="9" r="1.8" fill="#e85a5a" stroke={INK} strokeWidth="1.4" />
          </g>
        )}
        {hat === "hat_wizard" && (
          <g>
            <path d="M36 2 L26 18 L46 18 Z" fill="#5d4fc0" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            <ellipse cx="36" cy="18" rx="14" ry="3" fill="#5d4fc0" stroke={INK} strokeWidth="2.2" />
            <path d="M34 8 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 Z" fill="#ffd93d" />
            <circle cx="40" cy="14" r="1.3" fill="#ffd93d" />
          </g>
        )}
        {hat === "hat_ribbon" && (
          <g>
            <path d="M46 12 L54 7 L54 17 Z" fill="#e86fa0" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M46 12 L38 7 L38 17 Z" fill="#e86fa0" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="46" cy="12" r="3" fill="#ffa3c0" stroke={INK} strokeWidth="2" />
          </g>
        )}

        {/* face */}
        {closed ? (
          <g stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M27.5 28.6 q2.5 2.2 5 0" />
            <path d="M39.5 28.6 q2.5 2.2 5 0" />
          </g>
        ) : happy ? (
          <g stroke={INK} strokeWidth="2.1" fill="none" strokeLinecap="round">
            <path d="M27.5 28.8 q2.5 -3 5 0" />
            <path d="M39.5 28.8 q2.5 -3 5 0" />
          </g>
        ) : (
          <g fill={INK}>
            <circle cx="30" cy={lookDown ? 29.6 : 28.4} r="2.2" />
            <circle cx="42" cy={lookDown ? 29.6 : 28.4} r="2.2" />
          </g>
        )}
        <circle cx="25" cy="33" r="2.6" fill="#ffa3a3" opacity="0.75" />
        <circle cx="47" cy="33" r="2.6" fill="#ffa3a3" opacity="0.75" />
        {pose === "drink" || pose === "exercise" ? (
          <circle cx="36" cy="34" r="2" fill="#e85a5a" stroke={INK} strokeWidth="1.4" />
        ) : !closed ? (
          <path d="M33.5 33.6 q2.5 2.4 5 0" stroke={INK} strokeWidth="1.9" fill="none" strokeLinecap="round" />
        ) : (
          <circle cx="36" cy="34" r="1.4" fill={INK} opacity="0.7" />
        )}

        {/* pose props */}
        <Props pose={pose} />
      </g>
    </svg>
  );
}

function Arms({ pose }: { pose: PoseId }) {
  if (["stretch", "exercise", "call", "drink", "dance", "yoga"].includes(pose)) {
    return (
      <g stroke={INK} strokeWidth="2.2" strokeLinecap="round">
        {pose === "call" ? (
          <>
            <path d="M26 47 q-4 -2 -4.5 -7" stroke={SKIN} strokeWidth="4.5" fill="none" />
            <path d="M46 47 q4 -4 3.5 -13" stroke={SKIN} strokeWidth="4.5" fill="none" />
            <circle cx="21.5" cy="40" r="3" fill={SKIN} />
          </>
        ) : (
          <>
            <path d="M26 47 q-5 -3 -6 -10" stroke={SKIN} strokeWidth="4.5" fill="none" />
            <path d="M46 47 q5 -3 6 -10" stroke={SKIN} strokeWidth="4.5" fill="none" />
          </>
        )}
      </g>
    );
  }
  return (
    <g>
      <circle cx="24.5" cy="49" r="3.6" fill={SKIN} stroke={INK} strokeWidth="2" />
      <circle cx="47.5" cy="49" r="3.6" fill={SKIN} stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Props({ pose }: { pose: PoseId }) {
  switch (pose) {
    case "sleep":
      return (
        <g>
          <rect x="22" y="46" width="28" height="13" rx="6.5" fill="#7fb3e8" stroke={INK} strokeWidth="2.2" />
          <path d="M26 52.5 h20" stroke="#b7d7f2" strokeWidth="2" strokeLinecap="round" />
          <g className="zzz" stroke="#4fb8e8" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M52 22 h5 l-5 5 h5" />
          </g>
          <g className="zzz" style={{ animationDelay: "0.9s" }} stroke="#4fb8e8" strokeWidth="1.7" fill="none" strokeLinecap="round">
            <path d="M59 13 h4 l-4 4 h4" />
          </g>
        </g>
      );
    case "read":
      return (
        <g className="book-bob">
          <path d="M21 47 q7.5 -3.5 15 0 q7.5 -3.5 15 0 v10 q-7.5 -3 -15 0 q-7.5 -3 -15 0 Z" fill="#fff9ea" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M36 47 v10" stroke={INK} strokeWidth="1.6" />
          <path d="M25 49.5 h7 M25 52 h5 M40 49.5 h7 M42 52 h5" stroke="#c9b791" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case "drink":
      return (
        <g className="tilt-drink">
          <rect x="45.5" y="33" width="9" height="12" rx="2.5" fill="#7ed3f2" stroke={INK} strokeWidth="2" />
          <path d="M48 33 V28 l4 -3" stroke="#e85a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M47.5 38.5 h5" stroke="#b5e8f8" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "exercise":
      return (
        <g className="lift">
          <rect x="10" y="33.5" width="13" height="3" rx="1.5" fill="#8fa3b8" stroke={INK} strokeWidth="1.6" />
          <circle cx="10" cy="35" r="3.6" fill="#5d4fc0" stroke={INK} strokeWidth="1.6" />
          <circle cx="23" cy="35" r="3.6" fill="#5d4fc0" stroke={INK} strokeWidth="1.6" />
          <rect x="49" y="33.5" width="13" height="3" rx="1.5" fill="#8fa3b8" stroke={INK} strokeWidth="1.6" />
          <circle cx="49" cy="35" r="3.6" fill="#5d4fc0" stroke={INK} strokeWidth="1.6" />
          <circle cx="62" cy="35" r="3.6" fill="#5d4fc0" stroke={INK} strokeWidth="1.6" />
        </g>
      );
    case "meditate":
      return (
        <g>
          <g className="sparkle-f" fill="#ffd93d"><path d="M16 22 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" /></g>
          <g className="sparkle-f" style={{ animationDelay: "0.5s" }} fill="#ffd93d"><path d="M56 18 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" /></g>
          <g className="sparkle-f" style={{ animationDelay: "1s" }} fill="#ffd93d"><path d="M50 42 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 Z" /></g>
        </g>
      );
    case "eat":
      return (
        <g>
          <path d="M25 49 a11 7 0 0 0 22 0 Z" fill="#fff3dc" stroke={INK} strokeWidth="2" />
          <path d="M25 49 h22" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <circle cx="31" cy="48" r="1.8" fill="#e85a5a" />
          <circle cx="37" cy="47.4" r="1.8" fill="#58b84e" />
          <circle cx="42" cy="48" r="1.8" fill="#f2b33d" />
          <path className="steam" d="M32 44 q-1.5 -2.5 0 -5" stroke="#d9d9d9" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path className="steam" style={{ animationDelay: "0.7s" }} d="M40 44 q1.5 -2.5 0 -5" stroke="#d9d9d9" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case "walk":
      return (
        <g stroke="#7ed3f2" strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
          <path d="M12 40 h7" />
          <path d="M8 47 h8" />
          <path d="M13 54 h6" />
        </g>
      );
    case "study":
      return (
        <g>
          <rect x="25" y="40" width="22" height="9" rx="1.5" fill="#b5e8f8" stroke={INK} strokeWidth="2" />
          <rect x="23" y="49" width="26" height="5" rx="2" fill="#8fa3b8" stroke={INK} strokeWidth="2" />
          <path d="M28 43 h6 M28 46 h10" stroke="#4fb8e8" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    case "music":
      return (
        <g>
          <g className="note-float" fill="#5d4fc0">
            <circle cx="54" cy="24" r="2.4" />
            <path d="M56.2 24 V14 l5 -1.5 V21" stroke="#5d4fc0" strokeWidth="1.8" fill="none" />
            <circle cx="59.5" cy="21.5" r="2" />
          </g>
          <g className="note-float" style={{ animationDelay: "1s" }} fill="#e85a71">
            <circle cx="14" cy="30" r="2.2" />
            <path d="M16 30 V20" stroke="#e85a71" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M16 20 q3 0 4 2.5" stroke="#e85a71" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        </g>
      );
    case "plant":
      return (
        <g>
          <path d="M47 50 h12 l-1.5 9 a2 2 0 0 1 -2 1.6 h-5 a2 2 0 0 1 -2 -1.6 Z" fill="#c68d52" stroke={INK} strokeWidth="2" />
          <path d="M53 50 v-6" stroke="#3e9142" strokeWidth="2.2" strokeLinecap="round" />
          <g className="pulse-soft">
            <ellipse cx="49.5" cy="42.5" rx="4" ry="2.4" fill="#58b84e" transform="rotate(-30 49.5 42.5)" />
            <ellipse cx="56.5" cy="42.5" rx="4" ry="2.4" fill="#58b84e" transform="rotate(30 56.5 42.5)" />
          </g>
          <path d="M25 50 q-3 -1 -3.5 -5" stroke={SKIN} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "write":
      return (
        <g>
          <rect x="22" y="46" width="18" height="12" rx="2" fill="#fff9ea" stroke={INK} strokeWidth="2" />
          <path d="M25 50 h12 M25 53 h8" stroke="#c9b791" strokeWidth="1.6" strokeLinecap="round" />
          <g transform="rotate(35 47 48)">
            <rect x="45.5" y="38" width="3.4" height="14" rx="1.4" fill="#f2b33d" stroke={INK} strokeWidth="1.6" />
            <path d="M45.5 52 l1.7 3.4 1.7 -3.4 Z" fill="#3a2a1a" />
          </g>
        </g>
      );
    case "call":
      return (
        <g>
          <rect x="46" y="22" width="8" height="13" rx="2.5" fill="#5d4fc0" stroke={INK} strokeWidth="2" />
          <path d="M48 25 h4" stroke="#c0b5f2" strokeWidth="1.6" strokeLinecap="round" />
          <g className="sparkle-f" stroke="#4fb8e8" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M58 20 q3 3 0 7" />
            <path d="M61.5 17.5 q5 5.5 0 12" />
          </g>
        </g>
      );
    case "stretch":
      return (
        <g>
          <g className="sparkle-f" fill="#ffd93d"><path d="M20 12 l1.1 2.7 2.7 1.1 -2.7 1.1 -1.1 2.7 -1.1 -2.7 -2.7 -1.1 2.7 -1.1 Z" /></g>
          <g className="sparkle-f" style={{ animationDelay: "0.6s" }} fill="#ffd93d"><path d="M52 10 l1.1 2.7 2.7 1.1 -2.7 1.1 -1.1 2.7 -1.1 -2.7 -2.7 -1.1 2.7 -1.1 Z" /></g>
        </g>
      );
    case "yoga":
      return (
        <g>
          <circle cx="36" cy="26" r="21" fill="none" stroke="#ffd93d" strokeWidth="1.6" opacity="0.55" className="pulse-soft" />
          <g className="sparkle-f" fill="#9c8ce8"><path d="M15 20 l1.1 2.7 2.7 1.1 -2.7 1.1 -1.1 2.7 -1.1 -2.7 -2.7 -1.1 2.7 -1.1 Z" /></g>
          <g className="sparkle-f" style={{ animationDelay: "0.7s" }} fill="#9c8ce8"><path d="M57 16 l1.1 2.7 2.7 1.1 -2.7 1.1 -1.1 2.7 -1.1 -2.7 -2.7 -1.1 2.7 -1.1 Z" /></g>
        </g>
      );
    case "dance":
      return (
        <g>
          <g className="note-float" fill="#e85a71">
            <circle cx="55" cy="22" r="2.3" />
            <path d="M57.2 22 V12.5 l4.5 -1.4 V18.5" stroke="#e85a71" strokeWidth="1.7" fill="none" />
            <circle cx="60.2" cy="19.5" r="1.9" />
          </g>
          <g className="note-float" style={{ animationDelay: "0.8s" }} fill="#4fb8e8">
            <circle cx="13" cy="27" r="2.1" />
            <path d="M15 27 V18" stroke="#4fb8e8" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            <path d="M15 18 q2.8 0 3.8 2.3" stroke="#4fb8e8" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          </g>
          <g className="sparkle-f" style={{ animationDelay: "0.4s" }} fill="#ffd93d"><path d="M52 40 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 Z" /></g>
        </g>
      );
    case "cook":
      return (
        <g>
          <g className="tilt-drink">
            <ellipse cx="52" cy="47" rx="9" ry="4" fill="#8fa3b8" stroke={INK} strokeWidth="1.8" />
            <line x1="60" y1="46" x2="68" y2="43" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="50" cy="46.4" r="2.7" fill="#fff3dc" stroke={INK} strokeWidth="1.3" />
            <circle cx="50" cy="46.4" r="1.2" fill="#f2b33d" />
          </g>
          <path className="steam" d="M48 41 q-1.5 -2.5 0 -5" stroke="#d9d9d9" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path className="steam" style={{ animationDelay: "0.6s" }} d="M55 40 q1.5 -2.5 0 -5" stroke="#d9d9d9" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        </g>
      );
    case "draw":
      return (
        <g>
          <rect x="45" y="36" width="15" height="13" rx="1.5" fill="#fff9ea" stroke={INK} strokeWidth="1.8" />
          <path d="M48 41 l3 3 4.5 -5.5" stroke="#e85a5a" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="23" cy="47" r="4.5" fill="#fff3dc" stroke={INK} strokeWidth="1.8" />
          <circle cx="21.5" cy="46" r="1" fill="#e85a5a" />
          <circle cx="24.5" cy="46" r="1" fill="#4fb8e8" />
          <circle cx="23" cy="48.8" r="1" fill="#f2b33d" />
        </g>
      );
    case "brush":
      return (
        <g>
          <g transform="rotate(20 50 40)">
            <rect x="48.5" y="30" width="3.4" height="13" rx="1.5" fill="#4fb8e8" stroke={INK} strokeWidth="1.5" />
            <rect x="47.5" y="27" width="5.4" height="4" rx="1.2" fill="#fff9ea" stroke={INK} strokeWidth="1.4" />
          </g>
          <g className="steam" fill="#d9f0fa" stroke="#9fd4ec" strokeWidth="1">
            <circle cx="42" cy="36" r="2.2" />
            <circle cx="46" cy="33.5" r="1.7" />
            <circle cx="40" cy="32.5" r="1.4" />
          </g>
        </g>
      );
    case "pill":
      return (
        <g>
          <g transform="rotate(-25 52 42)">
            <rect x="45" y="39" width="14" height="6.5" rx="3.25" fill="#fff9ea" stroke={INK} strokeWidth="1.7" />
            <rect x="52" y="39" width="7" height="6.5" rx="3.25" fill="#e85a71" stroke={INK} strokeWidth="1.7" />
          </g>
          <rect x="20" y="42" width="8" height="11" rx="2" fill="#7ed3f2" stroke={INK} strokeWidth="1.8" />
          <path d="M22 45.5 h4" stroke="#b5e8f8" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case "save":
      return (
        <g>
          <g className="pulse-soft">
            <ellipse cx="52" cy="47" rx="9" ry="7" fill="#ffa3c0" stroke={INK} strokeWidth="1.8" />
            <circle cx="56.5" cy="45" r="1.2" fill={INK} />
            <ellipse cx="59.5" cy="47.5" rx="2.4" ry="2" fill="#e86fa0" stroke={INK} strokeWidth="1.4" />
            <rect x="48" y="40.5" width="6" height="1.8" rx="0.9" fill={INK} />
            <path d="M46 54 l-1.5 3 M58 54 l1.5 3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="note-float" fill="#ffd93d" stroke="#e8a91a" strokeWidth="1.2">
            <circle cx="46" cy="34" r="3.4" />
            <path d="M46 32.5 v3 M44.8 34 h2.4" stroke="#e8a91a" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </g>
      );
    case "pet":
      return (
        <g>
          <g>
            <circle cx="53" cy="50" r="7" fill="#f2b33d" stroke={INK} strokeWidth="1.8" />
            <path d="M47.5 45 l-1.5 -5 4.5 2.5 Z" fill="#f2b33d" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M58.5 45 l1.5 -5 -4.5 2.5 Z" fill="#f2b33d" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="50.5" cy="49" r="1" fill={INK} />
            <circle cx="55.5" cy="49" r="1" fill={INK} />
            <path d="M52 52 q1 1.2 2 0" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M60 52 q4 -1 4.5 -5" stroke="#f2b33d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </g>
          <g className="note-float" fill="#e85a71">
            <path d="M44 36 c-2 -2.5 -5 -0.5 -3.2 2 L44 40.5 L47.2 38 C49 35.5 46 33.5 44 36 Z" />
          </g>
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x="46" y="36" width="11" height="17" rx="2.5" fill="#5d4fc0" stroke={INK} strokeWidth="1.8" />
          <path d="M49 40 h5" stroke="#c0b5f2" strokeWidth="1.5" strokeLinecap="round" />
          <g stroke="#e85a5a" strokeWidth="2.4" strokeLinecap="round">
            <path d="M43 33 L60 56" />
            <path d="M60 33 L43 56" />
          </g>
          <g className="sparkle-f" fill="#7acb5f"><path d="M16 30 l1.1 2.7 2.7 1.1 -2.7 1.1 -1.1 2.7 -1.1 -2.7 -2.7 -1.1 2.7 -1.1 Z" /></g>
        </g>
      );
    default:
      return null;
  }
}
