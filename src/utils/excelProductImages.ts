import JSZip from "jszip";
import * as XLSX from "xlsx";
import { compressImageFile } from "@/utils/compressImage";

const IMAGE_HEADER_KEYS = new Set([
  "image",
  "imageurl",
  "images",
  "photo",
  "picture",
]);

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
};

export type EmbeddedExcelImage = {
  excelRow: number; // 1-based sheet row
  bytes: Uint8Array;
  mime: string;
  fileName: string;
  col?: number; // 0-based
};

const normalizeHeader = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const guessMime = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return MIME_BY_EXT[ext] || "image/jpeg";
};

const findImageColumnIndex = (sheet: XLSX.WorkSheet): number => {
  if (!sheet["!ref"]) return -1;
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
    const header = normalizeHeader(sheet[addr]?.v);
    if (IMAGE_HEADER_KEYS.has(header)) return c;
  }
  return -1;
};

/** Prefer full hyperlink target over truncated display text in the image cell. */
export const getImageCellValue = (
  sheet: XLSX.WorkSheet,
  excelRow1Based: number,
  imageCol: number,
  fallbackFromJson = ""
): string => {
  if (imageCol < 0) return fallbackFromJson;
  const addr = XLSX.utils.encode_cell({ r: excelRow1Based - 1, c: imageCol });
  const cell = sheet[addr];
  const target = cell?.l?.Target || cell?.l?.target;
  if (typeof target === "string" && /^https?:\/\//i.test(target.trim())) {
    return target.trim();
  }
  const raw = cell?.v != null ? String(cell.v).trim() : "";
  if (/^https?:\/\//i.test(raw) || /^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(fallbackFromJson) || /^data:image\//i.test(fallbackFromJson)) {
    return fallbackFromJson;
  }
  return raw || fallbackFromJson;
};

const parseRels = (relsXml: string): Map<string, string> => {
  const map = new Map<string, string>();
  const re =
    /Id\s*=\s*"([^"]+)"[^>]*Target\s*=\s*"([^"]+)"|Target\s*=\s*"([^"]+)"[^>]*Id\s*=\s*"([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(relsXml))) {
    const id = m[1] || m[4];
    const target = m[2] || m[3];
    if (id && target) map.set(id, target.replace(/\\/g, "/"));
  }
  return map;
};

const resolveMediaPath = (drawingDir: string, target: string): string => {
  if (target.startsWith("/")) return target.slice(1);
  if (target.startsWith("xl/")) return target;
  // drawingDir like xl/drawings → ../media/image1.png → xl/media/image1.png
  const baseParts = drawingDir.split("/").filter(Boolean);
  const targetParts = target.split("/");
  for (const part of targetParts) {
    if (part === "..") baseParts.pop();
    else if (part !== ".") baseParts.push(part);
  }
  return baseParts.join("/");
};

/**
 * Extract floating / in-cell pictures from an .xlsx and map them to sheet rows.
 */
export async function extractEmbeddedImagesByRow(
  buffer: ArrayBuffer
): Promise<Map<number, EmbeddedExcelImage>> {
  const byRow = new Map<number, EmbeddedExcelImage>();

  try {
    const zip = await JSZip.loadAsync(buffer);

    // Media lookup
    const mediaFiles = new Map<string, { bytes: Uint8Array; mime: string; fileName: string }>();
    const mediaFolder = zip.folder("xl/media");
    if (mediaFolder) {
      const tasks: Promise<void>[] = [];
      mediaFolder.forEach((relativePath, file) => {
        if (file.dir) return;
        tasks.push(
          (async () => {
            const bytes = await file.async("uint8array");
            const fileName = relativePath.split("/").pop() || relativePath;
            mediaFiles.set(`xl/media/${relativePath.replace(/^\//, "")}`, {
              bytes,
              mime: guessMime(fileName),
              fileName,
            });
            // also key by short name
            mediaFiles.set(fileName, mediaFiles.get(`xl/media/${relativePath.replace(/^\//, "")}`)!);
          })()
        );
      });
      await Promise.all(tasks);
    }

    if (mediaFiles.size === 0) return byRow;

    // Drawing anchors (classic Insert > Pictures floating images)
    const drawingFiles = Object.keys(zip.files).filter(
      (p) => /^xl\/drawings\/drawing\d+\.xml$/i.test(p) && !p.includes("_rels")
    );

    for (const drawingPath of drawingFiles) {
      const drawingXml = await zip.file(drawingPath)?.async("string");
      if (!drawingXml) continue;

      const relsPath = drawingPath.replace(
        /drawing(\d+)\.xml$/i,
        "_rels/drawing$1.xml.rels"
      );
      const relsXml = await zip.file(relsPath)?.async("string");
      const rels = relsXml ? parseRels(relsXml) : new Map<string, string>();
      const drawingDir = drawingPath.split("/").slice(0, -1).join("/");

      const anchorBlocks =
        drawingXml.match(
          /<(?:\w+:)?(?:twoCellAnchor|oneCellAnchor)\b[\s\S]*?<\/(?:\w+:)?(?:twoCellAnchor|oneCellAnchor)>/gi
        ) || [];

      for (const block of anchorBlocks) {
        const rowMatch = block.match(/<(?:\w+:)?from>[\s\S]*?<(?:\w+:)?row>(\d+)<\/(?:\w+:)?row>/i);
        const colMatch = block.match(/<(?:\w+:)?from>[\s\S]*?<(?:\w+:)?col>(\d+)<\/(?:\w+:)?col>/i);
        const embedMatch = block.match(/r:embed="([^"]+)"/i) || block.match(/embed="([^"]+)"/i);
        if (!rowMatch || !embedMatch) continue;

        const excelRow = Number(rowMatch[1]) + 1; // 0-based in OOXML
        const col = colMatch ? Number(colMatch[1]) : undefined;
        const relTarget = rels.get(embedMatch[1]);
        if (!relTarget) continue;

        const mediaPath = resolveMediaPath(drawingDir, relTarget);
        const media =
          mediaFiles.get(mediaPath) ||
          mediaFiles.get(mediaPath.split("/").pop() || "");
        if (!media) continue;

        // Prefer image already mapped only if none; first wins per row
        if (!byRow.has(excelRow)) {
          byRow.set(excelRow, {
            excelRow,
            bytes: media.bytes,
            mime: media.mime,
            fileName: media.fileName,
            col,
          });
        }
      }
    }

    // Excel 365 "Place in Cell" / DISPIMG support (best-effort)
    const cellImagesXml = await zip.file("xl/cellimages.xml")?.async("string");
    const cellImagesRels = await zip
      .file("xl/cellimages.xml.rels")
      ?.async("string")
      .catch(() => undefined);
    // Some workbooks use xl/_rels/cellimages.xml.rels
    const cellImagesRelsAlt = await zip
      .file("xl/_rels/cellimages.xml.rels")
      ?.async("string")
      .catch(() => undefined);

    if (cellImagesXml) {
      const rels = parseRels(cellImagesRels || cellImagesRelsAlt || "");
      // Map image name/id → media
      const idToMedia = new Map<string, { bytes: Uint8Array; mime: string; fileName: string }>();
      const nameBlocks =
        cellImagesXml.match(/<(?:\w+:)?pic>[\s\S]*?<\/(?:\w+:)?pic>/gi) || [];
      for (const block of nameBlocks) {
        const nameMatch =
          block.match(/name="([^"]+)"/i) ||
          block.match(/<(?:\w+:)?cNvPr[^>]*name="([^"]+)"/i);
        const embedMatch = block.match(/r:embed="([^"]+)"/i);
        if (!nameMatch || !embedMatch) continue;
        const relTarget = rels.get(embedMatch[1]);
        if (!relTarget) continue;
        const mediaPath = resolveMediaPath("xl", relTarget.startsWith("media/") ? `../${relTarget}` : relTarget);
        const media =
          mediaFiles.get(mediaPath) ||
          mediaFiles.get(`xl/${relTarget.replace(/^\.\.\//, "")}`) ||
          mediaFiles.get(relTarget.split("/").pop() || "");
        if (media) idToMedia.set(nameMatch[1], media);
      }

      // Find DISPIMG formulas in first sheet cells
      const sheetPath =
        Object.keys(zip.files).find((p) => /^xl\/worksheets\/sheet1\.xml$/i.test(p)) ||
        Object.keys(zip.files).find((p) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(p));
      if (sheetPath) {
        const sheetXml = await zip.file(sheetPath)?.async("string");
        if (sheetXml) {
          const rowBlocks = sheetXml.match(/<(?:\w+:)?c\b[^>]*>[\s\S]*?<\/(?:\w+:)?c>/gi) || [];
          for (const cellXml of rowBlocks) {
            const refMatch = cellXml.match(/\br="([A-Z]+)(\d+)"/i);
            const dispMatch = cellXml.match(/DISPIMG\s*\(\s*"([^"]+)"/i);
            if (!refMatch || !dispMatch) continue;
            const excelRow = Number(refMatch[2]);
            const media = idToMedia.get(dispMatch[1]);
            if (media && !byRow.has(excelRow)) {
              byRow.set(excelRow, {
                excelRow,
                bytes: media.bytes,
                mime: media.mime,
                fileName: media.fileName,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn("Failed to extract embedded Excel images:", error);
  }

  return byRow;
}

const fileToDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

/**
 * Compress an embedded Excel picture to a data URL.
 * Backend bulk import uploads it to Cloudinary under the same products folder
 * used by normal product image uploads.
 */
export async function uploadEmbeddedExcelImage(
  image: EmbeddedExcelImage
): Promise<string | null> {
  try {
    const file = new File([image.bytes], image.fileName || "excel-image.jpg", {
      type: image.mime || "image/jpeg",
    });
    const compressed = await compressImageFile(file);
    const dataUrl = await fileToDataUrl(compressed);
    return dataUrl.startsWith("data:image/") ? dataUrl : null;
  } catch (error) {
    console.warn("Failed to process embedded Excel image:", error);
    return null;
  }
}

/**
 * Resolve final image value for a product row:
 * 1) URL / hyperlink in image column
 * 2) embedded picture on that row → upload to Cloudinary
 */
export async function resolveExcelRowImage(options: {
  sheet: XLSX.WorkSheet;
  excelRow: number;
  imageCol: number;
  cellFallback?: string;
  embeddedByRow: Map<number, EmbeddedExcelImage>;
}): Promise<string> {
  const fromCell = getImageCellValue(
    options.sheet,
    options.excelRow,
    options.imageCol,
    options.cellFallback || ""
  );

  if (/^https?:\/\//i.test(fromCell) || /^data:image\//i.test(fromCell)) {
    return fromCell;
  }

  const embedded = options.embeddedByRow.get(options.excelRow);
  if (embedded) {
    const uploaded = await uploadEmbeddedExcelImage(embedded);
    if (uploaded) return uploaded;
  }

  return fromCell;
}

export function getExcelImageColumnIndex(sheet: XLSX.WorkSheet): number {
  return findImageColumnIndex(sheet);
}
