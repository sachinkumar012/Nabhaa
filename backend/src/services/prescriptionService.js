/**
 * PrescriptionService — 7-Layer Robust OCR + Medicine Extraction + Fallback Pipeline
 *
 * Layer 1: Image Preprocessing     (sharp)
 * Layer 2: OCR Engine              (Gemini Vision API primary / Tesseract LSTM fallback)
 * Layer 3: Text Cleaning           (noise & header removal)
 * Layer 4: Medicine Line Detection (regex: tab/syp/cap + mg/ml patterns)
 * Layer 5: NLP Entity Extraction   (name, dosage, form, frequency per line)
 * Layer 6: Validation & Matching   (DB exact → prefix → fuzzy → RxNorm substitute)
 * Layer 7: Fallback Engine         (salt extraction → same-salt DB substitutes)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const stringSimilarity = require('string-similarity');
const Medicine = require('../models/Medicine');
const DrugInteraction = require('../models/DrugInteraction');
const HybridDrugService = require('./hybridDrugService');
const {
  NOISE_PATTERNS,
  MEDICINE_STOP_WORDS,
  isMedicineLine,
  extractDosage,
  extractFrequency,
  extractDuration,
  extractForm,
  extractMedicineName,
  computeConfidence,
  parseStructuredForm,
} = require('../utils/ocrUtils');

// ─── Gemini client (lazy init so startup doesn't crash if key absent) ─────
let _genAI = null;
function getGeminiClient() {
  if (!_genAI && process.env.GEMINI_API_KEY) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

class PrescriptionService {

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 1 — Image Preprocessing
  // NOTE: Full mobile preprocessing (HEIC→JPEG, EXIF rotate, resize, compress)
  // is now done in the controller via imageProcessor.js BEFORE calling this service.
  // This method is kept as a lightweight identity pass-through for compatibility.
  // ══════════════════════════════════════════════════════════════════════════
  static async preprocessImage(buffer) {
    // By the time we reach here, the controller has already:
    //   1. Converted HEIC/HEIF → JPEG
    //   2. Applied EXIF rotation
    //   3. Resized to max 1200px
    //   4. Normalized contrast + sharpened
    // So we just return the buffer as-is.
    console.log('[OCR] Image preprocessing: already done by controller (mobile-safe pipeline)');
    return buffer;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 2 — OCR Engine
  // Primary: Gemini Vision (better for handwriting, key already in .env)
  // Fallback: Tesseract LSTM (--oem 3 --psm 6)
  // ══════════════════════════════════════════════════════════════════════════
  static async extractTextFromImage(imageBuffer, mimeType = 'image/jpeg') {
    // Preprocessing already done by controller (HEIC→JPEG, EXIF rotate, resize)
    // We use the buffer directly
    const processedBuffer = imageBuffer;

    // Try Gemini Vision first — always send as image/jpeg since controller normalized it
    const effectiveMime = 'image/jpeg';
    const geminiResult = await PrescriptionService._ocrWithGemini(processedBuffer, effectiveMime);
    if (geminiResult && geminiResult.text && geminiResult.text.trim().length > 20) {
      console.log('[OCR] Gemini Vision succeeded');
      return { text: geminiResult.text, engine: 'gemini', confidence: geminiResult.confidence };
    }

    // Fallback to Tesseract LSTM
    console.log('[OCR] Falling back to Tesseract LSTM...');
    const tesseractResult = await PrescriptionService._ocrWithTesseract(processedBuffer);
    return { text: tesseractResult, engine: 'tesseract', confidence: 0.7 };
  }

  /** Gemini Vision OCR with prescription-specific prompt */
  static async _ocrWithGemini(buffer, mimeType) {
    try {
      const genAI = getGeminiClient();
      if (!genAI) throw new Error('Gemini key not configured');

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const prompt = `You are a medical prescription OCR specialist working for a pharmacy system.
Your job is to extract ALL text from this prescription image EXACTLY as written.

IMPORTANT: This prescription may be in ANY of these formats:

FORMAT A — Handwritten style (most common):
  Tab Amoxicillin 500mg BD x 5 days
  Syp Calpol 250mg TDS

FORMAT B — Structured form style (label: value pairs):
  Medication: Atorvastatin
  Dosage Form (Tablet/Capsule/Liquid): Tablet
  Strength: 40 mg
  Quantity: 30 Tablets
  Route of Administration: Oral
  Frequency: Once daily
  Duration of Therapy: 30 days

FORMAT C — Table format:
  | Medicine     | Dose  | Frequency |
  | Paracetamol  | 500mg | TDS       |

EXTRACTION RULES:
- Return ALL text verbatim, preserving line breaks
- DO NOT summarize, interpret, or skip any field
- Keep ALL label:value pairs intact (e.g., "Medication: Atorvastatin" must appear exactly)
- Keep ALL dosage info (mg, ml, mcg, g)
- Keep ALL frequency info (OD, BD, TDS, Once daily, Twice daily)
- Keep ALL duration info (x 5 days, 30 days, Duration: 30 days)

Return ONLY the raw extracted text. Nothing else.`;


      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();

      // Gemini's structured understanding gives high confidence
      return { text, confidence: 0.92 };
    } catch (err) {
      console.error('[OCR] Gemini Vision error:', err.message);
      return null;
    }
  }

  /** Tesseract LSTM OCR — best-config for medical text (mobile-optimized) */
  static async _ocrWithTesseract(buffer) {
    const Tesseract = require('tesseract.js');
    try {
      console.log(`[OCR] Tesseract: processing ${(buffer.length / 1024).toFixed(1)} KB buffer`);
      const { data } = await Tesseract.recognize(buffer, 'eng', {
        logger: () => {},
        // OEM 1 = LSTM only (more accurate than OEM 3 for clean images)
        tessedit_ocr_engine_mode: '1',
        // PSM 4 = Assume a single column of text (better for prescriptions)
        tessedit_pageseg_mode: '4',
        preserve_interword_spaces: '1',
        // Whitelist characters commonly found in prescriptions
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/()-+ ',
      });
      console.log('[OCR] Tesseract confidence:', data.confidence, '| Text length:', data.text?.length);
      return data.text;
    } catch (err) {
      console.error('[OCR] Tesseract error:', err.message);
      throw new Error('Both OCR engines failed. Unable to read prescription.');
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 3 — Text Cleaning
  // Strip doctor info, headers, noise symbols, normalize whitespace
  // ══════════════════════════════════════════════════════════════════════════
  static cleanOcrText(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // Apply all noise patterns
    for (const pattern of NOISE_PATTERNS) {
      text = text.replace(pattern, ' ');
    }

    // Normalize: collapse multiple spaces/newlines, trim lines
    text = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2)
      .join('\n');

    return text;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 4 — Medicine Line Detection
  // Filter OCR lines to only those containing medicine indicators
  // ══════════════════════════════════════════════════════════════════════════
  static detectMedicineLines(cleanedText) {
    const allLines = cleanedText.split('\n');
    const medicineLines = allLines.filter(line => isMedicineLine(line));

    console.log(`[NLP] Total lines: ${allLines.length}, Medicine lines detected: ${medicineLines.length}`);
    if (medicineLines.length > 0) {
      console.log('[NLP] Medicine lines:', medicineLines);
    }

    return medicineLines;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 5 — NLP Entity Extraction
  // Per medicine line: extract name, dosage, form, frequency, duration
  // ══════════════════════════════════════════════════════════════════════════
  static parseMedicineEntities(medicineLines) {
    const entities = [];

    for (const line of medicineLines) {
      const name = extractMedicineName(line);
      if (!name || name.length < 3) continue;
      if (MEDICINE_STOP_WORDS.has(name.toLowerCase())) continue;

      const entity = {
        rawLine: line,
        candidateName: name,
        dosage: extractDosage(line),
        form: extractForm(line),
        frequency: extractFrequency(line),
        duration: extractDuration(line),
      };

      console.log('[NLP] Parsed entity:', entity);
      entities.push(entity);
    }

    return entities;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 6 — Validation & Matching
  // For each entity: exact DB → prefix DB → fuzzy match → RxNorm fallback
  // ══════════════════════════════════════════════════════════════════════════
  static async validateAndMatchMedicines(entities) {
    const results = [];
    const FUZZY_THRESHOLD = 0.60; // Minimum similarity to accept fuzzy match

    for (const entity of entities) {
      const candidate = entity.candidateName;
      let matched = null;
      let matchType = null;
      let similarityScore = 0;

      // ── Step 1: Exact name match ────────────────────────────────────────
      matched = await Medicine.findOne({
        name: { $regex: new RegExp(`^${candidate}$`, 'i') }
      }).lean();
      if (matched) {
        matchType = 'exact';
        console.log(`[DB] Exact match: ${candidate} → ${matched.name}`);
      }

      // ── Step 2: Prefix match (starts with candidate, ≥5 chars) ─────────
      if (!matched && candidate.length >= 4) {
        const prefixMatches = await Medicine.find({
          name: { $regex: new RegExp(`^${candidate}`, 'i') }
        }).limit(3).lean();
        if (prefixMatches.length > 0) {
          matched = prefixMatches[0];
          matchType = 'prefix';
          console.log(`[DB] Prefix match: ${candidate} → ${matched.name}`);
        }
      }

      // ── Step 3: Fuzzy match via string-similarity ───────────────────────
      if (!matched && candidate.length >= 4) {
        // Pull a targeted sample from DB for fuzzy comparison
        // Use first 2 chars as prefix anchor to avoid full-table scan
        const anchor = candidate.substring(0, 2);
        const nearbyMeds = await Medicine.find({
          name: { $regex: new RegExp(`^${anchor}`, 'i') }
        }).limit(60).lean();

        if (nearbyMeds.length > 0) {
          const nameList = nearbyMeds.map(m => m.name);
          const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(
            candidate.toLowerCase(),
            nameList.map(n => n.toLowerCase())
          );

          if (bestMatch.rating >= FUZZY_THRESHOLD) {
            matched = nearbyMeds[bestMatchIndex];
            matchType = 'fuzzy';
            similarityScore = bestMatch.rating;
            console.log(`[Fuzzy] ${candidate} → ${matched.name} (score: ${bestMatch.rating.toFixed(2)})`);
          }
        }
      }

      // ── Step 4: RxNorm API fallback ─────────────────────────────────────
      if (!matched) {
        console.log(`[RxNorm] Trying external lookup for: ${candidate}`);
        try {
          const rxResult = await HybridDrugService.searchMedicine(candidate);
          if (rxResult && rxResult.source !== 'not_found') {
            results.push({
              candidateName: candidate,
              matchType: 'rxnorm',
              confidence: 0.65,
              dosage: entity.dosage,
              form: entity.form,
              frequency: entity.frequency,
              duration: entity.duration,
              rxnormResult: rxResult,
              dbMedicine: null,
            });
            continue;
          }
        } catch (e) {
          console.warn('[RxNorm] Lookup failed:', e.message);
        }

        // Totally unmatched
        results.push({
          candidateName: candidate,
          matchType: 'unmatched',
          confidence: 0.3,
          dosage: entity.dosage,
          form: entity.form,
          frequency: entity.frequency,
          duration: entity.duration,
          dbMedicine: null,
        });
        continue;
      }

      // ── Matched successfully ─────────────────────────────────────────────
      results.push({
        candidateName: candidate,
        matchedName: matched.name,
        matchType,
        confidence: computeConfidence(matchType, similarityScore),
        dosage: entity.dosage,
        form: entity.form || matched.packSize,
        frequency: entity.frequency,
        duration: entity.duration,
        dbMedicine: matched,
      });
    }

    return results;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MASTER PIPELINE — called by the controller
  // ══════════════════════════════════════════════════════════════════════════
  static async analyzePrescription(imageBuffer, mimeType) {
    // Layer 2: OCR
    const { text: rawText, engine, confidence: ocrConfidence } =
      await PrescriptionService.extractTextFromImage(imageBuffer, mimeType);

    console.log(`[Pipeline] OCR engine: ${engine}, raw text length: ${rawText.length}`);
    console.log('[Pipeline] Raw text preview:', rawText.substring(0, 400));

    // Layer 3: Clean
    const cleanedText = PrescriptionService.cleanOcrText(rawText);

    // ── Layer 3.5: Structured Form Pre-Pass ────────────────────────────────
    // Detect label:value prescription format BEFORE applying medicine line regex
    // e.g. "Medication: Atorvastatin\nStrength: 40 mg\nDosage Form: Tablet"
    // Run on RAW text (before noise removal which may strip labels)
    const structuredResult = parseStructuredForm(rawText);

    let medicineLines;
    let isStructuredForm = false;

    if (structuredResult && structuredResult.medicineLines.length > 0) {
      // Use the synthesized medicine line from structured detection
      medicineLines = structuredResult.medicineLines;
      isStructuredForm = true;
      console.log('[Pipeline] Structured form detected. Using synthesized lines:', medicineLines);
    } else {
      // Layer 4: Normal medicine line detection
      medicineLines = PrescriptionService.detectMedicineLines(cleanedText);
    }

    // Layer 5: NLP Entity Extraction
    const entities = PrescriptionService.parseMedicineEntities(medicineLines);

    // If structured but entities still empty (name was a known drug not in stop words)
    // directly create an entity from the raw fields
    if (isStructuredForm && entities.length === 0 && structuredResult.fields.medName) {
      const { medName, strength, form, frequency, duration } = structuredResult.fields;
      entities.push({
        rawLine: `${medName} ${strength || ''}`.trim(),
        candidateName: medName,
        dosage: strength || null,
        form: form || null,
        frequency: frequency || null,
        duration: duration || null,
      });
      console.log('[Pipeline] Entity injected directly from structured fields:', entities[0]);
    }

    // Layer 6: Validate + Match
    const matchedMedicines = await PrescriptionService.validateAndMatchMedicines(entities);

    // Compute overall confidence
    // Boost confidence for structured forms since labels are reliable
    const baseConfidence = matchedMedicines.length > 0
      ? matchedMedicines.reduce((sum, m) => sum + m.confidence, 0) / matchedMedicines.length
      : 0;
    const overallConfidence = isStructuredForm && baseConfidence > 0
      ? Math.max(baseConfidence, 0.75)   // structured forms are more reliable
      : baseConfidence;

    const requiresConfirmation = overallConfidence < 0.70 ||
      matchedMedicines.some(m => m.matchType === 'unmatched');

    return {
      rawText,
      cleanedText,
      ocrEngine: engine,
      ocrConfidence,
      isStructuredForm,
      medicineLines,
      extractedMedicines: matchedMedicines,
      overallConfidence: parseFloat(overallConfidence.toFixed(2)),
      requiresConfirmation,
      totalFound: matchedMedicines.filter(m => m.matchType !== 'unmatched').length,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INVENTORY + SUBSTITUTE ENGINE (kept from v1, enhanced)
  // ══════════════════════════════════════════════════════════════════════════

  static async findTargetOrSubstitutes(medicineTarget) {
    const exactMedicine = await Medicine.findById(medicineTarget._id);
    const isAvailable = exactMedicine && !exactMedicine.isDiscontinued;

    if (isAvailable) {
      return { type: 'ORIGINAL', original: exactMedicine.name, data: exactMedicine };
    }

    if (!medicineTarget.composition) {
      return {
        type: 'UNSAFE',
        original: medicineTarget.name,
        alert: 'Substitute unavailable — missing composition details.',
      };
    }

    const saltTokens = medicineTarget.composition.toLowerCase().split(' ');
    const substitutes = await Medicine.find({
      _id: { $ne: medicineTarget._id },
      isDiscontinued: false,
      composition: { $regex: new RegExp(saltTokens[0], 'i') },
    }).limit(5);

    return {
      type: 'SUBSTITUTE',
      original: medicineTarget.name,
      originalComposition: medicineTarget.composition,
      rawSubstitutes: substitutes,
    };
  }

  static async validateSubstitutes(substitutePayload, patientCurrentMeds) {
    if (substitutePayload.type !== 'SUBSTITUTE') return substitutePayload;

    const safeSubstitutes = [];

    for (const sub of substitutePayload.rawSubstitutes) {
      let isSafe = true;

      if (patientCurrentMeds && patientCurrentMeds.length > 0) {
        for (const currentMed of patientCurrentMeds) {
          const interaction = await DrugInteraction.findOne({
            $or: [
              { salt1: sub.composition?.toLowerCase(), salt2: currentMed.composition?.toLowerCase() },
              { salt2: sub.composition?.toLowerCase(), salt1: currentMed.composition?.toLowerCase() },
            ],
          });
          if (interaction && ['contraindicated', 'high'].includes(interaction.severity?.toLowerCase())) {
            isSafe = false;
            break;
          }
        }
      }

      if (isSafe) {
        const mockDistance = Math.floor(Math.random() * 10) + 1;
        const mockMatchPercentage = Math.floor(Math.random() * 20) + 80;
        safeSubstitutes.push({
          ...sub.toObject(),
          matchPercentage: mockMatchPercentage,
          distance: mockDistance,
        });
      }
    }

    if (safeSubstitutes.length === 0) {
      return {
        type: 'UNSAFE',
        original: substitutePayload.original,
        alert: 'Consult Pharmacist: No safe substitute found.',
      };
    }

    safeSubstitutes.sort((a, b) => {
      const scoreA = (a.matchPercentage * 0.5) + ((100 / (a.price || 100)) * 0.3) + ((10 / (a.distance || 1)) * 0.2);
      const scoreB = (b.matchPercentage * 0.5) + ((100 / (b.price || 100)) * 0.3) + ((10 / (b.distance || 1)) * 0.2);
      return scoreB - scoreA;
    });

    return { ...substitutePayload, substitutes: safeSubstitutes };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ON-DEMAND FUZZY SEARCH — for /validate-medicine UI route
  // ══════════════════════════════════════════════════════════════════════════
  static async fuzzySearchMedicine(query) {
    if (!query || query.length < 2) return [];

    const anchor = query.substring(0, 2);
    const candidates = await Medicine.find({
      name: { $regex: new RegExp(`^${anchor}`, 'i') },
    }).limit(80).lean();

    if (candidates.length === 0) return [];

    const nameList = candidates.map(m => m.name.toLowerCase());
    const { ratings } = stringSimilarity.findBestMatch(query.toLowerCase(), nameList);

    return candidates
      .map((med, i) => ({ ...med, similarity: ratings[i].rating }))
      .filter(m => m.similarity >= 0.4)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 8);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYER 7 — Fallback Engine
  // Triggers when: OCR confidence <60% | 0 meds found | all meds unmatched
  // Flow: candidate name → RxNorm/DB salt → same-salt DB substitutes
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Decide whether the fallback engine should fire
   * Conditions:
   *   - OCR confidence < 0.60
   *   - Zero medicines matched
   *   - All medicines are 'unmatched' (no DB record)
   */
  static shouldTriggerFallback(pipelineResult) {
    // Never fallback when structured form parsing found a matched medicine
    // (Tesseract confidence is low for text-only forms but results are correct)
    if (pipelineResult.isStructuredForm && pipelineResult.totalFound > 0) return false;

    if (pipelineResult.overallConfidence < 0.60) return true;
    if (pipelineResult.totalFound === 0) return true;
    if (pipelineResult.extractedMedicines.length === 0) return true;
    const allUnmatched = pipelineResult.extractedMedicines.every(
      m => m.matchType === 'unmatched'
    );
    if (allUnmatched) return true;
    return false;
  }


  /**
   * Extract the active salt/composition for a medicine name.
   * Strategy:
   *   1. Exact DB lookup for composition field
   *   2. RxNorm API lookup (salt from drug name)
   *   3. Return null if neither works
   */
  static async extractSalt(medicineName) {
    if (!medicineName) return null;

    // 1. Internal DB — fastest path
    const dbMed = await Medicine.findOne({
      name: { $regex: new RegExp(medicineName, 'i') },
    }).lean();
    if (dbMed && dbMed.composition) {
      // Composition may look like "Paracetamol (500mg)" or "Amox + Clav"
      // Extract first salt token
      const salt = dbMed.composition
        .split(/[+(,]/)[0]          // split on +, (, ,
        .replace(/\(.*\)/g, '')     // remove parenthetical
        .trim();
      if (salt.length >= 3) {
        console.log(`[Fallback] Salt from DB: ${salt}`);
        return salt;
      }
    }

    // 2. RxNorm API
    try {
      const rxResult = await HybridDrugService.searchRxNorm(medicineName);
      if (rxResult && rxResult.salt) {
        // RxNorm returns strings like "Acetaminophen Oral Tablet"
        const salt = rxResult.salt.split(' ')[0];
        console.log(`[Fallback] Salt from RxNorm: ${salt}`);
        return salt;
      }
    } catch (e) {
      console.warn('[Fallback] RxNorm lookup failed:', e.message);
    }

    return null;
  }

  /**
   * Find same-salt medicines from MongoDB.
   * Applies form + rough dosage filtering when info is available.
   */
  static async findSaltSubstitutes(salt, dosage, form) {
    if (!salt) return [];

    const baseMeds = await Medicine.find({
      composition: { $regex: new RegExp(salt, 'i') },
      isDiscontinued: false,
    }).limit(10).lean();

    if (baseMeds.length === 0) return [];

    // Prefer matching form (Syrup, Tablet, etc.)
    if (form) {
      const formFiltered = baseMeds.filter(m => {
        const combined = `${m.packSize || ''} ${m.type || ''}`.toLowerCase();
        return combined.includes(form.toLowerCase());
      });
      if (formFiltered.length >= 2) {
        return formFiltered.map(m => ({
          _id: m._id,
          name: m.name,
          price: m.price,
          composition: m.composition,
          packSize: m.packSize,
          manufacturer: m.manufacturer,
          stock: true,
          tag: 'Same Salt Alternative',
        }));
      }
    }

    return baseMeds.map(m => ({
      _id: m._id,
      name: m.name,
      price: m.price,
      composition: m.composition,
      packSize: m.packSize,
      manufacturer: m.manufacturer,
      stock: true,
      tag: 'Same Salt Alternative',
    }));
  }

  /**
   * Run the full Layer 7 fallback pipeline.
   * Returns a structured fallback payload for the controller.
   */
  static async runFallbackPipeline(pipelineResult) {
    // Determine why fallback was triggered
    let reason = 'not_found';
    if (pipelineResult.overallConfidence < 0.60) reason = 'low_confidence';
    if (pipelineResult.extractedMedicines.length === 0) reason = 'no_detection';

    // Gather candidate names from:
    //   a) already-extracted but unmatched entities
    //   b) OCR medicine lines (re-parse if entities were empty)
    const candidateNames = [];

    for (const med of pipelineResult.extractedMedicines) {
      if (med.candidateName) candidateNames.push({
        name: med.candidateName,
        dosage: med.dosage,
        form: med.form,
      });
    }

    // If no entity candidates, try extracting from raw medicine lines
    if (candidateNames.length === 0 && pipelineResult.medicineLines?.length > 0) {
      for (const line of pipelineResult.medicineLines.slice(0, 5)) {
        const { extractMedicineName, extractDosage, extractForm } = require('../utils/ocrUtils');
        const name = extractMedicineName(line);
        if (name) candidateNames.push({
          name,
          dosage: extractDosage(line),
          form: extractForm(line),
        });
      }
    }

    const fallbackMedicines = [];

    // For each candidate — extract salt, find substitutes
    const processed = new Set();
    for (const candidate of candidateNames.slice(0, 6)) {
      if (!candidate.name || processed.has(candidate.name.toLowerCase())) continue;
      processed.add(candidate.name.toLowerCase());

      const salt = await PrescriptionService.extractSalt(candidate.name);
      const substitutes = await PrescriptionService.findSaltSubstitutes(
        salt, candidate.dosage, candidate.form
      );

      const dosageWarning = candidate.dosage && substitutes.length > 0
        ? substitutes.filter(s =>
            s.packSize && !s.packSize.includes(candidate.dosage)
          ).length > 0
          ? 'Note: Dosage may differ from prescribed. Consult pharmacist.'
          : null
        : null;

      fallbackMedicines.push({
        originalInput: candidate.name,
        salt: salt || null,
        dosage: candidate.dosage,
        form: candidate.form,
        substitutes,
        dosageWarning,
        hasSubstitutes: substitutes.length > 0,
        message: substitutes.length > 0
          ? `Original medicine not found. Showing same-salt (${salt || 'composition'}) alternatives.`
          : salt
            ? `No alternatives found for salt: ${salt}. Please search manually.`
            : 'Could not determine medicine composition. Please search manually.',
      });
    }

    // If absolutely no candidates — return generic prompt
    if (fallbackMedicines.length === 0) {
      fallbackMedicines.push({
        originalInput: null,
        salt: null,
        dosage: null,
        form: null,
        substitutes: [],
        hasSubstitutes: false,
        message: 'No medicines detected in the prescription. Please enter manually or upload a clearer image.',
      });
    }

    return { reason, fallbackMedicines };
  }
}

module.exports = PrescriptionService;
