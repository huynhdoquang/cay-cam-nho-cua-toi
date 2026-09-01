import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { GameState, PoseId, TaskKind } from "./types";
import {
  ABSENCE_DROP_DAYS, BONUS_STREAK, CRIT_CHANCE, CRIT_MULT, DAILY_XP_CAP, DECOR_FLAGS, FERT_BONUS,
  FIRST_HARVEST_FRUITS, FIRST_HARVEST_LEVEL, FOG_FIRST_HARVEST, FOG_REGROWTH_HARVEST, FOG_START,
  FRUIT_REGROWTH_COUNT, FRUIT_REGROWTH_DAYS, HAIR_COLORS, LANDMARKS, PITY_LIMIT, randInt, SHOP,
  SHIRT_COLORS, STREAK_BONUS_RATE, TREE, buildDailyTasks, colorOf, levelFromXp,
} from "./data";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
import type { GardenEngine } from "./engine";
import { setMuted as setAudioMuted, sfx, unlockAudio } from "./audio";

export type ToastKind = "info" | "success" | "warn" | "berry" | "level";
export interface ToastMsg { id: number; text: string; kind: ToastKind }

export const bridge: { toast: ((text: string, kind?: ToastKind) => void) | null } = { toast: null };

export interface GameApi {
  start: (fresh: boolean) => void;
  completeTask: (uid: string) => void;
  stepBack: (uid: string) => void;
  endDay: () => void;
  buy: (itemId: string) => void;
  equip: (slot: "hair" | "shirt" | "hat", id: string) => void;
  addCustom: (d: { name: string; pose: PoseId; kind: TaskKind; target: number; unit: string; step: number }) => boolean;
  removeCustom: (id: string) => void;
  onFruitPick: (x: number, y: number) => void;
  closeHarvest: () => void;
  dismissStory: () => void;
  clearNotice: () => void;
  toggleMute: () => void;
}

const KEY = "cay-cam-nho-v1";

function freshState(): GameState {
  return {
    started: false,
    hasSave: false,
    notice: null,
    fog: FOG_START,
    discovered: [],
    pendingStories: [],
    lastDate: todayStr(),
    berries: 0,
    day: 1,
    streak: 0,
    bestStreak: 0,
    xp: 0,
    xpToday: 0,
    level: 1,
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
    freezes: 0,
    pity: 0,
    wilted: false,
    muted: false,
  };
}

export function skinColors(s: GameState): { hair: string; shirt: string; hat: string | null } {
  return {
    hair: colorOf(HAIR_COLORS, s.hair, "#7a4a21"),
    shirt: colorOf(SHIRT_COLORS, s.shirt, "#58b84e"),
    hat: s.hat,
  };
}

export function useGame({
  engineRef,
  toast,
}: {
  engineRef: MutableRefObject<GardenEngine | null>;
  toast: (text: string, kind?: ToastKind) => void;
}): { state: GameState; api: GameApi } {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as GameState;
        const merged = { ...freshState(), ...s, started: false, hasSave: true };
        // loss aversion nhẹ: vắng >= N ngày → cây buồn, rụng 1 quả (nếu có), mất streak
        const gap = Math.floor(
          (Date.parse(todayStr()) - Date.parse(merged.lastDate || todayStr())) / 86400000
        );
        if (!Number.isNaN(gap) && gap >= ABSENCE_DROP_DAYS) {
          if (merged.fruitsLeft > 0) {
            merged.fruitsLeft -= 1;
            merged.notice = `Cây nhớ bạn… vắng ${gap} ngày, một quả cam đã rụng. Về kịp lúc rồi!`;
          } else if (merged.streak > 0) {
            merged.notice = `Bạn vắng ${gap} ngày — chuỗi ${merged.streak} ngày đành dừng lại. Cây vẫn ở đây đợi bạn!`;
          }
          merged.streak = 0;
          merged.wilted = true;
        }
        merged.lastDate = todayStr();
        return merged;
      }
    } catch { /* noop */ }
    return freshState();
  });
  const ref = useRef(state);
  ref.current = state;

  // persist (kèm ngày chơi thật để tính vắng nhà)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, started: true, lastDate: todayStr() }));
    } catch { /* noop */ }
  }, [state]);

  useEffect(() => {
    setAudioMuted(state.muted);
  }, [state.muted]);

  useEffect(() => {
    bindEngine(engineRef);
  }, [engineRef]);

  const eng = useCallback(() => engineRef.current, [engineRef]);

  const fx = { toast };

  const api: GameApi = {
    start(fresh: boolean) {
      unlockAudio();
      if (fresh) {
        try { localStorage.removeItem(KEY); } catch { /* noop */ }
        const s = freshState();
        s.started = true;
        setState(s);
        const e = eng();
        if (e) {
          e.setLevel(1);
          e.setTree(TREE);
        }
        sfx.plant();
        fx.toast("Hạt cam đã được gieo. Chúc bạn một mùa bội thu!", "success");
        return;
      }
      setState((prev) => ({ ...prev, started: true }));
      sfx.click();
    },

    completeTask(uid: string) {
      const s = ref.current;
      const t = s.tasks.find((x) => x.uid === uid);
      if (!t || t.done) return;
      const progress = t.kind === "binary" ? t.target : Math.min(t.target, t.progress + t.step);
      const doneNow = progress >= t.target;
      const tasks = s.tasks.map((x) => (x.uid === uid ? { ...x, progress, done: doneNow } : x));
      const next: GameState = { ...s, tasks };
      if (doneNow) {
        water(next, t.xp, t.kind);
      } else {
        sfx.click();
      }
      setState(next);
    },

    stepBack(uid: string) {
      const s = ref.current;
      const t = s.tasks.find((x) => x.uid === uid);
      if (!t || t.done || t.progress <= 0) return;
      setState({
        ...s,
        tasks: s.tasks.map((x) => (x.uid === uid ? { ...x, progress: Math.max(0, x.progress - x.step) } : x)),
      });
      sfx.click();
    },

    endDay() {
      const s = ref.current;
      const doneAll = s.tasks.length > 0 && s.tasks.every((t) => t.done);
      let streak = s.streak;
      let freezes = s.freezes;
      let wilted = false;
      if (doneAll) {
        streak += 1;
      } else if (freezes > 0) {
        freezes -= 1;
        fx.toast("Băng bảo vệ đã giữ streak cho bạn!", "warn");
      } else {
        if (streak > 0) fx.toast("Mất streak hôm nay rồi — mai tưới tiếp nhé!", "warn");
        streak = 0;
        wilted = true;
      }
      const day = s.day + 1;
      // cây vẫn lớn tiếp: quả mọc lại định kỳ sau lần thu hoạch đầu
      let fruitsLeft = s.fruitsLeft;
      let harvestPhase = s.harvestPhase;
      if (
        s.level >= FIRST_HARVEST_LEVEL &&
        harvestPhase === "none" &&
        fruitsLeft === 0 &&
        day % FRUIT_REGROWTH_DAYS === 0
      ) {
        fruitsLeft = FRUIT_REGROWTH_COUNT;
        harvestPhase = "picking";
        fx.toast(`Cây cam ra ${FRUIT_REGROWTH_COUNT} quả mới — ra hái thôi!`, "berry");
        setTimeout(() => eng()?.ripeFx(), 300);
        setTimeout(() => sfx.ripe(), 300);
      }
      const bonus = doneAll ? 5 + Math.min(20, streak) : 0;
      const next: GameState = {
        ...s,
        day,
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
        freezes,
        wilted,
        xpToday: 0,
        tasks: buildDailyTasks(day, s.customs),
        fruitsLeft,
        harvestPhase,
        berries: s.berries + bonus,
        totalBerries: s.totalBerries + bonus,
      };
      if (bonus > 0) fx.toast(`Thưởng trọn ngày +${bonus} berry!`, "berry");
      const e = eng();
      e?.setWilted(wilted);
      if (harvestPhase === "picking" && fruitsLeft > 0) e?.syncFruits(fruitsLeft, FRUIT_REGROWTH_COUNT);
      sfx.sleep();
      setState(next);
    },

    buy(itemId: string) {
      const s = ref.current;
      const item = SHOP.find((i) => i.id === itemId);
      if (!item || s.berries < item.cost || s.owned.includes(itemId)) {
        sfx.deny();
        return;
      }
      const next: GameState = { ...s, berries: s.berries - item.cost, owned: [...s.owned, itemId] };
      if (itemId === "fertilizer") next.fertCharges += 3;
      if (itemId === "freeze") next.freezes += 1;
      if (item.kind === "decor") {
        const e = eng();
        e?.setDecor({
          fence: next.owned.includes(DECOR_FLAGS[0]),
          lantern: next.owned.includes(DECOR_FLAGS[1]),
          mushrooms: next.owned.includes(DECOR_FLAGS[2]),
          flowers: next.owned.includes(DECOR_FLAGS[3]),
        });
      }
      sfx.buy();
      fx.toast(`Đã mua ${item.name}!`, "success");
      setState(next);
    },

    equip(slot, id: string) {
      const s = ref.current;
      const next = { ...s };
      if (slot === "hair") next.hair = id;
      if (slot === "shirt") next.shirt = id;
      if (slot === "hat") next.hat = id === "hat_none" ? null : id;
      const e = eng();
      e?.setSkin({
        hair: colorOf(HAIR_COLORS, next.hair, "#7a4a21"),
        shirt: colorOf(SHIRT_COLORS, next.shirt, "#58b84e"),
        hat: next.hat,
      });
      sfx.equip();
      setState(next);
    },

    addCustom(d) {
      const s = ref.current;
      const name = d.name.trim();
      if (!name) {
        fx.toast("Đặt tên nhiệm vụ trước đã nhé!", "warn");
        return false;
      }
      const id = `custom-${Date.now()}`;
      const customs = [...s.customs, { id, ...d, name, xp: d.kind === "binary" ? 12 : 16 }];
      setState({
        ...s,
        customs,
        tasks: [...s.tasks, {
          uid: `c-${s.day}-${id}`,
          defId: null,
          custom: true,
          name,
          pose: d.pose,
          kind: d.kind,
          target: d.kind === "binary" ? 1 : d.target,
          unit: d.kind === "binary" ? "" : d.unit,
          step: d.kind === "binary" ? 1 : d.step,
          xp: d.kind === "binary" ? 12 : 16,
          progress: 0,
          done: false,
        }],
      });
      sfx.check();
      fx.toast(`Đã thêm “${name}” — một bong bóng mới xuất hiện!`, "success");
      return true;
    },

    removeCustom(id: string) {
      const s = ref.current;
      setState({
        ...s,
        customs: s.customs.filter((c) => c.id !== id),
        tasks: s.tasks.filter((t) => !(t.custom && t.uid.includes(id))),
      });
      sfx.click();
    },

    onFruitPick(x: number, y: number) {
      const s = ref.current;
      if (s.fruitsLeft <= 0) return;
      const isFirst = s.harvests === 0;
      const per = isFirst ? TREE.value : TREE.regrowthValue;
      const fruitsLeft = s.fruitsLeft - 1;
      const gain = per;
      let harvestPhase = s.harvestPhase;
      let harvests = s.harvests;
      let lastHarvestGain = s.lastHarvestGain;
      const e = eng();
      e?.floatText(x, y, `+${gain}`, "#c0b5f2", false);
      sfx.pop();
      if (fruitsLeft === 0) {
        harvestPhase = "done";
        harvests += 1;
        const bonus = 25 + harvests * 5;
        lastHarvestGain = per + bonus;
        const total = gain + bonus;
        sfx.harvest();
        e?.celebrate();

        // narrative layer: mỗi mùa thu hoạch làm sương mù tan bớt
        const fog = Math.max(0, s.fog - (isFirst ? FOG_FIRST_HARVEST : FOG_REGROWTH_HARVEST));
        const crossed = LANDMARKS.filter((l) => fog <= l.at && !s.discovered.some((d) => d.id === l.id));
        const discovered = [...s.discovered, ...crossed.map((l) => ({ id: l.id, day: s.day }))];
        const pendingStories = crossed.length
          ? [...s.pendingStories, ...crossed.map((l) => l.id)]
          : s.pendingStories;
        if (crossed.length) {
          setTimeout(() => {
            engGlobal()?.revealFx();
            sfx.levelup();
          }, 900);
        }

        setState({
          ...s,
          fruitsLeft,
          harvestPhase,
          harvests,
          lastHarvestGain: total,
          berries: s.berries + total,
          totalBerries: s.totalBerries + total,
          fog,
          discovered,
          pendingStories,
        });
        return;
      }
      setState({
        ...s,
        fruitsLeft,
        berries: s.berries + gain,
        totalBerries: s.totalBerries + gain,
      });
    },

    closeHarvest() {
      const s = ref.current;
      setState({ ...s, harvestPhase: "none" });
      sfx.click();
    },

    dismissStory() {
      const s = ref.current;
      setState({ ...s, pendingStories: s.pendingStories.slice(1) });
      sfx.click();
    },

    clearNotice() {
      const s = ref.current;
      if (s.notice) setState({ ...s, notice: null });
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

/* ---------- tưới cây: +KN, rơi berry, lên cấp ---------- */

function water(s: GameState, baseXp: number, kind: TaskKind) {
  const capped = s.xpToday >= DAILY_XP_CAP;
  const gained = capped ? Math.max(2, Math.round(baseXp * 0.2)) : baseXp;
  s.xp += gained;
  s.xpToday += baseXp;
  const prevLevel = s.level;
  const newLevel = levelFromXp(s.xp);
  const leveled = newLevel > prevLevel;
  s.level = newLevel;

  const e = engGlobal();
  e?.water();
  e?.spawnXpFloater(gained, capped);
  sfx.water();
  if (leveled) {
    setTimeout(() => {
      engGlobal()?.levelUpFx();
      sfx.levelup();
    }, 350);
  }

  // lần đầu VƯỢT cấp 10 → đậu quả (các cấp sau không tự ra quả, chờ chu kỳ 7 ngày)
  if (leveled && prevLevel < FIRST_HARVEST_LEVEL && newLevel >= FIRST_HARVEST_LEVEL && s.fruitsLeft === 0 && s.harvestPhase === "none") {
    s.fruitsLeft = FIRST_HARVEST_FRUITS;
    s.harvestPhase = "picking";
    setTimeout(() => {
      engGlobal()?.ripeFx();
      engGlobal()?.syncFruits(FIRST_HARVEST_FRUITS, FIRST_HARVEST_FRUITS);
      sfx.ripe();
    }, 700);
    bridge.toast?.(`Cây cam ra ${FIRST_HARVEST_FRUITS} quả chín — chạm để hái từng quả!`, "berry");
  }

  // rơi berry
  let rate = kind === "quant" ? 0.7 : 0.4;
  if (s.streak >= BONUS_STREAK) rate += STREAK_BONUS_RATE;
  let fertUsed = false;
  if (s.fertCharges > 0) {
    rate += FERT_BONUS;
    fertUsed = true;
  }
  rate = Math.min(0.97, rate);
  s.pity += 1;
  let dropped = Math.random() < rate || s.pity > PITY_LIMIT;
  if (dropped) {
    const base = kind === "quant" ? randInt(3, 8) : randInt(1, 3);
    const crit = Math.random() < CRIT_CHANCE;
    const amount = base * (crit ? CRIT_MULT : 1);
    s.berries += amount;
    s.totalBerries += amount;
    s.pity = 0;
    if (fertUsed) s.fertCharges = Math.max(0, s.fertCharges - 1);
    setTimeout(() => {
      engGlobal()?.spawnBerryBurst({ amount, crit });
      if (crit) sfx.crit(); else sfx.drop();
    }, 550);
    bridge.toast?.(
      crit ? `CRIT! +${amount} berry — may mắn ngập vườn!` : `+${amount} berry rơi ra!`,
      crit ? "level" : "berry"
    );
  }
  void dropped;
}

let engHolder: MutableRefObject<GardenEngine | null> | null = null;
export function bindEngine(ref: MutableRefObject<GardenEngine | null>) {
  engHolder = ref;
}
function engGlobal(): GardenEngine | null {
  return engHolder?.current ?? null;
}
