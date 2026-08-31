import type { GameState } from "../game/types";
import { DAILY_XP_CAP, xpWindow } from "../game/data";
import { Icon } from "./icons";

interface Props {
  state: GameState;
  done: number;
  total: number;
  onToggleMute: () => void;
  onHelp: () => void;
}

export function HUD({ state, done, total, onToggleMute, onHelp }: Props) {
  const { prev, next, pct } = xpWindow(state.level, state.xp);
  const streakHot = state.streak >= 7;
  const taskPct = total ? Math.round((done / total) * 100) : 0;
  const atCap = state.xpToday >= DAILY_XP_CAP;

  return (
    <header className="panel-dark z-30 flex flex-col gap-1.5 rounded-none border-x-0 border-t-0 px-3 pb-2 pt-2 sm:px-4" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))" }}>
      {/* hàng 1 */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <div className="flex items-center gap-2 mr-0.5">
          <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden className="drop-shadow">
            <circle cx="20" cy="23" r="14" fill="#ff8c2e" stroke="#5c3a1e" strokeWidth="2.4" />
            <circle cx="15" cy="19" r="4" fill="#ffc46b" opacity="0.85" />
            <ellipse cx="24" cy="7.5" rx="6" ry="3" fill="#58b84e" stroke="#2e6b33" strokeWidth="1.6" transform="rotate(-24 24 7.5)" />
            <path d="M20 12c0-3 1-5 3-6" stroke="#5c3a1e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </svg>
          <h1 className="hidden sm:block font-display text-xl font-extrabold text-cream-100 tracking-wide" style={{ textShadow: "0 2px 0 rgba(43,26,12,.6)" }}>
            Cây Cam Nhỏ
          </h1>
        </div>

        <div className="flex-1" />

        <div className="chip bg-cream-200 text-bark-800 text-[13px] sm:text-sm">
          <Icon name="sun" size={14} className="text-tang-600" />
          <span className="hidden sm:inline">Ngày</span> {state.day}
        </div>

        <div
          className={`chip text-[13px] sm:text-sm ${streakHot ? "bg-tang-400 text-bark-900" : "bg-cream-200 text-bark-800"}`}
          title={streakHot ? "Streak ≥ 7: +20% tỉ lệ rơi berry!" : "Hoàn thành đủ nhiệm vụ mỗi ngày để giữ streak"}
        >
          <Icon name="flame" size={14} className={state.streak > 0 ? "text-tang-600" : "text-bark-500"} />
          {state.streak}
          {streakHot && <span className="font-body text-[10px] font-bold">+20%</span>}
        </div>

        <div className="chip bg-berry-300 text-berry-700 text-[13px] sm:text-sm" title="Berry — tiền tệ của khu vườn">
          <span key={state.berries} className="bump inline-flex items-center gap-1.5">
            <Icon name="berry" size={15} />
            {state.berries}
          </span>
        </div>

        <button onClick={onHelp} className="hud-btn h-9 w-9" title="Luật chơi" aria-label="Luật chơi">
          <Icon name="help" size={17} />
        </button>
        <button onClick={onToggleMute} className="hud-btn h-9 w-9" title={state.muted ? "Bật tiếng" : "Tắt tiếng"} aria-label="Âm thanh">
          <Icon name={state.muted ? "soundOff" : "sound"} size={17} />
        </button>
      </div>

      {/* hàng 2: thanh nhiệm vụ + EXP */}
      <div className="flex items-center gap-2">
        <div
          className="chip flex-1 justify-between bg-cream-100 text-bark-800 text-[12px] sm:text-[13px]"
          title={`${done}/${total} nhiệm vụ hôm nay`}
        >
          <span className="flex items-center gap-1.5">
            <Icon name="clipboard" size={14} className="text-leaf-700" />
            <span className="hidden xs:inline sm:inline">{done}/{total}</span>
            <span className="xs:hidden sm:hidden inline">{done}/{total}</span>
          </span>
          <span className="h-2.5 w-20 sm:w-28 overflow-hidden rounded-full border-2 border-bark-800/50 bg-cream-300">
            <span
              className={`block h-full rounded-full transition-all duration-500 ${done === total && total > 0 ? "bg-leaf-500" : "bg-tang-400"}`}
              style={{ width: `${taskPct}%` }}
            />
          </span>
        </div>

        <div
          className={`chip flex-1 justify-between text-[12px] sm:text-[13px] ${atCap ? "bg-tang-300 text-bark-900" : "bg-leaf-300 text-leaf-900"}`}
          title={`KN hôm nay: ${state.xpToday}/${DAILY_XP_CAP}${atCap ? " (đã chạm trần)" : ""}`}
        >
          <span className="flex items-center gap-1.5">
            <Icon name="star" size={14} className="text-tang-600" />
            Cấp {state.level}
          </span>
          <span className="h-2.5 w-20 sm:w-28 overflow-hidden rounded-full border-2 border-leaf-900/60 bg-leaf-200">
            <span
              className={`block h-full rounded-full transition-all duration-500 ${atCap ? "bg-tang-500" : "bg-gradient-to-r from-leaf-600 to-tang-500"}`}
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </span>
          <span className="hidden sm:inline font-body text-[10px] font-bold opacity-80">
            {atCap ? "trần!" : `${state.xp - prev}/${next - prev}`}
          </span>
        </div>
      </div>
    </header>
  );
}
