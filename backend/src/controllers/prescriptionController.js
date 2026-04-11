const PrescriptionService = require('../services/prescriptionService');
const { preprocessForOCR, detectFormatFromMagicBytes } = require('../utils/imageProcessor');

/**
 * @desc    Upload & Analyze Prescription Image (Full 7-Layer Pipeline)
 * @route   POST /api/prescriptions/analyze
 * @access  Public
 */
exports.analyzePrescription = async (req, res) => {
  try {
    // ── Step 0: Validate file presence ─────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a prescription image.',
        code: 'NO_FILE',
      });
    }

    const rawBuffer = req.file.buffer;
    const declaredMime = req.file.mimetype;
    const originalName = req.file.originalname || 'unknown';
    const fileSizeKB = (rawBuffer.length / 1024).toFixed(1);

    // ── Step 1: Debug — log upload info ────────────────────────────────────
    const detectedFormat = detectFormatFromMagicBytes(rawBuffer);
    console.log('═══════════════════════════════════════════════════════');
    console.log('[Upload] File received:', {
      originalName,
      declaredMime,
      detectedFormat,
      fileSizeKB: `${fileSizeKB} KB`,
      userAgent: req.headers['user-agent']?.substring(0, 80) || 'unknown',
      contentType: req.headers['content-type']?.substring(0, 60) || 'unknown',
    });
    console.log('═══════════════════════════════════════════════════════');

    // Warn if MIME mismatch (common on mobile — iOS sends HEIC as jpeg sometimes)
    if (detectedFormat && detectedFormat !== 'jpeg' && declaredMime === 'image/jpeg') {
      console.warn(`[Upload] MIME mismatch! Declared: ${declaredMime}, Detected: ${detectedFormat}`);
    }

    // ── Step 2: Mobile-safe image preprocessing────────────────────────────
    // Converts HEIC→JPEG, applies EXIF rotation, resizes to 1200px, compresses
    let processedBuffer, effectiveMime;
    try {
      const processed = await preprocessForOCR(rawBuffer, declaredMime);
      processedBuffer = processed.buffer;
      effectiveMime = processed.mimeType;
      console.log(`[Controller] Image preprocessed: ${processed.originalSize} bytes → ${processed.processedSize} bytes`);
    } catch (preprocessErr) {
      console.error('[Controller] Image preprocessing failed, using raw buffer:', preprocessErr.message);
      processedBuffer = rawBuffer;
      effectiveMime = declaredMime;
    }

    // ── Step 3: Run the full 7-layer OCR pipeline ───────────────────────────
    const pipelineResult = await PrescriptionService.analyzePrescription(processedBuffer, effectiveMime);

    // ── Step 4: Layer 7 CHECK — Should we trigger fallback? ────────────────
    if (PrescriptionService.shouldTriggerFallback(pipelineResult)) {
      console.log('[Controller] Fallback engine triggered. Reason:', {
        confidence: pipelineResult.overallConfidence,
        totalFound: pipelineResult.totalFound,
        entities: pipelineResult.extractedMedicines.length,
      });

      const { reason, fallbackMedicines } = await PrescriptionService.runFallbackPipeline(pipelineResult);

      return res.status(200).json({
        success: true,
        status: 'fallback_used',
        reason,
        ocrEngine: pipelineResult.ocrEngine,
        ocrConfidence: pipelineResult.ocrConfidence,
        overallConfidence: pipelineResult.overallConfidence,
        rawText: pipelineResult.rawText,
        medicineLines: pipelineResult.medicineLines,
        totalMedicinesFound: 0,
        fallbackMedicines,
        extractedMedicines: [],
        message: reason === 'low_confidence'
          ? 'Prescription unclear. Showing best alternatives based on detected composition.'
          : reason === 'no_detection'
          ? 'No medicines detected. Please search manually or upload a clearer image.'
          : 'Medicine not found in database. Showing same-salt alternatives.',
      });
    }

    // ── Step 5: NORMAL FLOW — Enrich each matched medicine ─────────────────
    const patientCurrentMeds = [];
    const enrichedResults = [];

    for (const medResult of pipelineResult.extractedMedicines) {

      // Unmatched entity — run individual fallback for this one medicine
      if (!medResult.dbMedicine) {
        const salt = await PrescriptionService.extractSalt(medResult.candidateName);
        const substitutes = await PrescriptionService.findSaltSubstitutes(
          salt, medResult.dosage, medResult.form
        );

        enrichedResults.push({
          extractedName: medResult.candidateName,
          matchedName: medResult.matchedName || medResult.candidateName,
          dosage: medResult.dosage,
          form: medResult.form,
          frequency: medResult.frequency,
          duration: medResult.duration,
          confidence: medResult.confidence,
          matchType: medResult.matchType,
          inventoryStatus: 'UNVERIFIED',
          requiresConfirmation: true,
          salt: salt || null,
          saltSubstitutes: substitutes,
          message: substitutes.length > 0
            ? `Could not verify "${medResult.candidateName}". Showing same-salt alternatives.`
            : `Could not verify "${medResult.candidateName}". Please search manually.`,
        });
        continue;
      }

      try {
        const recPayload = await PrescriptionService.findTargetOrSubstitutes(medResult.dbMedicine);

        if (recPayload.type === 'SUBSTITUTE') {
          const safetyRankedPayload = await PrescriptionService.validateSubstitutes(recPayload, patientCurrentMeds);
          enrichedResults.push({
            extractedName: medResult.candidateName,
            matchedName: medResult.matchedName || medResult.dbMedicine.name,
            dosage: medResult.dosage,
            form: medResult.form,
            frequency: medResult.frequency,
            duration: medResult.duration,
            confidence: medResult.confidence,
            matchType: medResult.matchType,
            inventoryStatus: safetyRankedPayload.type,
            original: safetyRankedPayload.original,
            substitutes: safetyRankedPayload.substitutes || [],
            alert: safetyRankedPayload.alert || null,
          });
        } else if (recPayload.type === 'ORIGINAL') {
          enrichedResults.push({
            extractedName: medResult.candidateName,
            matchedName: medResult.matchedName || medResult.dbMedicine.name,
            dosage: medResult.dosage,
            form: medResult.form,
            frequency: medResult.frequency,
            duration: medResult.duration,
            confidence: medResult.confidence,
            matchType: medResult.matchType,
            inventoryStatus: 'ORIGINAL',
            data: recPayload.data,
          });
        } else {
          enrichedResults.push({
            extractedName: medResult.candidateName,
            matchedName: medResult.matchedName || medResult.dbMedicine.name,
            dosage: medResult.dosage,
            form: medResult.form,
            frequency: medResult.frequency,
            duration: medResult.duration,
            confidence: medResult.confidence,
            matchType: medResult.matchType,
            inventoryStatus: recPayload.type,
            alert: recPayload.alert,
          });
        }
      } catch (innerErr) {
        console.error(`[Controller] Error processing ${medResult.candidateName}:`, innerErr.message);
        enrichedResults.push({
          extractedName: medResult.candidateName,
          matchedName: medResult.matchedName || medResult.candidateName,
          dosage: medResult.dosage,
          form: medResult.form,
          confidence: medResult.confidence,
          matchType: medResult.matchType,
          inventoryStatus: 'ERROR',
          error: 'Could not complete inventory check.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      status: 'success',
      ocrEngine: pipelineResult.ocrEngine,
      ocrConfidence: pipelineResult.ocrConfidence,
      overallConfidence: pipelineResult.overallConfidence,
      requiresConfirmation: pipelineResult.requiresConfirmation,
      totalMedicinesFound: pipelineResult.totalFound,
      medicineLines: pipelineResult.medicineLines,
      extractedMedicines: enrichedResults,
    });

  } catch (error) {
    // ── Full error logging for debugging mobile failures ────────────────────
    console.error('[Controller] ══ PRESCRIPTION ANALYSIS ERROR ══');
    console.error('[Controller] Error name:', error.name);
    console.error('[Controller] Error message:', error.message);
    console.error('[Controller] Stack:', error.stack?.substring(0, 600));

    // Specific known error types
    if (error.message?.includes('OCR') || error.message?.includes('read prescription')) {
      return res.status(422).json({
        success: false,
        status: 'error',
        code: 'OCR_FAILED',
        message: 'Unable to read prescription clearly. Please upload a clearer image or enter medicines manually.',
        requiresManualInput: true,
        debugHint: process.env.NODE_ENV === 'development' ? error.message : undefined, // Visible in response only for debugging
      });
    }

    if (error.message?.includes('Input file is missing') || error.message?.includes('unsupported image format')) {
      return res.status(422).json({
        success: false,
        status: 'error',
        code: 'UNSUPPORTED_FORMAT',
        message: 'Image format not supported. Please use JPG, PNG, or WebP.',
        requiresManualInput: true,
        debugHint: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    if (error.message?.includes('GEMINI') || error.message?.includes('API key') || error.message?.includes('quota')) {
      return res.status(503).json({
        success: false,
        status: 'error',
        code: 'AI_UNAVAILABLE',
        message: 'AI analysis service is temporarily unavailable. Please try again in a moment.',
        requiresManualInput: true,
      });
    }

    return res.status(500).json({
      success: false,
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred.',
      debugHint: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * @desc    Fuzzy-search a medicine name (manual input fallback)
 * @route   GET /api/prescriptions/validate-medicine?q=calpol
 * @access  Public
 */
exports.validateMedicine = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters.' });
    }

    const suggestions = await PrescriptionService.fuzzySearchMedicine(q.trim());

    return res.status(200).json({
      success: true,
      query: q,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('[Controller] validateMedicine error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
