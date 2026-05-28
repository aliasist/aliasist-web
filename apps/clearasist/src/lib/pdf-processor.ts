import { PDFDocument } from 'pdf-lib';

export interface ProcessedPdf {
  originalFile: File;
  cleanedBlob: Blob;
  originalSize: number;
  cleanedSize: number;
  removedItems: { label: string; value?: string }[];
  removedCount: number;
}

/**
 * More thorough client-side PDF metadata stripping using pdf-lib's proper API.
 */
export async function processPdf(file: File): Promise<ProcessedPdf> {
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const removed: { label: string; value?: string }[] = [];

  // Helper to safely get and clear metadata fields
  const clearField = (getter: () => any, setter: (val: string) => void, label: string) => {
    try {
      const value = getter();
      if (value) {
        removed.push({ label, value: String(value) });
        setter('');
      }
    } catch (_) {}
  };

  // Clear standard metadata fields using pdf-lib's typed methods
  clearField(() => pdfDoc.getTitle(), (v) => pdfDoc.setTitle(v), 'Title');
  clearField(() => pdfDoc.getAuthor(), (v) => pdfDoc.setAuthor(v), 'Author');
  clearField(() => pdfDoc.getSubject(), (v) => pdfDoc.setSubject(v), 'Subject');
  clearField(() => pdfDoc.getKeywords(), (v) => pdfDoc.setKeywords(v ? [v] : []), 'Keywords');
  clearField(() => pdfDoc.getCreator(), (v) => pdfDoc.setCreator(v), 'Creator');
  clearField(() => pdfDoc.getProducer(), (v) => pdfDoc.setProducer(v), 'Producer');
  clearField(() => pdfDoc.getCreationDate(), (v) => pdfDoc.setCreationDate(v as any), 'CreationDate');
  clearField(() => pdfDoc.getModificationDate(), (v) => pdfDoc.setModificationDate(v as any), 'ModDate');

  // Save the cleaned PDF
  const cleanedBytes = await pdfDoc.save({
    useObjectStreams: true,
  });

  const cleanedBlob = new Blob([new Uint8Array(cleanedBytes)], { type: 'application/pdf' });

  return {
    originalFile: file,
    cleanedBlob,
    originalSize,
    cleanedSize: cleanedBlob.size,
    removedItems: removed,
    removedCount: removed.length,
  };
}
