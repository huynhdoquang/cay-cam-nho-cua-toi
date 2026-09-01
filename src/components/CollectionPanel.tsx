import type { GameState } from "../game/types";
import { MAX_LEVEL, SHOP, TREES } from "../game/data";
import type { GameApi } from "../game/useGame";
import { Icon } from "./icons";
import { MiniTree } from "./MiniTree";

interface Props {
  state: GameState;
  api: GameApi;
}

export function CollectionPanel({ state, api }: Props) {
  const trees = Object.values(TREES);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto scroll-cute pr-0.5">
      <h2 className="font-display text-lg font-extrabold text-bark-900 flex items-center gap-2 sticky top-0 bg-cream-200 py-0.5 z-10">
        <Icon name="book" size={19} className="text-leaf-700" />
        Bộ sưu tập
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {trees.map((t) => {
          const unlocked = state.unlockedTrees.includes(t.id);
          const growing = state.treeType === t.id;
          const seed = SHOP.find((s) => s.kind === "seed" && s.treeId === t.id);
          return (
            <div
              key={t.id}
              className={`flex flex-col items-center rounded-xl border-2 p-2 text-center transition-all ${
                growing
                  ? "border-tang-500 bg-tang-200 shadow-[0_4px_0_rgba(201,106,30,0.4)]"
                  : unlocked
                    ? "border-leaf-600/60 bg-leaf-200/70"
                    : "border-bark-700/25 bg-cream-100 opacity-90"
              }`}
            >
              <div className={unlocked ? "" : "relative"}>
                <MiniTree tree={t} locked={!unlocked} />
                {!unlocked && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-bark-800 bg-cream-300 text-bark-700">
                      <Icon name="lock" size={14} />
                    </span>
                  </span>
                )}
              </div>
              <p className="font-display text-xs font-extrabold text-bark-900 leading-tight">{t.name}</p>
              {growing ? (
                <span className="mt-0.5 chip chip-sm bg-tang-500 text-cream-100 text-[10px]">Đang trồng · Cấp {state.level}</span>
              ) : unlocked ? (
                <button onClick={() => api.plantTree(t.id)} className="btn btn-leaf mt-1 px-2 py-1 text-[11px]">
                  Gieo hạt
                </button>
              ) : (
                <p className="mt-0.5 font-body text-[10px] font-bold text-bark-600">
                  Hạt · {seed ? seed.cost : "—"} <Icon name="berry" size={10} className="inline text-berry-600" />
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Mùa thu hoạch", value: state.harvests, icon: "basket" },
          { label: "Berry đã kiếm", value: state.totalBerries, icon: "berry" },
          { label: "Chuỗi dài nhất", value: state.bestStreak, icon: "flame" },
          { label: "Hái quả ở cấp", value: MAX_LEVEL, icon: "star" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-2.5">
            <p className="flex items-center gap-1.5 font-display text-xl font-extrabold text-bark-900">
              <Icon name={s.icon} size={17} className="text-tang-600" />
              {s.value}
            </p>
            <p className="font-body text-[11px] font-semibold text-bark-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
        <h3 className="mb-2 flex items-center gap-1.5 font-display text-sm font-extrabold text-bark-900">
          <Icon name="spark" size={15} className="text-tang-600" />
          Sổ tay làm vườn
        </h3>
        <ul className="flex flex-col gap-1.5 font-body text-[11.5px] font-medium leading-snug text-bark-700">
          <li className="flex gap-1.5"><Icon name="drop" size={14} className="shrink-0 text-skyy-600" />Mỗi nhiệm vụ xong = 1 lần tưới: +KN và có thể rơi berry (Có/Không 40% · Đo lường 70%).</li>
          <li className="flex gap-1.5"><Icon name="spark" size={14} className="shrink-0 text-tang-600" />Crit 5% — nhân 5 số berry. Tưới 6 lần không rơi? Lần sau chắc chắn rơi.</li>
          <li className="flex gap-1.5"><Icon name="flame" size={14} className="shrink-0 text-tang-600" />Streak ≥ 7 ngày: +20% tỉ lệ rơi. Lỡ một ngày: mất streak, cây héo nhẹ (Băng bảo vệ sẽ cứu).</li>
          <li className="flex gap-1.5"><Icon name="star" size={14} className="shrink-0 text-tang-600" />Trần KN mỗi ngày: 120 — berry vẫn rơi bình thường.</li>
          <li className="flex gap-1.5"><Icon name="basket" size={14} className="shrink-0 text-tang-600" />Cây cấp 10: tự tay hái từng quả, nhận thưởng lớn rồi gieo cây mới.</li>
        </ul>
      </div>
    </div>
  );
}
