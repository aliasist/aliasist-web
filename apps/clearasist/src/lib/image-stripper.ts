/**
 * Low-level image metadata stripping (lossless where possible)
 * Focus: JPEG segment stripping + PNG chunk stripping
 */

export interface StripResult {
  cleanedBuffer: ArrayBuffer;
  removedSegments: string[]; // human-readable descriptions of what was removed
}

/**
 * Strip metadata from JPEG files by removing APP segments and COM markers.
 * This is lossless for the image data (no re-encoding).
 */
export function stripJpegMetadata(buffer: ArrayBuffer): StripResult {
  const bytes = new Uint8Array(buffer);
  const removed: string[] = [];

  if (bytes.length < 2 || bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    // Not a valid JPEG, return original
    return { cleanedBuffer: buffer, removedSegments: [] };
  }

  const output: number[] = [];
  let i = 0;

  // SOI
  output.push(bytes[i++]);
  output.push(bytes[i++]);

  while (i < bytes.length) {
    if (bytes[i] !== 0xFF) {
      output.push(bytes[i++]);
      continue;
    }

    const marker = bytes[i + 1];
    const markerStart = i;

    // Handle standalone 0xFF
    if (marker === undefined) {
      output.push(bytes[i++]);
      break;
    }

    i += 2; // skip 0xFF and marker

    // Markers that have length (2 bytes big-endian)
    const hasLength = !(
      marker === 0xD0 || marker === 0xD1 || marker === 0xD2 || marker === 0xD3 ||
      marker === 0xD4 || marker === 0xD5 || marker === 0xD6 || marker === 0xD7 ||
      marker === 0xD8 || marker === 0xD9
    );

    let segmentLength = 0;
    if (hasLength && i + 1 < bytes.length) {
      segmentLength = (bytes[i] << 8) | bytes[i + 1];
      i += 2;
    }

    const isMetadataMarker =
      marker === 0xE0 || // APP0 (JFIF)
      marker === 0xE1 || // APP1 (EXIF)
      marker === 0xE2 || // APP2 (ICC, FlashPix)
      marker === 0xE3 || // APP3
      marker === 0xE4 || // APP4
      marker === 0xE5 || // APP5
      marker === 0xE6 || // APP6
      marker === 0xE7 || // APP7
      marker === 0xE8 || // APP8
      marker === 0xE9 || // APP9
      marker === 0xEA || // APP10
      marker === 0xEB || // APP11
      marker === 0xEC || // APP12
      marker === 0xED || // APP13 (IPTC)
      marker === 0xEE || // APP14
      marker === 0xEF || // APP15
      marker === 0xFE;   // COM (comment)

    if (isMetadataMarker) {
      // Skip this entire segment
      const segmentEnd = markerStart + 2 + (hasLength ? segmentLength : 0);
      let markerName = 'Unknown APP';
      if (marker === 0xE1) markerName = 'EXIF (APP1)';
      else if (marker === 0xED) markerName = 'IPTC (APP13)';
      else if (marker === 0xE0) markerName = 'JFIF (APP0)';
      else if (marker === 0xFE) markerName = 'Comment (COM)';
      else markerName = `APP${marker - 0xE0}`;

      removed.push(markerName);
      i = segmentEnd;
      continue;
    }

    // Keep the marker and its data
    output.push(0xFF);
    output.push(marker);

    if (hasLength) {
      output.push(bytes[markerStart + 2]);
      output.push(bytes[markerStart + 3]);
      for (let j = 0; j < segmentLength - 2; j++) {
        if (markerStart + 4 + j < bytes.length) {
          output.push(bytes[markerStart + 4 + j]);
        }
      }
      i = markerStart + 2 + 2 + (segmentLength - 2);
    } else {
      // RST markers or SOI/EOI have no length
    }

    if (marker === 0xD9) {
      // EOI - end of image
      break;
    }
  }

  // If we didn't consume everything, append remaining (safety)
  while (i < bytes.length) {
    output.push(bytes[i++]);
  }

  const cleanedBuffer = new Uint8Array(output).buffer;
  return { cleanedBuffer, removedSegments: removed };
}

/**
 * Strip metadata chunks from PNG files.
 */
export function stripPngMetadata(buffer: ArrayBuffer): StripResult {
  const bytes = new Uint8Array(buffer);
  const removed: string[] = [];

  if (bytes.length < 8) {
    return { cleanedBuffer: buffer, removedSegments: [] };
  }

  // PNG signature
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== pngSignature[i]) {
      return { cleanedBuffer: buffer, removedSegments: [] };
    }
  }

  const output: number[] = [...pngSignature];
  let pos = 8;

  while (pos < bytes.length) {
    if (pos + 8 > bytes.length) break;

    const length = (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
    const type = String.fromCharCode(
      bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]
    );

    const isMetadataChunk =
      type === 'eXIf' || // EXIF
      type === 'iTXt' || // International text
      type === 'tEXt' || // Text
      type === 'zTXt' || // Compressed text
      type === 'tIME' || // Time
      type === 'pHYs' || // Physical pixel dimensions (sometimes considered metadata)
      type === 'cHRM' ||
      type === 'gAMA' ||
      type === 'sRGB' ||
      type === 'iCCP';   // ICC profile

    if (isMetadataChunk) {
      removed.push(`PNG ${type} chunk`);
      pos += 12 + length; // length(4) + type(4) + data + crc(4)
      continue;
    }

    // Keep the chunk
    for (let j = 0; j < 12 + length; j++) {
      if (pos + j < bytes.length) {
        output.push(bytes[pos + j]);
      }
    }
    pos += 12 + length;
  }

  const cleanedBuffer = new Uint8Array(output).buffer;
  return { cleanedBuffer, removedSegments: removed };
}

/**
 * Main entry point for stripping metadata from supported image types.
 */
export function stripImageMetadata(file: File): Promise<StripResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;

      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        try {
          const result = stripJpegMetadata(buffer);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      } else if (file.type === 'image/png') {
        try {
          const result = stripPngMetadata(buffer);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      } else {
        // Fallback for WebP / other formats: use canvas (not ideal but works)
        stripViaCanvasFallback(file)
          .then(blob => blob.arrayBuffer())
          .then(buffer => resolve({ cleanedBuffer: buffer, removedSegments: ['Metadata stripped via re-encoding (fallback)'] }))
          .catch(reject);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function stripViaCanvasFallback(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context failed'));
        return;
      }
      ctx.drawImage(img, 0, 0);

      const outputType = file.type.startsWith('image/') ? file.type : 'image/jpeg';
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('toBlob failed'));
      }, outputType, 0.92);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };

    img.src = url;
  });
}
