const PrescriptionService = require('../services/prescriptionService');

/**
 * @desc    Upload & Analyze Prescription Image (Full 7-Layer Pipeline)
 * @route   POST /api/prescriptions/analyze
 * @access  Public
 */
exports.analyzePrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a prescription image.',
        code: 'NO_FILE',
      });
    }

    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Run the full 6-layer pipeline
    const pipelineResult = await PrescriptionService.analyzePrescription(imageBuffer, mimeType);

    // ══════════════════════════════════════════════════════════════════════
    // LAYER 7 CHECK — Should we trigger fallback?
    // Conditions: low confidence | 0 meds | all unmatched
    // ══════════════════════════════════════════════════════════════════════
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
        reason,                                   // 'low_confidence' | 'not_found' | 'no_detection'
        ocrEngine: pipelineResult.ocrEngine,
        ocrConfidence: pipelineResult.ocrConfidence,
        overallConfidence: pipelineResult.overallConfidence,
        rawText: pipelineResult.rawText,
        medicineLines: pipelineResult.medicineLines,
        totalMedicinesFound: 0,
        fallbackMedicines,                        // Array of salt-based fallback results
        extractedMedicines: [],
        message: reason === 'low_confidence'
          ? 'Prescription unclear. Showing best alternatives based on detected composition.'
          : reason === 'no_detection'
          ? 'No medicines detected. Please search manually or upload a clearer image.'
          : 'Medicine not found in database. Showing same-salt alternatives.',
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // NORMAL FLOW — Enrich each matched medicine with inventory + substitutes
    // ══════════════════════════════════════════════════════════════════════
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
    console.error('[Controller] Prescription Analysis Error:', error);

    if (error.message.includes('OCR')) {
      return res.status(422).json({
        success: false,
        status: 'error',
        code: 'OCR_FAILED',
        message: 'Unable to read prescription clearly. Please upload a clearer image or enter medicines manually.',
        requiresManualInput: true,
      });
    }

    return res.status(500).json({
      success: false,
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred.',
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
