/**
 * Atomicity — simple stopwatch (no tasks, no saves, no storage).
 */
import { initIntro } from "./intro.mjs";
import { formatElapsed } from "./atomicity-core.mjs";

// The intro is a full-viewport interactive game — skip it when embedded (e.g. the
// archive-demo modal iframe) so the app boots immediately instead of blocking on it.
const embedded = window.self !== window.top;
if (!embedded) {
  await initIntro();
} else {
  document.getElementById("axIntro")?.setAttribute("hidden", "");
}

const els = {
  display: document.getElementById("display"),
  btnStart: document.getElementById("btnStart"),
  btnStop: document.getElementById("btnStop"),
  btnReset: document.getElementById("btnReset"),
};

if (!els.display || !els.btnStart || !els.btnStop || !els.btnReset) {
  throw new Error("Atomicity: missing required elements");
}

let baseMs = 0;
let runningSince = null; // performance.now()
let raf = 0;
let lastText = "";

function totalMs() {
  if (runningSince == null) return baseMs;
  return baseMs + (performance.now() - runningSince);
}

function setButtons() {
  const running = runningSince != null;
  document.body.classList.toggle("ax-running", running);
  els.btnStart.disabled = running;
  els.btnStart.setAttribute("aria-disabled", running ? "true" : "false");
  els.btnStop.disabled = !running;
  els.btnStop.setAttribute("aria-disabled", !running ? "true" : "false");
}

function paint(force = false) {
  const t = totalMs();
  const f = formatElapsed(t);
  const next = `${f.h}:${f.m}:${f.s}.${f.ms}`;
  if (force || next !== lastText) {
    els.display.textContent = next;
    lastText = next;
  }
}

function stopLoop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function loop() {
  paint();
  raf = requestAnimationFrame(loop);
}

function start() {
  if (runningSince != null) return;
  runningSince = performance.now();
  setButtons();
  stopLoop();
  raf = requestAnimationFrame(loop);
}

function stop() {
  if (runningSince == null) return;
  baseMs += performance.now() - runningSince;
  runningSince = null;
  setButtons();
  stopLoop();
  paint(true);
}

function reset() {
  baseMs = 0;
  if (runningSince != null) runningSince = performance.now();
  paint(true);
}

els.btnStart.addEventListener("click", start);
els.btnStop.addEventListener("click", stop);
els.btnReset.addEventListener("click", reset);

for (const btn of [els.btnStart, els.btnStop, els.btnReset]) {
  btn.addEventListener("pointerdown", () => {
    btn.classList.remove("ax-ripple");
    // Force reflow so repeated clicks retrigger the animation.
    void btn.offsetWidth;
    btn.classList.add("ax-ripple");
  });
  btn.addEventListener("animationend", (e) => {
    if (e.animationName === "ax-btn-ripple") btn.classList.remove("ax-ripple");
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    e.target instanceof HTMLSelectElement
  ) {
    return;
  }
  if (e.code === "Space") {
    e.preventDefault();
    if (runningSince == null) start();
    else stop();
  } else if (e.code === "KeyC" && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    reset();
  } else if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    reset();
  }
});

setButtons();
paint(true);

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  const secure = location.protocol === "http:" || location.protocol === "https:";
  if (secure) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(new URL("sw.js", window.location.href)).catch(() => {});
    });
  }
}
