import type { CustomDef, PoseId, ShopItem, TaskDef, TaskInst, TreeDef, TreeId } from "./types";

export const DAILY_XP_CAP = 120;
export const PITY_LIMIT = 6; // guaranteed drop after N dry waters
export const BONUS_STREAK = 7; // +20% drop rate
export const CRIT_CHANCE = 0.05;
export const CRIT_MULT = 5;
export const FERT_CHARGES = 3;
export const FERT_BONUS = 0.25;
export const STREAK_BONUS_RATE = 0.2;

export const POSES: { id: PoseId; label: string }[] = [
  { id: "sleep", label: "Ngủ" },
  { id: "read", label: "Đọc sách" },
  { id: "drink", label: "Uống nước" },
  { id: "exercise", label: "Tập luyện" },
  { id: "meditate", label: "Thiền" },
  { id: "eat", label: "Ăn uống" },
  { id: "clean", label: "Dọn dẹp" },
  { id: "walk", label: "Đi bộ" },
  { id: "study", label: "Học tập" },
  { id: "music", label: "Âm nhạc" },
  { id: "plant", label: "Cây cối" },
  { id: "write", label: "Viết lách" },
  { id: "call", label: "Gọi điện" },
  { id: "stretch", label: "Vươn vai" },
];

export const PRESETS: TaskDef[] = [
  { id: "sleep23", name: "Ngủ trước 23h", pose: "sleep", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "read10", name: "Đọc sách", pose: "read", kind: "quant", target: 10, unit: "trang", step: 2, xp: 16 },
  { id: "water8", name: "Uống nước", pose: "drink", kind: "quant", target: 8, unit: "cốc", step: 1, xp: 16 },
  { id: "gym15", name: "Tập thể dục", pose: "exercise", kind: "quant", target: 15, unit: "phút", step: 5, xp: 16 },
  { id: "zen5", name: "Thiền tĩnh tâm", pose: "meditate", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "breakfast", name: "Ăn sáng đầy đủ", pose: "eat", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "tidy", name: "Dọn bàn làm việc", pose: "clean", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "steps5k", name: "Đi bộ", pose: "walk", kind: "quant", target: 5000, unit: "bước", step: 1000, xp: 16 },
  { id: "focus25", name: "Học tập trung", pose: "study", kind: "quant", target: 25, unit: "phút", step: 5, xp: 16 },
  { id: "musicrelax", name: "Nghe nhạc thư giãn", pose: "music", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "waterplants", name: "Tưới cây trong nhà", pose: "plant", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "journal3", name: "Viết nhật ký", pose: "write", kind: "quant", target: 3, unit: "dòng", step: 1, xp: 16 },
  { id: "familycall", name: "Gọi cho gia đình", pose: "call", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "stretch5", name: "Vươn vai giãn cơ", pose: "stretch", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "nosugar", name: "Không đồ ngọt", pose: "eat", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
  { id: "posture", name: "Ngồi đúng tư thế", pose: "stretch", kind: "binary", target: 1, unit: "", step: 1, xp: 12 },
];

const ROTATION = [0, 5, 10, 15, 4, 9]; // coprime offsets mod 16 → always 6 distinct presets

export function buildDailyTasks(day: number, customs: CustomDef[]): TaskInst[] {
  const start = (day * 3) % PRESETS.length;
  const list: TaskInst[] = ROTATION.map((off, i) => {
    const d = PRESETS[(start + off) % PRESETS.length];
    return inst(d, `${day}-${i}`, false, d.id);
  });
  customs.forEach((c, i) => {
    list.push(inst(c, `c-${day}-${i}-${c.id}`, true, c.id));
  });
  return list;
}

function inst(d: { name: string; pose: PoseId; kind: TaskDef["kind"]; target: number; unit: string; step: number; xp: number }, uid: string, custom: boolean, defId: string): TaskInst {
  return {
    uid,
    defId,
    custom,
    name: d.name,
    pose: d.pose,
    kind: d.kind,
    target: d.target,
    unit: d.unit,
    step: d.step,
    xp: d.xp,
    progress: 0,
    done: false,
  };
}

export const TREES: Record<TreeId, TreeDef> = {
  cam: {
    id: "cam", name: "Cam Sành", fruit: "#ff8c2e", fruitDark: "#c96a1e",
    glow: "rgba(255,140,46,", value: 10, fruits: 8, leaf: "#3e9142", leafLight: "#58b84e",
  },
  cherry: {
    id: "cherry", name: "Anh Đào", fruit: "#e85a71", fruitDark: "#b03050",
    glow: "rgba(232,90,113,", value: 13, fruits: 9, leaf: "#4ca854", leafLight: "#7acb5f",
  },
  tao: {
    id: "tao", name: "Táo Đỏ", fruit: "#e84545", fruitDark: "#a92626",
    glow: "rgba(232,69,69,", value: 16, fruits: 8, leaf: "#3e9142", leafLight: "#6fbf5a",
  },
};

// cumulative XP to REACH level index+2 (level 1 + count passed)
export const LEVEL_XP = [25, 60, 105, 160, 225, 300, 385, 480, 585];
export const MAX_LEVEL = 10;

export function levelFromXp(xp: number): number {
  let lv = 1;
  for (const t of LEVEL_XP) if (xp >= t) lv++;
  return Math.min(lv, MAX_LEVEL);
}

export function xpWindow(level: number, xp: number): { prev: number; next: number; pct: number } {
  if (level >= MAX_LEVEL) return { prev: LEVEL_XP[8], next: LEVEL_XP[8], pct: 1 };
  const prev = level === 1 ? 0 : LEVEL_XP[level - 2];
  const next = LEVEL_XP[level - 1];
  return { prev, next, pct: Math.max(0, Math.min(1, (xp - prev) / (next - prev))) };
}

export const HAIR_COLORS: { id: string; name: string; color: string }[] = [
  { id: "hair_default", name: "Tóc nâu", color: "#7a4a21" },
  { id: "hair_orange", name: "Tóc cam", color: "#e8751a" },
  { id: "hair_blue", name: "Tóc xanh biển", color: "#3e7bc0" },
  { id: "hair_pink", name: "Tóc hồng", color: "#e86fa0" },
];

export const SHIRT_COLORS: { id: string; name: string; color: string }[] = [
  { id: "shirt_default", name: "Áo lá xanh", color: "#58b84e" },
  { id: "shirt_yellow", name: "Áo vàng nắng", color: "#f2b33d" },
  { id: "shirt_red", name: "Áo đỏ dưa hấu", color: "#e85a5a" },
  { id: "shirt_sky", name: "Áo xanh da trời", color: "#4fb8e8" },
];

export const HATS: { id: string; name: string }[] = [
  { id: "hat_none", name: "Không đội mũ" },
  { id: "hat_frog", name: "Mũ ếch" },
  { id: "hat_orange", name: "Mũ cam" },
];

export function colorOf(list: { id: string; color: string }[], id: string, fallback: string): string {
  return list.find((x) => x.id === id)?.color ?? fallback;
}

export const SHOP: ShopItem[] = [
  { id: "fertilizer", name: "Phân bón thần kỳ", desc: `+25% tỉ lệ rơi berry trong ${FERT_CHARGES} lần tưới tới`, cost: 25, icon: "fertilizer", kind: "consumable" },
  { id: "freeze", name: "Băng bảo vệ", desc: "Giữ nguyên streak nếu lỡ một ngày chưa xong nhiệm vụ", cost: 40, icon: "snow", kind: "consumable" },
  { id: "seed_cherry", name: "Hạt anh đào", desc: "Mở khóa cây Anh Đào — berry mỗi quả ×1.3", cost: 120, icon: "seed", kind: "seed", treeId: "cherry" },
  { id: "seed_tao", name: "Hạt táo đỏ", desc: "Mở khóa cây Táo Đỏ — berry mỗi quả ×1.6", cost: 220, icon: "seed", kind: "seed", treeId: "tao" },
  { id: "decor_mushrooms", name: "Nấm xinh", desc: "Khóm nấm đỏ lấm tấm trong vườn", cost: 30, icon: "mushroom", kind: "decor" },
  { id: "decor_lantern", name: "Đèn vườn", desc: "Ngọn đèn ấm áp lấp lánh về chiều", cost: 45, icon: "lantern", kind: "decor" },
  { id: "decor_flowers", name: "Khóm hoa", desc: "Hoa cúc hoạ mi ven lối đất", cost: 50, icon: "flower", kind: "decor" },
  { id: "decor_fence", name: "Hàng rào gỗ", desc: "Hàng rào bao quanh khu vườn nhỏ", cost: 60, icon: "fence", kind: "decor" },
  { id: "hair_orange", name: "Tóc cam", desc: "Đổi màu tóc cho bé Cam", cost: 40, icon: "hat", kind: "skin", slot: "hair", color: "#e8751a" },
  { id: "hair_blue", name: "Tóc xanh biển", desc: "Đổi màu tóc cho bé Cam", cost: 45, icon: "hat", kind: "skin", slot: "hair", color: "#3e7bc0" },
  { id: "hair_pink", name: "Tóc hồng", desc: "Đổi màu tóc cho bé Cam", cost: 45, icon: "hat", kind: "skin", slot: "hair", color: "#e86fa0" },
  { id: "shirt_yellow", name: "Áo vàng nắng", desc: "Áo mới cho bé Cam", cost: 40, icon: "shirt", kind: "skin", slot: "shirt", color: "#f2b33d" },
  { id: "shirt_red", name: "Áo đỏ dưa hấu", desc: "Áo mới cho bé Cam", cost: 40, icon: "shirt", kind: "skin", slot: "shirt", color: "#e85a5a" },
  { id: "shirt_sky", name: "Áo xanh da trời", desc: "Áo mới cho bé Cam", cost: 40, icon: "shirt", kind: "skin", slot: "shirt", color: "#4fb8e8" },
  { id: "hat_frog", name: "Mũ ếch", desc: "Chiếc mũ ếch có hai mắt lồi siêu cute", cost: 60, icon: "frog", kind: "skin", slot: "hat" },
  { id: "hat_orange", name: "Mũ cam", desc: "Mũ len hình quả cam có lá", cost: 50, icon: "citrus", kind: "skin", slot: "hat" },
];

export const DECOR_FLAGS = ["decor_fence", "decor_lantern", "decor_mushrooms", "decor_flowers"] as const;

export function randInt(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}
