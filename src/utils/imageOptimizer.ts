/**
 * Image Optimization Utilities
 * Compresses and resizes images for better performance in the editor
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.85
  maxFileSizeKB?: number; // Target max file size in KB
  format?: "jpeg" | "webp" | "png"; // Output format
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  maxFileSizeKB: 500,
  format: "webp",
};

/**
 * Compress and resize an image file
 * Returns a data URL of the optimized image
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const result = compressImage(img, opts);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an already-loaded image element
 */
export function compressImage(
  img: HTMLImageElement,
  options: ImageOptimizationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Calculate new dimensions while maintaining aspect ratio
  let { width, height } = img;
  const maxW = opts.maxWidth!;
  const maxH = opts.maxHeight!;

  if (width > maxW) {
    height = Math.round((height * maxW) / width);
    width = maxW;
  }
  if (height > maxH) {
    width = Math.round((width * maxH) / height);
    height = maxH;
  }

  // Create canvas for compression
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Use better image smoothing for downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the image
  ctx.drawImage(img, 0, 0, width, height);

  // Determine output format and MIME type
  let mimeType: string;
  let format = opts.format!;

  // Check WebP support
  if (format === "webp" && !supportsWebP()) {
    format = "jpeg";
  }

  switch (format) {
    case "webp":
      mimeType = "image/webp";
      break;
    case "png":
      mimeType = "image/png";
      break;
    default:
      mimeType = "image/jpeg";
  }

  // Start with target quality
  let quality = opts.quality!;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  // If we have a max file size target, iteratively reduce quality
  if (opts.maxFileSizeKB) {
    const targetBytes = opts.maxFileSizeKB * 1024;
    let iterations = 0;
    const maxIterations = 5;

    while (
      dataUrl.length > targetBytes &&
      quality > 0.3 &&
      iterations < maxIterations
    ) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL(mimeType, quality);
      iterations++;
    }

    // If still too large, try reducing dimensions
    if (dataUrl.length > targetBytes && width > 600) {
      const scale = 0.75;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL(mimeType, quality);
    }
  }

  return dataUrl;
}

/**
 * Optimize a data URL image
 */
export async function optimizeDataUrl(
  dataUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const result = compressImage(img, options);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/**
 * Check if browser supports WebP
 */
let webpSupported: boolean | null = null;

function supportsWebP(): boolean {
  if (webpSupported !== null) return webpSupported;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  webpSupported =
    canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  return webpSupported;
}

/**
 * Get the size of a data URL in bytes
 */
export function getDataUrlSize(dataUrl: string): number {
  // Remove the data URL prefix to get just the base64
  const base64 = dataUrl.split(",")[1];
  if (!base64) return dataUrl.length;

  // Base64 encodes 3 bytes as 4 characters
  // Account for padding
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Format bytes as human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if an image needs optimization
 */
export function needsOptimization(
  dataUrl: string,
  options: { maxSizeKB?: number; maxDimension?: number } = {}
): boolean {
  const { maxSizeKB = 500, maxDimension = 1200 } = options;

  // Check file size
  const size = getDataUrlSize(dataUrl);
  if (size > maxSizeKB * 1024) return true;

  // We'd need to load the image to check dimensions, so for now just check size
  return false;
}
