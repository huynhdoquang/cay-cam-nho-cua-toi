import type { CustomDef, FruitType, PoseId, ShopItem, TaskDef, TaskInst, TaskKind } from "./types";

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
// sau đó cây vẫn lớn tiếp, và quả mọc lại theo chu kỳ có giai đoạn ra hoa
export const FRUIT_REGROWTH_COUNT = 5;
export const CYCLE_BLOOM_DAYS = 2; // ngày 1-2 của chu kỳ: cây nở hoa
export const CYCLE_GREEN_DAYS = 2; // ngày 3-4: đậu quả xanh
export const CYCLE_RIPE_AT = CYCLE_BLOOM_DAYS + CYCLE_GREEN_DAYS + 1; // ngày 5+: quả chín để hái
export const FRUIT_REGROWTH_DAYS = CYCLE_RIPE_AT; // alias: số ngày để lứa quả mới chín

/* ---------- quả đặc biệt ---------- */

export const GIANT_CHANCE = 0.1; // xác suất một quả là "siêu bự"
export const GIFT_CHANCE = 0.12; // xác suất một quả là hộp quà bí ẩn
export const GIANT_MULT = 3; // siêu bự = 3x berry

/** Bảng phần thưởng khi mở hộp quà bí ẩn (trọng số). */
export interface GiftReward {
  kind: "berries" | "fert" | "freeze" | "xp" | "cosmetic" | "hug";
  w: number;
  min?: number;
  max?: number;
  amount?: number;
  label: string;
}
export const GIFT_TABLE: GiftReward[] = [
  { kind: "berries", w: 28, min: 15, max: 45, label: "Một nắm berry căng mọng" },
  { kind: "xp", w: 18, amount: 30, label: "Cuốn bí kíp làm vườn (+30 KN)" },
  { kind: "fert", w: 14, label: "Một túi phân bón thần kỳ" },
  { kind: "freeze", w: 14, label: "Một viên băng bảo vệ" },
  { kind: "cosmetic", w: 12, label: "Một món đồ diện mạo bí mật" },
  { kind: "hug", w: 14, label: "Bé Sương gửi bạn một cái ôm (+5 berry)" },
];

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
  { id: "yoga", label: "Yoga" },
  { id: "dance", label: "Nhảy nhót" },
  { id: "cook", label: "Nấu ăn" },
  { id: "draw", label: "Vẽ vời" },
  { id: "brush", label: "Đánh răng" },
  { id: "pill", label: "Uống thuốc" },
  { id: "save", label: "Tiết kiệm" },
  { id: "pet", label: "Chơi với pet" },
  { id: "phone", label: "Cai điện thoại" },
];

/* ---------- mẫu nhiệm vụ nhanh ---------- */

export interface TaskTemplate {
  id: string;
  name: string;
  pose: PoseId;
  kind: TaskKind;
  target: number;
  unit: string;
  step: number;
  cat: string;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Sức khoẻ
  { id: "tpl_water", name: "Uống đủ nước", pose: "drink", kind: "quant", target: 8, unit: "cốc", step: 2, cat: "Sức khoẻ" },
  { id: "tpl_sleep", name: "Ngủ trước 23h", pose: "sleep", kind: "binary", target: 1, unit: "", step: 1, cat: "Sức khoẻ" },
  { id: "tpl_gym", name: "Tập thể dục", pose: "exercise", kind: "quant", target: 15, unit: "phút", step: 5, cat: "Sức khoẻ" },
  { id: "tpl_walk", name: "Đi bộ", pose: "walk", kind: "quant", target: 5000, unit: "bước", step: 1000, cat: "Sức khoẻ" },
  { id: "tpl_yoga", name: "Tập yoga", pose: "yoga", kind: "quant", target: 10, unit: "phút", step: 5, cat: "Sức khoẻ" },
  { id: "tpl_vitamin", name: "Uống vitamin", pose: "pill", kind: "binary", target: 1, unit: "", step: 1, cat: "Sức khoẻ" },
  { id: "tpl_brush", name: "Đánh răng sáng & tối", pose: "brush", kind: "quant", target: 2, unit: "lần", step: 1, cat: "Sức khoẻ" },
  // Học tập
  { id: "tpl_read", name: "Đọc sách", pose: "read", kind: "quant", target: 10, unit: "trang", step: 2, cat: "Học tập" },
  { id: "tpl_focus", name: "Học tập trung", pose: "study", kind: "quant", target: 25, unit: "phút", step: 5, cat: "Học tập" },
  { id: "tpl_vocab", name: "Học từ vựng", pose: "study", kind: "quant", target: 10, unit: "từ", step: 5, cat: "Học tập" },
  { id: "tpl_draw", name: "Vẽ / phác thảo", pose: "draw", kind: "quant", target: 15, unit: "phút", step: 5, cat: "Học tập" },
  // Nhà cửa
  { id: "tpl_tidy", name: "Dọn bàn làm việc", pose: "clean", kind: "binary", target: 1, unit: "", step: 1, cat: "Nhà cửa" },
  { id: "tpl_cook", name: "Nấu ăn ở nhà", pose: "cook", kind: "binary", target: 1, unit: "", step: 1, cat: "Nhà cửa" },
  { id: "tpl_plants", name: "Tưới cây trong nhà", pose: "plant", kind: "binary", target: 1, unit: "", step: 1, cat: "Nhà cửa" },
  // Tinh thần
  { id: "tpl_zen", name: "Thiền tĩnh tâm", pose: "meditate", kind: "binary", target: 1, unit: "", step: 1, cat: "Tinh thần" },
  { id: "tpl_journal", name: "Viết nhật ký", pose: "write", kind: "quant", target: 3, unit: "dòng", step: 1, cat: "Tinh thần" },
  { id: "tpl_call", name: "Gọi cho người thân", pose: "call", kind: "binary", target: 1, unit: "", step: 1, cat: "Tinh thần" },
  { id: "tpl_detox", name: "Không MXH 1 giờ", pose: "phone", kind: "binary", target: 1, unit: "", step: 1, cat: "Tinh thần" },
  { id: "tpl_dance", name: "Nhảy theo nhạc", pose: "dance", kind: "quant", target: 10, unit: "phút", step: 5, cat: "Tinh thần" },
  { id: "tpl_pet", name: "Chơi với thú cưng", pose: "pet", kind: "binary", target: 1, unit: "", step: 1, cat: "Tinh thần" },
  // Tiền bạc
  { id: "tpl_save", name: "Ghi chép chi tiêu", pose: "save", kind: "binary", target: 1, unit: "", step: 1, cat: "Tiền bạc" },
];

export const TEMPLATE_CATS = ["Sức khoẻ", "Học tập", "Nhà cửa", "Tinh thần", "Tiền bạc"];

/** Nhãn thứ trong tuần, index 0..6 = T2..CN (JS getDay: (i+1)%7). */
export const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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

export function buildDailyTasks(day: number, customs: CustomDef[], weekdayJs?: number): TaskInst[] {
  const start = (day * 3) % PRESETS.length;
  const list: TaskInst[] = ROTATION.map((off, i) => {
    const d = PRESETS[(start + off) % PRESETS.length];
    return inst(d, `${day}-${i}`, false);
  });
  const jsDay = weekdayJs ?? new Date().getDay();
  customs
    .filter((c) => !c.repeat || c.repeat.length === 0 || c.repeat.includes(jsDay))
    .forEach((c, i) => {
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
  { id: "hair_purple", name: "Tóc tím mộng mơ", color: "#9c8ce8" },
  { id: "hair_mint", name: "Tóc xanh bạc hà", color: "#5fd0b0" },
];

export const SHIRT_COLORS: { id: string; name: string; color: string }[] = [
  { id: "shirt_default", name: "Áo lá xanh", color: "#58b84e" },
  { id: "shirt_yellow", name: "Áo vàng nắng", color: "#f2b33d" },
  { id: "shirt_red", name: "Áo đỏ dưa hấu", color: "#e85a5a" },
  { id: "shirt_sky", name: "Áo xanh da trời", color: "#4fb8e8" },
  { id: "shirt_purple", name: "Áo tím hoa cà", color: "#9c8ce8" },
  { id: "shirt_orange", name: "Áo cam sành", color: "#ff8c2e" },
];

export const HATS: { id: string; name: string }[] = [
  { id: "hat_none", name: "Không đội mũ" },
  { id: "hat_frog", name: "Mũ ếch" },
  { id: "hat_orange", name: "Mũ cam" },
  { id: "hat_crown", name: "Vương miện" },
  { id: "hat_wizard", name: "Mũ phù thuỷ" },
  { id: "hat_ribbon", name: "Nơ bướm" },
];

export function colorOf(list: { id: string; color: string }[], id: string, fallback: string): string {
  return list.find((x) => x.id === id)?.color ?? fallback;
}

/* ---------- shop ---------- */

export const SHOP: ShopItem[] = [
  // ---- vật phẩm tiêu hao ----
  { id: "fertilizer", name: "Phân bón thần kỳ", desc: `+25% tỉ lệ rơi berry trong ${FERT_CHARGES} lần tưới tới`, cost: 25, icon: "fertilizer", kind: "consumable" },
  { id: "freeze", name: "Băng bảo vệ", desc: "Giữ nguyên streak nếu lỡ một ngày chưa xong nhiệm vụ", cost: 40, icon: "snow", kind: "consumable" },
  { id: "charm", name: "Bùa may mắn", desc: "Trong 3 lần tưới tới: +15% rơi berry và +10% crit", cost: 35, icon: "charm", kind: "consumable" },
  { id: "candy", name: "Kẹo ngọt", desc: "Bé Cam ăn kẹo và hoàn thành ngay 1 nhiệm vụ chưa xong hôm nay", cost: 30, icon: "candy", kind: "consumable" },
  // ---- trang trí vườn ----
  { id: "decor_mushrooms", name: "Nấm xinh", desc: "Khóm nấm đỏ lấm tấm trong vườn", cost: 30, icon: "mushroom", kind: "decor" },
  { id: "decor_lantern", name: "Đèn vườn", desc: "Ngọn đèn ấm áp lấp lánh về chiều", cost: 45, icon: "lantern", kind: "decor" },
  { id: "decor_flowers", name: "Khóm hoa", desc: "Hoa cúc hoạ mi ven lối đất", cost: 50, icon: "flower", kind: "decor" },
  { id: "decor_pond", name: "Hồ cá koi", desc: "Hồ nước trong veo với mấy chú cá koi lượn lờ", cost: 80, icon: "pond", kind: "decor" },
  { id: "decor_scarecrow", name: "Bù nhìn vui vẻ", desc: "Anh bù nhìn canh vườn, xua chim và cả nỗi buồn", cost: 55, icon: "scarecrow", kind: "decor" },
  { id: "decor_swing", name: "Xích đu gỗ", desc: "Chiếc xích đu đung đưa dưới tán cây", cost: 70, icon: "swing", kind: "decor" },
  { id: "decor_fence", name: "Hàng rào gỗ", desc: "Hàng rào bao quanh khu vườn nhỏ", cost: 60, icon: "fence", kind: "decor" },
  // ---- diện mạo: tóc ----
  { id: "hair_orange", name: "Tóc cam", desc: "Đổi màu tóc cho bé Cam", cost: 40, icon: "hat", kind: "skin", slot: "hair", color: "#e8751a" },
  { id: "hair_blue", name: "Tóc xanh biển", desc: "Đổi màu tóc cho bé Cam", cost: 45, icon: "hat", kind: "skin", slot: "hair", color: "#3e7bc0" },
  { id: "hair_pink", name: "Tóc hồng", desc: "Đổi màu tóc cho bé Cam", cost: 45, icon: "hat", kind: "skin", slot: "hair", color: "#e86fa0" },
  { id: "hair_purple", name: "Tóc tím mộng mơ", desc: "Đổi màu tóc cho bé Cam", cost: 50, icon: "hat", kind: "skin", slot: "hair", color: "#9c8ce8" },
  { id: "hair_mint", name: "Tóc xanh bạc hà", desc: "Đổi màu tóc cho bé Cam", cost: 50, icon: "hat", kind: "skin", slot: "hair", color: "#5fd0b0" },
  // ---- diện mạo: áo ----
  { id: "shirt_yellow", name: "Áo vàng nắng", desc: "Áo mới cho bé Cam", cost: 40, icon: "shirt", kind: "skin", slot: "shirt", color: "#f2b33d" },
  { id: "shirt_red", name: "Áo đỏ dưa hấu", desc: "Áo mới cho bé Cam", cost: 40, icon: "shirt", kind: "skin", slot: "shirt", color: "#e85a5a" },
  { id: "shirt_sky", name: "Áo xanh da trời", desc: "Áo mới cho bé Cam", cost: 40, icon: "shirt", kind: "skin", slot: "shirt", color: "#4fb8e8" },
  { id: "shirt_purple", name: "Áo tím hoa cà", desc: "Áo mới cho bé Cam", cost: 45, icon: "shirt", kind: "skin", slot: "shirt", color: "#9c8ce8" },
  { id: "shirt_orange", name: "Áo cam sành", desc: "Áo ton-sur-ton với cây cam", cost: 45, icon: "shirt", kind: "skin", slot: "shirt", color: "#ff8c2e" },
  // ---- diện mạo: mũ ----
  { id: "hat_frog", name: "Mũ ếch", desc: "Chiếc mũ ếch có hai mắt lồi siêu cute", cost: 60, icon: "frog", kind: "skin", slot: "hat" },
  { id: "hat_orange", name: "Mũ cam", desc: "Mũ len hình quả cam có lá", cost: 50, icon: "citrus", kind: "skin", slot: "hat" },
  { id: "hat_crown", name: "Vương miện", desc: "Bé Cam là hoàng tộc của khu vườn này", cost: 120, icon: "crown", kind: "skin", slot: "hat" },
  { id: "hat_wizard", name: "Mũ phù thuỷ", desc: "Mũ chóp nhọn đầy sao, biết đâu có phép màu", cost: 90, icon: "wizard", kind: "skin", slot: "hat" },
  { id: "hat_ribbon", name: "Nơ bướm", desc: "Chiếc nơ xinh xắn buộc lệch một bên", cost: 45, icon: "ribbon", kind: "skin", slot: "hat" },
];

export const DECOR_FLAGS = ["decor_fence", "decor_lantern", "decor_mushrooms", "decor_flowers", "decor_pond", "decor_scarecrow", "decor_swing"] as const;

export function randInt(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

/** Sinh danh sách loại quả cho một lứa (đảm bảo ít nhất 1 quả thường). */
export function generateFruitManifest(count: number): FruitType[] {
  const m: FruitType[] = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    if (roll < GIANT_CHANCE) m.push("giant");
    else if (roll < GIANT_CHANCE + GIFT_CHANCE) m.push("gift");
    else m.push("normal");
  }
  // đảm bảo không phải tất cả đều đặc biệt (luôn có quả thường)
  if (m.length > 1 && m.every((t) => t !== "normal")) {
    const arr: FruitType[] = [...m];
    arr[0] = "normal";
    return arr;
  }
  return m;
}

/** Rút một phần thưởng từ hộp quà bí ẩn (theo trọng số). */
export function rollGift(): GiftReward {
  const total = GIFT_TABLE.reduce((s, g) => s + g.w, 0);
  let r = Math.random() * total;
  for (const g of GIFT_TABLE) {
    r -= g.w;
    if (r <= 0) return g;
  }
  return GIFT_TABLE[0];
}
