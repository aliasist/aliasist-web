/**
 * Format handling and support for Clearasist
 * Goal: Best possible client-side metadata removal across common formats.
 */

export type SupportedFormat = 'jpeg' | 'png' | 'webp' | 'heic' | 'heif' | 'pdf' | 'office';

export interface FormatInfo {
  format: SupportedFormat | 'unknown';
  isFullySupported: boolean;      // We have good metadata stripping
  usesFallback: boolean;          // We fall back to canvas re-encoding
  displayName: string;
  canProcess: boolean;
}

const IMAGE_MIME_MAP: Record<string, SupportedFormat> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export function detectFormat(file: File): FormatInfo {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  // Office documents
  if (
    name.endsWith('.docx') ||
    name.endsWith('.pptx') ||
    name.endsWith('.xlsx')
  ) {
    return {
      format: 'office',
      isFullySupported: false, // Current implementation is decent but not perfect
      usesFallback: false,
      displayName: 'Office Document',
      canProcess: true,
    };
  }

  // PDF
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return {
      format: 'pdf',
      isFullySupported: false,
      usesFallback: false,
      displayName: 'PDF',
      canProcess: true,
    };
  }

  // Images
  const format = IMAGE_MIME_MAP[type] || 
    (name.endsWith('.heic') ? 'heic' : 
     name.endsWith('.heif') ? 'heif' : 
     name.endsWith('.webp') ? 'webp' : 'unknown');

  if (format === 'jpeg' || format === 'png') {
    return {
      format,
      isFullySupported: true,
      usesFallback: false,
      displayName: format.toUpperCase(),
      canProcess: true,
    };
  }

  if (format === 'webp') {
    return {
      format,
      isFullySupported: false,
      usesFallback: true,
      displayName: 'WebP',
      canProcess: true,
    };
  }

  if (format === 'heic' || format === 'heif') {
    return {
      format,
      isFullySupported: false,
      usesFallback: true,
      displayName: format.toUpperCase(),
      canProcess: true,
    };
  }

  return {
    format: 'unknown',
    isFullySupported: false,
    usesFallback: true,
    displayName: 'Unknown',
    canProcess: false,
  };
}

export function getSupportedFormatsMessage(): string {
  return "Best support: JPEG, PNG • Good support: PDF, DOCX/PPTX/XLSX • Fallback: WebP, HEIC/HEIF";
}

export function shouldShowFormatWarning(formatInfo: FormatInfo): boolean {
  return formatInfo.usesFallback || !formatInfo.isFullySupported;
}

export function getFormatWarning(formatInfo: FormatInfo): string {
  if (formatInfo.format === 'heic' || formatInfo.format === 'heif') {
    return "HEIC/HEIF: Using fallback stripping. Quality may be slightly reduced.";
  }
  if (formatInfo.format === 'webp') {
    return "WebP: Using fallback stripping. Some metadata may remain.";
  }
  if (formatInfo.format === 'pdf') {
    return "PDF: Basic client-side cleaning. Deep cleaning available in future updates.";
  }
  if (formatInfo.format === 'office') {
    return "Office: Basic metadata removal. Some advanced properties may remain.";
  }
  return "";
}
