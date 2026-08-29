import { useEffect, useRef } from "react";
import type { GameState } from "../game/types";
import { DECOR_FLAGS, TREES } from "../game/data";
import { GardenEngine } from "../game/engine";
import { bridge, skinColors } from "../game/useGame";
import { Icon } from "./icons";

interface Props {
  state: GameState;
  engineRef: React.MutableRefObject<GardenEngine | null>;
  onEndDay: () => void;
  onFruitPick: (x: number, y: number) => void;
}

export function GardenCanvas({ state, engineRef, onEndDay, onFruitPick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pickRef = useRef(onFruitPick);
  pickRef.current = onFruitPick;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const engine = new GardenEngine(canvas);
    engine.onFruitPick = (x, y) => pickRef.current(x, y);
    engineRef.current = engine;
    bridge.engine = engine;
    engine.start();

    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      engine.setSize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 2));
    });
    ro.observe(wrap);
    const r0 = wrap.getBoundingClientRect();
    engine.setSize(r0.width, r0.height, Math.min(window.devicePixelRatio || 1, 2));

    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
      bridge.engine = null;
    };
  }, [engineRef]);

  // sync visual state
  const tree = TREES[state.treeType];
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setTree(state.treeType, tree);
    e.setLevel(state.level);
    e.setWilted(state.wilted);
    e.setSkin(skinColors(state));
    e.setDecor({
      fence: state.owned.includes(DECOR_FLAGS[0]),
      lantern: state.owned.includes(DECOR_FLAGS[1]),
      mushrooms: state.owned.includes(DECOR_FLAGS[2]),
      flowers: state.owned.includes(DECOR_FLAGS[3]),
    });
    if (state.level >= 10 && e.unpickedCount() !== state.fruitsLeft) e.syncFruits(state.fruitsLeft, tree.fruits);
  }, [state.treeType, state.level, state.wilted, state.hair, state.shirt, state.hat, state.owned, state.fruitsLeft, engineRef, tree]);

  const allDone = state.tasks.length > 0 && state.tasks.every((t) => t.done);
  const picking = state.harvestPhase === "picking";

  return (
    <div className="panel-dark relative flex-1 min-h-0 p-2 sm:p-2.5">
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden rounded-[10px]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />

        {/* harvest hint */}
        {picking && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 pop-in">
            <div className="chip bg-tang-400 text-bark-900 text-sm sm:text-base shadow-lg">
              <Icon name="basket" size={17} />
              Nhấn vào từng quả trên cây để hái!
              <span className="font-body font-bold">({state.fruitsLeft})</span>
            </div>
          </div>
        )}

        {/* level tag on garden */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          <div className="chip bg-leaf-300 text-leaf-900 text-xs sm:text-sm">
            <Icon name="sprout" size={15} />
            {tree.name} · Cấp {state.level}/10
          </div>
          {state.fertCharges > 0 && (
            <div className="chip bg-lime-200 text-lime-900 text-xs">
              <Icon name="fertilizer" size={14} />
              Phân bón ×{state.fertCharges}
            </div>
          )}
          {state.wilted && (
            <div className="chip bg-cream-300 text-bark-700 text-xs">
              <Icon name="leaf" size={14} />
              Cây đang hơi héo…
            </div>
          )}
        </div>

        {/* sleep button */}
        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2">
          {allDone && !picking && (
            <div className="chip bg-cream-100 text-leaf-800 text-xs pop-in">
              <Icon name="check" size={14} />
              Xong hết rồi, ngủ thôi!
            </div>
          )}
          <button
            onClick={onEndDay}
            disabled={picking}
            className={`btn btn-wood px-4 py-2 text-sm sm:text-base ${allDone && !picking ? "glow-pulse" : ""}`}
            title="Kết thúc ngày, nhận nhiệm vụ mới"
          >
            <Icon name="moon" size={17} />
            Đi ngủ · sang Ngày {state.day + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
