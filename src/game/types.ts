export type PoseId =
  | "sleep" | "read" | "drink" | "exercise" | "meditate" | "eat" | "clean"
  | "walk" | "study" | "music" | "plant" | "write" | "call" | "stretch"
  | "yoga" | "dance" | "cook" | "draw" | "brush" | "pill" | "save" | "pet" | "phone";

export type TaskKind = "binary" | "quant";

/** Loại quả trên cây: thường / siêu bự / hộp quà bí ẩn. */
export type FruitType = "normal" | "giant" | "gift";

/** Pha của chu kỳ ra quả sau thu hoạch. */
export type CyclePhase = "none" | "bloom" | "green" | "ripe";

export interface TaskDef {
  id: string;
  name: string;
  pose: PoseId;
  kind: TaskKind;
  target: number; // binary = 1
  unit: string;
  step: number;
  xp: number;
}

export interface TaskInst {
  uid: string;
  defId: string | null;
  custom: boolean;
  name: string;
  pose: PoseId;
  kind: TaskKind;
  target: number;
  unit: string;
  step: number;
  xp: number;
  progress: number;
  done: boolean;
}

export interface CustomDef {
  id: string;
  name: string;
  pose: PoseId;
  kind: TaskKind;
  target: number;
  unit: string;
  step: number;
  xp: number;
  tplId?: string; // nếu thêm từ mẫu nhanh
  repeat?: number[]; // ngày trong tuần lặp lại (JS getDay: 0=CN); rỗng = mỗi ngày
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  kind: "consumable" | "decor" | "skin";
  slot?: "hair" | "shirt" | "hat";
  color?: string;
}

export interface GameState {
  started: boolean;
  hasSave: boolean;
  notice: string | null; // thông báo một lần sau khi load (vd: rụng quả vì vắng nhà)
  fog: number; // % sương mù bao phủ khu vườn (0 = tan hết)
  discovered: { id: string; day: number }[]; // các bí mật đã khám phá
  pendingStories: string[]; // hàng đợi chuyện kể của Bé Sương
  lastDate: string; // ngày chơi gần nhất (YYYY-MM-DD)
  berries: number;
  day: number;
  streak: number;
  bestStreak: number;
  xp: number;
  xpToday: number;
  level: number;
  harvests: number;
  totalBerries: number;
  fruitsLeft: number;
  harvestPhase: "none" | "picking" | "done";
  lastHarvestGain: number;
  fruitManifest: FruitType[]; // loại của từng quả trong lứa hiện tại
  cycleDay: number; // ngày trong chu kỳ ra quả sau thu hoạch (0 = chưa bắt đầu)
  inCycle: boolean; // đang trong chu kỳ nở hoa → quả xanh → quả chín
  reminder: { enabled: boolean; time: string }; // nhắc nhở hàng ngày (HH:MM)
  history: { day: number; done: number; total: number }[]; // nhật ký hoàn thành (tối đa 30)
  tasks: TaskInst[];
  customs: CustomDef[];
  owned: string[];
  hair: string;
  shirt: string;
  hat: string | null;
  fertCharges: number;
  freezes: number;
  luckyCharges: number; // bùa may mắn: tăng tỉ lệ rơi + crit trong N lần tưới
  pity: number;
  wilted: boolean;
  muted: boolean;
}

export interface WaterOutcome {
  xp: number;
  capped: boolean;
  dropped: boolean;
  amount: number;
  crit: boolean;
  leveledTo: number | null;
  becameRipe: boolean;
}
