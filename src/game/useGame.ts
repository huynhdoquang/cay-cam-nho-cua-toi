import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { FruitType, GameState, PoseId, TaskKind } from "./types";
import {
  ABSENCE_DROP_DAYS, BONUS_STREAK, CRIT_CHANCE, CRIT_MULT, CYCLE_BLOOM_DAYS, CYCLE_RIPE_AT,
  DAILY_XP_CAP, DECOR_FLAGS, FERT_BONUS, FERT_CHARGES, FIRST_HARVEST_FRUITS, FIRST_HARVEST_LEVEL,
  FOG_FIRST_HARVEST, FOG_REGROWTH_HARVEST, FOG_START, FRUIT_REGROWTH_COUNT, GIANT_MULT,
  HAIR_COLORS, LANDMARKS, PITY_LIMIT, SHOP, SHIRT_COLORS, STREAK_BONUS_RATE, TREE,
  buildDailyTasks, colorOf, generateFruitManifest, levelFromXp, randInt, rollGift, xpForLevel,
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
  addCustom: (d: { name: string; pose: PoseId; kind: TaskKind; target: number; unit: string; step: number; repeat?: number[]; tplId?: string }) => boolean;
  removeCustom: (id: string) => void;
  setReminder: (enabled: boolean, time: string) => void;
  onFruitPick: (index: number, x: number, y: number) => void;
  closeHarvest: () => void;
  dismissStory: () => void;
  clearNotice: () => void;
  toggleMute: () => void;
  /** Các công cụ dành riêng cho việc test / cân bằng game. */
  test: {
    addBerries: (n: number) => void;
    addXp: (n: number) => void;
    setLevel: (lv: number) => void;
    completeAll: () => void;
    nextDay: () => void;
    spawnFruits: () => void;
    forceHarvest: () => void;
    clearFog: () => void;
    unlockAll: () => void;
    reset: () => void;
  };
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
    fruitManifest: [],
    cycleDay: 0,
    inCycle: false,
    reminder: { enabled: false, time: "20:00" },
    history: [],
    tasks: buildDailyTasks(1, []),
    customs: [],
    owned: [],
    hair: "hair_default",
    shirt: "shirt_default",
    hat: null,
    fertCharges: 0,
    freezes: 0,
    luckyCharges: 0,
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

/** Pha hiển thị của chu kỳ ra quả (chỉ bloom/green — quả chín vẽ riêng). */
export function cyclePhaseOf(inCycle: boolean, cycleDay: number): "none" | "bloom" | "green" {
  if (!inCycle || cycleDay < 1) return "none";
  if (cycleDay <= CYCLE_BLOOM_DAYS) return "bloom";
  if (cycleDay < CYCLE_RIPE_AT) return "green";
  return "none";
}

/** Mở hộp quà bí ẩn: sửa trực tiếp `s`, trả về phần thưởng để hiển thị. */
function applyGift(s: GameState, x: number, y: number): { gain: number; label: string } {
  const g = rollGift();
  switch (g.kind) {
    case "berries": {
      const n = randInt(g.min ?? 10, g.max ?? 30);
      s.berries += n;
      s.totalBerries += n;
      engGlobal()?.spawnBerryBurst({ amount: n, crit: false });
      return { gain: n, label: `Quà: +${n} berry!` };
    }
    case "xp": {
      const n = g.amount ?? 30;
      gainXp(s, n);
      return { gain: 0, label: `Quà: +${n} KN!` };
    }
    case "fert": {
      s.fertCharges += FERT_CHARGES;
      return { gain: 0, label: "Quà: Phân bón thần kỳ!" };
    }
    case "freeze": {
      s.freezes += 1;
      return { gain: 0, label: "Quà: Băng bảo vệ!" };
    }
    case "cosmetic": {
      const unowned = SHOP.filter((i) => i.kind === "skin" && i.slot && !s.owned.includes(i.id));
      if (unowned.length === 0) {
        s.berries += 20;
        s.totalBerries += 20;
        return { gain: 20, label: "Quà: +20 berry!" };
      }
      const pick = unowned[Math.floor(Math.random() * unowned.length)];
      s.owned = [...s.owned, pick.id];
      engGlobal()?.sparkAt(x, y, "#9c8ce8");
      return { gain: 0, label: `Quà: ${pick.name}!` };
    }
    default: {
      s.berries += 5;
      s.totalBerries += 5;
      return { gain: 5, label: "Bé Sương ôm bạn +5 berry" };
    }
  }
}

/** Cộng KN thuần (quà bí ẩn / test), tự tính cấp và hiệu ứng. */
function gainXp(s: GameState, amount: number) {
  const prevLevel = s.level;
  s.xp += amount;
  s.level = levelFromXp(s.xp);
  if (s.level > prevLevel) {
    setTimeout(() => {
      engGlobal()?.levelUpFx();
      sfx.levelup();
    }, 300);
    bridge.toast?.(`Cây cam lên cấp ${s.level}!`, "level");
  }
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
      // chu kỳ ra quả sau thu hoạch: nở hoa → quả xanh → quả chín
      let fruitsLeft = s.fruitsLeft;
      let harvestPhase = s.harvestPhase;
      let fruitManifest = s.fruitManifest;
      let cycleDay = s.cycleDay;
      const inCycle = s.inCycle;

      if (inCycle) {
        cycleDay += 1;
        if (cycleDay === 1) {
          fx.toast("Cây cam đang nở hoa trắng muốt…", "info");
        } else if (cycleDay === CYCLE_BLOOM_DAYS + 1) {
          fx.toast("Hoa đã đậu thành những quả cam non xanh mướt!", "info");
        }
        if (
          cycleDay >= CYCLE_RIPE_AT &&
          harvestPhase === "none" &&
          fruitsLeft === 0 &&
          s.level >= FIRST_HARVEST_LEVEL
        ) {
          fruitManifest = generateFruitManifest(FRUIT_REGROWTH_COUNT);
          fruitsLeft = FRUIT_REGROWTH_COUNT;
          harvestPhase = "picking";
          fx.toast(`Cây cam chín ${FRUIT_REGROWTH_COUNT} quả mới — ra hái thôi!`, "berry");
          setTimeout(() => eng()?.ripeFx(), 300);
          setTimeout(() => sfx.ripe(), 300);
        }
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
        fruitManifest,
        cycleDay,
        berries: s.berries + bonus,
        totalBerries: s.totalBerries + bonus,
      };
      if (bonus > 0) fx.toast(`Thưởng trọn ngày +${bonus} berry!`, "berry");
      const e = eng();
      e?.setWilted(wilted);
      e?.setCyclePhase(cyclePhaseOf(inCycle, cycleDay));
      if (harvestPhase === "picking" && fruitsLeft > 0) {
        e?.setFruitManifest(fruitManifest, fruitsLeft);
      }
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
      if (itemId === "fertilizer") next.fertCharges += FERT_CHARGES;
      if (itemId === "freeze") next.freezes += 1;
      if (itemId === "charm") next.luckyCharges += 3;
      if (itemId === "candy") {
        // hoàn thành ngay 1 nhiệm vụ chưa xong ngẫu nhiên
        const open = next.tasks.filter((t) => !t.done);
        if (open.length === 0) {
          fx.toast("Hôm nay bé Cam đã xong hết việc rồi!", "info");
        } else {
          const t = open[Math.floor(Math.random() * open.length)];
          next.tasks = next.tasks.map((x) =>
            x.uid === t.uid ? { ...x, progress: x.target, done: true } : x
          );
          water(next, t.xp, t.kind);
          fx.toast(`Bé Cam ăn kẹo và hoàn thành “${t.name}”!`, "success");
        }
      }
      if (item.kind === "decor") {
        const has = (id: string) => next.owned.includes(id);
        eng()?.setDecor({
          fence: has("decor_fence"),
          lantern: has("decor_lantern"),
          mushrooms: has("decor_mushrooms"),
          flowers: has("decor_flowers"),
          pond: has("decor_pond"),
          scarecrow: has("decor_scarecrow"),
          swing: has("decor_swing"),
        });
      }
      sfx.buy();
      if (itemId !== "candy") fx.toast(`Đã mua ${item.name}!`, "success");
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
      const repeat = d.repeat && d.repeat.length > 0 ? d.repeat : undefined;
      const customs = [...s.customs, { id, ...d, name, repeat, tplId: d.tplId, xp: d.kind === "binary" ? 12 : 16 }];
      // hôm nay có nằm trong lịch lặp? (index T2..CN = (jsDay+6)%7)
      const t2cn = (new Date().getDay() + 6) % 7;
      const showToday = !repeat || repeat.includes(t2cn);
      const tasks = showToday
        ? [...s.tasks, {
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
          }]
        : s.tasks;
      setState({ ...s, customs, tasks });
      sfx.check();
      fx.toast(
        showToday ? `Đã thêm “${name}” — một bong bóng mới xuất hiện!` : `Đã thêm “${name}” — sẽ xuất hiện vào ngày lặp của nó!`,
        "success"
      );
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

    onFruitPick(index: number, x: number, y: number) {
      const s = ref.current;
      if (s.fruitsLeft <= 0) return;
      const type: FruitType = s.fruitManifest[index] ?? "normal";
      const isFirst = s.harvests === 0;
      const per = isFirst ? TREE.value : TREE.regrowthValue;
      const fruitsLeft = s.fruitsLeft - 1;

      // đánh dấu quả đã hái để không tái sử dụng
      const fruitManifest = s.fruitManifest.map((t, i) => (i === index ? "normal" : t)) as FruitType[];
      const next: GameState = { ...s, fruitManifest };

      let gain = per;
      const e = eng();
      if (type === "giant") {
        gain = per * GIANT_MULT;
        e?.floatText(x, y, `SIÊU BỰ! +${gain}`, "#ffd93d", true);
        e?.sparkAt(x, y, "#ffd93d");
        sfx.crit();
      } else if (type === "gift") {
        const r = applyGift(next, x, y);
        gain = r.gain;
        e?.floatText(x, y, r.label, "#c0b5f2", false);
        sfx.buy();
      } else {
        e?.floatText(x, y, `+${gain}`, "#c0b5f2", false);
        sfx.pop();
      }

      let harvestPhase = s.harvestPhase;
      let harvests = s.harvests;
      let lastHarvestGain = s.lastHarvestGain;
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
          ...next,
          fruitsLeft,
          harvestPhase,
          harvests,
          lastHarvestGain: total,
          berries: next.berries + total,
          totalBerries: next.totalBerries + total,
          fog,
          discovered,
          pendingStories,
          // bắt đầu chu kỳ nở hoa → quả xanh → quả chín tiếp theo
          inCycle: true,
          cycleDay: 0,
          fruitManifest: [],
        });
        return;
      }
      setState({
        ...next,
        fruitsLeft,
        berries: next.berries + gain,
        totalBerries: next.totalBerries + gain,
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

    /* ---------- TEST MODE ---------- */
    test: {
      addBerries(n) {
        setState((p) => ({ ...p, berries: p.berries + n, totalBerries: p.totalBerries + n }));
        fx.toast(`[test] +${n} berry`, "info");
      },
      addXp(n) {
        setState((p) => {
          const c = { ...p };
          gainXp(c, n);
          return c;
        });
        fx.toast(`[test] +${n} KN`, "info");
      },
      setLevel(lv) {
        setState((p) => {
          const xp = xpForLevel(lv);
          return { ...p, xp, level: lv };
        });
        eng()?.setLevel(lv);
        fx.toast(`[test] cấp ${lv}`, "info");
      },
      completeAll() {
        setState((p) => {
          const c = { ...p };
          c.tasks = c.tasks.map((t) => (t.done ? t : { ...t, progress: t.target, done: true }));
          return c;
        });
        fx.toast("[test] xong hết nhiệm vụ", "success");
      },
      nextDay() {
        api.endDay();
        fx.toast("[test] sang ngày mới", "info");
      },
      spawnFruits() {
        setState((p) => {
          if (p.fruitsLeft > 0) return p;
          const manifest = generateFruitManifest(FIRST_HARVEST_FRUITS);
          setTimeout(() => eng()?.setFruitManifest(manifest, FIRST_HARVEST_FRUITS), 50);
          return { ...p, fruitManifest: manifest, fruitsLeft: FIRST_HARVEST_FRUITS, harvestPhase: "picking" };
        });
        fx.toast("[test] spawn quả chín", "berry");
      },
      forceHarvest() {
        setState((p) => {
          if (p.fruitsLeft === 0) return p;
          const gain = p.fruitsLeft * (p.harvests === 0 ? TREE.value : TREE.regrowthValue) + 25;
          return {
            ...p,
            fruitsLeft: 0,
            harvestPhase: "done",
            harvests: p.harvests + 1,
            lastHarvestGain: gain,
            berries: p.berries + gain,
            totalBerries: p.totalBerries + gain,
            inCycle: true,
            cycleDay: 0,
            fruitManifest: [],
          };
        });
        fx.toast("[test] thu hoạch ngay", "level");
      },
      clearFog() {
        setState((p) => ({ ...p, fog: 0, discovered: LANDMARKS.map((l) => ({ id: l.id, day: p.day })) }));
        eng()?.setFog(0);
        eng()?.setDiscovered(LANDMARKS.map((l) => l.id));
        fx.toast("[test] tan hết sương", "info");
      },
      unlockAll() {
        setState((p) => ({ ...p, owned: SHOP.filter((i) => i.kind !== "consumable").map((i) => i.id) }));
        fx.toast("[test] mở khóa mọi đồ", "info");
      },
      reset() {
        try { localStorage.removeItem(KEY); } catch { /* noop */ }
        const s = freshState();
        s.started = true;
        setState(s);
        eng()?.resetTree();
        fx.toast("[test] reset game", "warn");
      },
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

  // lần đầu VƯỢT cấp 10 → đậu quả (có thể kèm quả siêu bự / hộp quà)
  if (leveled && prevLevel < FIRST_HARVEST_LEVEL && newLevel >= FIRST_HARVEST_LEVEL && s.fruitsLeft === 0 && s.harvestPhase === "none") {
    s.fruitManifest = generateFruitManifest(FIRST_HARVEST_FRUITS);
    s.fruitsLeft = FIRST_HARVEST_FRUITS;
    s.harvestPhase = "picking";
    setTimeout(() => {
      engGlobal()?.ripeFx();
      engGlobal()?.setFruitManifest(s.fruitManifest, FIRST_HARVEST_FRUITS);
      sfx.ripe();
    }, 700);
    bridge.toast?.(`Cây cam ra ${FIRST_HARVEST_FRUITS} quả chín — chạm để hái từng quả!`, "berry");
  }

  // rơi berry (bùa may mắn: +15% rơi, +10% crit, tính trong lần tưới này)
  const lucky = s.luckyCharges > 0;
  s.luckyCharges = Math.max(0, s.luckyCharges - 1);
  let rate = kind === "quant" ? 0.7 : 0.4;
  if (s.streak >= BONUS_STREAK) rate += STREAK_BONUS_RATE;
  if (lucky) rate += 0.15;
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
    const crit = Math.random() < CRIT_CHANCE + (lucky ? 0.1 : 0);
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
