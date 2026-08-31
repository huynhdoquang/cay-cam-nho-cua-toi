import type { GameState } from "../game/types";
import { FIRST_HARVEST_LEVEL, FRUIT_REGROWTH_COUNT, FRUIT_REGROWTH_DAYS, TREE, xpForLevel, xpWindow, stageName } from "../game/data";
import { Icon } from "./icons";

interface Props {
  state: GameState;
}

function MiniTree({ level }: { level: number }) {
  const s = Math.min(1, 0.55 + level * 0.03);
  const ancient = level >= 13;
  return (
    <svg width={96 * s + 24} height={96 * s + 24} viewBox="0 0 120 120" aria-hidden>
      {ancient && <circle cx="60" cy="52" r="46" fill="rgba(255,217,61,0.25)" />}
      <ellipse cx="60" cy="104" rx="30" ry="7" fill="rgba(30,77,40,0.25)" />
      <path d={`M54 104 Q54 ${80 - level} 58 ${66 - level} L62 ${66 - level} Q66 ${80 - level} 66 104 Z`} fill="#8b5a2b" stroke="#5c3a1e" strokeWidth="2.4" />
      <g transform={`translate(60 ${58 - level * 0.8}) scale(${s})`}>
        <circle cx="0" cy="0" r="30" fill={TREE.leaf} stroke="#2e6b33" strokeWidth="2.6" />
        <circle cx="-20" cy="8" r="17" fill={TREE.leaf} />
        <circle cx="20" cy="8" r="17" fill={TREE.leaf} />
        <circle cx="-9" cy="-12" r="15" fill={TREE.leafLight} />
        <circle cx="-12" cy="4" r="6" fill={TREE.fruit} stroke={TREE.fruitDark} strokeWidth="2" />
        <circle cx="10" cy="-2" r="6" fill={TREE.fruit} stroke={TREE.fruitDark} strokeWidth="2" />
        <circle cx="2" cy="14" r="6" fill={TREE.fruit} stroke={TREE.fruitDark} strokeWidth="2" />
      </g>
    </svg>
  );
}

export function TreePanel({ state }: Props) {
  const { prev, next, pct } = xpWindow(state.level, state.xp);
  const needNext = next - prev;
  const mature = state.level >= FIRST_HARVEST_LEVEL;

  let daysUntil = (FRUIT_REGROWTH_DAYS - (state.day % FRUIT_REGROWTH_DAYS)) % FRUIT_REGROWTH_DAYS;
  if (daysUntil === 0) daysUntil = FRUIT_REGROWTH_DAYS;
  const hasFruit = state.fruitsLeft > 0;

  const stats = [
    { label: "Mùa thu hoạch", value: state.harvests, icon: "basket" },
    { label: "Berry đã kiếm", value: state.totalBerries, icon: "berry" },
    { label: "Chuỗi dài nhất", value: state.bestStreak, icon: "flame" },
    { label: "Cấp hiện tại", value: state.level, icon: "star" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* hồ sơ cây */}
      <div className="flex items-center gap-3 rounded-2xl border-[3px] border-leaf-700 bg-gradient-to-b from-leaf-200 to-leaf-300 p-3">
        <div className="shrink-0">
          <MiniTree level={state.level} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-extrabold leading-tight text-leaf-900">{TREE.name}</h2>
          <p className="chip chip-sm mt-1 bg-tang-400 text-[11px] text-bark-900">
            <Icon name="leaf" size={13} />
            {stageName(state.level)} · Cấp {state.level}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between font-body text-[11px] font-bold text-leaf-900">
              <span>KN {state.xp - prev}/{needNext}</span>
              <span>{Math.round(pct * 100)}%</span>
            </div>
            <div className="mt-0.5 h-3 overflow-hidden rounded-full border-2 border-leaf-900/60 bg-leaf-200">
              <div className="h-full rounded-full bg-gradient-to-r from-leaf-600 to-tang-500 transition-all duration-500" style={{ width: `${pct * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* hành trình lớn mãi */}
      <div className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-3">
        <h3 className="flex items-center gap-1.5 font-display text-sm font-extrabold text-bark-900">
          <Icon name="sprout" size={16} className="text-leaf-700" />
          Cây lớn mãi, chậm mà chắc
        </h3>
        <p className="mt-1 font-body text-[12px] font-medium leading-snug text-bark-700">
          Sau mùa quả đầu tiên ở cấp {FIRST_HARVEST_LEVEL}, cây cam <b>không dừng lại</b> — nó tiếp tục vươn cao thành cổ thụ.
          Mỗi cấp sau cần nhiều KN hơn ~38%, và cứ {FRUIT_REGROWTH_DAYS} ngày cây lại ra {FRUIT_REGROWTH_COUNT} quả mới để bạn hái.
        </p>
        {mature && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-bark-900 bg-berry-300 px-2.5 py-1 font-body text-[11.5px] font-bold text-berry-700">
            <Icon name="basket" size={13} />
            {hasFruit
              ? `Đang có ${state.fruitsLeft} quả trên cây — ra hái thôi!`
              : `Lứa quả tiếp theo sau ${daysUntil} ngày nữa (Ngày ${state.day + daysUntil})`}
          </p>
        )}
        {!mature && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-bark-900 bg-tang-200 px-2.5 py-1 font-body text-[11.5px] font-bold text-tang-700">
            <Icon name="star" size={13} />
            Còn {xpForLevel(FIRST_HARVEST_LEVEL) - state.xp > 0 ? xpForLevel(FIRST_HARVEST_LEVEL) - state.xp : 0} KN nữa là cây đậu quả đầu tiên!
          </p>
        )}
      </div>

      {/* thống kê */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border-2 border-bark-700/25 bg-cream-100 p-2.5">
            <p className="flex items-center gap-1.5 font-display text-xl font-extrabold text-bark-900">
              <Icon name={s.icon} size={17} className="text-tang-600" />
              {s.value}
            </p>
            <p className="font-body text-[11px] font-semibold text-bark-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* sổ tay */}
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
          <li className="flex gap-1.5"><Icon name="basket" size={14} className="shrink-0 text-tang-600" />Cây cấp 10: chạm hái từng quả. Sau đó cây lớn tiếp, {FRUIT_REGROWTH_DAYS} ngày ra quả một lần.</li>
        </ul>
      </div>
    </div>
  );
}
