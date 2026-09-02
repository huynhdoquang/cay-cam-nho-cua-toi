import { useEffect, useState } from "react";
import type { GameApi, ToastMsg } from "../game/useGame";
import { Icon } from "./icons";

interface Props {
  api: GameApi;
  toast: (text: string, kind?: ToastMsg["kind"]) => void;
}

/**
 * Chế độ test — dành cho việc cân bằng & kiểm tra game.
 * Bật/tắt bằng nút "Test" (góc phải vườn) hoặc phím tắt "T".
 */
export function TestPanel({ api, toast }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "t" || e.key === "T") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const act = (label: string, fn: () => void) => () => {
    fn();
  };

  const groups: { title: string; icon: string; items: { label: string; icon: string; fn: () => void }[] }[] = [
    {
      title: "Tài nguyên",
      icon: "coins",
      items: [
        { label: "+100 berry", icon: "berry", fn: () => api.test.addBerries(100) },
        { label: "+1000 berry", icon: "berry", fn: () => api.test.addBerries(1000) },
        { label: "+50 KN", icon: "star", fn: () => api.test.addXp(50) },
        { label: "Mở khóa mọi đồ", icon: "lock", fn: () => api.test.unlockAll() },
      ],
    },
    {
      title: "Cấp & ngày",
      icon: "star",
      items: [
        { label: "Cấp 5", icon: "sprout", fn: () => api.test.setLevel(5) },
        { label: "Cấp 9", icon: "leaf", fn: () => api.test.setLevel(9) },
        { label: "Cấp 10 (ra quả)", icon: "citrus", fn: () => api.test.setLevel(10) },
        { label: "Cấp 13 (cổ thụ)", icon: "spark", fn: () => api.test.setLevel(13) },
        { label: "Xong hết nhiệm vụ", icon: "check", fn: () => api.test.completeAll() },
        { label: "Sang ngày mới", icon: "moon", fn: () => api.test.nextDay() },
      ],
    },
    {
      title: "Quả & mùa",
      icon: "citrus",
      items: [
        { label: "Spawn quả chín", icon: "citrus", fn: () => api.test.spawnFruits() },
        { label: "Thu hoạch ngay", icon: "basket", fn: () => api.test.forceHarvest() },
      ],
    },
    {
      title: "Khác",
      icon: "mist",
      items: [
        { label: "Tan hết sương mù", icon: "mist", fn: () => api.test.clearFog() },
        { label: "Reset game", icon: "close", fn: () => api.test.reset() },
      ],
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`hud-btn fixed z-40 transition-all ${open ? "bg-tang-400 text-bark-900" : "bg-night-700/90 text-cream-200 border-bark-600"}`}
        style={{ right: 12, top: "calc(env(safe-area-inset-top, 0px) + 118px)" }}
        title="Chế độ test (phím T)"
        aria-label="Chế độ test"
      >
        <Icon name="flame" size={16} />
      </button>

      {open && (
        <div
          className="pop-in fixed z-40 w-[248px] overflow-hidden rounded-xl border-[3px] border-bark-600 bg-night-900/95 shadow-[0_8px_0_rgba(0,0,0,0.4)] backdrop-blur-sm"
          style={{ right: 12, top: "calc(env(safe-area-inset-top, 0px) + 162px)", maxHeight: "min(60dvh, 480px)" }}
        >
          <div className="flex items-center gap-2 border-b-2 border-bark-600/60 bg-night-800 px-3 py-2">
            <Icon name="flame" size={15} className="text-tang-400" />
            <span className="font-display text-sm font-extrabold text-cream-100">Chế độ test</span>
            <span className="ml-auto rounded bg-tang-500/20 px-1.5 font-body text-[10px] font-bold text-tang-300">phím T</span>
          </div>
          <div className="max-h-[52dvh] overflow-y-auto scroll-cute p-2">
            {groups.map((g) => (
              <div key={g.title} className="mb-2 last:mb-0">
                <p className="flex items-center gap-1 px-1 pb-1 font-display text-[11px] font-extrabold uppercase tracking-wide text-cream-300/70">
                  <Icon name={g.icon} size={12} />
                  {g.title}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((it) => (
                    <button
                      key={it.label}
                      onClick={act(it.label, it.fn)}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-bark-600/60 bg-night-700 px-2 py-1.5 text-left font-body text-[11px] font-semibold text-cream-200 transition-all hover:border-tang-500 hover:bg-night-800 active:scale-95"
                    >
                      <Icon name={it.icon} size={13} className="shrink-0 text-tang-400" />
                      <span className="truncate">{it.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
