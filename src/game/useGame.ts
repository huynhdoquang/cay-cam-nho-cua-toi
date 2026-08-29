import { useEffect, useRef, useState } from "react";
import type { CustomDef, GameState, PoseId, TaskInst, TreeId, WaterOutcome } from "./types";
import {
  BONUS_STREAK, CRIT_CHANCE, CRIT_MULT, DAILY_XP_CAP, FERT_BONUS, FERT_CHARGES,
  HAIR_COLORS, MAX_LEVEL, PITY_LIMIT, PRESETS, SHOP, SHIRT_COLORS, STREAK_BONUS_RATE,
  TREES, buildDailyTasks, colorOf, levelFromXp, randInt,
} from "./data";
import type { GardenEngine } from "./engine";
import { setMuted as setAudioMuted, sfx, unlockAudio } from "./audio";

const SAVE_KEY = "cay-cam-nho-v1";

export type ToastKind = "info" | "success" | "warn" | "berry" | "level";
export interface ToastMsg { id: number; text: string; kind: ToastKind }

export interface GameApi {
  start: (fresh: boolean) => void;
  completeTask: (uid: string) => void;
  stepBack: (uid: string) => void;
  endDay: () => void;
  buy: (itemId: string) => void;
  equip: (slot: "hair" | "shirt" | "hat", id: string) => void;
  addCustom: (d: { name: string; pose: PoseId; kind: "binary" | "quant"; target: number; unit: string; step: number }) => boolean;
  removeCustom: (id: string) => void;
  onFruitPick: (x: number, y: number) => void;
  plantTree: (id: TreeId) => void;
  toggleMute: () => void;
}

function freshState(): GameState {
  return {
    started: false,
    hasSave: false,
    berries: 20,
    day: 1,
    streak: 0,
    bestStreak: 0,
    xp: 0,
    xpToday: 0,
    level: 1,
    treeType: "cam",
    unlockedTrees: ["cam"],
    harvests: 0,
    totalBerries: 0,
    fruitsLeft: 0,
    harvestPhase: "none",
    lastHarvestGain: 0,
    tasks: buildDailyTasks(1, []),
    customs: [],
    owned: [],
    hair: "hair_default",
    shirt: "shirt_default",
    hat: null,
    fertCharges: 0,
    freezes: 1,
    pity: 0,
    wilted: false,
    muted: false,
  };
}

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...freshState(), ...parsed, started: false, hasSave: true };
  } catch {
    return null;
  }
}

interface Fx {
  engineRef: React.MutableRefObject<GardenEngine | null>;
  toast: (text: string, kind?: ToastKind) => void;
}

export function useGame(fx: Fx): { state: GameState; api: GameApi } {
  const [state, setState] = useState<GameState>(() => {
    const s = freshState();
    s.hasSave = loadSave() != null;
    return s;
  });
  const ref = useRef(state);
  ref.current = state;

  // persist
  useEffect(() => {
    if (!state.started) return;
    try {
      const { started: _s, hasSave: _h, ...rest } = state;
      localStorage.setItem(SAVE_KEY, JSON.stringify(rest));
    } catch { /* private mode */ }
  }, [state]);

  const eng = () => fx.engineRef.current;

  const api: GameApi = {
    start(fresh: boolean) {
      unlockAudio();
      let next: GameState;
      let resumed = false;
      if (fresh) {
        try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ }
        next = { ...freshState(), started: true };
      } else {
        const saved = loadSave();
        resumed = saved != null;
        next = { ...(saved ?? freshState()), started: true };
      }
      setAudioMuted(next.muted);
      setState(next);
      sfx.plant();
      if (resumed) fx.toast(`Chào mừng trở lại! Ngày ${next.day} bắt đầu.`, "info");
      setTimeout(() => {
        const e = eng();
        if (e) {
          e.resetTree();
          e.setLevel(next.level);
          e.setWilted(next.wilted);
          if (next.level >= MAX_LEVEL) e.syncFruits(next.fruitsLeft, TREES[next.treeType].fruits);
        }
      }, 60);
    },

    completeTask(uid: string) {
      const s = ref.current;
      if (!s.started) return;
      const task = s.tasks.find((t) => t.uid === uid);
      if (!task || task.done) return;

      if (task.kind === "quant" && task.progress + task.step < task.target) {
        setState({
          ...s,
          tasks: s.tasks.map((t) => (t.uid === uid ? { ...t, progress: Math.min(t.target, t.progress + t.step) } : t)),
        });
        sfx.click();
        return;
      }

      const { next, out } = waterTask(s, task);
      setState(next);
      playWaterFx(out);
    },

    stepBack(uid: string) {
      const s = ref.current;
      const task = s.tasks.find((t) => t.uid === uid);
      if (!task || task.done || task.kind !== "quant") return;
      setState({
        ...s,
        tasks: s.tasks.map((t) => (t.uid === uid ? { ...t, progress: Math.max(0, t.progress - t.step) } : t)),
      });
      sfx.click();
    },

    endDay() {
      const s = ref.current;
      if (!s.started) return;
      const allDone = s.tasks.length > 0 && s.tasks.every((t) => t.done);
      const day = s.day + 1;
      let { streak, freezes, berries, totalBerries } = s;
      let bestStreak = s.bestStreak;
      let wilted = false;
      let bonus = 0;

      if (allDone) {
        streak = s.streak + 1;
        bestStreak = Math.max(bestStreak, streak);
        bonus = 5 + Math.min(streak, 25);
        berries += bonus;
        totalBerries += bonus;
      } else if (s.freezes > 0) {
        freezes -= 1;
        fx.toast("Băng bảo vệ đã tan để giữ streak của bạn!", "info");
      } else {
        streak = 0;
        wilted = true;
      }

      setState({
        ...s, day, streak, bestStreak, freezes, berries, totalBerries, wilted,
        xpToday: 0,
        tasks: buildDailyTasks(day, s.customs),
      });

      const e = eng();
      e?.nightPulse();
      e?.sleepChibi();
      setTimeout(() => e?.setWilted(wilted), 900);
      sfx.sleep();
      if (allDone) {
        fx.toast(`Ngày trọn vẹn! Streak ${streak} — thưởng +${bonus} berry`, "success");
        setTimeout(() => sfx.drop(), 500);
      } else if (wilted) {
        fx.toast("Cây hơi héo một chút... ngày mai cố lên nhé!", "warn");
      }
    },

    buy(itemId: string) {
      const s = ref.current;
      const item = SHOP.find((i) => i.id === itemId);
      if (!item) return;
      const already = s.owned.includes(itemId) ||
        (item.kind === "seed" && item.treeId && s.unlockedTrees.includes(item.treeId));
      if (already) return;
      if (s.berries < item.cost) {
        sfx.deny();
        fx.toast("Chưa đủ berry rồi! Tưới cây thêm nhé.", "warn");
        return;
      }
      let next: GameState = { ...s, berries: s.berries - item.cost };
      if (item.id === "fertilizer") next = { ...next, fertCharges: next.fertCharges + FERT_CHARGES };
      else if (item.id === "freeze") next = { ...next, freezes: next.freezes + 1 };
      else if (item.kind === "seed" && item.treeId) next = { ...next, unlockedTrees: [...next.unlockedTrees, item.treeId] };
      else next = { ...next, owned: [...next.owned, itemId] };
      setState(next);
      sfx.buy();
      fx.toast(`Đã mua ${item.name}!`, "berry");
    },

    equip(slot, id) {
      const s = ref.current;
      if (slot === "hat") {
        const none = s.hat === id;
        setState({ ...s, hat: none ? null : id });
      } else if (slot === "hair") {
        setState({ ...s, hair: id });
      } else {
        setState({ ...s, shirt: id });
      }
      sfx.equip();
    },

    addCustom(d) {
      const s = ref.current;
      const name = d.name.trim();
      if (!name) return false;
      if (s.customs.length >= 6) {
        fx.toast("Tối đa 6 nhiệm vụ tự tạo thôi nhé!", "warn");
        return false;
      }
      const def: CustomDef = {
        id: `u${Date.now()}`,
        name: name.slice(0, 42),
        pose: d.pose,
        kind: d.kind,
        target: d.kind === "quant" ? Math.max(1, Math.min(999, d.target)) : 1,
        unit: d.kind === "quant" ? (d.unit.trim() || "lần").slice(0, 12) : "",
        step: d.kind === "quant" ? Math.max(1, Math.min(99, d.step)) : 1,
        xp: d.kind === "quant" ? 16 : 12,
      };
      const instTask: TaskInst = {
        uid: `c-${s.day}-x-${def.id}`,
        defId: def.id,
        custom: true,
        name: def.name,
        pose: def.pose,
        kind: def.kind,
        target: def.target,
        unit: def.unit,
        step: def.step,
        xp: def.xp,
        progress: 0,
        done: false,
      };
      setState({ ...s, customs: [...s.customs, def], tasks: [...s.tasks, instTask] });
      sfx.check();
      fx.toast(`Đã thêm "${def.name}" vào hôm nay!`, "success");
      return true;
    },

    removeCustom(id: string) {
      const s = ref.current;
      setState({
        ...s,
        customs: s.customs.filter((c) => c.id !== id),
        tasks: s.tasks.filter((t) => !(t.custom && t.defId === id)),
      });
      sfx.click();
    },

    onFruitPick(x: number, y: number) {
      const s = ref.current;
      if (s.harvestPhase !== "picking" || s.fruitsLeft <= 0) return;
      const tree = TREES[s.treeType];
      const crit = Math.random() < 0.08;
      let gain = tree.value;
      if (crit) gain *= 3;
      const left = s.fruitsLeft - 1;
      let acc = s.lastHarvestGain + gain;

      let next: GameState = {
        ...s,
        berries: s.berries + gain,
        totalBerries: s.totalBerries + gain,
        fruitsLeft: left,
        lastHarvestGain: acc,
      };

      const e = eng();
      e?.floatText(x, y, `+${gain}${crit ? "!" : ""}`, crit ? "#ffd93d" : "#ffe0ad", crit);
      if (crit) sfx.crit(); else sfx.pop();

      if (left === 0) {
        const bonus = 20 + s.streak * 2;
        acc += bonus;
        let unlockedTrees = s.unlockedTrees;
        let unlockMsg: string | null = null;
        if (s.treeType === "cam" && !unlockedTrees.includes("cherry")) {
          unlockedTrees = [...unlockedTrees, "cherry"];
          unlockMsg = "Đã mở khóa hạt giống Anh Đào trong Cửa hàng!";
        } else if (s.treeType === "cherry" && !unlockedTrees.includes("tao")) {
          unlockedTrees = [...unlockedTrees, "tao"];
          unlockMsg = "Đã mở khóa hạt giống Táo Đỏ trong Cửa hàng!";
        }
        next = {
          ...next,
          berries: next.berries + bonus,
          totalBerries: next.totalBerries + bonus,
          fruitsLeft: 0,
          harvestPhase: "done",
          lastHarvestGain: acc,
          harvests: s.harvests + 1,
          unlockedTrees,
        };
        e?.celebrate();
        sfx.harvest();
        if (unlockMsg) setTimeout(() => fx.toast(unlockMsg!, "level"), 1200);
      }
      setState(next);
    },

    plantTree(id: TreeId) {
      const s = ref.current;
      if (!s.unlockedTrees.includes(id)) return;
      setState({
        ...s,
        treeType: id,
        level: 1,
        xp: 0,
        xpToday: 0,
        fruitsLeft: 0,
        harvestPhase: "none",
        lastHarvestGain: 0,
        wilted: false,
        pity: 0,
      });
      const e = eng();
      e?.resetTree();
      e?.setLevel(1);
      sfx.plant();
      fx.toast(`Đã gieo hạt ${TREES[id].name}! Hành trình 10 cấp bắt đầu.`, "success");
    },

    toggleMute() {
      const s = ref.current;
      const m = !s.muted;
      setAudioMuted(m);
      setState({ ...s, muted: m });
      if (!m) sfx.click();
    },
  };

  return { state, api };
}

/* ---------- task completion core ---------- */

function waterTask(s: GameState, task: TaskInst): { next: GameState; out: WaterOutcome } {
  const quant = task.kind === "quant";
  let xpGain = task.xp + randInt(-2, 2);
  const capped = s.xpToday >= DAILY_XP_CAP;
  if (capped) xpGain = Math.max(2, Math.round(xpGain * 0.2));
  const xp = s.xp + xpGain;
  const xpToday = s.xpToday + xpGain;

  const hasFert = s.fertCharges > 0;
  let rate = (quant ? 0.7 : 0.4) + (s.streak >= BONUS_STREAK ? STREAK_BONUS_RATE : 0) + (hasFert ? FERT_BONUS : 0);
  rate = Math.min(rate, 0.97);
  const pity = s.pity + 1;
  const dropped = Math.random() < rate || pity >= PITY_LIMIT;
  let amount = 0;
  let crit = false;
  if (dropped) {
    amount = quant ? randInt(3, 8) : randInt(1, 3);
    crit = Math.random() < CRIT_CHANCE;
    if (crit) amount *= CRIT_MULT;
  }

  const newLevel = Math.min(levelFromXp(xp), MAX_LEVEL);
  const leveledTo = newLevel > s.level ? newLevel : null;
  const becameRipe = newLevel >= MAX_LEVEL && s.level < MAX_LEVEL;
  const tree = TREES[s.treeType];

  const next: GameState = {
    ...s,
    xp,
    xpToday,
    berries: s.berries + amount,
    totalBerries: s.totalBerries + amount,
    pity: dropped ? 0 : pity,
    fertCharges: hasFert ? s.fertCharges - 1 : s.fertCharges,
    level: newLevel,
    fruitsLeft: becameRipe ? tree.fruits : s.fruitsLeft,
    harvestPhase: becameRipe ? "picking" : s.harvestPhase,
    tasks: s.tasks.map((t) => (t.uid === task.uid ? { ...t, progress: t.target, done: true } : t)),
  };
  return { next, out: { xp: xpGain, capped, dropped, amount, crit, leveledTo, becameRipe } };
}

function playWaterFx(out: WaterOutcome) {
  // engine is read lazily through window-level callback set by GardenCanvas? No —
  // we pass via closure in useGame; here we use a small event bridge.
  const e = bridge.engine;
  e?.water();
  sfx.water();
  setTimeout(() => sfx.check(), 250);
  setTimeout(() => e?.spawnXpFloater(out.xp, out.capped), 350);
  if (out.dropped) {
    setTimeout(() => {
      e?.spawnBerryBurst({ amount: out.amount, crit: out.crit });
      if (out.crit) sfx.crit(); else sfx.drop();
    }, 850);
  }
  if (out.leveledTo != null) {
    setTimeout(() => {
      e?.levelUpFx();
      sfx.levelup();
      bridge.toast(`Cây lên cấp ${out.leveledTo}!`, "level");
    }, 1150);
  }
  if (out.becameRipe) {
    setTimeout(() => {
      e?.ripeFx();
      sfx.ripe();
      bridge.toast("Quả đã chín! Nhấn vào từng quả trên cây để thu hoạch.", "success");
    }, 1650);
  }
}

/* small bridge so water fx can reach engine/toast without prop drilling */
export const bridge: {
  engine: GardenEngine | null;
  toast: (text: string, kind?: ToastKind) => void;
} = { engine: null, toast: () => {} };

export function skinColors(s: GameState) {
  return {
    hair: colorOf(HAIR_COLORS, s.hair, "#7a4a21"),
    shirt: colorOf(SHIRT_COLORS, s.shirt, "#58b84e"),
    hat: s.hat,
  };
}

export { PRESETS };
