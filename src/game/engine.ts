/* Cây Cam Nhỏ — procedural canvas garden engine. All art drawn in code. */

export interface TreeLook {
  fruit: string; fruitDark: string; glow: string; leaf: string; leafLight: string;
}
export interface SkinLook { hair: string; shirt: string; hat: string | null }
export interface DecorLook { fence: boolean; lantern: boolean; mushrooms: boolean; flowers: boolean }
export interface DropInfo { amount: number; crit: boolean }

interface Particle {
  x: number; y: number; vx: number; vy: number; g: number;
  life: number; maxLife: number; size: number; color: string;
  kind: "dot" | "berry" | "spark" | "leaf" | "confetti" | "drop";
  rot: number; vr: number; bounced: number;
}

interface Floater { x: number; y: number; text: string; color: string; t: number; life: number; size: number; sub?: string }
interface Fruit { dx: number; dy: number; phase: number; picked: boolean }
interface Cloud { x: number; y: number; s: number; v: number }
interface Ring { x: number; y: number; r: number; max: number; t: number }

const FRUIT_SPOTS: [number, number][] = [
  [-0.58, -0.14], [-0.3, -0.56], [0.06, -0.3], [0.42, -0.52], [0.62, -0.04],
  [0.3, 0.18], [-0.06, 0.12], [-0.52, 0.36], [0.1, 0.42],
];

// index = level-1; cây lớn tới cấp 16 rồi giữ nguyên, chỉ thêm hào quang
const STAGE_DIMS = [
  { h: 16, w: 5, r: 0 }, { h: 30, w: 6, r: 0 }, { h: 46, w: 9, r: 27 },
  { h: 62, w: 11, r: 39 }, { h: 78, w: 13, r: 51 }, { h: 94, w: 15, r: 63 },
  { h: 110, w: 17, r: 75 }, { h: 122, w: 18, r: 83 }, { h: 132, w: 19, r: 89 },
  { h: 142, w: 20, r: 95 },
  { h: 150, w: 21, r: 101 }, { h: 157, w: 22, r: 106 }, { h: 163, w: 22, r: 110 },
  { h: 168, w: 23, r: 113 }, { h: 172, w: 23, r: 115 }, { h: 175, w: 24, r: 117 },
];

export class GardenEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W = 800; private H = 520; private u = 1;
  private raf = 0; private last = 0; private time = 0;
  private running = false;
  private groundK = 0.84;

  level = 1;
  fruit = "#ff8c2e"; fruitDark = "#c96a1e"; glowBase = "rgba(255,140,46,";
  leafA = "#3e9142"; leafB = "#58b84e";
  wilted = false;
  skin: SkinLook = { hair: "#7a4a21", shirt: "#58b84e", hat: null };
  decor: DecorLook = { fence: false, lantern: false, mushrooms: false, flowers: false };

  private fruits: Fruit[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private clouds: Cloud[] = [];
  private rings: Ring[] = [];
  private grass: { x: number; y: number; h: number; p: number; c: string }[] = [];
  private daisies: { x: number; y: number; c: string }[] = [];
  private fireflies: { t: number; s: number; p: number }[] = [];
  private butterflies = [{ t: 2.1, s: 26, yb: 0.3, c: "#ffa733" }, { t: 7.7, s: 19, yb: 0.42, c: "#9c8ce8" }];

  private chibiMode: "idle" | "water" | "celebrate" | "sleep" = "idle";
  private chibiT = 0;
  private dropTimer = 0;
  private treePulse = 0;
  private wetT = 0;
  private shake = 0;
  private blinkT = 0;
  private geom = { tx: 0, gy: 0, cx: 0, cy: 0, r: 60 };
  private wiltLeavesSpawned = false;

  onFruitPick: ((x: number, y: number) => void) | null = null;

  private onDown = (e: PointerEvent) => this.pointerDown(e);
  private onMove = (e: PointerEvent) => this.pointerMove(e);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointermove", this.onMove);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.time += dt;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
  }

  setSize(w: number, h: number, dpr: number) {
    this.W = Math.max(320, w);
    this.H = Math.max(300, h);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.u = Math.max(0.58, Math.min(1.15, Math.min(this.H / 560, this.W / 820)));
    // màn hình dọc (mobile): đẩy mặt đất lên cao để không bị UI che
    this.groundK = this.H > this.W ? 0.76 : 0.84;
    this.seedGround();
  }

  private seedGround() {
    this.grass = [];
    this.daisies = [];
    for (let i = 0; i < 70; i++) {
      this.grass.push({
        x: Math.random() * this.W,
        y: this.H * 0.66 + Math.random() * (this.H * 0.34),
        h: (6 + Math.random() * 8) * this.u,
        p: Math.random() * Math.PI * 2,
        c: Math.random() > 0.5 ? "#3e9142" : "#2e6b33",
      });
    }
    const colors = ["#fff9ea", "#ffa3a3", "#ffc46b"];
    for (let i = 0; i < 7; i++) {
      this.daisies.push({ x: Math.random() * this.W, y: this.H * this.groundK + Math.random() * (this.H - this.H * this.groundK) * 0.8, c: colors[i % 3] });
    }
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      this.clouds.push({ x: Math.random() * this.W, y: this.H * (0.08 + i * 0.07), s: (0.7 + Math.random() * 0.6) * this.u, v: 6 + i * 4 });
    }
    this.fireflies = [];
    for (let i = 0; i < 9; i++) {
      this.fireflies.push({ t: Math.random() * 10, s: 10 + Math.random() * 14, p: Math.random() * Math.PI * 2 });
    }
  }

  /* ---------- public API ---------- */

  getView(): { w: number; h: number; u: number; tx: number; ty: number; r: number } {
    return {
      w: this.W, h: this.H, u: this.u,
      tx: this.geom.cx, ty: this.geom.cy, r: this.geom.r,
    };
  }

  setTree(def: TreeLook) {
    this.fruit = def.fruit; this.fruitDark = def.fruitDark; this.glowBase = def.glow;
    this.leafA = def.leaf; this.leafB = def.leafLight;
  }

  setLevel(level: number) {
    this.level = level;
    if (level < 10) this.fruits = [];
  }

  unpickedCount(): number {
    return this.fruits.filter((f) => !f.picked).length;
  }

  syncFruits(remaining: number, count: number) {
    if (this.fruits.length !== count) {
      this.fruits = FRUIT_SPOTS.slice(0, count).map((s, i) => ({ dx: s[0], dy: s[1], phase: i * 0.9, picked: false }));
    }
    const pickedCount = count - remaining;
    this.fruits.forEach((f, i) => { f.picked = i < pickedCount; });
  }

  setWilted(w: boolean) {
    if (w && !this.wilted) this.wiltLeavesSpawned = false;
    this.wilted = w;
  }

  setSkin(s: SkinLook) { this.skin = s; }
  setDecor(d: DecorLook) { this.decor = d; }

  water() {
    this.chibiMode = "water";
    this.chibiT = 1.7;
    this.dropTimer = 0;
    this.treePulse = 1;
    this.wetT = 1;
  }

  spawnXpFloater(xp: number, capped: boolean) {
    const g = this.geom;
    this.floaters.push({
      x: g.cx + 30 * this.u, y: g.cy - 10 * this.u,
      text: `+${xp} KN`, color: capped ? "#ead3a3" : "#cdf0b4",
      t: 0, life: 1.25, size: capped ? 15 : 19,
      sub: capped ? "đã chạm trần ngày" : undefined,
    });
  }

  spawnBerryBurst(drop: DropInfo) {
    const g = this.geom;
    const n = drop.crit ? 18 : 9;
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: g.cx + (Math.random() - 0.5) * g.r * 0.8, y: g.cy + (Math.random() - 0.5) * g.r * 0.5,
        vx: (Math.random() - 0.5) * 240 * this.u, vy: -(80 + Math.random() * 160) * this.u,
        g: 620 * this.u, life: 0, maxLife: 1.6, size: (3.5 + Math.random() * 2.5) * this.u,
        color: Math.random() > 0.35 ? "#7b68d9" : "#9c8ce8", kind: "berry",
        rot: 0, vr: 0, bounced: 0,
      });
    }
    if (drop.crit) {
      this.shake = 7;
      for (let i = 0; i < 14; i++) this.sparkAt(g.cx, g.cy, "#ffd93d");
    }
    this.floaters.push({
      x: g.cx - 40 * this.u, y: g.cy + g.r * 0.2,
      text: drop.crit ? `+${drop.amount} CRIT!` : `+${drop.amount}`,
      color: drop.crit ? "#ffd93d" : "#c0b5f2",
      t: 0, life: 1.4, size: drop.crit ? 24 : 18,
      sub: "berry",
    });
  }

  sparkAt(x: number, y: number, color: string) {
    this.particles.push({
      x, y, vx: (Math.random() - 0.5) * 260 * this.u, vy: (Math.random() - 0.8) * 220 * this.u,
      g: 300 * this.u, life: 0, maxLife: 0.9, size: (3 + Math.random() * 3) * this.u,
      color, kind: "spark", rot: Math.random() * 3, vr: (Math.random() - 0.5) * 10, bounced: 0,
    });
  }

  levelUpFx() {
    const g = this.geom;
    this.rings.push({ x: g.cx, y: g.cy, r: 8 * this.u, max: 150 * this.u, t: 0 });
    this.shake = 4;
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: g.cx + (Math.random() - 0.5) * g.r, y: g.cy + (Math.random() - 0.5) * g.r * 0.6,
        vx: (Math.random() - 0.5) * 180 * this.u, vy: -(60 + Math.random() * 140) * this.u,
        g: 260 * this.u, life: 0, maxLife: 1.4, size: (4 + Math.random() * 3) * this.u,
        color: Math.random() > 0.5 ? "#7acb5f" : "#a5dd8a", kind: "leaf",
        rot: Math.random() * 3, vr: (Math.random() - 0.5) * 8, bounced: 0,
      });
    }
  }

  ripeFx() {
    const g = this.geom;
    this.rings.push({ x: g.cx, y: g.cy, r: 10 * this.u, max: 190 * this.u, t: 0 });
    for (let i = 0; i < 20; i++) this.sparkAt(g.cx + (Math.random() - 0.5) * g.r, g.cy + (Math.random() - 0.5) * g.r, "#ffd93d");
  }

  celebrate() {
    this.chibiMode = "celebrate";
    this.chibiT = 2.2;
    this.shake = 6;
    const g = this.geom;
    const colors = ["#ff8c2e", "#ffd93d", "#7acb5f", "#9c8ce8", "#fff3dc"];
    for (let i = 0; i < 42; i++) {
      this.particles.push({
        x: g.cx + (Math.random() - 0.5) * g.r, y: g.cy,
        vx: (Math.random() - 0.5) * 380 * this.u, vy: -(120 + Math.random() * 260) * this.u,
        g: 420 * this.u, life: 0, maxLife: 1.8, size: (3 + Math.random() * 4) * this.u,
        color: colors[i % colors.length], kind: "confetti",
        rot: Math.random() * 3, vr: (Math.random() - 0.5) * 14, bounced: 0,
      });
    }
    this.rings.push({ x: g.cx, y: g.cy, r: 12 * this.u, max: 220 * this.u, t: 0 });
  }

  floatText(x: number, y: number, text: string, color: string, big = false) {
    this.floaters.push({ x, y: y - 14, text, color, t: 0, life: 1.1, size: big ? 22 : 16, sub: "berry" });
  }

  /* ---------- input ---------- */

  private toLocal(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private pointerDown(e: PointerEvent) {
    if (this.level < 10 || this.fruits.length === 0) return;
    const { x, y } = this.toLocal(e);
    const g = this.geom;
    for (const f of this.fruits) {
      if (f.picked) continue;
      const fx = g.cx + f.dx * g.r * 0.78;
      const fy = g.cy + f.dy * g.r * 0.78;
      if (Math.hypot(x - fx, y - fy) < 19 * this.u) {
        f.picked = true;
        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: fx, y: fy, vx: (Math.random() - 0.5) * 240 * this.u, vy: -(40 + Math.random() * 160) * this.u,
            g: 500 * this.u, life: 0, maxLife: 0.9, size: (2.5 + Math.random() * 3) * this.u,
            color: Math.random() > 0.4 ? this.fruit : "#ffd93d", kind: "dot",
            rot: 0, vr: 0, bounced: 0,
          });
        }
        this.rings.push({ x: fx, y: fy, r: 4 * this.u, max: 44 * this.u, t: 0 });
        this.onFruitPick?.(fx, fy);
        return;
      }
    }
  }

  private pointerMove(e: PointerEvent) {
    if (this.level < 10) { this.canvas.style.cursor = "default"; return; }
    const { x, y } = this.toLocal(e);
    const g = this.geom;
    let hover = false;
    for (const f of this.fruits) {
      if (f.picked) continue;
      if (Math.hypot(x - (g.cx + f.dx * g.r * 0.78), y - (g.cy + f.dy * g.r * 0.78)) < 19 * this.u) { hover = true; break; }
    }
    this.canvas.style.cursor = hover ? "pointer" : "default";
  }

  /* ---------- update ---------- */

  private update(dt: number) {
    for (const c of this.clouds) {
      c.x += c.v * dt * this.u;
      if (c.x > this.W + 90) c.x = -90;
    }
    for (const b of this.butterflies) b.t += dt;
    for (const f of this.fireflies) f.t += dt;

    this.blinkT += dt;
    if (this.blinkT > 3.4) this.blinkT = 0;

    if (this.chibiT > 0) {
      this.chibiT -= dt;
      if (this.chibiMode === "water") {
        this.dropTimer -= dt;
        if (this.dropTimer <= 0 && this.chibiT > 0.35) {
          this.dropTimer = 0.045;
          const g = this.geom;
          const sx = g.tx + 96 * this.u, sy = g.gy - 46 * this.u;
          this.particles.push({
            x: sx, y: sy, vx: -(30 + Math.random() * 70) * this.u, vy: -(70 + Math.random() * 90) * this.u,
            g: 520 * this.u, life: 0, maxLife: 1.1, size: (2 + Math.random() * 1.8) * this.u,
            color: "#7ed3f2", kind: "drop", rot: 0, vr: 0, bounced: 0,
          });
        }
      }
      if (this.chibiT <= 0) this.chibiMode = "idle";
    }

    if (this.wilted && !this.wiltLeavesSpawned) {
      this.wiltLeavesSpawned = true;
      const g = this.geom;
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: g.cx + (Math.random() - 0.5) * g.r, y: g.cy,
          vx: (Math.random() - 0.5) * 40 * this.u, vy: 30 * this.u,
          g: 60 * this.u, life: 0, maxLife: 2.2, size: 4 * this.u,
          color: "#c68d52", kind: "leaf", rot: Math.random() * 3, vr: 3, bounced: 0,
        });
      }
    }

    this.treePulse = Math.max(0, this.treePulse - dt * 1.4);
    this.wetT = Math.max(0, this.wetT - dt * 0.25);
    this.shake = Math.max(0, this.shake - dt * 14);

    this.particles = this.particles.filter((p) => {
      p.life += dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const groundY = this.H * (this.groundK + 0.02);
      if (p.kind === "berry" && p.y > groundY && p.vy > 0 && p.bounced < 2) {
        p.vy *= -0.45; p.vx *= 0.7; p.y = groundY; p.bounced++;
      }
      return p.life < p.maxLife && p.y < this.H + 40;
    });
    if (this.particles.length > 320) this.particles.splice(0, this.particles.length - 320);

    this.floaters = this.floaters.filter((f) => (f.t += dt) < f.life);
    this.rings = this.rings.filter((r) => (r.t += dt * 1.6) < 1);
  }

  /* ---------- draw ---------- */

  private draw() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    this.drawSky();
    this.drawClouds();
    this.drawHills();
    if (this.decor.fence) this.drawFence();
    this.drawGround();
    if (this.decor.mushrooms) this.drawMushrooms();
    if (this.decor.flowers) this.drawFlowerBed();

    const gy = H * this.groundK;
    const tx = W * 0.4;
    const dim = STAGE_DIMS[Math.min(STAGE_DIMS.length - 1, Math.max(0, this.level - 1))];
    const sway = Math.sin(this.time * 1.3) * 2.4 * this.u * (Math.min(this.level, 16) / 10 + 0.25);
    const pulse = 1 + this.treePulse * 0.045;
    const r = dim.r * this.u * pulse * (this.wilted ? 0.965 : 1);
    const cx = tx + sway;
    const cy = gy - dim.h * this.u - r * 0.5 + (this.wilted ? 5 * this.u : 0);
    this.geom = { tx, gy, cx, cy, r };

    if (this.level >= 13) this.drawAncientAura(cx, cy, r);
    this.drawTreeShadow();
    this.drawTree(tx, gy, cx, cy, r, dim.h * this.u, dim.w * this.u);
    if (this.level >= 10 && this.fruits.length > 0) this.drawFruits();
    if (this.level >= 13) this.drawFireflies();

    if (this.decor.lantern) this.drawLantern();
    this.drawChibi();
    this.drawParticles();
    this.drawRings();
    this.drawFloaters();
    ctx.restore();
  }

  private drawSky() {
    const { ctx, W, H, u } = this;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#3fa8dd");
    g.addColorStop(0.55, "#7ed3f2");
    g.addColorStop(1, "#c9f0d8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const sx = W * 0.84, sy = H * 0.16;
    const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 90 * u);
    glow.addColorStop(0, "rgba(255,217,61,0.5)");
    glow.addColorStop(1, "rgba(255,217,61,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(sx - 100 * u, sy - 100 * u, 200 * u, 200 * u);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.time * 0.08);
    ctx.fillStyle = "rgba(255,232,115,0.55)";
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(30 * u, -4 * u);
      ctx.lineTo(44 * u, 0);
      ctx.lineTo(30 * u, 4 * u);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(sx, sy, 26 * u, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd93d";
    ctx.fill();
    ctx.lineWidth = 3 * u;
    ctx.strokeStyle = "#e8a91a";
    ctx.stroke();
  }

  private drawClouds() {
    const { ctx } = this;
    for (const c of this.clouds) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.s, c.s);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.arc(20, -8, 15, 0, Math.PI * 2);
      ctx.arc(40, 0, 18, 0, Math.PI * 2);
      ctx.arc(20, 7, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawHills() {
    const { ctx, W, H } = this;
    ctx.fillStyle = "#8fd97a";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.62);
    ctx.quadraticCurveTo(W * 0.25, H * 0.48, W * 0.5, H * 0.6);
    ctx.quadraticCurveTo(W * 0.75, H * 0.7, W, H * 0.56);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#6cc25e";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.72);
    ctx.quadraticCurveTo(W * 0.3, H * 0.62, W * 0.62, H * 0.72);
    ctx.quadraticCurveTo(W * 0.85, H * 0.8, W, H * 0.68);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();
  }

  private drawGround() {
    const { ctx, W, H } = this;
    const g = ctx.createLinearGradient(0, H * 0.74, 0, H);
    g.addColorStop(0, "#58b84e");
    g.addColorStop(1, "#3e9142");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.8);
    ctx.quadraticCurveTo(W * 0.5, H * 0.74, W, H * 0.8);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#c68d52";
    ctx.beginPath();
    ctx.ellipse(this.geom.tx, H * (this.groundK + 0.035), 120 * this.u, 22 * this.u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a9713a";
    ctx.lineWidth = 2.5 * this.u;
    ctx.stroke();

    if (this.wetT > 0) {
      ctx.fillStyle = `rgba(74,48,24,${(this.wetT * 0.4).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(this.geom.tx, H * (this.groundK + 0.025), 70 * this.u, 13 * this.u, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const b of this.grass) {
      const sw = Math.sin(this.time * 1.8 + b.p) * 2.2 * this.u;
      ctx.strokeStyle = b.c;
      ctx.lineWidth = 1.6 * this.u;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.quadraticCurveTo(b.x + sw, b.y - b.h * 0.6, b.x + sw * 1.4, b.y - b.h);
      ctx.stroke();
    }
    for (const d of this.daisies) {
      ctx.fillStyle = d.c;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(d.x + Math.cos(a) * 3 * this.u, d.y + Math.sin(a) * 3 * this.u, 2.1 * this.u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f2b33d";
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.8 * this.u, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawFence() {
    const { ctx, W, H, u } = this;
    const y = H * 0.64;
    ctx.strokeStyle = "#7a4a21";
    ctx.lineWidth = 2.5 * u;
    ctx.fillStyle = "#c68d52";
    const step = 46 * u;
    for (let x = 14 * u; x < W - 10; x += step) {
      const h = 30 * u;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 7 * u, y - 9 * u);
      ctx.lineTo(x + 14 * u, y);
      ctx.lineTo(x + 14 * u, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "#a9713a";
    ctx.fillRect(0, y + 6 * u, W, 6 * u);
    ctx.fillRect(0, y + 20 * u, W, 6 * u);
  }

  private drawTreeShadow() {
    const { ctx, u } = this;
    const g = this.geom;
    ctx.fillStyle = "rgba(30,77,40,0.3)";
    ctx.beginPath();
    ctx.ellipse(g.tx, g.gy + 6 * u, (30 + Math.min(this.level, 16) * 8) * u, 10 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawAncientAura(cx: number, cy: number, r: number) {
    const { ctx, u } = this;
    const k = Math.min(1, (this.level - 12) / 4);
    const pulse = 1 + Math.sin(this.time * 1.6) * 0.05;
    const rad = r * 1.5 * pulse;
    const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, rad);
    glow.addColorStop(0, `rgba(255,217,61,${(0.28 * k).toFixed(3)})`);
    glow.addColorStop(1, "rgba(255,217,61,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    void u;
  }

  private drawFireflies() {
    const { ctx, u } = this;
    const g = this.geom;
    for (const f of this.fireflies) {
      const a = f.t * 0.7 + f.p;
      const x = g.cx + Math.cos(a) * f.s * 4 * u;
      const y = g.cy + Math.sin(a * 1.3) * f.s * 2.4 * u;
      const tw = 0.5 + Math.sin(f.t * 4 + f.p) * 0.5;
      ctx.fillStyle = `rgba(255,232,115,${(tw * 0.9).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,232,115,${(tw * 0.25).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 6 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTree(tx: number, gy: number, cx: number, cy: number, r: number, th: number, tw: number) {
    const { ctx, u } = this;
    const lvl = this.level;
    const ink = "#2e6b33";
    const bark = "#8b5a2b";
    const barkInk = "#5c3a1e";

    if (lvl <= 2) {
      ctx.fillStyle = "#a9713a";
      ctx.beginPath();
      ctx.ellipse(tx, gy, 20 * u, 8 * u, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#3e9142";
      ctx.lineWidth = 4 * u;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, gy);
      ctx.quadraticCurveTo(tx + cx - tx, gy - th * 0.6, cx, gy - th);
      ctx.stroke();
      const leaves = lvl === 1 ? 1 : 2;
      for (let i = 0; i < leaves; i++) {
        const dir = i === 0 ? -1 : 1;
        const lx = cx + dir * 8 * u, ly = gy - th + 2 * u;
        ctx.fillStyle = "#58b84e";
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2 * u;
        ctx.beginPath();
        ctx.ellipse(lx + dir * 7 * u, ly - 3 * u, 9 * u, 5 * u, dir * -0.5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      if (lvl === 1) {
        ctx.fillStyle = "#f2b33d";
        ctx.beginPath();
        ctx.arc(cx, gy - th - 3 * u, 3 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    ctx.fillStyle = bark;
    ctx.strokeStyle = barkInk;
    ctx.lineWidth = 2.6 * u;
    ctx.beginPath();
    ctx.moveTo(tx - tw, gy + 4 * u);
    ctx.quadraticCurveTo(tx - tw * 0.7, gy - th * 0.5, cx - tw * 0.45, gy - th);
    ctx.lineTo(cx + tw * 0.45, gy - th);
    ctx.quadraticCurveTo(tx + tw * 0.7, gy - th * 0.5, tx + tw, gy + 4 * u);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    if (lvl >= 6) {
      ctx.strokeStyle = bark;
      ctx.lineWidth = tw * 0.55;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, gy - th * 0.55);
      ctx.quadraticCurveTo(tx - r * 0.5, gy - th * 0.75, cx - r * 0.55, cy + r * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx, gy - th * 0.62);
      ctx.quadraticCurveTo(tx + r * 0.5, gy - th * 0.8, cx + r * 0.55, cy + r * 0.25);
      ctx.stroke();
    }

    const blobs: [number, number, number][] =
      lvl <= 3 ? [[0, 0, 1]] :
      lvl <= 5 ? [[0, 0, 1], [-0.62, 0.22, 0.68], [0.62, 0.22, 0.68]] :
      [[0, 0, 1], [-0.66, 0.2, 0.7], [0.66, 0.2, 0.7], [-0.3, -0.52, 0.62], [0.34, -0.48, 0.6]];

    ctx.lineWidth = 3 * u;
    ctx.strokeStyle = ink;
    for (const [ox, oy, s] of blobs) {
      ctx.fillStyle = this.leafA;
      ctx.beginPath();
      ctx.arc(cx + ox * r, cy + oy * r, r * s, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = this.leafB;
    ctx.beginPath();
    ctx.arc(cx - r * 0.22, cy - r * 0.28, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + r * 0.3, cy - r * 0.42, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // cổ thụ: tán ánh vàng nhẹ
    if (lvl >= 13) {
      ctx.fillStyle = `rgba(255,217,61,${Math.min(0.22, (lvl - 12) * 0.05).toFixed(3)})`;
      for (const [ox, oy, s] of blobs) {
        ctx.beginPath();
        ctx.arc(cx + ox * r, cy + oy * r, r * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (this.wilted) {
      ctx.fillStyle = "rgba(139,90,43,0.18)";
      for (const [ox, oy, s] of blobs) {
        ctx.beginPath();
        ctx.arc(cx + ox * r, cy + oy * r, r * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (lvl === 8) {
      const spots: [number, number][] = [[-0.4, -0.3], [0.25, -0.5], [0.5, 0.1], [-0.1, 0.25], [-0.55, 0.15], [0.1, -0.1], [0.45, -0.25]];
      for (const [ox, oy] of spots) {
        const fx = cx + ox * r, fy = cy + oy * r;
        ctx.fillStyle = "#fff9ea";
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + this.time * 0.2;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * 4 * u, fy + Math.sin(a) * 4 * u, 2.6 * u, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#ffd93d";
        ctx.beginPath();
        ctx.arc(fx, fy, 2.2 * u, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (lvl === 9) {
      for (let i = 0; i < 6; i++) {
        const [ox, oy] = FRUIT_SPOTS[i];
        ctx.fillStyle = "#a5dd8a";
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2 * u;
        ctx.beginPath();
        ctx.arc(cx + ox * r * 0.75, cy + oy * r * 0.75, 5.5 * u, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    }
  }

  private drawFruits() {
    const { ctx, u } = this;
    const g = this.geom;
    for (const f of this.fruits) {
      if (f.picked) continue;
      const fx = g.cx + f.dx * g.r * 0.78;
      const fy = g.cy + f.dy * g.r * 0.78 + Math.sin(this.time * 2 + f.phase) * 1.6 * u;
      const glow = ctx.createRadialGradient(fx, fy, 2, fx, fy, 26 * u);
      glow.addColorStop(0, `${this.glowBase}0.5)`);
      glow.addColorStop(1, `${this.glowBase}0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(fx - 26 * u, fy - 26 * u, 52 * u, 52 * u);

      ctx.fillStyle = this.fruit;
      ctx.strokeStyle = this.fruitDark;
      ctx.lineWidth = 2.4 * u;
      ctx.beginPath();
      ctx.arc(fx, fy, 10 * u, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(fx - 3.2 * u, fy - 3.5 * u, 2.8 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3e9142";
      ctx.beginPath();
      ctx.ellipse(fx + 3 * u, fy - 10.5 * u, 4.5 * u, 2.2 * u, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawLantern() {
    const { ctx, u } = this;
    const g = this.geom;
    const x = Math.min(this.W - 40 * u, g.tx + 185 * u);
    const y = g.gy + 8 * u;
    const flick = 0.82 + Math.sin(this.time * 7.3) * 0.08 + Math.sin(this.time * 13.1) * 0.05;
    const glow = ctx.createRadialGradient(x, y - 52 * u, 3, x, y - 52 * u, 44 * u * flick);
    glow.addColorStop(0, "rgba(255,200,90,0.55)");
    glow.addColorStop(1, "rgba(255,200,90,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 60 * u, y - 110 * u, 120 * u, 120 * u);

    ctx.strokeStyle = "#3b2412";
    ctx.lineWidth = 3 * u;
    ctx.fillStyle = "#5c3a1e";
    ctx.beginPath();
    ctx.roundRect(x - 3.5 * u, y - 46 * u, 7 * u, 46 * u, 3 * u);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffd93d";
    ctx.beginPath();
    ctx.roundRect(x - 9 * u, y - 64 * u, 18 * u, 20 * u, 4 * u);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8b5a2b";
    ctx.beginPath();
    ctx.moveTo(x - 12 * u, y - 64 * u);
    ctx.lineTo(x, y - 74 * u);
    ctx.lineTo(x + 12 * u, y - 64 * u);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  private drawMushrooms() {
    const { ctx, u } = this;
    const g = this.geom;
    const base = [{ dx: -165, s: 1 }, { dx: -142, s: 0.72 }, { dx: -182, s: 0.55 }];
    for (const m of base) {
      const x = Math.max(24 * u, g.tx + m.dx * u);
      const y = g.gy + 14 * u;
      const s = m.s * u;
      ctx.strokeStyle = "#3b2412";
      ctx.lineWidth = 2.2 * s;
      ctx.fillStyle = "#fff3dc";
      ctx.beginPath();
      ctx.roundRect(x - 5 * s, y - 14 * s, 10 * s, 14 * s, 4 * s);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e85a5a";
      ctx.beginPath();
      ctx.arc(x, y - 14 * s, 12 * s, Math.PI, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff9ea";
      ctx.beginPath();
      ctx.arc(x - 5 * s, y - 19 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.arc(x + 4 * s, y - 22 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawFlowerBed() {
    const { ctx, u } = this;
    const x = this.W * 0.12;
    const y = this.H * 0.92;
    const cols = ["#ffa3a3", "#fff9ea", "#c0b5f2", "#ffc46b"];
    for (let i = 0; i < 5; i++) {
      const fx = x + i * 22 * u;
      const sway = Math.sin(this.time * 2 + i) * 2 * u;
      ctx.strokeStyle = "#2e6b33";
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(fx, y);
      ctx.quadraticCurveTo(fx + sway, y - 12 * u, fx + sway, y - 22 * u);
      ctx.stroke();
      const c = cols[i % cols.length];
      ctx.fillStyle = c;
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(fx + sway + Math.cos(a) * 4.4 * u, y - 22 * u + Math.sin(a) * 4.4 * u, 3 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f2b33d";
      ctx.beginPath();
      ctx.arc(fx + sway, y - 22 * u, 3 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawChibi() {
    const { ctx, u } = this;
    const g = this.geom;
    const x = Math.min(this.W - 50 * u, g.tx + 150 * u);
    const mode = this.chibiMode;
    let y = g.gy + 10 * u;
    const t = this.time;

    if (mode === "celebrate") y -= Math.abs(Math.sin(t * 9)) * 16 * u;
    else if (mode === "idle") y -= Math.abs(Math.sin(t * 2.6)) * 2.6 * u;

    const ink = "#3b2412";
    ctx.lineWidth = 2.4 * u;
    ctx.strokeStyle = ink;
    ctx.lineCap = "round";

    ctx.fillStyle = "#4a6ba8";
    const legSwing = mode === "celebrate" ? Math.sin(t * 14) * 3 * u : 0;
    ctx.beginPath();
    ctx.roundRect(x - 10 * u + legSwing, y - 12 * u, 7 * u, 12 * u, 3 * u);
    ctx.roundRect(x + 3 * u - legSwing, y - 12 * u, 7 * u, 12 * u, 3 * u);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = this.skin.shirt;
    ctx.beginPath();
    ctx.roundRect(x - 13 * u, y - 30 * u, 26 * u, 20 * u, 9 * u);
    ctx.fill(); ctx.stroke();

    const headY = y - 46 * u;
    const armsUp = mode === "celebrate" || mode === "water";

    ctx.strokeStyle = ink;
    ctx.fillStyle = "#ffe3c9";
    if (mode === "water") {
      ctx.lineWidth = 5 * u;
      ctx.strokeStyle = "#ffe3c9";
      ctx.beginPath();
      ctx.moveTo(x - 11 * u, y - 26 * u);
      ctx.lineTo(x - 24 * u, y - 34 * u);
      ctx.stroke();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.4 * u;
      const tilt = Math.sin(t * 6) * 0.06 - 0.5;
      ctx.save();
      ctx.translate(x - 27 * u, y - 37 * u);
      ctx.rotate(tilt);
      ctx.fillStyle = "#9fb4c4";
      ctx.beginPath();
      ctx.roundRect(-8 * u, -6 * u, 16 * u, 12 * u, 4 * u);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8 * u, -4 * u);
      ctx.lineTo(-18 * u, -10 * u);
      ctx.lineTo(-16 * u, -4 * u);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(2 * u, -9 * u, 5 * u, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#ffe3c9";
      ctx.beginPath();
      ctx.arc(x + 14 * u, y - 24 * u, 4.4 * u, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (armsUp) {
      for (const dir of [-1, 1]) {
        ctx.lineWidth = 5 * u;
        ctx.strokeStyle = "#ffe3c9";
        ctx.beginPath();
        ctx.moveTo(x + dir * 11 * u, y - 26 * u);
        ctx.lineTo(x + dir * 20 * u, y - 40 * u - Math.sin(t * 9 + dir) * 3 * u);
        ctx.stroke();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.4 * u;
      }
    } else {
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + dir * 14.5 * u, y - 23 * u, 4.4 * u, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    }

    ctx.fillStyle = "#ffe3c9";
    ctx.beginPath();
    ctx.arc(x, headY, 17 * u, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = this.skin.hair;
    ctx.beginPath();
    ctx.arc(x, headY, 17 * u, Math.PI, 0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 9 * u, headY + 1 * u, 4.6 * u, 0, Math.PI * 2);
    ctx.arc(x, headY - 0.5 * u, 4.6 * u, 0, Math.PI * 2);
    ctx.arc(x + 9 * u, headY + 1 * u, 4.6 * u, 0, Math.PI * 2);
    ctx.fill();

    if (this.skin.hat === "hat_frog") {
      ctx.fillStyle = "#58b84e";
      ctx.beginPath();
      ctx.arc(x, headY - 6 * u, 15 * u, Math.PI, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + dir * 9 * u, headY - 19 * u, 4.6 * u, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + dir * 9 * u, headY - 19 * u, 2 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3b2412";
        ctx.beginPath();
        ctx.arc(x + dir * 9 * u, headY - 19 * u, 1 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#58b84e";
      }
    } else if (this.skin.hat === "hat_orange") {
      ctx.fillStyle = "#ff8c2e";
      ctx.beginPath();
      ctx.arc(x, headY - 5 * u, 15.5 * u, Math.PI, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, headY - 20 * u, 3.6 * u, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#3e9142";
      ctx.beginPath();
      ctx.ellipse(x + 5 * u, headY - 23 * u, 4 * u, 2 * u, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const blink = this.blinkT > 3.2 && this.blinkT < 3.35 && mode !== "sleep";
    ctx.fillStyle = ink;
    if (mode === "sleep") {
      ctx.lineWidth = 2 * u;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + dir * 6.5 * u, headY + 3 * u, 3 * u, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
      const zt = (t % 2) / 2;
      ctx.globalAlpha = 1 - zt;
      ctx.font = `800 ${Math.round(11 * u)}px "Baloo 2", sans-serif`;
      ctx.fillStyle = "#7ed3f2";
      ctx.fillText("z", x + 16 * u + zt * 6 * u, headY - 12 * u - zt * 12 * u);
      ctx.fillText("Z", x + 22 * u + zt * 8 * u, headY - 20 * u - zt * 14 * u);
      ctx.globalAlpha = 1;
    } else if (mode === "celebrate") {
      ctx.lineWidth = 2.2 * u;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + dir * 6.5 * u, headY + 3.5 * u, 3.2 * u, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, headY + 8 * u, 3.4 * u, 0, Math.PI);
      ctx.fillStyle = "#e85a5a";
      ctx.fill();
    } else if (blink) {
      ctx.lineWidth = 2 * u;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + dir * 3.5 * u, headY + 3.5 * u);
        ctx.lineTo(x + dir * 9.5 * u, headY + 3.5 * u);
        ctx.stroke();
      }
    } else {
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x + dir * 6.5 * u, headY + 3.5 * u, 2.3 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, headY + 8 * u, 2.6 * u, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,163,163,0.75)";
    ctx.beginPath();
    ctx.arc(x - 11 * u, headY + 7 * u, 2.6 * u, 0, Math.PI * 2);
    ctx.arc(x + 11 * u, headY + 7 * u, 2.6 * u, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, a);
      if (p.kind === "spark") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size * 0.25, -p.size * 0.25, p.size, 0);
        ctx.quadraticCurveTo(p.size * 0.25, p.size * 0.25, 0, p.size);
        ctx.quadraticCurveTo(-p.size * 0.25, p.size * 0.25, -p.size, 0);
        ctx.quadraticCurveTo(-p.size * 0.25, -p.size * 0.25, 0, -p.size);
        ctx.fill();
        ctx.restore();
      } else if (p.kind === "leaf") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.kind === "confetti") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
      } else if (p.kind === "berry") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "#4b3fa8";
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawRings() {
    const { ctx } = this;
    for (const r of this.rings) {
      const rr = r.r + (r.max - r.r) * r.t;
      ctx.globalAlpha = 1 - r.t;
      ctx.strokeStyle = "#cdf0b4";
      ctx.lineWidth = 4 * this.u * (1 - r.t) + 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawFloaters() {
    const { ctx, u } = this;
    for (const f of this.floaters) {
      const k = f.t / f.life;
      const y = f.y - k * 44 * u;
      ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      const size = f.size * u;
      ctx.font = `800 ${Math.round(size)}px "Baloo 2", sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = Math.max(3, size * 0.22);
      ctx.strokeStyle = "rgba(43,26,12,0.85)";
      ctx.lineJoin = "round";

      if (f.sub === "berry") {
        const w = ctx.measureText(f.text).width;
        ctx.strokeText(f.text, f.x + 8 * u, y);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x + 8 * u, y);
        ctx.beginPath();
        ctx.arc(f.x - w / 2 - 4 * u, y - size * 0.32, size * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "#7b68d9";
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#4b3fa8";
        ctx.stroke();
      } else {
        ctx.strokeText(f.text, f.x, y);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, y);
        if (f.sub) {
          ctx.font = `600 ${Math.round(size * 0.55)}px "Be Vietnam Pro", sans-serif`;
          ctx.strokeText(f.sub, f.x, y + size * 0.75);
          ctx.fillStyle = "#f7e7c3";
          ctx.fillText(f.sub, f.x, y + size * 0.75);
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }
}
