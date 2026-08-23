import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Vite-native worker wiring — avoids a separate copy step for the worker file.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export async function loadPdf(bytes: ArrayBuffer): Promise<PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  return loadingTask.promise;
}

/** Renders one page onto a fresh canvas at the given CSS-pixel width, preserving aspect ratio. */
export async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  targetWidth: number,
): Promise<{ canvas: HTMLCanvasElement; widthPt: number; heightPt: number }> {
  const page = await doc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale: scale * window.devicePixelRatio });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetWidth * (unscaledViewport.height / unscaledViewport.width)}px`;

  const context = canvas.getContext("2d")!;
  await page.render({ canvasContext: context, viewport }).promise;

  return {
    canvas,
    widthPt: unscaledViewport.width,
    heightPt: unscaledViewport.height,
  };
}
