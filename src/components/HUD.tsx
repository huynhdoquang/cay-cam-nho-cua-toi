import type { GameState } from "../game/types";
import { DAILY_XP_CAP, xpWindow } from "../game/data";
import { Icon } from "./icons";

interface Props {
  state: GameState;
  onToggleMute: () => void;
  onHelp: () => void;
}

export function HUD({ state, onToggleMute, onHelp }: Props) {
  const { prev, next, pct } = xpWindow(state.level, state.xp);
  const streakHot = state.streak >= 7;

  return (
    <header className="panel-dark z-20 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
      {/* logo */}
      <div className="flex items-center gap-2.5 mr-1">
        <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden className="drop-shadow">
          <circle cx="20" cy="23" r="14" fill="#ff8c2e" stroke="#5c3a1e" strokeWidth="2.4" />
          <circle cx="15" cy="19" r="4" fill="#ffc46b" opacity="0.85" />
          <ellipse cx="24" cy="7.5" rx="6" ry="3" fill="#58b84e" stroke="#2e6b33" strokeWidth="1.6" transform="rotate(-24 24 7.5)" />
          <path d="M20 12c0-3 1-5 3-6" stroke="#5c3a1e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
        <div className="leading-none">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-cream-100 tracking-wide" style={{ textShadow: "0 2px 0 rgba(43,26,12,.6)" }}>
            Cây Cam Nhỏ
          </h1>
          <p className="hidden md:block font-body text-[11px] font-medium text-cream-300/90">trồng cây · gieo thói quen</p>
        </div>
      </div>

      <div className="flex-1" />

      {/* day */}
      <div className="chip bg-cream-200 text-bark-800 text-sm">
        <Icon name="sun" size={15} className="text-tang-600" />
        Ngày {state.day}
      </div>

      {/* streak */}
      <div
        className={`chip text-sm ${streakHot ? "bg-tang-400 text-bark-900" : "bg-cream-200 text-bark-800"}`}
        title={streakHot ? "Streak ≥ 7: +20% tỉ lệ rơi berry!" : "Hoàn thành đủ nhiệm vụ mỗi ngày để giữ streak"}
      >
        <Icon name="flame" size={15} className={state.streak > 0 ? "text-tang-600" : "text-bark-500"} />
        {state.streak}
        {streakHot && <span className="font-body text-[10px] font-bold">+20%</span>}
      </div>

      {/* berries */}
      <div className="chip bg-berry-300 text-berry-700 text-sm" title="Berry — tiền tệ của khu vườn">
        <span key={state.berries} className="bump inline-flex items-center gap-1.5">
          <Icon name="berry" size={16} />
          {state.berries}
        </span>
      </div>

      {/* level + xp */}
      <div className="chip bg-leaf-300 text-leaf-900 text-sm min-w-[150px] sm:min-w-[172px] justify-between" title={`KN hôm nay: ${state.xpToday}/${DAILY_XP_CAP}${state.xpToday >= DAILY_XP_CAP ? " (đã chạm trần)" : ""}`}>
        <span className="flex items-center gap-1.5">
          <Icon name="star" size={15} className="text-tang-600" />
          Cấp {state.level}
        </span>
        <span className="h-2.5 w-16 sm:w-20 overflow-hidden rounded-full border-2 border-leaf-900 bg-leaf-200">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-leaf-600 to-tang-500 transition-all duration-500"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </span>
        <span className="hidden sm:inline font-body text-[11px] font-bold opacity-80">
          {state.level >= 10 ? "MAX" : `${state.xp - prev}/${next - prev}`}
        </span>
      </div>

      {/* freeze count */}
      {state.freezes > 0 && (
        <div className="chip bg-skyy-300 text-[#14507a] text-sm hidden sm:inline-flex" title="Băng bảo vệ streak">
          <Icon name="snow" size={15} />
          {state.freezes}
        </div>
      )}

      <button
        onClick={onHelp}
        className="btn btn-cream h-9 w-9 rounded-full"
        title="Luật chơi"
        aria-label="Luật chơi"
      >
        <Icon name="help" size={18} />
      </button>
      <button
        onClick={onToggleMute}
        className="btn btn-cream h-9 w-9 rounded-full"
        title={state.muted ? "Bật tiếng" : "Tắt tiếng"}
        aria-label="Âm thanh"
      >
        <Icon name={state.muted ? "soundOff" : "sound"} size={18} />
      </button>
    </header>
  );
}
