import { useCallback, useEffect, useRef, useState } from "react";
import type { GardenEngine } from "./game/engine";
import { bridge, useGame } from "./game/useGame";
import type { ToastKind, ToastMsg } from "./game/useGame";
import { GardenCanvas } from "./components/GardenCanvas";
import { HUD } from "./components/HUD";
import { TaskPanel } from "./components/TaskPanel";
import { ShopPanel } from "./components/ShopPanel";
import { CollectionPanel } from "./components/CollectionPanel";
import { HarvestModal, HelpModal, StartScreen, Toasts } from "./components/Modals";
import { Icon } from "./components/icons";

type Tab = "tasks" | "shop" | "col";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "tasks", label: "Nhiệm vụ", icon: "clipboard" },
  { id: "shop", label: "Cửa hàng", icon: "basket" },
  { id: "col", label: "Sưu tập", icon: "book" },
];

export default function App() {
  const engineRef = useRef<GardenEngine | null>(null);
  const toastId = useRef(0);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [help, setHelp] = useState(false);
  const [tab, setTab] = useState<Tab>("tasks");

  const toast = useCallback((text: string, kind: ToastKind = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  useEffect(() => {
    bridge.toast = toast;
  }, [toast]);

  const { state, api } = useGame({ engineRef, toast });

  const savedDay = state.day;
  const [saveDay, setSaveDay] = useState(savedDay);
  useEffect(() => {
    if (!state.started) {
      try {
        const raw = localStorage.getItem("cay-cam-nho-v1");
        if (raw) setSaveDay((JSON.parse(raw) as { day?: number }).day ?? 1);
      } catch { /* noop */ }
    }
  }, [state.started]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {state.started && <HUD state={state} onToggleMute={api.toggleMute} onHelp={() => setHelp(true)} />}

      <main className="flex min-h-0 flex-1 flex-col gap-2.5 p-2.5 lg:flex-row">
        {/* garden */}
        <div className="flex h-[44vh] min-h-[300px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1 lg:shrink">
          <GardenCanvas
            state={state}
            engineRef={engineRef}
            onEndDay={api.endDay}
            onFruitPick={api.onFruitPick}
          />
        </div>

        {/* side panel */}
        <aside className="flex min-h-0 flex-1 flex-col gap-2 lg:w-[402px] lg:flex-none">
          <div className="grid shrink-0 grid-cols-3 gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`btn px-2 py-2 text-[13px] sm:text-sm ${tab === t.id ? "btn-tang" : "btn-cream text-bark-700"}`}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
                {t.id === "tasks" && (
                  <span className={`rounded-full px-1.5 font-body text-[10px] font-bold ${tab === t.id ? "bg-bark-900/25 text-cream-100" : "bg-tang-300 text-bark-800"}`}>
                    {state.tasks.filter((x) => x.done).length}/{state.tasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="panel flex min-h-0 flex-1 flex-col p-3">
            {tab === "tasks" && <TaskPanel state={state} api={api} />}
            {tab === "shop" && <ShopPanel state={state} api={api} />}
            {tab === "col" && <CollectionPanel state={state} api={api} />}
          </div>
        </aside>
      </main>

      {!state.started && <StartScreen hasSave={state.hasSave} day={saveDay} onStart={api.start} />}
      {state.started && state.harvestPhase === "done" && <HarvestModal state={state} api={api} />}
      {help && <HelpModal onClose={() => setHelp(false)} />}
      <Toasts list={toasts} />
    </div>
  );
}
