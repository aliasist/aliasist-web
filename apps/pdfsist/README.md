# PdfSist

**PdfSist** is a privacy-first PDF editing and signing tool. Drop in a PDF, add
typed text and a hand-drawn (or typed) signature, and download the result —
entirely in your browser. Nothing is ever uploaded to a server.

Part of the **[Aliasist](https://aliasist.com)** suite, alongside
[Clearasist](../clearasist) (the sibling privacy tool this scaffold follows).

## How it works

1. Drop a PDF in the browser. It's parsed and rendered locally with `pdfjs-dist` — never sent anywhere.
2. Add text boxes (click to place, double-click to edit, drag to reposition) and a signature (draw with mouse/touch, or type your name in a signature font).
3. Download flattens every placed element into the original PDF with `pdf-lib` and triggers a local file download.

## Project structure

- `src/App.tsx` — dropzone + toolbar + page navigation
- `src/components/PdfCanvas.tsx` — renders the current page and the draggable/editable overlay elements on it
- `src/components/SignaturePad.tsx` — draw or type a signature, exported as a transparent PNG
- `src/lib/pdf-render.ts` — `pdfjs-dist` wrapper (page rendering)
- `src/lib/pdf-export.ts` — `pdf-lib` wrapper (flattens placed elements into the PDF)
- `src/types.ts` — the `PlacedElement` shape shared between the canvas, the pad, and export

## Local development

```bash
cd apps/pdfsist
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech stack

- React + Vite + TypeScript + Tailwind
- `pdfjs-dist` — in-browser PDF rendering
- `pdf-lib` — in-browser PDF editing/export

## Scope notes

This is a v1: text annotations + signature placement, not true PDF content
editing (rewriting existing text/vector content in place) or AcroForm
field-filling. Both are reasonable next steps if this needs to grow.
