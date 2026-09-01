import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { GardenEngine } from "../game/engine";
import { colorOf, DECOR_FLAGS, HAIR_COLORS, SHIRT_COLORS, TREE } from "../game/data";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  engineRef: MutableRefObject<GardenEngine | null>;
  onFruitPick: (x: number, y: number) => void;
}

export function GardenCanvas({ state, engineRef, onFruitPick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fruitCb = useRef(onFruitPick);
  fruitCb.current = onFruitPick;

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GardenEngine(canvas);
    engineRef.current = engine;
    engine.onFruitPick = (x, y) => fruitCb.current(x, y);
    engine.setTree(TREE);
    engine.start();

    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
      lastW = r.width;
      lastH = r.height;
      engine.setSize(r.width, r.height, Math.min(2, window.devicePixelRatio || 1));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [engineRef]);

  // sync engine with game state
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setLevel(state.level);
    e.setSkin({
      hair: colorOf(HAIR_COLORS, state.hair, "#7a4a21"),
      shirt: colorOf(SHIRT_COLORS, state.shirt, "#58b84e"),
      hat: state.hat,
    });
    e.setDecor({
      fence: state.owned.includes(DECOR_FLAGS[0]),
      lantern: state.owned.includes(DECOR_FLAGS[1]),
      mushrooms: state.owned.includes(DECOR_FLAGS[2]),
      flowers: state.owned.includes(DECOR_FLAGS[3]),
    });
    if (state.level >= 10 && state.fruitsLeft > 0 && e.unpickedCount() !== state.fruitsLeft) {
      e.syncFruits(state.fruitsLeft, state.harvests === 0 ? 8 : 5);
    }
    e.setFog(state.fog);
    e.setDiscovered(state.discovered.map((d) => d.id));
  });

  useEffect(() => {
    engineRef.current?.setWilted(state.wilted);
  }, [state.wilted, engineRef]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-skyy-400 via-skyy-300 to-leaf-300">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ touchAction: "manipulation" }} />

      {/* gợi ý khi cây chín */}
      {state.level >= 10 && state.harvestPhase === "picking" && state.fruitsLeft > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 sm:top-3">
          <div className="floaty chip bg-tang-400 text-bark-900 text-xs shadow-lg sm:text-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 10.5h15l-1.6 8a2.5 2.5 0 0 1-2.4 2H8.5a2.5 2.5 0 0 1-2.4-2z" /><path d="M8 10.5 12 4l4 6.5M4.5 14h15" /></svg>
            Hái {state.fruitsLeft} quả trên cây!
          </div>
        </div>
      )}

      {/* cây héo */}
      {state.wilted && (
        <div className="pointer-events-none absolute left-1/2 top-12 z-10 -translate-x-1/2 sm:top-14">
          <div className="chip bg-skyy-300 text-[#14507a] text-[11px] shadow-lg sm:text-xs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5S6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5z" /></svg>
            Cây buồn vì hôm qua… tưới cây đều nhé!
          </div>
        </div>
      )}
    </div>
  );
}
