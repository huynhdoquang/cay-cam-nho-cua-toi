import type { ReactNode } from "react";
import type { GameState } from "../game/types";
import { FRUIT_REGROWTH_DAYS, TREE } from "../game/data";
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
            Cây cam sẽ <b>tiếp tục lớn</b> thành cổ thụ! Lứa quả mới sẽ ra sau mỗi {FRUIT_REGROWTH_DAYS} ngày — nhớ quay lại hái nhé.
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

/* ---------------- Luật chơi ---------------- */

const RULES: { icon: string; text: ReactNode }[] = [
  { icon: "clipboard", text: <>Mỗi nhiệm vụ hoàn thành = <b>1 lần tưới cây</b>: +KN và có thể rơi <b>berry</b>. Nhiệm vụ đo lường rơi berry nhiều hơn.</> },
  { icon: "star", text: <>Trần <b>120 KN/ngày</b> để giữ nhịp vừa sức — quá trần, berry vẫn rơi như thường.</> },
  { icon: "berry", text: <>Tỷ lệ rơi: Có/Không <b>40%</b> (1–3), đo lường <b>70%</b> (3–8). <b>Crit 5%</b> nhân 5! Tưới 6 lần không rơi thì lần sau <b>chắc chắn rơi</b>.</> },
  { icon: "flame", text: <>Streak ≥ <b>7 ngày</b> cộng thêm <b>+20%</b> tỷ lệ rơi. Lỡ một ngày: mất streak và cây héo nhẹ — <b>Băng bảo vệ</b> sẽ đỡ thay.</> },
  { icon: "basket", text: <>Cây đạt <b>cấp 10</b> sẽ chín quả: tự tay <b>chạm từng quả</b> để hái. Sau đó cây vẫn lớn tiếp, cứ <b>7 ngày</b> lại ra quả mới.</> },
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
