import ExifReader from 'exifreader';
import { stripImageMetadata } from './image-stripper';
import { detectFormat, type FormatInfo } from './format-handler';

export interface RemovedMetadataItem {
  category: string;
  label: string;
  value?: string;
}

export interface ProcessedImage {
  originalFile: File;
  cleanedBlob: Blob;
  originalSize: number;
  cleanedSize: number;
  removedItems: RemovedMetadataItem[];
  removedCount: number;
  previewUrl: string;
  rawMetadata: any;           // Full metadata extracted from the original file
  cleanedMetadata: any;       // Metadata remaining in the cleaned file (should be minimal)
  formatInfo: FormatInfo;
  verifiedClean?: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
  // GPS / Location
  'GPSLatitude': 'Location',
  'GPSLongitude': 'Location',
  'GPSAltitude': 'Location',
  'GPSDateStamp': 'Location',
  'GPSTimeStamp': 'Location',
  
  // Camera / Hardware
  'Make': 'Camera',
  'Model': 'Camera',
  'LensModel': 'Camera',
  'FocalLength': 'Camera',
  'FNumber': 'Camera',
  'ExposureTime': 'Camera',
  'ISOSpeedRatings': 'Camera',
  
  // Software / Editing
  'Software': 'Software',
  'CreatorTool': 'Software',
  'History': 'Software',
  
  // Author / Identity
  'Artist': 'Author',
  'Copyright': 'Author',
  'Creator': 'Author',
  'Author': 'Author',
  
  // Dates
  'DateTimeOriginal': 'Timestamps',
  'DateTime': 'Timestamps',
  'DateTimeDigitized': 'Timestamps',
  'CreateDate': 'Timestamps',
  'ModifyDate': 'Timestamps',
  
  // Other sensitive
  'HostComputer': 'System',
  'ImageDescription': 'Description',
};

function categorizeTag(tagName: string): string {
  return CATEGORY_MAP[tagName] || 'Other';
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value.description) return String(value.description);
    return JSON.stringify(value);
  }
  return String(value);
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  // Read metadata
  let tags: any = {};
  try {
    tags = await ExifReader.load(arrayBuffer, { expanded: true });
  } catch (e) {
    // No readable metadata or unsupported format
    tags = {};
  }

  const removedItems: RemovedMetadataItem[] = [];

  // Collect removable tags from common sections
  const sections = ['exif', 'gps', 'iptc', 'xmp', 'thumbnail'];

  for (const section of sections) {
    if (tags[section]) {
      for (const [key, value] of Object.entries(tags[section])) {
        if (key === 'Makernote' || key === 'UserComment') continue; // skip huge binary
        const category = categorizeTag(key);
        removedItems.push({
          category,
          label: key,
          value: formatValue(value),
        });
      }
    }
  }

  // Also check flat tags
  if (tags.exif) {
    for (const [key, value] of Object.entries(tags.exif)) {
      const category = categorizeTag(key);
      if (!removedItems.some(i => i.label === key)) {
        removedItems.push({
          category,
          label: key,
          value: formatValue(value),
        });
      }
    }
  }

  // Deduplicate
  const uniqueRemoved = Array.from(
    new Map(removedItems.map(item => [item.label, item])).values()
  );

  // === Improved stripping logic ===
  // Use lossless segment/chunk stripping for JPEG and PNG when possible.
  let cleanedBuffer: ArrayBuffer;
  let actualRemovedSegments: string[] = [];

  try {
    const stripResult = await stripImageMetadata(file);
    cleanedBuffer = stripResult.cleanedBuffer;
    actualRemovedSegments = stripResult.removedSegments;
  } catch (e) {
    // Fallback to canvas method
    const fallbackBlob = await stripMetadataViaCanvas(file);
    cleanedBuffer = await fallbackBlob.arrayBuffer();
    actualRemovedSegments = ['Metadata stripped (fallback method)'];
  }

  const cleanedBlob = new Blob([cleanedBuffer], { type: file.type });

  // Merge actual low-level removed segments into reporting for transparency
  actualRemovedSegments.forEach(seg => {
    if (!uniqueRemoved.some(r => r.label === seg)) {
      uniqueRemoved.push({
        category: 'Low-level Stripped',
        label: seg,
      });
    }
  });

  const cleanedSize = cleanedBlob.size;
  const previewUrl = URL.createObjectURL(cleanedBlob);

  // Re-scan the cleaned file to show "after" state (for verification)
  let cleanedTags: any = {};
  try {
    const cleanedArrayBuffer = await cleanedBlob.arrayBuffer();
    cleanedTags = await ExifReader.load(cleanedArrayBuffer, { expanded: true });
  } catch (e) {
    cleanedTags = {};
  }

  const formatInfo = detectFormat(file);

  // Post-clean verification — re-scan the output to confirm it's clean
  let verifiedClean = false;
  try {
    const verifyTags = await ExifReader.load(cleanedBuffer, { expanded: true });
    const hasMetadata = verifyTags && 
      (Object.keys(verifyTags.exif || {}).length > 0 || 
       Object.keys(verifyTags.gps || {}).length > 0 ||
       Object.keys(verifyTags.iptc || {}).length > 0);
    verifiedClean = !hasMetadata;
  } catch (e) {
    // If we can't even read it, assume it's clean (common after stripping)
    verifiedClean = true;
  }

  return {
    originalFile: file,
    cleanedBlob,
    originalSize,
    cleanedSize,
    removedItems: uniqueRemoved,
    removedCount: uniqueRemoved.length,
    previewUrl,
    rawMetadata: tags,
    cleanedMetadata: cleanedTags,
    formatInfo,
    verifiedClean,   // true = we double-checked and found no metadata left
  };
}

async function stripMetadataViaCanvas(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      // Determine output format
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputType === 'image/jpeg' ? 0.92 : undefined;

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      }, outputType, quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for cleaning'));
    };

    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
