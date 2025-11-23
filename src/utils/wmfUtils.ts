import * as WMFModule from "wmf";

// Handle different import styles (CommonJS vs ESM)
const WMF = (WMFModule as any).default || WMFModule;

const META_ESCAPE_FUNC = 1574;
const META_ESCAPE_ENHANCED_METAFILE = 0x000f;
const COMMENT_HEADER_BYTES = 34;
const COMMENT_ID_EXPECTED = 0x43464d57; // "WMFC"
const COMMENT_TYPE_EXPECTED = 0x00000001;
const COMMENT_VERSION_EXPECTED = 0x00010000;
const META_HEADER_FALLBACK_BYTES = 18;
const MAX_ESCAPE_RECORDS = 512;

export type EscapeSanitizerRecordDebugInfo = {
  recordIndex: number;
  byteCount: number;
  byteCountOffset: number;
  originalByteCount: number;
  payloadLength: number;
  originalRecordCount: number;
  originalRecordSize: number;
  originalRemainingBytes: number;
  originalTotalBytes: number;
  remainingBytes: number;
  totalBytes: number;
  expectedSum: number;
  actualSum: number;
  sumMatches: boolean;
  headerOffset: number;
};

export type EscapeSanitizerDebugInfo = {
  blockIndex: number;
  totalRecords: number;
  totalPayload: number;
  records: EscapeSanitizerRecordDebugInfo[];
};

type EscapeSanitizerDebugHook = (info: EscapeSanitizerDebugInfo) => void;

type EscapeRecordInfo = {
  byteCountOffset: number;
  headerOffset: number;
  payloadLength: number;
  originalByteCount: number;
  originalRecordCount: number;
  originalRecordSize: number;
  originalRemainingBytes: number;
  originalTotalBytes: number;
};

interface EscapeBlock {
  totalRecords: number;
  records: EscapeRecordInfo[];
}

let escapeBlockSequence = 0;

const clampRecordCount = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  return Math.min(value, MAX_ESCAPE_RECORDS);
};

const patchEscapeBlock = (
  view: DataView,
  block: EscapeBlock,
  debugHook?: EscapeSanitizerDebugHook
): number => {
  if (!block.records.length) {
    return 0;
  }

  const totalPayload = block.records.reduce((sum, record) => {
    return sum + Math.max(record.payloadLength, 0);
  }, 0);

  if (totalPayload <= 0) {
    return 0;
  }

  let processedBytes = 0;
  const debugRecords: Array<{
    byteCount: number;
    byteCountOffset: number;
    payloadLength: number;
    remainingBytes: number;
    originalByteCount: number;
    originalRecordCount: number;
    originalRecordSize: number;
    originalRemainingBytes: number;
    originalTotalBytes: number;
    headerOffset: number;
  }> = [];
  const blockIndex = escapeBlockSequence++;

  block.records.forEach((record) => {
    const payloadLength = Math.max(record.payloadLength, 0);
    const remainingBytes = Math.max(
      totalPayload - (processedBytes + payloadLength),
      0
    );
    const expectedByteCount = payloadLength + COMMENT_HEADER_BYTES;
    const clampedByteCount = Math.min(expectedByteCount, 0xffff);

    if (expectedByteCount > 0xffff) {
      console.warn(
        `[WMF] META_ESCAPE payload ${payloadLength} bytes exceeds ByteCount range; clamping to 0xFFFF`
      );
    }

    view.setUint16(record.byteCountOffset, clampedByteCount, true);

    let cursor = record.headerOffset;
    view.setUint32(cursor, COMMENT_ID_EXPECTED, true);
    cursor += 4;
    view.setUint32(cursor, COMMENT_TYPE_EXPECTED, true);
    cursor += 4;
    view.setUint32(cursor, COMMENT_VERSION_EXPECTED, true);
    cursor += 4;
    view.setUint16(cursor, 0, true);
    cursor += 2;
    view.setUint32(cursor, 0, true);
    cursor += 4;
    view.setUint32(cursor, block.totalRecords, true);
    cursor += 4;
    view.setUint32(cursor, payloadLength, true);
    cursor += 4;
    view.setUint32(cursor, remainingBytes, true);
    cursor += 4;
    view.setUint32(cursor, totalPayload, true);

    processedBytes += payloadLength;

    if (debugHook) {
      debugRecords.push({
        byteCount: clampedByteCount,
        byteCountOffset: record.byteCountOffset,
        payloadLength,
        remainingBytes,
        originalByteCount: record.originalByteCount,
        originalRecordCount: record.originalRecordCount,
        originalRecordSize: record.originalRecordSize,
        originalRemainingBytes: record.originalRemainingBytes,
        originalTotalBytes: record.originalTotalBytes,
        headerOffset: record.headerOffset,
      });
    }
  });

  if (debugHook && debugRecords.length) {
    let previousRemaining = totalPayload;
    const enrichedRecords: EscapeSanitizerRecordDebugInfo[] = debugRecords.map(
      (record, index) => {
        const expectedSum = index === 0 ? totalPayload : previousRemaining;
        const actualSum = record.payloadLength + record.remainingBytes;
        const enriched: EscapeSanitizerRecordDebugInfo = {
          recordIndex: index,
          byteCount: record.byteCount,
          byteCountOffset: record.byteCountOffset,
          originalByteCount: record.originalByteCount,
          payloadLength: record.payloadLength,
          originalRecordCount: record.originalRecordCount,
          originalRecordSize: record.originalRecordSize,
          originalRemainingBytes: record.originalRemainingBytes,
          originalTotalBytes: record.originalTotalBytes,
          remainingBytes: record.remainingBytes,
          totalBytes: totalPayload,
          expectedSum,
          actualSum,
          sumMatches: expectedSum === actualSum,
          headerOffset: record.headerOffset,
        };
        previousRemaining = record.remainingBytes;
        return enriched;
      }
    );

    debugHook({
      blockIndex,
      totalRecords: block.records.length,
      totalPayload,
      records: enrichedRecords,
    });
  }

  return block.records.length;
};

export function sanitizeMetaEscapeRecords(
  data: Uint8Array,
  debugHook?: EscapeSanitizerDebugHook
): number {
  if (!data || data.length < META_HEADER_FALLBACK_BYTES) {
    return 0;
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  let headerWords = 0;
  try {
    headerWords = view.getUint16(2, true);
  } catch {
    headerWords = 0;
  }

  let offset = headerWords > 0 ? headerWords * 2 : META_HEADER_FALLBACK_BYTES;
  if (offset < META_HEADER_FALLBACK_BYTES || offset > view.byteLength) {
    offset = META_HEADER_FALLBACK_BYTES;
  }

  let patchedRecords = 0;
  let block: EscapeBlock | null = null;

  const flushBlock = () => {
    if (!block || !block.records.length) {
      block = null;
      return;
    }
    if (block.totalRecords !== block.records.length) {
      block.totalRecords = block.records.length;
    }
    patchedRecords += patchEscapeBlock(view, block, debugHook);
    block = null;
  };

  while (offset + 6 <= view.byteLength) {
    const sizeWords = view.getUint32(offset, true);
    if (!sizeWords) {
      flushBlock();
      break;
    }

    const recordBytes = sizeWords * 2;
    const recordEnd = offset + recordBytes;
    if (recordEnd > view.byteLength) {
      flushBlock();
      break;
    }

    offset += 4;
    const functionId = view.getUint16(offset, true);
    offset += 2;

    if (functionId === 0) {
      flushBlock();
      break;
    }

    if (functionId === META_ESCAPE_FUNC) {
      const escapeFunction = view.getUint16(offset, true);
      offset += 2;

      if (escapeFunction === META_ESCAPE_ENHANCED_METAFILE) {
        const byteCountOffset = offset;
        const headerOffset = byteCountOffset + 2;
        const headerEnd = headerOffset + COMMENT_HEADER_BYTES;

        if (headerEnd > recordEnd) {
          flushBlock();
          offset = recordEnd;
          continue;
        }

        const payloadLength = Math.max(recordEnd - headerEnd, 0);
        const originalByteCount = view.getUint16(byteCountOffset, true);
        const declaredCountRaw = view.getUint32(headerOffset + 18, true);
        const originalRecordSize = view.getUint32(headerOffset + 22, true);
        const originalRemainingBytes = view.getUint32(headerOffset + 26, true);
        const originalTotalBytes = view.getUint32(headerOffset + 30, true);
        const normalizedCount = clampRecordCount(declaredCountRaw);

        if (block && normalizedCount !== block.totalRecords) {
          flushBlock();
        }

        if (!block) {
          block = {
            totalRecords: normalizedCount,
            records: [],
          };
        }

        block.records.push({
          byteCountOffset,
          headerOffset,
          payloadLength,
          originalByteCount,
          originalRecordCount: declaredCountRaw,
          originalRecordSize,
          originalRemainingBytes,
          originalTotalBytes,
        });

        if (block.records.length >= block.totalRecords || payloadLength === 0) {
          flushBlock();
        }
      } else {
        flushBlock();
      }
    } else {
      flushBlock();
    }

    offset = recordEnd;
  }

  flushBlock();
  return patchedRecords;
}

export function patchMathTypeSignatures(wmfData: Uint8Array): number {
  let patches = 0;
  const view = new DataView(
    wmfData.buffer,
    wmfData.byteOffset,
    wmfData.byteLength
  );

  for (let i = 0; i < wmfData.length - 16; i++) {
    if (
      wmfData[i] === 0x4d &&
      wmfData[i + 1] === 0x61 &&
      wmfData[i + 2] === 0x74 &&
      wmfData[i + 3] === 0x68 &&
      wmfData[i + 4] === 0x54 &&
      wmfData[i + 5] === 0x79 &&
      wmfData[i + 6] === 0x70 &&
      wmfData[i + 7] === 0x65
    ) {
      // This is a MathType comment header embedded in the WMF
      // We need to patch it to look like a standard WMF comment

      // Patch Signature to "WMFC" (0x57 0x4D 0x46 0x43)
      view.setUint32(i, 0x43464d57, true); // Little endian: WMFC

      // Patch Type to 1 (0x00000001)
      view.setUint32(i + 4, 0x00000001, true);

      // Patch Version to 0x00010000
      view.setUint32(i + 8, 0x00010000, true);

      // Patch Checksum/Flags to 0
      view.setUint16(i + 12, 0x0000, true);

      // Patch Reserved field to 0
      view.setUint32(i + 14, 0x00000000, true);

      patches += 1;
    }
  }
  return patches;
}

function hasMathTypeContent(data: Uint8Array): boolean {
  // Check for MathType signature in the WMF data
  for (let i = 0; i < data.length - 8; i++) {
    if (
      data[i] === 0x4d &&
      data[i + 1] === 0x61 &&
      data[i + 2] === 0x74 &&
      data[i + 3] === 0x68 &&
      data[i + 4] === 0x54 &&
      data[i + 5] === 0x79 &&
      data[i + 6] === 0x70 &&
      data[i + 7] === 0x65
    ) {
      return true;
    }
  }
  return false;
}

export function wmfToPng(buffer: ArrayBuffer): string | null {
  // Suppress console errors from wmf.js library during conversion attempts
  const originalError = console.error;
  const originalWarn = console.warn;

  // Install console suppressors BEFORE any WMF operations
  console.error = (...args: any[]) => {
    const msg = String(args[0] || "");
    // Suppress all WMF-related errors
    if (
      msg.includes("WMF conversion error") ||
      msg.includes("Escape:") ||
      msg.includes("!=") ||
      args[0]?.message?.includes("Escape")
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const msg = String(args[0] || "");
    if (msg.includes("undefined") && args.length === 1) {
      return;
    }
    originalWarn.apply(console, args);
  };

  try {
    if (typeof window === "undefined") {
      console.error = originalError;
      console.warn = originalWarn;
      return null; // Server-side not supported for canvas
    }

    if (!WMF || !WMF.image_size || !WMF.draw_canvas) {
      console.error = originalError;
      console.warn = originalWarn;
      originalError("WMF library not loaded correctly", WMF);
      return null;
    }

    const data = new Uint8Array(buffer);

    // Check for Placeable Metafile Header (APM)
    // Key: 0x9AC6CDD7 (Little Endian: D7 CD C6 9A)
    let wmfData = data;
    if (
      data.length > 22 &&
      data[0] === 0xd7 &&
      data[1] === 0xcd &&
      data[2] === 0xc6 &&
      data[3] === 0x9a
    ) {
      // Create a copy to ensure byteOffset is 0, as some libraries ignore offset
      wmfData = new Uint8Array(data.subarray(22));
    }

    // Check if this WMF contains MathType equations
    // These files have validation issues with the wmf.js library
    const isMathType = hasMathTypeContent(wmfData);

    if (isMathType) {
      // Suppress wmf.js library errors for MathType files (known to fail)
      console.error = (...args: any[]) => {
        const msg = String(args[0] || "");
        if (msg.includes("WMF conversion error") || msg.includes("Escape:")) {
          // Silently ignore wmf.js validation errors
          return;
        }
        originalError.apply(console, args);
      };

      console.warn = (...args: any[]) => {
        const msg = String(args[0] || "");
        if (msg.includes("undefined")) {
          // Silently ignore wmf.js undefined warnings
          return;
        }
        originalWarn.apply(console, args);
      };

      // Try simple conversion without modifications (will likely fail for MathType)
      try {
        const size = WMF.image_size(wmfData);
        if (!size || size.length < 2) {
          return null;
        }

        const canvas = document.createElement("canvas");
        canvas.width = size[0];
        canvas.height = size[1];

        WMF.draw_canvas(wmfData, canvas);
        return canvas.toDataURL("image/png");
      } catch (mathTypeError) {
        // MathType WMFs fail due to wmf.js library limitations
        return null;
      } finally {
        // Restore console
        console.error = originalError;
        console.warn = originalWarn;
      }
    }

    // For non-MathType WMFs, apply normal processing
    const mathTypePatches = patchMathTypeSignatures(wmfData);
    const normalizedEscapes = sanitizeMetaEscapeRecords(wmfData);

    const size = WMF.image_size(wmfData);

    if (!size || size.length < 2) {
      console.error = originalError;
      console.warn = originalWarn;
      return null;
    }

    const width = size[0];
    const height = size[1];

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    WMF.draw_canvas(wmfData, canvas);

    console.error = originalError;
    console.warn = originalWarn;

    return canvas.toDataURL("image/png");
  } catch (e) {
    console.error = originalError;
    console.warn = originalWarn;
    return null;
  }
}

export function getPlaceholderSvg(type: string): string {
  const width = 300;
  const height = 50;
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#fff4e5" stroke="#c16659" stroke-width="1"/>
  <text x="50%" y="50%" font-family="sans-serif" font-size="12" fill="#c16659" text-anchor="middle" dy=".3em">
    ⚠️ ${type} format (Conversion Failed)
  </text>
</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
