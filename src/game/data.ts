import type { CustomDef, PoseId, ShopItem, TaskDef, TaskInst } from "./types";

export const DAILY_XP_CAP = 120;
export const PITY_LIMIT = 6; // guaranteed drop after N dry waters
export const BONUS_STREAK = 7; // +20% drop rate
export const CRIT_CHANCE = 0.05;
export const CRIT_MULT = 5;
export const FERT_CHARGES = 3;
export const FERT_BONUS = 0.25;
export const STREAK_BONUS_RATE = 0.2;

// thu hoạch đầu tiên ở cấp 10 (ngày ~21)
export const FIRST_HARVEST_LEVEL = 10;
export const FIRST_HARVEST_FRUITS = 8;
// sau đó cây vẫn lớn tiếp, và quả mọc lại định kỳ
export const FRUIT_REGROWTH_DAYS = 7;
export const FRUIT_REGROWTH_COUNT = 5;

/* ---------- narrative layer: sương mù & bí mật khu vườn ---------- */

export const FOG_START = 100;
export const FOG_FIRST_HARVEST = 25; // sương tan sau thu hoạch đầu tiên
export const FOG_REGROWTH_HARVEST = 12; // mỗi mùa quả sau đó
export const ABSENCE_DROP_DAYS = 2; // vắng >= N ngày → rụng 1 quả

export interface LandmarkDef {
  id: string;
  at: number; // hé lộ khi sương ≤ at (%)
  name: string;
  story: string;
  hint: string;
}

/** Thứ tự khám phá — mỗi mùa thu hoạch là một chương. */
export const LANDMARKS: LandmarkDef[] = [
  {
    id: "stream", at: 75, name: "Con suối nhỏ",
    story: "Nghe thấy không? Tiếng róc rách ấy… Con suối vừa tỉnh giấc sau giấc ngủ dài trong sương. Nó bảo nó nhớ tiếng cười lắm.",
    hint: "Thu hoạch mùa đầu tiên",
  },
  {
    id: "bridge", at: 62, name: "Chiếc cầu gỗ",
    story: "Ngày xưa có người bắc cầu qua suối để sang thăm khu vườn bên kia. Sương tan đến đâu, cầu lại hiện ra đến đó — như một lời hẹn cũ.",
    hint: "Để sương tan còn 62%",
  },
  {
    id: "cottage", at: 50, name: "Ngôi nhà gỗ",
    story: "Ngôi nhà của người giữ vườn trước. Trong lò sưởi vẫn còn ấm, như thể họ chỉ vừa đi đâu đó… và sẽ quay lại khi vườn xanh như cũ.",
    hint: "Để sương tan còn 50%",
  },
  {
    id: "windmill", at: 38, name: "Cối xay gió",
    story: "Cối xay gió quay rồi! Người ta kể nó xay những giấc mơ thành nắng, rải đều khắp vườn để chẳng cây nào phải lớn trong buồn bã.",
    hint: "Để sương tan còn 38%",
  },
  {
    id: "gate", at: 24, name: "Cổng đá cổ",
    story: "Cổng đá cổ — biên giới của khu vườn. Tương truyền ai bước qua cổng sẽ gặp lại khu vườn đẹp nhất trong ký ức của mình. Của bạn là đây chứ?",
    hint: "Để sương tan còn 24%",
  },
  {
    id: "rainbow", at: 8, name: "Cầu vồng sau sương",
    story: "Sương tan gần hết rồi… Cảm ơn bạn — và cảm ơn cả cây cam. Khu vườn này từng bị lãng quên, nhưng giờ nó là nhà của bạn rồi đấy.",
    hint: "Để sương tan còn 8%",
  },
];

/** Cây cam duy nhất của khu vườn. */
export const TREE = {
  name: "Cam Sành",
  fruit: "#ff8c2e",
  fruitDark: "#c96a1e",
  glow: "rgba(255,140,46,",
  leaf: "#3e9142",
  leafLight: "#58b84e",
  value: 10, // berry mỗi quả (lần đầu)
  regrowthValue: 6, // berry mỗi quả mọc lại
};

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
    return inst(d, `${day}-${i}`, false);
  });
  customs.forEach((c, i) => {
    list.push(inst(c, `c-${day}-${i}-${c.id}`, true));
  });
  return list;
}

function inst(d: { name: string; pose: PoseId; kind: TaskDef["kind"]; target: number; unit: string; step: number; xp: number }, uid: string, custom: boolean): TaskInst {
  return {
    uid,
    defId: custom ? null : uid,
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

/* ---------- progression: cây lớn MÃI, nhưng chậm dần ---------- */

// KN tích luỹ để ĐẠT cấp 2..10
export const LEVEL_XP = [25, 60, 105, 160, 225, 300, 385, 480, 585];
const BASE_TOP = LEVEL_XP[LEVEL_XP.length - 1]; // 585 → cấp 10
const POST_GAP = 240; // cấp 10→11 cần thêm 240
const POST_GROWTH = 1.38; // mỗi cấp sau đó cần nhiều hơn ~38%

/** KN tích luỹ cần để đạt cấp `lv` (lv ≥ 1). Hoạt động cho cả cấp > 10. */
export function xpForLevel(lv: number): number {
  if (lv <= 1) return 0;
  if (lv <= LEVEL_XP.length + 1) return LEVEL_XP[lv - 2];
  let t = BASE_TOP;
  let gap = POST_GAP;
  for (let l = LEVEL_XP.length + 2; l <= lv; l++) {
    t += gap;
    gap = Math.round(gap * POST_GROWTH);
  }
  return t;
}

export function levelFromXp(xp: number): number {
  let lv = 1;
  while (xpForLevel(lv + 1) <= xp) lv++;
  return lv;
}

export function xpWindow(level: number, xp: number): { prev: number; next: number; pct: number } {
  const prev = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = next === prev ? 1 : Math.max(0, Math.min(1, (xp - prev) / (next - prev)));
  return { prev, next, pct };
}

/** Tên giai đoạn của cây theo cấp. */
export function stageName(level: number): string {
  if (level <= 2) return "Mầm non";
  if (level <= 4) return "Cây con";
  if (level <= 7) return "Cây trưởng thành";
  if (level <= 9) return "Đâm hoa";
  if (level === 10) return "Đậu quả";
  if (level <= 12) return "Cây lớn";
  if (level <= 14) return "Cổ thụ";
  return "Đại cổ thụ";
}

/* ---------- avatar customization ---------- */

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

/* ---------- shop ---------- */

export const SHOP: ShopItem[] = [
  { id: "fertilizer", name: "Phân bón thần kỳ", desc: `+25% tỉ lệ rơi berry trong ${FERT_CHARGES} lần tưới tới`, cost: 25, icon: "fertilizer", kind: "consumable" },
  { id: "freeze", name: "Băng bảo vệ", desc: "Giữ nguyên streak nếu lỡ một ngày chưa xong nhiệm vụ", cost: 40, icon: "snow", kind: "consumable" },
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
