import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { GardenEngine } from "./game/engine";
import { bridge, useGame } from "./game/useGame";
import type { ToastMsg } from "./game/useGame";
import { GardenCanvas } from "./components/GardenCanvas";
import { TaskBubbles } from "./components/TaskBubbles";
import { HUD } from "./components/HUD";
import { TaskPanel } from "./components/TaskPanel";
import { ShopPanel } from "./components/ShopPanel";
import { TreePanel } from "./components/TreePanel";
import { TestPanel } from "./components/TestPanel";
import { HarvestModal, HelpModal, StartScreen, StoryModal, Toasts } from "./components/Modals";
import { Icon } from "./components/icons";

type Tab = "tasks" | "shop" | "tree";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "tasks", label: "Việc của bạn", icon: "clipboard" },
  { id: "shop", label: "Cửa hàng", icon: "basket" },
  { id: "tree", label: "Cây cam", icon: "sprout" },
];

/** chiều cao tab bar + lề — panel/popup neo phía trên nó */
const TABBAR_OFFSET = 72;

export default function App() {
  const engineRef = useRef<GardenEngine | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const toastId = useRef(0);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [help, setHelp] = useState(false);
  const [tab, setTab] = useState<Tab | null>(null);
  const [panelReset, setPanelReset] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [hudH, setHudH] = useState(0);

  const toast = useCallback((text: string, kind: ToastMsg["kind"] = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  useEffect(() => {
    bridge.toast = toast;
  }, [toast]);

  const { state, api } = useGame({ engineRef, toast });

  useEffect(() => {
    const el = hudRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHudH(el.offsetHeight));
    ro.observe(el);
    setHudH(el.offsetHeight);
    return () => ro.disconnect();
  }, [state.started]);

  const [saveDay, setSaveDay] = useState(1);
  useEffect(() => {
    if (!state.started) {
      try {
        const raw = localStorage.getItem("cay-cam-nho-v1");
        if (raw) setSaveDay((JSON.parse(raw) as { day?: number }).day ?? 1);
      } catch { /* noop */ }
    }
  }, [state.started]);

  // thông báo một lần sau khi load (vd: rụng quả vì vắng nhà)
  const notifiedRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.started && state.notice && notifiedRef.current !== state.notice) {
      notifiedRef.current = state.notice;
      toast(state.notice, "warn");
      api.clearNotice();
    }
  }, [state.started, state.notice, toast, api]);

  const done = state.tasks.filter((t) => t.done).length;
  const total = state.tasks.length;
  const allDone = total > 0 && done === total;
  const showFab = state.started && allDone && state.harvestPhase === "none" && !popupOpen && tab === null;

  const handleTab = (t: Tab) => {
    setTab((cur) => {
      const next = cur === t ? null : t;
      if (next) setPanelReset((n) => n + 1);
      return next;
    });
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {state.started && (
        <div ref={hudRef}>
          <HUD state={state} done={done} total={total} onToggleMute={api.toggleMute} onHelp={() => setHelp(true)} />
        </div>
      )}

      {/* vườn chiếm trọn phần còn lại */}
      <main className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1 select-none overflow-hidden">
          <GardenCanvas state={state} engineRef={engineRef} onFruitPick={api.onFruitPick} />
          <TaskBubbles
            state={state}
            api={api}
            engineRef={engineRef}
            onPopupChange={setPopupOpen}
            resetSignal={panelReset}
            bottomOffset={TABBAR_OFFSET}
          />
        </div>
      </main>

      {/* menu tab dưới đáy */}
      {state.started && <TabBar tab={tab} onTab={handleTab} allDone={allDone} />}

      {/* panel menu full-screen khi chọn tab */}
      {state.started && tab && (
        <MenuPanel top={hudH} onBackdrop={() => setTab(null)}>
          {tab === "tasks" && <TaskPanel state={state} api={api} />}
          {tab === "shop" && <ShopPanel state={state} api={api} />}
          {tab === "tree" && <TreePanel state={state} />}
        </MenuPanel>
      )}

      {/* nút kết thúc ngày */}
      {showFab && (
        <button
          className="btn btn-tang fab glow-pulse min-h-12 px-5 text-[15px]"
          style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${TABBAR_OFFSET + 12}px)` }}
          onClick={api.endDay}
        >
          <Icon name="moon" size={19} />
          Đi ngủ thôi
        </button>
      )}

      {/* chế độ test (phím T) */}
      {state.started && <TestPanel api={api} toast={toast} />}

      {!state.started && <StartScreen hasSave={state.hasSave} day={saveDay} onStart={api.start} />}
      {state.started && state.harvestPhase === "done" && <HarvestModal state={state} api={api} />}
      {state.started && state.harvestPhase !== "done" && state.pendingStories.length > 0 && (
        <StoryModal state={state} api={api} />
      )}
      {help && <HelpModal onClose={() => setHelp(false)} />}
      <Toasts list={toasts} />
    </div>
  );
}

/* ---------- thanh tab cố định dưới đáy ---------- */

function TabBar({ tab, onTab, allDone }: { tab: Tab | null; onTab: (t: Tab) => void; allDone: boolean }) {
  return (
    <nav
      className="fixed inset-x-0 z-40"
      style={{ bottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Menu chính"
    >
      <div className="mx-2 mb-2 grid grid-cols-3 overflow-hidden rounded-2xl border-[3px] border-bark-950 bg-bark-800 shadow-[0_-3px_18px_rgba(0,0,0,0.4)]">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              aria-pressed={active}
              className={`relative flex h-[54px] flex-col items-center justify-center gap-0.5 transition-all duration-150 ${
                active ? "bg-tang-500 text-bark-950" : "text-cream-300 hover:bg-bark-700 active:bg-bark-700"
              }`}
            >
              <span className={`transition-transform duration-150 ${active ? "-translate-y-0.5 scale-110" : ""}`}>
                <Icon name={t.icon} size={20} />
              </span>
              <span className="font-display text-[11px] font-extrabold leading-none">{t.label}</span>
              {active && <span className="absolute inset-x-8 bottom-1 h-1 rounded-full bg-bark-950/50" />}
              {t.id === "tasks" && allDone && (
                <span className="absolute right-[22%] top-2 h-2.5 w-2.5 rounded-full border-2 border-bark-950 bg-leaf-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- panel menu full-screen ---------- */

function MenuPanel({ children, onBackdrop, top }: { children: ReactNode; onBackdrop: () => void; top: number }) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-bark-950/45" onClick={onBackdrop} aria-hidden />
      <section
        className="menu-rise fixed inset-x-0 z-40 overflow-hidden lg:inset-x-auto lg:left-1/2 lg:w-[460px] lg:-translate-x-1/2 lg:rounded-2xl lg:border-[3px] lg:border-bark-700"
        style={{
          top: `${top}px`,
          bottom: `calc(env(safe-area-inset-bottom, 0px) + ${TABBAR_OFFSET}px)`,
          background:
            "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1.5px), linear-gradient(180deg, #1d4a30, #173826)",
          backgroundSize: "22px 22px, auto",
        }}
        role="dialog"
        aria-modal="false"
      >
        <div className="h-full overflow-y-auto scroll-cute">
          <div className="mx-auto max-w-[460px]">
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-cream-200/40 lg:hidden" />
            <div className="panel m-2 rounded-xl p-3 lg:m-3">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}
