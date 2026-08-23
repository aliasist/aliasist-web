import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PlacedElement } from "../types";

function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) ?? [];
  const r = parseInt(m[1] ?? "00", 16) / 255;
  const g = parseInt(m[2] ?? "00", 16) / 255;
  const b = parseInt(m[3] ?? "00", 16) / 255;
  return { r, g, b };
}

/** Flattens placed text/signature elements onto the original PDF and returns the resulting bytes. */
export async function exportPdf(
  originalBytes: ArrayBuffer,
  elements: PlacedElement[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  // Cache embedded signature images by data URL — the same signature is
  // often placed on multiple pages/spots.
  const signatureImageCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedPng>>>();

  for (const el of elements) {
    const page = pages[el.page - 1];
    if (!page) continue;
    const { width: pageWidthPt, height: pageHeightPt } = page.getSize();

    if (el.type === "text" && el.text) {
      const fontSize = el.fontSizePt ?? 16;
      const { r, g, b } = hexToRgb01(el.color ?? "#111111");
      const x = el.xFrac * pageWidthPt;
      // yFrac is the top of the box in top-left-origin fractional coords;
      // pdf-lib's y is the text baseline in bottom-left-origin points.
      const y = pageHeightPt - el.yFrac * pageHeightPt - fontSize;
      page.drawText(el.text, { x, y, size: fontSize, font, color: rgb(r, g, b) });
    }

    if (el.type === "signature" && el.imageDataUrl) {
      let image = signatureImageCache.get(el.imageDataUrl);
      if (!image) {
        const pngBytes = dataUrlToUint8Array(el.imageDataUrl);
        image = await pdfDoc.embedPng(pngBytes);
        signatureImageCache.set(el.imageDataUrl, image);
      }
      const widthPt = el.widthFrac * pageWidthPt;
      const heightPt = el.heightFrac * pageHeightPt;
      const x = el.xFrac * pageWidthPt;
      const y = pageHeightPt - el.yFrac * pageHeightPt - heightPt;
      page.drawImage(image, { x, y, width: widthPt, height: heightPt });
    }
  }

  return pdfDoc.save();
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
