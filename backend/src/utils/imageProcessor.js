/**
 * imageProcessor.js — Mobile-Compatible Image Preprocessing for OCR
 *
 * Handles all common mobile image issues before OCR:
 *   1. HEIC/HEIF → JPEG conversion (iOS photos)
 *   2. EXIF auto-rotation (mobile camera orientation)
 *   3. Resize to max 1200px (large mobile photos)
 *   4. Normalize contrast + sharpen (OCR quality boost)
 *   5. Reports normalized mimeType back to caller
 */

const sharp = require('sharp');

/**
 * Normalize a mobile image buffer for OCR.
 * Always returns a JPEG buffer regardless of input format,
 * with EXIF rotation applied, max 1200px wide, contrast-boosted.
 *
 * @param {Buffer} inputBuffer  - Raw uploaded file buffer
 * @param {string} mimeType     - Original MIME type from multer
 * @returns {{ buffer: Buffer, mimeType: string, originalSize: number, processedSize: number }}
 */
async function preprocessForOCR(inputBuffer, mimeType) {
  const originalSize = inputBuffer.length;

  console.log(`[ImageProcessor] Input: ${mimeType}, size: ${(originalSize / 1024).toFixed(1)} KB`);

  try {
    let pipeline = sharp(inputBuffer, {
      // Fail gracefully on unknown formats; don't throw on partially-corrupted mobile photos
      failOnError: false,
    });

    // ── Step 1: Read metadata to detect EXIF orientation ──────────────────
    let metadata;
    try {
      metadata = await pipeline.metadata();
      console.log(`[ImageProcessor] Detected format: ${metadata.format}, ${metadata.width}x${metadata.height}, orientation: ${metadata.orientation || 'none'}`);
    } catch (metaErr) {
      console.warn('[ImageProcessor] Could not read metadata:', metaErr.message);
      metadata = {};
    }

    // Rebuild pipeline from input buffer each time (sharp pipelines are one-use)
    pipeline = sharp(inputBuffer, { failOnError: false });

    // ── Step 2: Auto-rotate based on EXIF orientation (critical for mobile) ─
    pipeline = pipeline.rotate(); // sharp auto-reads EXIF orientation

    // ── Step 3: Resize — max 1200px wide, keep aspect ratio, no upscale ───
    pipeline = pipeline.resize({
      width: 1200,
      withoutEnlargement: true, // don't upscale small images
      fit: 'inside',
    });

    // ── Step 4: Convert to grayscale + normalize contrast + sharpen ────────
    pipeline = pipeline
      .grayscale()
      .normalize()                 // auto-stretch histogram
      .sharpen({ sigma: 1.2 })     // light sharpen for text edges
      .linear(1.2, -15);           // mild contrast boost

    // ── Step 5: Output as JPEG (strips HEIC/HEIF/TIFF incompatibilities) ───
    const processedBuffer = await pipeline
      .jpeg({ quality: 88, progressive: false })
      .toBuffer();

    const processedSize = processedBuffer.length;
    console.log(`[ImageProcessor] Output: image/jpeg, size: ${(processedSize / 1024).toFixed(1)} KB (${Math.round((1 - processedSize / originalSize) * 100)}% reduction)`);

    return {
      buffer: processedBuffer,
      mimeType: 'image/jpeg',
      originalSize,
      processedSize,
    };
  } catch (err) {
    console.error('[ImageProcessor] Sharp processing failed:', err.message);
    // If sharp fails entirely (extremely rare), return original buffer
    // Gemini Vision can usually handle most formats natively
    console.warn('[ImageProcessor] Falling back to original buffer');
    return {
      buffer: inputBuffer,
      mimeType: mimeType || 'image/jpeg',
      originalSize,
      processedSize: originalSize,
    };
  }
}

/**
 * Validate that an uploaded file looks like a real image buffer
 * by checking magic bytes (file signature), not just MIME type.
 * Mobile browsers sometimes lie about MIME types (e.g., HEIC sent as image/jpeg).
 *
 * @param {Buffer} buffer
 * @returns {string|null} detected format name, or null if unrecognized
 */
function detectFormatFromMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return null;

  const hex = buffer.slice(0, 12).toString('hex').toUpperCase();

  if (hex.startsWith('FFD8FF')) return 'jpeg';
  if (hex.startsWith('89504E47')) return 'png';
  if (hex.startsWith('52494646') && buffer.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (hex.startsWith('49492A00') || hex.startsWith('4D4D002A')) return 'tiff';
  if (hex.startsWith('424D')) return 'bmp';
  // HEIC/HEIF — starts with 'ftyp' box at offset 4
  if (buffer.slice(4, 8).toString('ascii') === 'ftyp') return 'heic';
  if (hex.startsWith('47494638')) return 'gif';

  return null;
}

module.exports = { preprocessForOCR, detectFormatFromMagicBytes };
