export type PoseId =
  | "sleep" | "read" | "drink" | "exercise" | "meditate" | "eat" | "clean"
  | "walk" | "study" | "music" | "plant" | "write" | "call" | "stretch";

export type TaskKind = "binary" | "quant";

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
  tasks: TaskInst[];
  customs: CustomDef[];
  owned: string[];
  hair: string;
  shirt: string;
  hat: string | null;
  fertCharges: number;
  freezes: number;
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
