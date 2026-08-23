import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { X } from "lucide-react";
import { renderPageToCanvas } from "../lib/pdf-render";
import type { PlacedElement } from "../types";

interface PdfCanvasProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  elements: PlacedElement[];
  activeTool: "none" | "text" | "signature";
  pendingSignature: { dataUrl: string; aspectRatio: number } | null;
  onPlace: (xFrac: number, yFrac: number) => void;
  onUpdate: (id: string, patch: Partial<PlacedElement>) => void;
  onRemove: (id: string) => void;
}

const PAGE_RENDER_WIDTH = 760;

export default function PdfCanvas({
  doc,
  pageNumber,
  elements,
  activeTool,
  pendingSignature,
  onPlace,
  onUpdate,
  onRemove,
}: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { canvas, widthPt, heightPt } = await renderPageToCanvas(doc, pageNumber, PAGE_RENDER_WIDTH);
      if (cancelled) return;
      const container = containerRef.current;
      if (!container) return;
      container.querySelector("canvas")?.remove();
      container.prepend(canvas);
      setPageSize({ width: widthPt, height: heightPt });
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (activeTool === "none") return;
    if (activeTool === "signature" && !pendingSignature) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const xFrac = (e.clientX - rect.left) / rect.width;
    const yFrac = (e.clientY - rect.top) / rect.height;
    onPlace(Math.min(Math.max(xFrac, 0), 1), Math.min(Math.max(yFrac, 0), 1));
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="pdf-page-shell relative mx-auto shadow-lg"
      style={{
        width: PAGE_RENDER_WIDTH,
        aspectRatio: pageSize ? `${pageSize.width} / ${pageSize.height}` : "8.5 / 11",
        cursor: activeTool !== "none" ? "crosshair" : "default",
      }}
    >
      {elements.map((el) => (
        <PlacedElementView
          key={el.id}
          element={el}
          onUpdate={(patch) => onUpdate(el.id, patch)}
          onRemove={() => onRemove(el.id)}
        />
      ))}
    </div>
  );
}

function PlacedElementView({
  element,
  onUpdate,
  onRemove,
}: {
  element: PlacedElement;
  onUpdate: (patch: Partial<PlacedElement>) => void;
  onRemove: () => void;
}) {
  const draggingRef = useRef<{ startX: number; startY: number; origXFrac: number; origYFrac: number } | null>(null);
  const [editing, setEditing] = useState(false);

  function handleDragStart(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.noDrag) return;
    e.stopPropagation();
    const parent = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    draggingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origXFrac: element.xFrac,
      origYFrac: element.yFrac,
    };
    const parentWidth = parent.width;
    const parentHeight = parent.height;

    function handleMove(ev: PointerEvent) {
      const drag = draggingRef.current;
      if (!drag) return;
      const dxFrac = (ev.clientX - drag.startX) / parentWidth;
      const dyFrac = (ev.clientY - drag.startY) / parentHeight;
      onUpdate({
        xFrac: Math.min(Math.max(drag.origXFrac + dxFrac, 0), 1 - element.widthFrac),
        yFrac: Math.min(Math.max(drag.origYFrac + dyFrac, 0), 1 - element.heightFrac),
      });
    }
    function handleUp() {
      draggingRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div
      onPointerDown={handleDragStart}
      className="group absolute cursor-move select-none"
      style={{
        left: `${element.xFrac * 100}%`,
        top: `${element.yFrac * 100}%`,
        width: `${element.widthFrac * 100}%`,
        height: `${element.heightFrac * 100}%`,
      }}
    >
      <button
        data-no-drag
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -right-2 -top-2 z-10 hidden size-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
      >
        <X size={10} />
      </button>

      {element.type === "signature" && element.imageDataUrl && (
        <img src={element.imageDataUrl} alt="Signature" className="pointer-events-none h-full w-full object-contain" draggable={false} />
      )}

      {element.type === "text" &&
        (editing ? (
          <input
            data-no-drag
            autoFocus
            value={element.text ?? ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="h-full w-full border border-dashed border-primary bg-white/90 px-1 text-[#111]"
            style={{ fontSize: `${(element.fontSizePt ?? 16) * 0.9}px` }}
          />
        ) : (
          <div
            data-no-drag
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="flex h-full w-full items-center whitespace-nowrap border border-dashed border-transparent px-1 hover:border-primary/60"
            style={{ fontSize: `${(element.fontSizePt ?? 16) * 0.9}px`, color: element.color ?? "#111111" }}
          >
            {element.text || "Double-click to edit"}
          </div>
        ))}
    </div>
  );
}
