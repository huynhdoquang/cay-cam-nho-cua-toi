import type { GameState, ShopItem } from "../game/types";
import { FERT_CHARGES, SHOP } from "../game/data";
import type { GameApi } from "../game/useGame";
import { Icon } from "./icons";

interface Props {
  state: GameState;
  api: GameApi;
}

const KIND_META: Record<ShopItem["kind"], { title: string; icon: string; bg: string; fg: string }> = {
  consumable: { title: "Vật phẩm", icon: "spark", bg: "bg-lime-200", fg: "text-lime-900" },
  decor: { title: "Trang trí vườn", icon: "flower", bg: "bg-tang-200", fg: "text-tang-700" },
  skin: { title: "Diện mạo bé Cam", icon: "hat", bg: "bg-berry-300", fg: "text-berry-700" },
};

export function ShopPanel({ state, api }: Props) {
  const groups: ShopItem["kind"][] = ["consumable", "decor", "skin"];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-extrabold text-bark-900 flex items-center gap-2 sticky top-0 bg-cream-200 py-0.5 z-10">
        <Icon name="basket" size={19} className="text-tang-600" />
        Cửa hàng
        <span className="ml-auto chip bg-berry-300 text-berry-700 text-xs">
          <Icon name="berry" size={13} />
          {state.berries}
        </span>
      </h2>

      {groups.map((kind) => (
        <section key={kind}>
          <h3 className="mb-1.5 flex items-center gap-1.5 font-display text-[13px] font-extrabold uppercase tracking-wide text-bark-600">
            <Icon name={KIND_META[kind].icon} size={14} />
            {KIND_META[kind].title}
          </h3>
          <div className="flex flex-col gap-1.5">
            {SHOP.filter((i) => i.kind === kind).map((item) => (
              <ShopRow key={item.id} item={item} state={state} api={api} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ShopRow({ item, state, api }: { item: ShopItem; state: GameState; api: GameApi }) {
  const owned = state.owned.includes(item.id);
  const affordable = state.berries >= item.cost;

  const isActive =
    (item.slot === "hair" && state.hair === item.id) ||
    (item.slot === "shirt" && state.shirt === item.id) ||
    (item.slot === "hat" && state.hat === item.id);

  const countChip =
    item.id === "fertilizer" && state.fertCharges > 0 ? `đang có ×${state.fertCharges}` :
    item.id === "freeze" && state.freezes > 0 ? `đang có ×${state.freezes}` : null;

  let right: React.ReactNode;
  if (item.kind === "skin") {
    right = owned ? (
      isActive ? (
        <span className="chip chip-sm bg-tang-300 text-bark-800 text-[11px]"><Icon name="star" size={12} />Đang dùng</span>
      ) : (
        <button onClick={() => api.equip(item.slot!, item.id)} className="btn btn-leaf px-3 py-2 text-[13px]">Dùng</button>
      )
    ) : (
      <PriceBtn cost={item.cost} affordable={affordable} onBuy={() => api.buy(item.id)} />
    );
  } else if (item.kind === "decor") {
    right = owned ? (
      <span className="chip chip-sm bg-leaf-300 text-leaf-900 text-[11px]"><Icon name="check" size={12} />Trong vườn</span>
    ) : (
      <PriceBtn cost={item.cost} affordable={affordable} onBuy={() => api.buy(item.id)} />
    );
  } else {
    right = <PriceBtn cost={item.cost} affordable={affordable} onBuy={() => api.buy(item.id)} />;
  }

  const meta = KIND_META[item.kind];

  return (
    <div className="flex items-center gap-2.5 rounded-xl border-2 border-bark-700/25 bg-cream-100 p-2 transition-all hover:-translate-y-0.5 hover:border-tang-500 hover:shadow-[0_4px_0_rgba(122,74,33,0.25)]">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border-2 border-bark-800/40 ${meta.bg} ${meta.fg}`}>
        <Icon name={item.icon} size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-display text-sm font-bold leading-tight text-bark-900">
          {item.name}
          {item.color && <span className="h-3.5 w-3.5 rounded-full border-2 border-bark-800/50" style={{ background: item.color }} />}
        </p>
        <p className="font-body text-[11px] font-medium leading-snug text-bark-600">{item.desc}</p>
        {countChip && (
          <span className="mt-0.5 inline-block rounded-full bg-skyy-300 px-1.5 py-px font-body text-[10px] font-bold text-[#14507a]">{countChip}</span>
        )}
        {item.id === "fertilizer" && (
          <span className="mt-0.5 ml-1 inline-block rounded-full bg-cream-300 px-1.5 py-px font-body text-[10px] font-bold text-bark-600">
            +{FERT_CHARGES} lần tưới
          </span>
        )}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function PriceBtn({ cost, affordable, onBuy }: { cost: number; affordable: boolean; onBuy: () => void }) {
  return (
    <button onClick={onBuy} disabled={!affordable} className={`btn px-3 py-2 text-[13px] ${affordable ? "btn-berry" : "btn-wood"}`}>
      <Icon name="berry" size={13} />
      {cost}
    </button>
  );
}
