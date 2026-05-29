/**
 * Flash-style interactive launch deck — plays once per browser session (sessionStorage).
 */

const STORAGE_KEY = "atomicity-intro-done";

const TOYS = [
  { id: "relay", label: "Relay", glyph: "✦", clue: "cyan relay charged" },
  { id: "core", label: "Core", glyph: "◉", clue: "reactor humming" },
  { id: "arc", label: "Arc", glyph: "⌒", clue: "orbit arc traced" },
  { id: "node", label: "Node", glyph: "⬡", clue: "hex node handshake" },
  { id: "spark", label: "Spark", glyph: "⚡", clue: "static cling!" },
  { id: "lens", label: "Lens", glyph: "◎", clue: "gravity lens focused" },
  { id: "gate", label: "Gate", glyph: "⎊", clue: "quantum gate yawning" },
  { id: "void", label: "Void", glyph: "◈", clue: "friendly void says hi" },
  { id: "pulse", label: "Pulse", glyph: "⟐", clue: "carrier wave locked" },
  { id: "dock", label: "Dock", glyph: "⏏", clue: "landing dock online" },
  { id: "seed", label: "Seed", glyph: "❋", clue: "star seed planted" },
  { id: "echo", label: "Echo", glyph: "≋", clue: "time echo detected" },
];

const BOOPS = [
  "Deck warmed up.",
  "Nice click.",
  "That button did something. Maybe.",
  "Hyperwave acknowledged.",
  "Still here? Legend.",
  "Cosmetic only. Zero telemetry.",
  "Try the orbs. Or don't. We're not your boss.",
];

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

function placeToys(container, onFound) {
  for (const t of TOYS) {
    const left = 4 + Math.random() * 52;
    const top = 8 + Math.random() * 55;
    const delay = `${(Math.random() * 4).toFixed(2)}s`;
    const dur = `${(6 + Math.random() * 8).toFixed(2)}s`;
    const b = el("button", "ax-intro-toy", `<span class="ax-intro-toy-g">${t.glyph}</span><span class="ax-intro-toy-l">${t.label}</span>`);
    b.type = "button";
    b.style.left = `${left}%`;
    b.style.top = `${top}%`;
    b.style.setProperty("--ax-drift-delay", delay);
    b.style.setProperty("--ax-drift-dur", dur);
    b.dataset.secret = t.id;
    b.addEventListener("click", () => onFound(t, b));
    container.append(b);
  }
}

export function initIntro() {
  const layer = document.getElementById("axIntro");
  const main = document.getElementById("axAppMain");
  const parallax = document.getElementById("axIntroParallax");
  const toysBox = document.getElementById("axIntroToys");
  const scoreEl = document.getElementById("axIntroScore");
  const totalEl = document.getElementById("axIntroTotal");
  const ticker = document.getElementById("axIntroTicker");
  const enter = document.getElementById("axIntroEnter");
  const skip = document.getElementById("axIntroSkip");
  const canvas = document.getElementById("axIntroFx");

  if (!layer || !main) return Promise.resolve();

  const dismissed = document.documentElement.classList.contains("ax-intro-skip");
  if (dismissed) {
    layer.hidden = true;
    layer.setAttribute("aria-hidden", "true");
    return Promise.resolve();
  }

  main.setAttribute("inert", "");
  layer.hidden = false;
  const reduced = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  if (reduced) layer.classList.add("ax-intro--reduced");
  enter?.focus();

  let found = new Set();

  const say = (msg) => {
    if (!ticker) return;
    ticker.textContent = msg;
  };

  const updateHud = () => {
    if (scoreEl) scoreEl.textContent = String(found.size);
    if (totalEl) totalEl.textContent = String(TOYS.length);
  };

  let stopFx = () => {};

  const onFound = (t, btn) => {
    if (found.has(t.id)) {
      say(`${t.label}: already tickled.`);
      btn.classList.add("ax-intro-toy--ping");
      window.setTimeout(() => btn.classList.remove("ax-intro-toy--ping"), 420);
      return;
    }
    found.add(t.id);
    btn.classList.add("ax-intro-toy--found");
    say(t.clue);
    updateHud();
    if (found.size >= TOYS.length) say("Full sweep! You're cleared for Atomicity.");
  };

  if (toysBox && !reduced) placeToys(toysBox, onFound);
  else if (toysBox) {
    toysBox.classList.add("ax-intro-toys--reduced");
    const r = el("p", "ax-intro-reduced-copy", "Motion reduced — use <strong>Enter Atomicity</strong> when ready.");
    toysBox.append(r);
  }

  updateHud();
  say("Tip: poke the floating glyphs. Or don’t.");

  /** Lightweight canvas drift — skipped when reduced motion or no canvas */
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    const parts = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.4 + Math.random() * 1.8,
      v: 0.00015 + Math.random() * 0.00035,
      a: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const r = layer.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(layer);

    let raf = 0;
    const tick = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w && h) {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.a += p.v;
          p.y += Math.sin(p.a) * 0.12;
          p.x += 0.0004;
          if (p.x > 1.05) p.x = -0.05;
          if (p.y < -0.05) p.y = 1.05;
          if (p.y > 1.05) p.y = -0.05;
          const x = p.x * w;
          const y = p.y * h;
          ctx.fillStyle = `rgba(34,211,238,${0.08 + p.s * 0.05})`;
          ctx.beginPath();
          ctx.arc(x, y, p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    stopFx = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }

  /** Parallax UFO */
  let px = 0;
  let py = 0;
  const onMove = (e) => {
    if (!parallax || reduced) return;
    const r = layer.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 28;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 22;
    px += (nx - px) * 0.08;
    py += (ny - py) * 0.08;
    parallax.style.setProperty("--ax-pdx", `${px}px`);
    parallax.style.setProperty("--ax-pdy", `${py}px`);
  };

  /** Spark burst on empty click */
  const onLayerClick = (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest(".ax-intro-toy, .ax-intro-cta, .ax-intro-header, .ax-intro-sidebar, a, button, input")) return;
    const spark = el("span", "ax-intro-spark");
    spark.style.left = `${e.clientX}px`;
    spark.style.top = `${e.clientY}px`;
    layer.append(spark);
    window.setTimeout(() => spark.remove(), 650);
  };

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* private mode */
      }
      document.documentElement.classList.add("ax-intro-skip");
      layer.hidden = true;
      layer.setAttribute("aria-hidden", "true");
      main.removeAttribute("inert");
      stopFx();
      document.removeEventListener("keydown", onKey);
      layer.removeEventListener("pointermove", onMove);
      layer.removeEventListener("click", onLayerClick);
      resolve();
    };

    const onKey = (e) => {
      if (e.code === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.code === "Space" && !layer.hidden) {
        const btn = document.activeElement?.closest?.("button");
        if (btn && layer.contains(btn)) return;
        e.preventDefault();
        say(BOOPS[(Math.random() * BOOPS.length) | 0]);
      }
    };

    layer.addEventListener("pointermove", onMove);
    layer.addEventListener("click", onLayerClick);
    document.addEventListener("keydown", onKey);
    enter?.addEventListener("click", finish);
    skip?.addEventListener("click", finish);
  });
}
