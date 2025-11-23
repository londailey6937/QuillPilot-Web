import { readFileSync } from "node:fs";
import path from "node:path";
import * as WMFModule from "wmf";
import {
  sanitizeMetaEscapeRecords,
  patchMathTypeSignatures,
  type EscapeSanitizerDebugInfo,
} from "../src/utils/wmfUtils";

const WMF = (WMFModule as any).default || WMFModule;
const PLACEABLE_HEADER_LENGTH = 22;
const PLACEABLE_HEADER_KEY = [0xd7, 0xcd, 0xc6, 0x9a];

type BinaryBuffer = Uint8Array<ArrayBufferLike>;

function stripPlaceableHeader(data: BinaryBuffer): BinaryBuffer {
  if (data.length <= PLACEABLE_HEADER_LENGTH) {
    return data;
  }

  for (let i = 0; i < PLACEABLE_HEADER_KEY.length; i++) {
    if (data[i] !== PLACEABLE_HEADER_KEY[i]) {
      return data;
    }
  }

  return new Uint8Array(data.subarray(PLACEABLE_HEADER_LENGTH));
}

function convert(filePath: string): void {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const fileBuffer = readFileSync(absolutePath);
  let data: BinaryBuffer = new Uint8Array(fileBuffer);
  data = stripPlaceableHeader(data);

  const debugBlocks: EscapeSanitizerDebugInfo[] = [];
  const normalized = sanitizeMetaEscapeRecords(data, (info) => {
    debugBlocks.push(info);
  });
  console.log(
    `[WMF][test] normalized ${normalized} META_ESCAPE record(s) in ${absolutePath}`
  );

  debugBlocks.forEach((block) => {
    console.log(
      `[WMF][test][sanitizer] block #${block.blockIndex} records=${block.totalRecords} totalPayload=${block.totalPayload}`
    );
    block.records.forEach((record) => {
      console.log(
        `  rec ${record.recordIndex + 1}: count=${block.totalRecords} payload=${
          record.payloadLength
        } remaining=${record.remainingBytes} total=${
          record.totalBytes
        } expectedSum=${record.expectedSum} actualSum=${record.actualSum}`
      );
    });
  });

  if (debugBlocks.length > 0 && debugBlocks[0].records.length > 0) {
    const record = debugBlocks[0].records[0];
    const headerView = new DataView(
      data.buffer,
      data.byteOffset + record.headerOffset,
      34
    );
    const recordCount = headerView.getUint32(18, true);
    const recordSize = headerView.getUint32(22, true);
    const remainingBytes = headerView.getUint32(26, true);
    const totalBytes = headerView.getUint32(30, true);
    console.log(
      `[WMF][test][sanitizer] header snapshot -> count=${recordCount} size=${recordSize} remaining=${remainingBytes} total=${totalBytes}`
    );
  }

  const mathTypePatches = patchMathTypeSignatures(data);
  if (mathTypePatches > 0) {
    console.log(`[WMF][test] patched ${mathTypePatches} MathType record(s)`);
  }

  const wmfInput = Buffer.from(data);
  if (debugBlocks.length > 0 && debugBlocks[0].records.length > 0) {
    const record = debugBlocks[0].records[0];
    const bufView = new DataView(
      wmfInput.buffer,
      wmfInput.byteOffset + record.headerOffset,
      34
    );
    console.log(
      `[WMF][test][buffer] snapshot -> count=${bufView.getUint32(
        18,
        true
      )} size=${bufView.getUint32(22, true)} remaining=${bufView.getUint32(
        26,
        true
      )} total=${bufView.getUint32(30, true)}`
    );
  }
  // TEMP: write sanitized buffer for inspection
  // writeFileSync("/tmp/sanitized.wmf", wmfInput);

  try {
    const size = WMF.image_size(wmfInput);
    console.log(`[WMF][test] image_size -> ${size}`);
  } catch (error) {
    console.error("[WMF][test] image_size error", error);
  }

  try {
    const actions = WMF.get_actions(wmfInput as any);
    console.log(`[WMF][test] get_actions -> ${actions.length} action(s)`);
  } catch (error) {
    console.error("[WMF][test] get_actions error", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

const targetPath = process.argv[2] ?? "tmp/wmfs/image38.wmf";
convert(targetPath);
