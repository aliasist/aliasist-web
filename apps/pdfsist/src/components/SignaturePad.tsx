import { useEffect, useRef, useState } from "react";
import { X, RotateCcw, Check } from "lucide-react";

interface SignaturePadProps {
  onCancel: () => void;
  onConfirm: (dataUrl: string, aspectRatio: number) => void;
}

const PAD_WIDTH = 560;
const PAD_HEIGHT = 220;

export default function SignaturePad({ onCancel, onConfirm }: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasStrokeRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
  }, [mode]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const point = getPoint(e);
    const last = lastPointRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      hasStrokeRef.current = true;
    }
    lastPointRef.current = point;
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function clearDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
  }

  function confirm() {
    if (mode === "draw") {
      if (!hasStrokeRef.current) return;
      const dataUrl = canvasRef.current!.toDataURL("image/png");
      onConfirm(dataUrl, PAD_WIDTH / PAD_HEIGHT);
      return;
    }

    // Typed mode — render the name in the signature font onto an offscreen
    // transparent canvas so it exports the same way a drawn signature does.
    if (!typedName.trim()) return;
    const canvas = document.createElement("canvas");
    canvas.width = PAD_WIDTH * 2;
    canvas.height = PAD_HEIGHT * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.font = "64px Caveat, cursive";
    ctx.fillStyle = "#111111";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(typedName.trim(), PAD_WIDTH / 2, PAD_HEIGHT / 2);
    onConfirm(canvas.toDataURL("image/png"), PAD_WIDTH / PAD_HEIGHT);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-heading text-sm font-semibold text-foreground">Add your signature</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-3">
          {(["draw", "type"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-t-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                mode === m
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "draw" ? "Draw" : "Type"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mode === "draw" ? (
            <canvas
              ref={canvasRef}
              width={PAD_WIDTH}
              height={PAD_HEIGHT}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full touch-none rounded-md border border-dashed border-border bg-white"
              style={{ aspectRatio: `${PAD_WIDTH} / ${PAD_HEIGHT}` }}
            />
          ) : (
            <div
              className="flex w-full items-center justify-center rounded-md border border-dashed border-border bg-white"
              style={{ aspectRatio: `${PAD_WIDTH} / ${PAD_HEIGHT}` }}
            >
              <input
                autoFocus
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your name"
                className="w-4/5 bg-transparent text-center text-4xl text-[#111] outline-none"
                style={{ fontFamily: "var(--font-signature)" }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          {mode === "draw" ? (
            <button
              onClick={clearDrawing}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={13} /> Clear
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={confirm}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Check size={14} /> Use this signature
          </button>
        </div>
      </div>
    </div>
  );
}
