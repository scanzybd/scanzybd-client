/**
 * Compress an image File in the browser before upload.
 * Keeps payload under Vercel ~4.5MB body limit (base64 JSON).
 * Returns a JPEG data URL suitable for POST /api/upload/image.
 */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;
/** Soft cap on data-URL length (~1.4MB binary → safe under 4.5MB with JSON overhead). */
const MAX_DATA_URL_CHARS = 1_800_000;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function drawToCanvas(img, maxEdge) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) throw new Error("Invalid image dimensions");

  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * @param {File} file
 * @returns {Promise<string>} data URL (image/jpeg)
 */
export async function compressImageFileForUpload(file) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  // Skip heavy work for tiny files (still convert to jpeg for consistency if needed)
  if (file.size <= 400_000 && file.type === "image/jpeg") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
  }

  const img = await loadImageFromFile(file);
  let maxEdge = MAX_EDGE;
  let quality = JPEG_QUALITY;
  let dataUrl = "";

  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = drawToCanvas(img, maxEdge);
    dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_DATA_URL_CHARS) break;
    quality = Math.max(0.55, quality - 0.1);
    maxEdge = Math.max(640, Math.round(maxEdge * 0.85));
  }

  if (!dataUrl || dataUrl.length > MAX_DATA_URL_CHARS * 1.5) {
    throw new Error("Image is still too large after compression. Try a smaller photo.");
  }

  return dataUrl;
}
