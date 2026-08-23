import { useCallback, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { FileText, Type, PenLine, Download, ChevronLeft, ChevronRight, Upload, ShieldCheck } from "lucide-react";
import { loadPdf } from "./lib/pdf-render";
import { exportPdf } from "./lib/pdf-export";
import PdfCanvas from "./components/PdfCanvas";
import SignaturePad from "./components/SignaturePad";
import type { PlacedElement } from "./types";

type Tool = "none" | "text" | "signature";

export default function App() {
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [tool, setTool] = useState<Tool>("none");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<{ dataUrl: string; aspectRatio: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFile = useCallback(async (file: File) => {
    const bytes = await file.arrayBuffer();
    // pdfjs detaches/transfers the buffer it's given, but pdf-lib needs its
    // own untouched copy at export time — keep a pristine clone for export.
    const exportCopy = bytes.slice(0);
    const pdfDoc = await loadPdf(bytes);
    setFileBytes(exportCopy);
    setFileName(file.name);
    setDoc(pdfDoc);
    setPageCount(pdfDoc.numPages);
    setPageNumber(1);
    setElements([]);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") openFile(file);
  }

  function handlePlace(xFrac: number, yFrac: number) {
    if (tool === "text") {
      const id = crypto.randomUUID();
      setElements((prev) => [
        ...prev,
        {
          id,
          page: pageNumber,
          type: "text",
          xFrac,
          yFrac,
          widthFrac: 0.28,
          heightFrac: 0.035,
          text: "",
          fontSizePt: 16,
          color: "#111111",
        },
      ]);
      setTool("none");
    } else if (tool === "signature" && pendingSignature) {
      const id = crypto.randomUUID();
      const widthFrac = 0.24;
      setElements((prev) => [
        ...prev,
        {
          id,
          page: pageNumber,
          type: "signature",
          xFrac,
          yFrac,
          widthFrac,
          heightFrac: widthFrac / pendingSignature.aspectRatio,
          imageDataUrl: pendingSignature.dataUrl,
        },
      ]);
      setTool("none");
      setPendingSignature(null);
    }
  }

  function updateElement(id: string, patch: Partial<PlacedElement>) {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((el) => el.id !== id));
  }

  async function handleDownload() {
    if (!fileBytes) return;
    setExporting(true);
    try {
      const outBytes = await exportPdf(fileBytes, elements);
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(/\.pdf$/i, "") + "-signed.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const currentPageElements = elements.filter((el) => el.page === pageNumber);

  if (!doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText size={28} />
          <h1 className="font-heading text-2xl font-bold text-foreground">PdfSist</h1>
        </div>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Add text and a hand-drawn signature to any PDF. Everything happens in your
          browser — nothing is ever uploaded.
        </p>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex w-full max-w-lg cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-8 py-14 transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border bg-card/40"
          }`}
        >
          <Upload size={28} className="text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Drop a PDF here, or click to browse
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) openFile(file);
            }}
          />
        </label>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck size={13} className="text-primary" />
          Nothing you upload here ever leaves your device.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <span className="max-w-[240px] truncate font-mono text-xs text-foreground">{fileName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool(tool === "text" ? "none" : "text")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              tool === "text" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:opacity-80"
            }`}
          >
            <Type size={13} /> Text
          </button>
          <button
            onClick={() => {
              if (pendingSignature) {
                setTool(tool === "signature" ? "none" : "signature");
              } else {
                setShowSignaturePad(true);
              }
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              tool === "signature" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:opacity-80"
            }`}
          >
            <PenLine size={13} /> {pendingSignature ? "Place signature" : "Sign"}
          </button>
          {tool !== "none" && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Click on the page to place it
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              {pageNumber} / {pageCount}
            </span>
            <button
              disabled={pageNumber >= pageCount}
              onClick={() => setPageNumber((p) => Math.min(pageCount, p + 1))}
              className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download size={13} /> {exporting ? "Exporting..." : "Download"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 justify-center overflow-auto bg-background/60 p-8">
        <PdfCanvas
          doc={doc}
          pageNumber={pageNumber}
          elements={currentPageElements}
          activeTool={tool}
          pendingSignature={pendingSignature}
          onPlace={handlePlace}
          onUpdate={updateElement}
          onRemove={removeElement}
        />
      </div>

      {showSignaturePad && (
        <SignaturePad
          onCancel={() => setShowSignaturePad(false)}
          onConfirm={(dataUrl, aspectRatio) => {
            setPendingSignature({ dataUrl, aspectRatio });
            setShowSignaturePad(false);
            setTool("signature");
          }}
        />
      )}
    </div>
  );
}
