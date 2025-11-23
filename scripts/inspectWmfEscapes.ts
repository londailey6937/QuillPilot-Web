import { readFileSync } from "node:fs";
import path from "node:path";
import {
  sanitizeMetaEscapeRecords,
  type EscapeSanitizerDebugInfo,
} from "../src/utils/wmfUtils";

const PLACEABLE_HEADER_LENGTH = 22;
const PLACEABLE_HEADER_KEY = [0xd7, 0xcd, 0xc6, 0x9a];
type BinaryBuffer = Uint8Array<ArrayBufferLike>;
const COMMENT_HEADER_BYTES = 34;

function stripPlaceableHeader(data: BinaryBuffer): BinaryBuffer {
  if (data.length <= PLACEABLE_HEADER_LENGTH) {
    return data;
  }

  for (let i = 0; i < PLACEABLE_HEADER_KEY.length; i++) {
    if (data[i] !== PLACEABLE_HEADER_KEY[i]) {
      return data;
    }
  }

  console.log("[WMF][debug] Stripping 22-byte placeable header for analysis");
  return new Uint8Array(data.subarray(PLACEABLE_HEADER_LENGTH));
}

function inspect(filePath: string): void {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const fileBuffer = readFileSync(absolutePath);
  let data: BinaryBuffer = new Uint8Array(fileBuffer);
  data = stripPlaceableHeader(data);

  const debugBlocks: EscapeSanitizerDebugInfo[] = [];
  const patched = sanitizeMetaEscapeRecords(data, (info) => {
    debugBlocks.push(info);
  });

  console.log(
    `[WMF][debug] sanitized ${patched} META_ESCAPE record(s) across ${debugBlocks.length} block(s) in ${absolutePath}`
  );

  debugBlocks.forEach((block) => {
    console.log(
      `\nBlock #${block.blockIndex} records=${block.totalRecords} totalPayload=${block.totalPayload}`
    );
    block.records.forEach((record) => {
      const status = record.sumMatches ? "ok" : "mismatch";
      const headerBytes = Array.from(
        data.slice(record.headerOffset, record.headerOffset + COMMENT_HEADER_BYTES)
      )
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");
      const payloadPreview = Array.from(
        data.slice(
          record.headerOffset + COMMENT_HEADER_BYTES,
          record.headerOffset + COMMENT_HEADER_BYTES + Math.min(record.payloadLength, 64)
        )
      )
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");
      console.log(
        `  rec ${record.recordIndex + 1} @header=${record.headerOffset}: byteCount=${record.byteCount} (orig=${record.originalByteCount}) recordCount(orig)=${record.originalRecordCount} payload=${record.payloadLength} (origSize=${record.originalRecordSize}) remaining=${record.remainingBytes} (origRemaining=${record.originalRemainingBytes}) total=${record.totalBytes} (origTotal=${record.originalTotalBytes}) expectedSum=${record.expectedSum} actualSum=${record.actualSum} -> ${status}`
      );
      console.log(`    header bytes: ${headerBytes}`);
      console.log(`    payload head: ${payloadPreview}`);
    });
  });
}

const targetPath = process.argv[2] ?? "tmp/wmfs/image38.wmf";
inspect(targetPath);
