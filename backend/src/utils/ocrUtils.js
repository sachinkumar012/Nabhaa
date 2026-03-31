/**
 * OCR Utilities — Regex constants + helper functions for prescription parsing
 * Used by prescriptionService.js
 */

// ─── Medicine Form Prefixes ────────────────────────────────────────────────
const MEDICINE_PREFIXES = [
  'tab', 'tablet', 'cap', 'capsule', 'caps',
  'syp', 'syr', 'syrup',
  'inj', 'injection',
  'oint', 'ointment',
  'gel', 'cream', 'lotion',
  'drops', 'drop', 'susp', 'suspension',
  'powder', 'sachet', 'patch',
  'inhaler', 'nebulizer', 'spray',
  'solution', 'sol',
];

// ─── Dosage Pattern (e.g. 250mg, 5ml, 500mcg, 100IU) ─────────────────────
const DOSAGE_REGEX = /(\d+(?:\.\d+)?)\s*(mg|ml|mcg|µg|iu|g|mmol|meq|%)\b/i;
const DOSAGE_REGEX_GLOBAL = /(\d+(?:\.\d+)?)\s*(mg|ml|mcg|µg|iu|g|mmol|meq|%)\b/gi;

// ─── Frequency Patterns ───────────────────────────────────────────────────
const FREQUENCY_MAP = {
  'od': 'Once Daily',
  'bd': 'Twice Daily',
  'tds': 'Three Times Daily',
  'qid': 'Four Times Daily',
  'sos': 'As Needed',
  'q6h': 'Every 6 Hours',
  'q8h': 'Every 8 Hours',
  'q12h': 'Every 12 Hours',
  '12hly': 'Every 12 Hours',
  'nocte': 'At Night',
  'stat': 'Immediately',
  'prn': 'As Needed',
  'ac': 'Before Meals',
  'pc': 'After Meals',
};

const FREQUENCY_REGEX = /\b(od|bd|tds|qid|sos|q6h|q8h|q12h|12hly|nocte|stat|prn|ac|pc|x\s+\d+\s*days?)\b/i;
const FREQUENCY_REGEX_GLOBAL = /\b(od|bd|tds|qid|sos|q6h|q8h|q12h|12hly|nocte|stat|prn|ac|pc|x\s+\d+\s*days?)\b/gi;

// ─── Duration Pattern (e.g. x 3d, x 5 days, for 7 days) ─────────────────
const DURATION_REGEX = /(?:x\s*(\d+)\s*(?:d|days?)|for\s*(\d+)\s*days?)/i;

// ─── Noise / Header Patterns to strip from OCR output ────────────────────
const NOISE_PATTERNS = [
  // Patient info headers — only strip the label+value, NOT structured drug fields
  /\b(patient\s*(?:name|id)?|name)\s*:?\s*[\w\s.,/-]{1,40}/gi,
  /\b(age|sex|gender|dob|date of birth)\s*:?\s*[\w\s.,/-]{1,20}/gi,
  /\b(weight|wt|ht|height)\s*:?\s*[\d.,\s]*(kg|lbs|cm|ft)?/gi,
  /\b(date|dt)\s*:?\s*[\d/.-]+/gi,
  // Clinical descriptions
  /\bclinical\s*(?:description|diagnosis|complaint)?\s*:?\s*[\w\s]{0,60}/gi,
  /\bdiagnosis\s*:?\s*[\w\s,]{0,60}/gi,
  // Doctor / Hospital info
  /\b(dr|doctor|physician|specialist)\s*\.?\s*[\w\s.,]{0,40}/gi,
  /\b(hospital|clinic|medical centre|medical center|nursing home)\s*[\w\s.,]{0,40}/gi,
  /\bregistration\s*(?:no|number)?\s*:?\s*[\w\s]{0,20}/gi,
  // Prescription boilerplate (but NOT medication/strength/form/frequency labels)
  /\b(rx|\u211e|advice|signature|seal|stamp)\b/gi,
  /\bref(?:ills?)?\s*:?\s*[\w\s]{0,20}/gi,
  // Common noise tokens
  /\b(urti|lrti|rtgs|nill?)\b/gi,
  // Pure number lines (dates, phone numbers)
  /^\s*[\d\s\-+().]+\s*$/gm,
  // Lines that are just symbols
  /^[^a-z0-9]+$/gim,
];

// ─── Structured Form Detection ───────────────────────────────────────────────
// Matches prescription label-value pairs:  "Medication: Atorvastatin"
const STRUCT_MED_RE    = /^(?:medication|drug|medicine|medication\s*name|drug\s*name|item|rx\s*item)\s*[:\-]\s*(.+)/i;
const STRUCT_DOSE_RE   = /^(?:strength|dose|dosage|concentration)\s*[:\-]\s*([\d.]+\s*(?:mg|ml|mcg|g|iu|%))/i;
const STRUCT_FORM_RE   = /^(?:dosage\s*form[^:]*|form|route\s*of[^:]*|formulation)\s*[:\-]\s*(tablet|capsule|syrup|injection|oral|liquid|cream|gel|drop|powder|inhaler|suspension|solution)/i;
const STRUCT_FREQ_RE   = /^(?:frequency|directions?|take|give|administer|sig)\s*[:\-]\s*(.+)/i;
const STRUCT_DUR_RE    = /^(?:duration[^:]*|days\s*supply|therapy\s*duration|quantity)\s*[:\-]\s*(\d+)/i;
const STRUCT_QTY_RE    = /^(?:quantity|qty)\s*[:\-]\s*(\d+)\s*(tablets?|capsules?|ml|units?)/i;

/**
 * Detect if OCR text contains a structured (form-based) prescription.
 * Returns extracted fields or null if not a structured form.
 * This handles formats like:
 *   Medication: Atorvastatin
 *   Strength: 40 mg
 *   Dosage Form: Tablet
 *   Frequency: Once daily
 *   Duration of Therapy: 30 days
 */
function parseStructuredForm(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2);

  let medName = null, strength = null, form = null, frequency = null, duration = null;

  for (const line of lines) {
    if (!medName) {
      const m = line.match(STRUCT_MED_RE);
      if (m) { medName = m[1].trim(); continue; }
    }
    if (!strength) {
      const m = line.match(STRUCT_DOSE_RE);
      if (m) { strength = m[1].trim(); continue; }
    }
    if (!form) {
      const m = line.match(STRUCT_FORM_RE);
      if (m) { form = m[1].trim(); continue; }
    }
    if (!frequency) {
      const m = line.match(STRUCT_FREQ_RE);
      if (m) { frequency = m[1].trim(); continue; }
    }
    if (!duration) {
      const m = line.match(STRUCT_DUR_RE);
      if (m) { duration = m[1].trim() + ' days'; continue; }
    }
  }

  // Must at least have a medicine name to be considered structured
  if (!medName) return null;

  // Normalize form prefix for the synthesized line
  const formPrefix = form
    ? (form.toLowerCase().startsWith('tablet') ? 'Tab'
       : form.toLowerCase().startsWith('capsule') ? 'Cap'
       : form.toLowerCase().startsWith('syrup') ? 'Syp'
       : form.toLowerCase().startsWith('injection') ? 'Inj'
       : 'Tab')
    : 'Tab';

  // Synthesize a medicine line the normal pipeline understands:
  // e.g. "Tab Atorvastatin 40mg"
  const synthesized = [
    formPrefix,
    medName,
    strength || '',
    frequency ? frequency.split(' ').slice(0, 3).join(' ') : '',
    duration ? `x ${duration}` : '',
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

  console.log('[Structured Form] Detected. Synthesized line:', synthesized);

  return {
    isStructured: true,
    medicineLines: [synthesized],
    fields: { medName, strength, form, frequency, duration },
  };
}

// ─── Stop words that are NEVER medicine names ─────────────────────────────
const MEDICINE_STOP_WORDS = new Set([
  // Patient / document headers
  'name', 'age', 'sex', 'gender', 'date', 'weight', 'hospital', 'clinic',
  'clinical', 'description', 'advice', 'total', 'bill', 'receipt', 'amount',
  'signature', 'urti', 'lrti', 'min', 'max', 'rx', 'fees', 'paid', 'patient',
  'information', 'strength', 'quantity', 'route', 'administration', 'oral',
  'frequency', 'once', 'daily', 'duration', 'therapy', 'days', 'refill',
  'number', 'substitution', 'allowed', 'general', 'prescription', 'details',
  'birth', 'morning', 'night', 'evening', 'afternoon', 'before', 'after',
  'meals', 'food', 'water', 'doctor', 'physician', 'registered', 'medical',
  'council', 'license', 'contact', 'phone', 'mobile', 'email', 'address',
  'district', 'state', 'pincode', 'india',
  // Instruction labels that OCR picks up from structured forms
  'medication', 'drug', 'medicine', 'dosage', 'dose', 'form', 'tablet',
  'capsule', 'liquid', 'instructions', 'direction', 'directions', 'take',
  'give', 'apply', 'instill', 'inject', 'dispense', 'sig', 'each', 'with',
  'without', 'empty', 'stomach', 'full', 'repeat', 'times', 'hour', 'hours',
  'week', 'weeks', 'month', 'months', 'prescribed', 'january', 'february',
  'march', 'april', 'june', 'july', 'august', 'september', 'october',
  'november', 'december',
  // Units / boilerplate
  'stat', 'prn', 'sos', 'nocte', 'other', 'note', 'notes', 'follow',
  'review', 'come', 'back', 'next', 'visit', 'report', 'test', 'unspecified',
  // Structured form field labels (never a medicine name)
  'item', 'sample', 'general', 'refill', 'substitution',
]);

// ─── Form normalizer ──────────────────────────────────────────────────────
function normalizeForm(rawPrefix) {
  const p = (rawPrefix || '').toLowerCase().trim();
  if (['tab', 'tablet'].includes(p)) return 'Tablet';
  if (['cap', 'capsule', 'caps'].includes(p)) return 'Capsule';
  if (['syp', 'syr', 'syrup'].includes(p)) return 'Syrup';
  if (['inj', 'injection'].includes(p)) return 'Injection';
  if (['susp', 'suspension'].includes(p)) return 'Suspension';
  if (['oint', 'ointment'].includes(p)) return 'Ointment';
  if (['gel'].includes(p)) return 'Gel';
  if (['cream'].includes(p)) return 'Cream';
  if (['drops', 'drop'].includes(p)) return 'Drops';
  if (['inhaler', 'spray'].includes(p)) return 'Inhaler';
  if (['powder', 'sachet'].includes(p)) return 'Powder';
  return rawPrefix ? rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1) : 'Unknown';
}

// ─── Build regex to detect medicine lines ────────────────────────────────
const MEDICINE_LINE_REGEX = new RegExp(
  `(?:^|\\n)\\s*(?:${MEDICINE_PREFIXES.join('|')})\\s*\\.?\\s*[a-z]`,
  'i'
);

// Check if a line contains dosage/form indicators (stricter — avoids noise words)
function isMedicineLine(line) {
  const lower = line.toLowerCase();

  // ── Gate 1: Must have a medicine prefix (Tab/Cap/Syp/Inj etc.) ──────────
  const hasPrefix = MEDICINE_PREFIXES.some(p => {
    const re = new RegExp(`\\b${p}\\b`, 'i');
    return re.test(lower);
  });
  if (hasPrefix) {
    // Even with a prefix, gate out lines where the first real word is a stop word
    // e.g. "Tablet strength 500mg" should NOT pass
    const words = lower.replace(/(tab|cap|syp|syr|inj|oint|gel|cream|drops|susp|sachet|spray|sol)\b/gi, '')
      .split(/\s+/).filter(w => w.length >= 4 && /^[a-z]/.test(w));
    if (words.length > 0 && MEDICINE_STOP_WORDS.has(words[0])) return false;
    return true;
  }

  // ── Gate 2: Dosage unit present + at least one non-stopword alpha word ──
  if (DOSAGE_REGEX.test(lower)) {
    const nonDosagePart = lower
      .replace(DOSAGE_REGEX_GLOBAL, '')
      .replace(FREQUENCY_REGEX_GLOBAL, '')
      .replace(/[\d()×x\/\\.,;:]+/g, ' ');
    const words = nonDosagePart.split(/\s+/)
      .filter(w => w.length >= 4 && /^[a-z]/.test(w) && !MEDICINE_STOP_WORDS.has(w));
    if (words.length > 0) return true;
  }

  return false;
}

// ─── Extract dosage string from a line ───────────────────────────────────
function extractDosage(line) {
  const matches = line.match(DOSAGE_REGEX);
  if (matches) return `${matches[1]}${matches[2].toLowerCase()}`;
  // Parenthetical dosage e.g. "(250/5)" or "(100/5)"
  const parenMatch = line.match(/\((\d+(?:\/\d+)?)\)/);
  if (parenMatch) return parenMatch[1];
  return null;
}

// ─── Extract frequency from a line ───────────────────────────────────────
function extractFrequency(line) {
  const match = line.match(FREQUENCY_REGEX);
  if (!match) return null;
  const key = match[1].toLowerCase().replace(/\s/g, '');
  return FREQUENCY_MAP[key] || match[1].toUpperCase();
}

// ─── Extract duration from a line ────────────────────────────────────────
function extractDuration(line) {
  const match = line.match(DURATION_REGEX);
  if (!match) return null;
  const days = match[1] || match[2];
  return `${days} day${days === '1' ? '' : 's'}`;
}

// ─── Extract form prefix from a line ─────────────────────────────────────
function extractForm(line) {
  for (const prefix of MEDICINE_PREFIXES) {
    const re = new RegExp(`\\b${prefix}\\b`, 'i');
    if (re.test(line)) return normalizeForm(prefix);
  }
  return null;
}

// ─── Extract candidate medicine name from a line ─────────────────────────
function extractMedicineName(line) {
  // Remove the form prefix
  let cleaned = line;
  for (const prefix of MEDICINE_PREFIXES) {
    cleaned = cleaned.replace(new RegExp(`\\b${prefix}\\b\\.?\\s*`, 'i'), '');
  }
  // Remove dosage, frequency, duration, numbers
  cleaned = cleaned
    .replace(DOSAGE_REGEX_GLOBAL, '')
    .replace(FREQUENCY_REGEX_GLOBAL, '')
    .replace(DURATION_REGEX, '')
    .replace(/\d+\s*ml\s*/gi, '')
    .replace(/[()×x\d\s\/\\.,;:]+/g, ' ')
    .trim();

  // Get the first substantial word (medicine name)
  const words = cleaned.split(/\s+/).filter(w => w.length >= 3 && /^[a-z]/i.test(w));
  return words.length > 0 ? words[0] : null;
}

// ─── Compute confidence score ─────────────────────────────────────────────
function computeConfidence(matchType, similarityScore) {
  if (matchType === 'exact') return 0.98;
  if (matchType === 'prefix') return 0.88;
  if (matchType === 'fuzzy') return Math.min(0.5 + similarityScore * 0.4, 0.87);
  return 0.5;
}

module.exports = {
  MEDICINE_PREFIXES,
  DOSAGE_REGEX,
  FREQUENCY_REGEX,
  MEDICINE_STOP_WORDS,
  FREQUENCY_MAP,
  isMedicineLine,
  extractDosage,
  extractFrequency,
  extractDuration,
  extractForm,
  extractMedicineName,
  normalizeForm,
  computeConfidence,
  NOISE_PATTERNS,
  parseStructuredForm,
};
