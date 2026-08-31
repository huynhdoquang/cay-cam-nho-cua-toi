import { useState } from "react";
import type { GameState, PoseId, TaskKind } from "../game/types";
import { BONUS_STREAK, FERT_BONUS, POSES } from "../game/data";
import type { GameApi } from "../game/useGame";
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
  const bonusRate = (state.streak >= BONUS_STREAK ? 20 : 0) + (state.fertCharges > 0 ? Math.round(FERT_BONUS * 100) : 0);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-bark-900">
          <Icon name="clipboard" size={19} className="text-leaf-700" />
          Việc của bạn · Ngày {state.day}
        </h2>
        {bonusRate > 0 && (
          <span className="chip chip-sm bg-tang-400 text-[11px] text-bark-900">
            <Icon name="spark" size={13} />
            rơi +{bonusRate}%
          </span>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border-2 border-dashed border-skyy-600/50 bg-skyy-300/60 p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-bark-900 bg-cream-100 text-skyy-600">
          <Icon name="drop" size={17} />
        </span>
        <p className="font-body text-[12px] font-semibold leading-snug text-[#14507a]">
          Mỗi nhiệm vụ là một <b>bong bóng bay quanh cây</b> — chạm bong bóng, xác nhận xong và ngắm bé Cam tưới cây ngay!
        </p>
      </div>

      {done === total && total > 0 && (
        <div className="pop-in flex items-center gap-2 rounded-xl border-2 border-leaf-600/60 bg-leaf-200 p-2.5">
          <Chibi pose="stretch" size={44} />
          <p className="font-body text-[12px] font-bold leading-snug text-leaf-900">
            Tuyệt vời! Vườn đã được tưới đủ hôm nay — đừng quên bấm “Đi ngủ thôi” để giữ streak nhé.
          </p>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} className="btn btn-cream w-full py-2.5 text-sm text-bark-800">
        <Icon name={open ? "close" : "plus"} size={16} />
        {open ? "Đóng" : "Thêm nhiệm vụ của bạn"}
      </button>

      {open && <CustomForm api={api} onDone={() => setOpen(false)} />}

      {state.customs.length > 0 && (
        <div>
          <h3 className="mb-1.5 flex items-center gap-1.5 font-display text-[13px] font-extrabold uppercase tracking-wide text-bark-600">
            <Icon name="star" size={14} />
            Nhiệm vụ của bạn ({state.customs.length})
          </h3>
          <div className="flex flex-col gap-1.5">
            {state.customs.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 rounded-xl border-2 border-bark-700/25 bg-cream-100 p-2">
                <Chibi pose={c.pose} size={38} animated={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-bark-900">{c.name}</p>
                  <p className="font-body text-[11px] font-semibold text-bark-600">
                    {c.kind === "binary" ? "Có / Không" : `${c.target} ${c.unit}`}
                  </p>
                </div>
                <button onClick={() => api.removeCustom(c.id)} className="hud-btn h-9 w-9 text-tang-700" aria-label={`Xoá ${c.name}`}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomForm({ api, onDone }: { api: GameApi; onDone: () => void }) {
  const [name, setName] = useState("");
  const [pose, setPose] = useState<PoseId>("read");
  const [kind, setKind] = useState<TaskKind>("binary");
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
        className="w-full rounded-lg border-2 border-bark-700/40 bg-cream-200 px-3 py-2.5 font-body text-sm font-semibold text-bark-900 outline-none placeholder:text-bark-500/60 focus:border-tang-500"
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

      <div className="mt-2 flex flex-wrap items-center gap-2">
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
              inputMode="numeric"
              className="w-16 rounded-lg border-2 border-bark-700/40 bg-cream-200 px-2 py-2 text-center font-body text-xs font-bold text-bark-900 outline-none focus:border-tang-500"
              aria-label="Mục tiêu"
            />
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              maxLength={10}
              placeholder="đơn vị"
              className="w-20 rounded-lg border-2 border-bark-700/40 bg-cream-200 px-2 py-2 text-center font-body text-xs font-bold text-bark-900 outline-none focus:border-tang-500"
            />
            <span className="font-body text-[11px] font-semibold text-bark-600">mỗi lần +</span>
            <input
              value={step}
              onChange={(e) => setStep(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="w-14 rounded-lg border-2 border-bark-700/40 bg-cream-200 px-2 py-2 text-center font-body text-xs font-bold text-bark-900 outline-none focus:border-tang-500"
              aria-label="Bước tăng"
            />
          </>
        )}
      </div>

      <button onClick={submit} className="btn btn-leaf mt-3 w-full py-2.5 text-sm">
        <Icon name="plus" size={16} />
        Tạo bong bóng nhiệm vụ
      </button>
    </div>
  );
}
