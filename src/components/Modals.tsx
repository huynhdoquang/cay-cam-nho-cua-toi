import type { ReactNode } from "react";
import type { GameState } from "../game/types";
import { FRUIT_REGROWTH_DAYS, LANDMARKS, TREE } from "../game/data";
import type { GameApi } from "../game/useGame";
import type { ToastMsg } from "../game/useGame";
import { Icon } from "./icons";
import { Chibi } from "./Chibi";

const SHEET_PANEL =
  "pop-in flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[22px] border-[3px] border-b-0 border-bark-700 bg-cream-200 shadow-[0_-6px_24px_rgba(0,0,0,0.4)] sm:max-w-md sm:rounded-[18px] sm:border-b-[3px] sm:shadow-[0_10px_0_rgba(43,26,12,0.5)]";

function SheetShell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bark-950/70 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div
        className={SHEET_PANEL}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-bark-700/30 sm:hidden" />
        {children}
      </div>
    </div>
  );
}

/* ---------------- Thu hoạch ---------------- */

export function HarvestModal({ state, api }: { state: GameState; api: GameApi }) {
  return (
    <SheetShell label="Thu hoạch">
      <div className="min-h-0 overflow-y-auto scroll-cute p-5 text-center">
        <div className="mx-auto w-fit rotate-[-6deg]">
          <span className="stamp inline-block rounded-xl border-[3px] border-tang-600 bg-tang-200 px-4 py-1.5 font-display text-lg font-extrabold uppercase tracking-wider text-tang-700 sm:text-xl">
            Mùa thu hoạch #{state.harvests}!
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-bark-900 sm:text-3xl">Hái trọn giỏ {TREE.name}</h2>

        <div className="mx-auto mt-3 w-fit">
          <div className="chip bg-berry-300 px-4 py-1.5 text-lg text-berry-700 sm:text-xl">
            <Icon name="berry" size={20} />
            +{state.lastHarvestGain}
          </div>
          <p className="mt-1.5 font-body text-[11.5px] font-medium text-bark-600 sm:text-xs">
            gồm thưởng mùa · streak {state.streak} ngày
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-leaf-600/60 bg-leaf-200/70 p-3 text-left">
          <Chibi pose="plant" size={48} />
          <p className="font-body text-[12px] font-semibold leading-snug text-leaf-900">
            Mùa quả khiến <b>sương mù tan bớt</b> — biết đâu khu vườn vừa hé lộ một bí mật mới? Cây cam vẫn sẽ lớn tiếp thành cổ thụ, và lứa quả sau ra mỗi {FRUIT_REGROWTH_DAYS} ngày.
          </p>
        </div>
      </div>
      <div className="shrink-0 border-t-2 border-bark-700/20 p-3">
        <button onClick={api.closeHarvest} className="btn btn-leaf w-full py-3 text-base">
          <Icon name="sprout" size={19} />
          Tiếp tục chăm cây
        </button>
      </div>
    </SheetShell>
  );
}

/* ---------------- Chuyện của Bé Sương ---------------- */

function MistSprite({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="floaty" aria-hidden>
      <g>
        <ellipse cx="50" cy="88" rx="22" ry="5" fill="rgba(43,26,12,0.15)" />
        <path
          d="M50 14c22 0 34 16 34 33 0 15-10 24-20 27 3 5 1 9-3 7-3-2-5-6-6-9-1.6.3-3.3.4-5 .4s-3.4-.1-5-.4c-1 3-3 7-6 9-4 2-6-2-3-7-10-3-20-12-20-27 0-17 12-33 34-33z"
          fill="#e8f4f8"
          stroke="#3b2412"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M30 40c4-8 11-13 20-13" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" fill="none" />
        <circle cx="40" cy="48" r="3.4" fill="#3b2412" />
        <circle cx="60" cy="48" r="3.4" fill="#3b2412" />
        <circle cx="41.2" cy="46.8" r="1.1" fill="#ffffff" />
        <circle cx="61.2" cy="46.8" r="1.1" fill="#ffffff" />
        <path d="M45 56q5 4.5 10 0" stroke="#3b2412" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="55" r="4" fill="#ffa3a3" opacity="0.7" />
        <circle cx="68" cy="55" r="4" fill="#ffa3a3" opacity="0.7" />
        <g className="sparkle-f" fill="#ffd93d">
          <path d="M16 24l1.6 3.8 3.8 1.6-3.8 1.6L16 34.8l-1.6-3.8-3.8-1.6 3.8-1.6z" />
        </g>
        <g className="sparkle-f" style={{ animationDelay: "0.5s" }} fill="#9c8ce8">
          <path d="M84 30l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4z" />
        </g>
        <g className="sparkle-f" style={{ animationDelay: "1s" }} fill="#ffd93d">
          <path d="M78 68l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z" />
        </g>
      </g>
    </svg>
  );
}

export function StoryModal({ state, api }: { state: GameState; api: GameApi }) {
  const id = state.pendingStories[0];
  const beat = LANDMARKS.find((l) => l.id === id);
  if (!beat) return null;
  const remaining = state.pendingStories.length - 1;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-night-900/80 p-4" role="dialog" aria-modal="true" aria-label={beat.name}>
      <div className="pop-in w-full max-w-sm overflow-hidden rounded-2xl border-[3px] border-bark-700 bg-cream-200 shadow-[0_10px_0_rgba(43,26,12,0.5)]">
        <div className="relative bg-gradient-to-b from-[#cfe8f2] to-[#eaf6f0] px-5 pb-2 pt-5 text-center">
          <MistSprite />
          <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.18em] text-bark-600">
            Bé Sương thì thầm…
          </p>
        </div>
        <div className="p-5 pt-3 text-center">
          <h2 className="font-display text-2xl font-extrabold text-bark-900">{beat.name}</h2>
          <p className="mt-2 font-body text-[13.5px] font-medium leading-relaxed text-bark-700">
            “{beat.story}”
          </p>

          <div className="mt-4 rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
            <div className="flex items-center justify-between font-display text-[11px] font-extrabold text-bark-600">
              <span>Sương mù khu vườn</span>
              <span>{state.fog}%</span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-bark-800/40 bg-skyy-300/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-skyy-400 to-skyy-600 transition-all duration-700"
                style={{ width: `${state.fog}%` }}
              />
            </div>
            <p className="mt-1.5 font-body text-[11px] font-semibold text-bark-600">
              {state.fog > 0 ? "Thu hoạch mỗi mùa để sương tan thêm — còn nhiều bí mật đang chờ…" : "Sương đã tan hết — khu vườn thuộc về bạn!"}
            </p>
          </div>
        </div>
        <div className="p-4 pt-0">
          <button onClick={api.dismissStory} className="btn btn-sky w-full py-3 text-base">
            <Icon name="spark" size={18} />
            {remaining > 0 ? `Nghe tiếp (${remaining} chuyện nữa)` : "Tuyệt quá, ra vườn thôi!"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Luật chơi ---------------- */

const RULES: { icon: string; text: ReactNode }[] = [
  { icon: "clipboard", text: <>Mỗi nhiệm vụ hoàn thành = <b>1 lần tưới cây</b>: +KN và có thể rơi <b>berry</b>. Nhiệm vụ đo lường rơi berry nhiều hơn.</> },
  { icon: "star", text: <>Trần <b>120 KN/ngày</b> để giữ nhịp vừa sức — quá trần, berry vẫn rơi như thường.</> },
  { icon: "berry", text: <>Tỷ lệ rơi: Có/Không <b>40%</b> (1–3), đo lường <b>70%</b> (3–8). <b>Crit 5%</b> nhân 5! Tưới 6 lần không rơi thì lần sau <b>chắc chắn rơi</b>.</> },
  { icon: "flame", text: <>Streak ≥ <b>7 ngày</b> cộng thêm <b>+20%</b> tỷ lệ rơi. Lỡ một ngày: mất streak và cây héo nhẹ — <b>Băng bảo vệ</b> sẽ đỡ thay.</> },
  { icon: "basket", text: <>Cây đạt <b>cấp 10</b> sẽ chín quả: tự tay <b>chạm từng quả</b> để hái. Sau đó cây vẫn lớn tiếp, cứ <b>7 ngày</b> lại ra quả mới.</> },
  { icon: "mist", text: <>Khu vườn chìm trong <b>sương mù</b>. Mỗi mùa thu hoạch làm sương tan bớt, hé lộ suối, cầu, nhà gỗ… và những câu chuyện của <b>Bé Sương</b>.</> },
  { icon: "drop", text: <>Cây nhớ bạn: vắng nhà <b>từ 2 ngày</b>, một quả cam có thể rụng và streak dừng lại. Ghé qua mỗi ngày nhé!</> },
  { icon: "moon", text: <>Xong nhiệm vụ? Bấm <b>Đi ngủ thôi</b> để sang ngày mới — nhiệm vụ và trần KN sẽ làm mới.</> },
];

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bark-950/70 sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Luật chơi">
      <div className={SHEET_PANEL} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-bark-700/30 sm:hidden" />
        <div className="flex shrink-0 items-center gap-2 border-b-2 border-bark-700/20 px-4 py-3">
          <Icon name="book" size={20} className="text-tang-600" />
          <h2 className="font-display text-lg font-extrabold text-bark-900">Luật chơi</h2>
          <button onClick={onClose} className="hud-btn ml-auto h-9 w-9" aria-label="Đóng">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto scroll-cute p-4">
          {RULES.map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border-2 border-bark-700/25 bg-cream-100 p-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-bark-800/40 bg-leaf-300 text-leaf-900">
                <Icon name={r.icon} size={18} />
              </span>
              <p className="font-body text-[13px] font-medium leading-snug text-bark-800">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="shrink-0 p-3">
          <button onClick={onClose} className="btn btn-leaf w-full py-3 text-base">Đã hiểu, làm vườn thôi!</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Màn hình bắt đầu ---------------- */

export function StartScreen({ hasSave, day, onStart }: { hasSave: boolean; day: number; onStart: (fresh: boolean) => void }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto scroll-cute bg-night-900/85 backdrop-blur-[2px]">
      <div
        className="flex min-h-full flex-col items-center justify-center gap-5 px-4 py-8"
        style={{ paddingTop: "max(2rem, env(safe-area-inset-top, 0px))", paddingBottom: "max(2rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="pop-in flex flex-col items-center text-center">
          <div className="floaty grid h-20 w-20 place-items-center rounded-[26px] border-[3px] border-bark-900 bg-tang-400 shadow-[0_6px_0_var(--color-bark-900)] sm:h-24 sm:w-24">
            <Icon name="sprout" size={48} className="text-bark-900" />
          </div>
          <h1 className="title-wobble mt-4 font-display text-4xl font-extrabold leading-tight text-cream-100 sm:text-6xl" style={{ textShadow: "0 4px 0 rgba(43,26,12,.8)" }}>
            <span>C</span><span style={{ animationDelay: ".06s" }}>â</span><span style={{ animationDelay: ".12s" }}>y</span>{" "}
            <span style={{ animationDelay: ".18s" }} className="text-tang-400">C</span><span style={{ animationDelay: ".24s" }} className="text-tang-400">a</span><span style={{ animationDelay: ".3s" }} className="text-tang-400">m</span>{" "}
            <span style={{ animationDelay: ".36s" }} className="text-leaf-400">N</span><span style={{ animationDelay: ".42s" }} className="text-leaf-400">h</span><span style={{ animationDelay: ".48s" }} className="text-leaf-400">ỏ</span>
          </h1>
          <p className="mt-2 max-w-sm font-body text-sm font-medium text-cream-300 sm:text-base">
            Một cây cam duy nhất. Hoàn thành thói quen mỗi ngày để tưới cây, ngắm bé Cam khôn lớn — cây sẽ lớn mãi thành cổ thụ, quả ngọt ra đều.
          </p>
        </div>

        <div className="pop-in flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: ".12s" }}>
          {[
            { icon: "clipboard", label: "6 nhiệm vụ/ngày" },
            { icon: "berry", label: "Rơi berry · crit ×5" },
            { icon: "flame", label: "Giữ chuỗi streak" },
            { icon: "sprout", label: "Cây lớn mãi không ngừng" },
            { icon: "mist", label: "Sương mù & bí mật khu vườn" },
          ].map((f) => (
            <span key={f.label} className="chip bg-night-700 text-xs text-cream-200 border-bark-600 sm:text-sm">
              <Icon name={f.icon} size={15} className="text-tang-400" />
              {f.label}
            </span>
          ))}
        </div>

        <div className="pop-in flex items-end gap-2" style={{ animationDelay: ".2s" }}>
          <Chibi pose="exercise" size={54} />
          <Chibi pose="read" size={62} />
          <Chibi pose="sleep" size={54} />
          <span className="chip mb-1 bg-night-700 text-[11px] text-cream-300 border-bark-600">+11 hoạt cảnh nữa</span>
        </div>

        <div className="pop-in flex w-full max-w-xs flex-col gap-2.5" style={{ animationDelay: ".28s" }}>
          {hasSave && (
            <button onClick={() => onStart(false)} className="btn btn-tang glow-pulse w-full py-3.5 text-base sm:text-lg">
              <Icon name="arrow" size={20} />
              Chơi tiếp · Ngày {day}
            </button>
          )}
          <button onClick={() => onStart(true)} className={`btn w-full py-3.5 text-base sm:text-lg ${hasSave ? "btn-cream" : "btn-leaf glow-pulse"}`}>
            <Icon name={hasSave ? "sprout" : "arrow"} size={20} />
            {hasSave ? "Trồng cây mới từ đầu" : "Bắt đầu trồng cây"}
          </button>
          <p className="text-center font-body text-[11px] font-medium text-cream-300/80">
            {hasSave ? "Chơi tiếp sẽ giữ nguyên vườn hiện tại." : "Tiến độ được lưu ngay trên máy bạn."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */

export function Toasts({ list }: { list: ToastMsg[] }) {
  const style: Record<ToastMsg["kind"], { cls: string; icon: string }> = {
    info: { cls: "bg-cream-100 text-bark-800", icon: "spark" },
    success: { cls: "bg-leaf-500 text-cream-100", icon: "check" },
    warn: { cls: "bg-skyy-400 text-bark-900", icon: "snow" },
    berry: { cls: "bg-berry-500 text-cream-100", icon: "berry" },
    level: { cls: "bg-tang-500 text-cream-100", icon: "star" },
  };
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-1.5 px-3"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 96px)" }}
    >
      {list.map((t) => {
        const s = style[t.kind];
        return (
          <div key={t.id} className={`toast-in chip chip-toast max-w-full text-[13px] shadow-xl ${s.cls}`}>
            <Icon name={s.icon} size={15} />
            <span className="truncate">{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}
