import { useState } from "react";
import type { GameState, TreeId } from "../game/types";
import { TREES } from "../game/data";
import type { GameApi, ToastMsg } from "../game/useGame";
import { Chibi } from "./Chibi";
import { MiniTree } from "./MiniTree";
import { Icon } from "./icons";

/* ---------- toasts ---------- */

const TOAST_STYLE: Record<ToastMsg["kind"], { cls: string; icon: string }> = {
  info: { cls: "bg-cream-200 text-bark-800", icon: "sprout" },
  success: { cls: "bg-leaf-300 text-leaf-900", icon: "check" },
  warn: { cls: "bg-tang-300 text-bark-800", icon: "leaf" },
  berry: { cls: "bg-berry-300 text-berry-700", icon: "berry" },
  level: { cls: "bg-tang-400 text-bark-900", icon: "star" },
};

export function Toasts({ list }: { list: ToastMsg[] }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-[74px] z-50 flex w-[min(92vw,430px)] -translate-x-1/2 flex-col items-center gap-2">
      {list.map((t) => {
        const s = TOAST_STYLE[t.kind];
        return (
          <div key={t.id} className={`toast-in chip chip-toast max-w-full text-[13px] shadow-xl ${s.cls}`}>
            <Icon name={s.icon} size={16} className="shrink-0" />
            <span className="font-body font-bold leading-snug">{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- shell ---------- */

function Overlay({ children, dim = true }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-40 grid place-items-center overflow-y-auto p-4 ${dim ? "bg-[rgba(10,22,14,0.78)]" : ""}`}
      style={{ backdropFilter: dim ? "blur(3px)" : undefined }}
    >
      {children}
    </div>
  );
}

/* ---------- start screen ---------- */

export function StartScreen({ hasSave, day, onStart }: { hasSave: boolean; day: number; onStart: (fresh: boolean) => void }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: "radial-gradient(1000px 600px at 50% -10%, rgba(255,167,51,0.14), transparent 60%), radial-gradient(800px 500px at 90% 110%, rgba(88,184,78,0.18), transparent 60%), #122b1d" }}>
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
      {/* drifting leaves */}
      <svg className="pointer-events-none absolute left-[8%] top-[14%] floaty" width="34" height="34" viewBox="0 0 24 24" fill="#58b84e" opacity="0.5"><path d="M4.5 19.5C4.5 10 11 4.5 20 4.5c0 9-6.5 15-15.5 15z" /></svg>
      <svg className="pointer-events-none absolute right-[10%] top-[22%] floaty" style={{ animationDelay: "1.2s" }} width="26" height="26" viewBox="0 0 24 24" fill="#ffa733" opacity="0.5"><path d="M4.5 19.5C4.5 10 11 4.5 20 4.5c0 9-6.5 15-15.5 15z" /></svg>
      <svg className="pointer-events-none absolute left-[16%] bottom-[18%] floaty" style={{ animationDelay: "0.6s" }} width="28" height="28" viewBox="0 0 24 24" fill="#7acb5f" opacity="0.4"><path d="M4.5 19.5C4.5 10 11 4.5 20 4.5c0 9-6.5 15-15.5 15z" /></svg>

      <div className="relative mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center gap-5 py-8 text-center">
        <div className="chip bg-leaf-300/90 text-leaf-900 text-xs pop-in">
          <Icon name="sprout" size={14} />
          game trồng cây · gieo thói quen
        </div>

        <h1 className="title-wobble font-display text-6xl font-extrabold leading-none text-cream-100 sm:text-7xl" style={{ textShadow: "0 4px 0 #c96a1e, 0 8px 0 rgba(43,26,12,0.55)" }}>
          <span>Cây&nbsp;</span>
          <span style={{ color: "#ffa733", animationDelay: "0.25s" }}>Cam&nbsp;</span>
          <span style={{ animationDelay: "0.5s" }}>Nhỏ</span>
        </h1>

        <div className="floaty">
          <Chibi pose="plant" size={150} hair="#7a4a21" shirt="#58b84e" />
        </div>

        <div className="panel-dark w-full max-w-md p-4 text-left pop-in">
          <p className="mb-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream-300">Cách chơi</p>
          <ol className="flex flex-col gap-2.5">
            {[
              { icon: "clipboard", text: "Hoàn thành nhiệm vụ hàng ngày — bé Cam sẽ diễn hoạt từng việc thay cho những dòng chữ khô khan." },
              { icon: "drop", text: "Mỗi việc xong là một lần tưới cây: nhận KN, cây lớn qua 10 cấp, berry rơi lách tách (có crit ×5!)." },
              { icon: "basket", text: "Cây cấp 10 sẽ chín quả — tự tay hái từng quả, nhận thưởng lớn, rồi gieo giống cây mới." },
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-bark-950 bg-tang-400 text-bark-900">
                  <Icon name={s.icon} size={16} />
                </span>
                <p className="font-body text-[13px] font-medium leading-snug text-cream-200">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex w-full max-w-md flex-col gap-2.5">
          {hasSave && (
            <button onClick={() => onStart(false)} className="btn btn-tang glow-pulse w-full py-3.5 text-lg">
              <Icon name="arrow" size={20} />
              Tiếp tục · Ngày {day}
            </button>
          )}
          <button onClick={() => onStart(true)} className={`btn w-full py-3 text-base ${hasSave ? "btn-wood" : "btn-tang glow-pulse text-lg py-3.5"}`}>
            <Icon name="sprout" size={19} />
            {hasSave ? "Trồng cây mới từ đầu" : "Bắt đầu trồng cây"}
          </button>
        </div>

        <p className="font-body text-[11px] font-medium text-cream-300/60">Tiến độ được lưu ngay trên máy của bạn · không cần tài khoản</p>
      </div>
    </div>
  );
}

/* ---------- harvest ---------- */

export function HarvestModal({ state, api }: { state: GameState; api: GameApi }) {
  const [sel, setSel] = useState<TreeId>(state.treeType);
  const tree = TREES[state.treeType];
  const bonus = 20 + state.streak * 2;
  const fromFruits = Math.max(0, state.lastHarvestGain - bonus);

  return (
    <Overlay>
      <div className="panel pop-in w-full max-w-lg p-5">
        <div className="text-center">
          <div className="chip bg-tang-400 text-bark-900 text-xs">
            <Icon name="basket" size={14} />
            Mùa thu hoạch #{state.harvests}
          </div>
          <h2 className="mt-2 font-display text-4xl font-extrabold text-bark-900" style={{ textShadow: "0 2px 0 rgba(255,196,107,0.8)" }}>
            Hết sạch quả rồi!
          </h2>
          <p className="font-body text-sm font-semibold text-bark-600">
            Cây {tree.name} đã hoàn thành sứ mệnh sau {state.day} ngày chăm sóc.
          </p>
        </div>

        <div className="mt-4 rounded-xl border-2 border-bark-700/30 bg-cream-100 p-3.5">
          <div className="flex items-center justify-between font-body text-[13px] font-semibold text-bark-700">
            <span>Berry từ {tree.fruits} quả hái</span>
            <span className="font-display font-bold">+{fromFruits}</span>
          </div>
          <div className="mt-1 flex items-center justify-between font-body text-[13px] font-semibold text-bark-700">
            <span>Thưởng streak ({state.streak} ngày)</span>
            <span className="font-display font-bold">+{bonus}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-bark-500/40 pt-2">
            <span className="font-display text-lg font-extrabold text-bark-900">Tổng cộng</span>
            <span className="chip bg-berry-300 text-berry-700 text-lg">
              <Icon name="berry" size={18} />
              +{state.lastHarvestGain}
            </span>
          </div>
        </div>

        <p className="mt-4 mb-2 text-center font-display text-sm font-extrabold uppercase tracking-wide text-bark-600">
          Gieo hạt cho mùa sau
        </p>
        <div className="grid grid-cols-3 gap-2">
          {state.unlockedTrees.map((id) => {
            const t = TREES[id];
            const active = sel === id;
            return (
              <button
                key={id}
                onClick={() => setSel(id)}
                className={`flex flex-col items-center rounded-xl border-[3px] p-2 transition-all ${
                  active
                    ? "border-tang-500 bg-tang-200 -translate-y-1 shadow-[0_5px_0_rgba(201,106,30,0.5)]"
                    : "border-bark-700/30 bg-cream-100 hover:border-bark-500"
                }`}
              >
                <MiniTree tree={t} locked={false} />
                <span className="font-display text-xs font-extrabold text-bark-900">{t.name}</span>
                <span className="font-body text-[10px] font-bold text-bark-600">{t.value} berry/quả</span>
              </button>
            );
          })}
        </div>

        <button onClick={() => api.plantTree(sel)} className="btn btn-leaf mt-4 w-full py-3 text-lg">
          <Icon name="sprout" size={20} />
          Gieo hạt & trồng!
        </button>
      </div>
    </Overlay>
  );
}

/* ---------- help ---------- */

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay>
      <div className="panel pop-in max-h-[86vh] w-full max-w-lg overflow-y-auto scroll-cute p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold text-bark-900 flex items-center gap-2">
            <Icon name="book" size={22} className="text-leaf-700" />
            Luật chơi
          </h2>
          <button onClick={onClose} className="btn btn-cream h-9 w-9 shrink-0 rounded-full" aria-label="Đóng">
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3 font-body text-[13px] font-medium leading-relaxed text-bark-700">
          <section className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
            <h3 className="mb-1 font-display text-sm font-extrabold text-leaf-800 flex items-center gap-1.5"><Icon name="drop" size={15} />Tưới cây & berry</h3>
            <ul className="list-disc space-y-0.5 pl-5">
              <li>Nhiệm vụ <b>Có/Không</b>: 40% rơi 1–3 berry.</li>
              <li>Nhiệm vụ <b>Đo lường</b>: 70% rơi 3–8 berry.</li>
              <li><b>Crit 5%</b>: nhân 5 lượng berry rơi.</li>
              <li><b>Thương xót</b>: 6 lần tưới không rơi → lần sau chắc chắn rơi.</li>
              <li><b>Streak ≥ 7</b>: +20% tỉ lệ rơi. <b>Phân bón</b>: +25% trong 3 lần tưới.</li>
            </ul>
          </section>

          <section className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
            <h3 className="mb-1 font-display text-sm font-extrabold text-leaf-800 flex items-center gap-1.5"><Icon name="star" size={15} />KN & cấp cây</h3>
            <ul className="list-disc space-y-0.5 pl-5">
              <li>Có/Không ~12 KN · Đo lường ~16 KN (±2).</li>
              <li>Trần <b>120 KN/ngày</b> — quá trần chỉ còn 20%, berry vẫn rơi đủ.</li>
              <li>Cây có 10 cấp: cấp 8 nở hoa, cấp 9 đậu quả non, cấp 10 chín.</li>
            </ul>
          </section>

          <section className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
            <h3 className="mb-1 font-display text-sm font-extrabold text-leaf-800 flex items-center gap-1.5"><Icon name="basket" size={15} />Thu hoạch & sau đó</h3>
            <ul className="list-disc space-y-0.5 pl-5">
              <li>Cấp 10: nhấn hái từng quả (8–9 quả), mỗi quả 10–16 berry, crit ×3.</li>
              <li>Thưởng mùa: <b>20 + 2×streak</b> berry.</li>
              <li>Sau thu hoạch: chọn gieo giống mới — Cam, Anh Đào, Táo Đỏ (mở khóa dần).</li>
            </ul>
          </section>

          <section className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
            <h3 className="mb-1 font-display text-sm font-extrabold text-leaf-800 flex items-center gap-1.5"><Icon name="moon" size={15} />Qua ngày & streak</h3>
            <ul className="list-disc space-y-0.5 pl-5">
              <li>Nhấn <b>Đi ngủ</b> để sang ngày mới với bộ nhiệm vụ mới.</li>
              <li>Xong hết nhiệm vụ: +1 streak, thưởng 5–30 berry.</li>
              <li>Lỡ dở: mất streak, cây héo nhẹ một ngày — <b>Băng bảo vệ</b> sẽ đỡแทน. Nhẹ nhàng thôi, mai mình làm lại!</li>
            </ul>
          </section>
        </div>

        <button onClick={onClose} className="btn btn-leaf mt-4 w-full py-2.5 text-base">
          <Icon name="check" size={17} />
          Đã hiểu, ra vườn thôi!
        </button>
      </div>
    </Overlay>
  );
}
