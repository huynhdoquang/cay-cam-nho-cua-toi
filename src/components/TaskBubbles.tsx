import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { GameState, TaskInst } from "../game/types";
import type { GardenEngine } from "../game/engine";
import type { GameApi } from "../game/useGame";
import { skinColors } from "../game/useGame";
import { BONUS_STREAK, FERT_BONUS } from "../game/data";
import { sfx } from "../game/audio";
import { Chibi } from "./Chibi";
import { Icon } from "./icons";

interface Props {
  state: GameState;
  api: GameApi;
  engineRef: MutableRefObject<GardenEngine | null>;
  onPopupChange: (open: boolean) => void;
  resetSignal: number;
  bottomOffset: number;
}

interface ViewInfo { w: number; h: number; u: number; tx: number; ty: number; r: number }
interface Ghost { uid: string; task: TaskInst; fx: number; fy: number }

const lastPos: { current: Record<string, { x: number; y: number }> } = { current: {} };

function buzz(ms: number) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported */ }
}

/** Bong bóng nhiệm vụ bay quanh cây + popup xác nhận dock đáy màn hình. */
export function TaskBubbles({ state, api, engineRef, onPopupChange, resetSignal, bottomOffset }: Props) {
  const [view, setView] = useState<ViewInfo>({ w: 0, h: 0, u: 0.8, tx: 0, ty: 0, r: 60 });
  const [selected, setSelected] = useState<string | null>(null);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const refresh = useCallback(() => {
    const e = engineRef.current;
    if (e) setView(e.getView());
  }, [engineRef]);

  useEffect(() => {
    refresh();
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(refresh);
    ro.observe(el);
    return () => ro.disconnect();
  }, [refresh, state.level, state.tasks.length]);

  useEffect(() => {
    if (resetSignal > 0) {
      setSelected(null);
      onPopupChange(false);
    }
  }, [resetSignal, onPopupChange]);

  // popup tự đóng khi task đã hoàn thành (delay để nhìn bubble bay vào cây)
  useEffect(() => {
    if (!selected) return;
    const t = state.tasks.find((x) => x.uid === selected);
    if (!t || t.done) {
      const id = window.setTimeout(() => {
        setSelected(null);
        onPopupChange(false);
      }, 420);
      return () => window.clearTimeout(id);
    }
  }, [selected, state.tasks, onPopupChange]);

  const openPopup = (uid: string) => {
    sfx.pop();
    buzz(8);
    setSelected(uid);
    onPopupChange(true);
  };

  const confirm = (t: TaskInst) => {
    const v = viewRef.current;
    setGhosts((g) => [...g, { uid: t.uid, task: t, fx: v.tx, fy: v.ty }]);
    buzz(18);
    api.completeTask(t.uid);
    window.setTimeout(() => setGhosts((g) => g.filter((x) => x.uid !== t.uid)), 560);
  };

  const active = state.tasks.filter((t) => !t.done);
  const sk = skinColors(state);
  const N = active.length;
  const ready = view.w > 0 && view.tx > 0;

  const slots = active.map((t, i) => {
    const frac = N === 1 ? 0.5 : i / (N - 1);
    const angle = Math.PI + frac * Math.PI;
    const rx = Math.min(view.w * 0.42, Math.max(130 * view.u, view.r + 120 * view.u));
    const ry = Math.min(view.h * 0.3, Math.max(100 * view.u, view.r + 85 * view.u));
    const x = Math.min(view.w - 40, Math.max(40, view.tx + Math.cos(angle) * rx));
    const y = Math.min(view.h * 0.66, Math.max(46, view.ty + Math.sin(angle) * ry * 0.85 - 8 * view.u));
    return { t, x, y };
  });

  const selectedTask = selected ? state.tasks.find((x) => x.uid === selected && !x.done) ?? null : null;

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-20">
      {state.started && ready &&
        slots.map(({ t, x, y }, i) => (
          <Bubble
            key={t.uid}
            task={t}
            x={x}
            y={y}
            index={i}
            hair={sk.hair}
            shirt={sk.shirt}
            hat={sk.hat}
            onTap={() => openPopup(t.uid)}
            onConfirm={confirm}
          />
        ))}

      {ghosts.map((g) => {
        const origin = lastPos.current[g.uid];
        const fx = g.fx - (origin?.x ?? view.w / 2);
        const fy = g.fy - (origin?.y ?? view.h / 2);
        return (
          <div
            key={`ghost-${g.uid}`}
            className="bubble bubble-fly"
            style={{ left: origin?.x ?? view.w / 2, top: origin?.y ?? view.h / 2, ["--fx" as string]: `${fx}px`, ["--fy" as string]: `${fy}px` }}
          >
            <div className="bubble-btn pointer-events-none" style={{ boxShadow: "0 3px 0 rgba(43,26,12,0.4)" }}>
              <Chibi pose={g.task.pose} hair={sk.hair} shirt={sk.shirt} hat={sk.hat} size={44} animated={false} />
            </div>
          </div>
        );
      })}

      {selectedTask && (
        <TaskPopup
          key={selectedTask.uid}
          task={selectedTask}
          state={state}
          api={api}
          hair={sk.hair}
          shirt={sk.shirt}
          hat={sk.hat}
          onClose={() => {
            setSelected(null);
            onPopupChange(false);
          }}
          onConfirm={confirm}
          bottomOffset={bottomOffset}
        />
      )}
    </div>
  );
}

function Bubble({
  task, x, y, index, hair, shirt, hat, onTap, onConfirm,
}: {
  task: TaskInst;
  x: number;
  y: number;
  index: number;
  hair: string;
  shirt: string;
  hat: string | null;
  onTap: () => void;
  onConfirm: (t: TaskInst) => void;
}) {
  useEffect(() => {
    lastPos.current[task.uid] = { x, y };
  }, [task.uid, x, y]);

  useEffect(() => {
    return () => { delete lastPos.current[task.uid]; };
  }, [task.uid]);

  const pct = task.kind === "quant" ? task.progress / task.target : 0;
  const R = 37;
  const C = 2 * Math.PI * R;

  return (
    <div className="bubble bubble-in" style={{ left: x, top: y, animationDelay: `${index * 0.07}s` }}>
      <div className="bubble-bob" style={{ animationDuration: `${2.6 + (index % 3) * 0.5}s`, animationDelay: `${index * 0.33}s` }}>
        <button
          onClick={onTap}
          onDoubleClick={() => onConfirm(task)}
          className="bubble-btn pointer-events-auto"
          aria-label={`Nhiệm vụ: ${task.name}`}
        >
          <Chibi pose={task.pose} hair={hair} shirt={shirt} hat={hat} size={44} />

          {task.kind === "quant" && (
            <svg className="absolute -inset-[5px] -rotate-90" width="72" height="72" viewBox="0 0 76 76" aria-hidden>
              <circle cx="38" cy="38" r={R} fill="none" stroke="rgba(122,74,33,0.25)" strokeWidth="4.5" />
              <circle
                cx="38" cy="38" r={R} fill="none"
                stroke="#ff8c2e" strokeWidth="4.5" strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
          )}

          <span className="absolute -bottom-1.5 -right-1 rounded-full border-2 border-bark-900 bg-leaf-400 px-1 py-px font-display text-[9px] font-extrabold leading-tight text-leaf-900">
            +{task.xp}
          </span>
        </button>
      </div>
    </div>
  );
}

function TaskPopup({
  task, state, api, hair, shirt, hat, onClose, onConfirm, bottomOffset,
}: {
  task: TaskInst;
  state: GameState;
  api: GameApi;
  hair: string;
  shirt: string;
  hat: string | null;
  onClose: () => void;
  onConfirm: (t: TaskInst) => void;
  bottomOffset: number;
}) {
  const bonusRate = (state.streak >= BONUS_STREAK ? 20 : 0) + (state.fertCharges > 0 ? Math.round(FERT_BONUS * 100) : 0);
  const rate = Math.min(97, (task.kind === "quant" ? 70 : 40) + bonusRate);
  const pct = Math.min(100, Math.round((task.progress / task.target) * 100));

  return (
    <div
      className="popup-rise pointer-events-auto fixed left-1/2 z-40 w-[min(92vw,400px)]"
      style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset}px)` }}
      role="dialog"
      aria-label={task.name}
    >
      <div className="panel overflow-hidden rounded-2xl p-3.5 shadow-[0_8px_0_rgba(43,26,12,0.55)]">
        <div className="flex items-center gap-3">
          <div className="relative grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-bark-800 bg-leaf-200">
            <Chibi pose={task.pose} hair={hair} shirt={shirt} hat={hat} size={62} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-display text-base font-extrabold leading-tight text-bark-900">
              {task.name}
              {task.custom && (
                <span className="shrink-0 rounded-full bg-berry-300 px-1.5 py-px font-body text-[9px] font-bold text-berry-700">của bạn</span>
              )}
            </p>
            <p className="mt-0.5 font-body text-[11.5px] font-semibold text-bark-600">
              +{task.xp} KN · rơi berry {rate}%
              {task.kind === "quant" && ` · ${task.progress}/${task.target} ${task.unit}`}
            </p>
          </div>
          <button onClick={onClose} className="hud-btn h-9 w-9 shrink-0" aria-label="Đóng">
            <Icon name="close" size={15} />
          </button>
        </div>

        {task.kind === "quant" && (
          <div className="mt-2.5 h-3.5 overflow-hidden rounded-full border-2 border-bark-800/50 bg-cream-300">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tang-400 to-tang-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {task.kind === "binary" ? (
          <button onClick={() => onConfirm(task)} className="btn btn-leaf mt-3 w-full py-3 text-base">
            <Icon name="drop" size={19} />
            Xong rồi — tưới cây thôi!
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            {task.progress > 0 && (
              <button onClick={() => api.stepBack(task.uid)} className="btn btn-cream h-12 w-12 shrink-0 text-bark-700" aria-label="Giảm tiến độ">
                <Icon name="minus" size={17} />
              </button>
            )}
            <button onClick={() => onConfirm(task)} className="btn btn-leaf h-12 flex-1 text-base font-extrabold">
              <Icon name="plus" size={17} />+{task.step} {task.unit}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
