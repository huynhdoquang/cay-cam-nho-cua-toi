export type PoseId =
  | "sleep" | "read" | "drink" | "exercise" | "meditate" | "eat" | "clean"
  | "walk" | "study" | "music" | "plant" | "write" | "call" | "stretch";

export type TreeId = "cam" | "cherry" | "tao";
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

export interface TreeDef {
  id: TreeId;
  name: string;
  fruit: string;      // fruit fill
  fruitDark: string;  // fruit stroke
  glow: string;       // glow rgba base
  value: number;      // berries per fruit
  fruits: number;     // fruit count at harvest
  leaf: string;
  leafLight: string;
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  kind: "consumable" | "seed" | "decor" | "skin";
  slot?: "hair" | "shirt" | "hat";
  color?: string;
  treeId?: TreeId;
}

export interface GameState {
  started: boolean;
  hasSave: boolean;
  berries: number;
  day: number;
  streak: number;
  bestStreak: number;
  xp: number;
  xpToday: number;
  level: number;
  treeType: TreeId;
  unlockedTrees: TreeId[];
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
