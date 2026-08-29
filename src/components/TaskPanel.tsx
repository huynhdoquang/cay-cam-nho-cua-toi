import { useState } from "react";
import type { GameState, PoseId, TaskInst } from "../game/types";
import { BONUS_STREAK, DAILY_XP_CAP, FERT_BONUS, POSES } from "../game/data";
import type { GameApi } from "../game/useGame";
import { skinColors } from "../game/useGame";
import { Chibi } from "./Chibi";
import { Icon } from "./icons";

interface Props {
  state: GameState;
  api: GameApi;
}

export function TaskPanel({ state, api }: Props) {
  const [open, setOpen] = useState(false);
  const done = state.tasks.filter((t) => t.done).length;
  const total = state.tasks.length;
  const atCap = state.xpToday >= DAILY_XP_CAP;

  const bonusRate = (state.streak >= BONUS_STREAK ? 20 : 0) + (state.fertCharges > 0 ? Math.round(FERT_BONUS * 100) : 0);

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto scroll-cute pr-1">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-extrabold text-bark-900 flex items-center gap-2">
          <Icon name="clipboard" size={19} className="text-leaf-700" />
          Nhiệm vụ ngày {state.day}
        </h2>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-16 overflow-hidden rounded-full border-2 border-bark-800/50 bg-cream-300">
            <div
              className="h-full rounded-full bg-leaf-500 transition-all duration-500"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
          <span className="font-display text-sm font-bold text-bark-800">{done}/{total}</span>
        </div>
      </div>

      <div
        className={`chip self-start text-[11px] ${atCap ? "bg-tang-300 text-bark-800" : "bg-cream-100 text-bark-700"}`}
        title="Sau khi chạm trần, nhiệm vụ vẫn thưởng berry nhưng KN giảm"
      >
        <Icon name="star" size={13} />
        KN hôm nay {state.xpToday}/{DAILY_XP_CAP}
        {bonusRate > 0 && (
          <span className="rounded-full bg-tang-500 px-1.5 font-body text-[10px] font-bold text-cream-100">rơi +{bonusRate}%</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {state.tasks.map((t) => (
          <TaskRow key={t.uid} t={t} state={state} api={api} bonusRate={bonusRate} />
        ))}
        {state.tasks.length === 0 && (
          <p className="text-center font-body text-sm text-bark-600 py-6">Chưa có nhiệm vụ nào — thêm bên dưới nhé!</p>
        )}
      </div>

      <button onClick={() => setOpen((o) => !o)} className="btn btn-cream w-full py-2 text-sm text-bark-800">
        <Icon name={open ? "close" : "plus"} size={16} />
        {open ? "Đóng" : "Thêm nhiệm vụ của bạn"}
      </button>

      {open && <CustomForm api={api} onDone={() => setOpen(false)} />}
    </div>
  );
}

function TaskRow({ t, state, api, bonusRate }: { t: TaskInst; state: GameState; api: GameApi; bonusRate: number }) {
  const sk = skinColors(state);
  const pct = Math.round((t.progress / t.target) * 100);
  const rate = Math.min(97, (t.kind === "quant" ? 70 : 40) + bonusRate);

  return (
    <div
      className={`relative flex items-center gap-2.5 rounded-xl border-2 p-2 transition-all duration-300 ${
        t.done
          ? "border-leaf-600/70 bg-leaf-200/60"
          : "border-bark-700/25 bg-cream-100 hover:-translate-y-0.5 hover:border-tang-500 hover:shadow-[0_4px_0_rgba(122,74,33,0.25)]"
      }`}
    >
      <div className={`relative shrink-0 ${t.done ? "opacity-70 saturate-[0.4]" : ""}`}>
        <Chibi pose={t.pose} hair={sk.hair} shirt={sk.shirt} hat={sk.hat} size={54} animated={!t.done} />
        {t.done && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="stamp grid h-8 w-8 place-items-center rounded-full border-[3px] border-leaf-900 bg-leaf-400 text-leaf-900">
              <Icon name="check" size={15} />
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`font-display text-[15px] font-bold leading-tight truncate ${t.done ? "text-leaf-900 line-through decoration-2" : "text-bark-900"}`}>
            {t.name}
          </p>
          {t.custom && (
            <span className="shrink-0 rounded-full bg-berry-300 px-1.5 py-px font-body text-[9px] font-bold text-berry-700">của bạn</span>
          )}
        </div>

        {t.kind === "quant" ? (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-bark-800/40 bg-cream-300">
              <div
                className={`h-full rounded-full transition-all duration-300 ${t.done ? "bg-leaf-500" : "bg-tang-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="whitespace-nowrap font-body text-[11px] font-bold text-bark-700">
              {t.progress}/{t.target} {t.unit}
            </span>
          </div>
        ) : (
          <p className="mt-0.5 font-body text-[11px] font-semibold text-bark-600">
            +{t.xp} KN · rơi berry {rate}%
          </p>
        )}
      </div>

      {!t.done &&
        (t.kind === "binary" ? (
          <button onClick={() => api.completeTask(t.uid)} className="btn btn-leaf shrink-0 px-3.5 py-2 text-sm">
            <Icon name="check" size={15} />
            Xong!
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            {t.progress > 0 && (
              <button
                onClick={() => api.stepBack(t.uid)}
                className="btn btn-cream h-9 w-8 text-bark-700"
                aria-label="Giảm tiến độ"
              >
                <Icon name="minus" size={14} />
              </button>
            )}
            <button onClick={() => api.completeTask(t.uid)} className="btn btn-leaf px-3 py-2 text-sm font-extrabold">
              +{t.step}
            </button>
          </div>
        ))}
    </div>
  );
}

function CustomForm({ api, onDone }: { api: GameApi; onDone: () => void }) {
  const [name, setName] = useState("");
  const [pose, setPose] = useState<PoseId>("read");
  const [kind, setKind] = useState<"binary" | "quant">("binary");
  const [target, setTarget] = useState("10");
  const [unit, setUnit] = useState("trang");
  const [step, setStep] = useState("2");

  const submit = () => {
    const ok = api.addCustom({
      name,
      pose,
      kind,
      target: parseInt(target, 10) || 1,
      unit,
      step: parseInt(step, 10) || 1,
    });
    if (ok) {
      setName("");
      onDone();
    }
  };

  return (
    <div className="pop-in rounded-xl border-2 border-dashed border-bark-500/60 bg-cream-100 p-3">
      <p className="font-display text-sm font-bold text-bark-800 mb-2">Nhiệm vụ mới</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={42}
        placeholder="VD: Học đàn 15 phút"
        className="w-full rounded-lg border-2 border-bark-700/40 bg-cream-200 px-3 py-2 font-body text-sm font-semibold text-bark-900 outline-none placeholder:text-bark-500/60 focus:border-tang-500"
      />

      <p className="mt-2 mb-1 font-body text-[11px] font-bold uppercase tracking-wide text-bark-600">Bé Cam sẽ diễn hoạt…</p>
      <div className="grid grid-cols-7 gap-1">
        {POSES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPose(p.id)}
            title={p.label}
            className={`rounded-lg border-2 p-0.5 transition-all ${
              pose === p.id ? "border-tang-500 bg-tang-200 scale-105" : "border-transparent hover:border-bark-500/40 hover:bg-cream-300"
            }`}
          >
            <Chibi pose={p.id} size={38} animated={pose === p.id} />
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border-2 border-bark-700/40">
          <button
            onClick={() => setKind("binary")}
            className={`px-2.5 py-1.5 font-display text-xs font-bold transition-colors ${kind === "binary" ? "bg-leaf-500 text-cream-100" : "bg-cream-200 text-bark-700"}`}
          >
            Có / Không
          </button>
          <button
            onClick={() => setKind("quant")}
            className={`px-2.5 py-1.5 font-display text-xs font-bold transition-colors ${kind === "quant" ? "bg-leaf-500 text-cream-100" : "bg-cream-200 text-bark-700"}`}
          >
            Đo lường
          </button>
        </div>

        {kind === "quant" && (
          <>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-14 rounded-lg border-2 border-bark-700/40 bg-cream-200 px-2 py-1.5 text-center font-body text-xs font-bold text-bark-900 outline-none focus:border-tang-500"
              aria-label="Mục tiêu"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              maxLength={12}
              placeholder="đơn vị"
              className="w-20 rounded-lg border-2 border-bark-700/40 bg-cream-200 px-2 py-1.5 font-body text-xs font-bold text-bark-900 outline-none placeholder:text-bark-500/60 focus:border-tang-500"
            />
            <div className="flex items-center gap-1 font-body text-[11px] font-bold text-bark-600">
              bước
              <input
                value={step}
                onChange={(e) => setStep(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-10 rounded-lg border-2 border-bark-700/40 bg-cream-200 px-2 py-1.5 text-center font-body text-xs font-bold text-bark-900 outline-none focus:border-tang-500"
                aria-label="Bước tăng"
              />
            </div>
          </>
        )}
      </div>

      <button onClick={submit} disabled={!name.trim()} className="btn btn-tang mt-3 w-full py-2 text-sm">
        <Icon name="sprout" size={16} />
        Thêm vào hôm nay (+{kind === "quant" ? 16 : 12} KN)
      </button>
    </div>
  );
}
