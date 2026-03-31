/**
 * Quick test: verify parseStructuredForm() correctly extracts
 * Atorvastatin from the sample structured prescription
 */

const { parseStructuredForm } = require('./src/utils/ocrUtils');

// Simulate what Tesseract extracts from the sample prescription image
const sampleOcrText = `Sample General Prescription
Date: October 8, 2085

Patient Information

Name: Katherine Connel
Date of Birth: January 1, 2050
Patient ID: 987654321

Prescription Details

Medication: Atorvastatin
Dosage Form (Tablet/Capsule/Liquid): Tablet
Strength: 40 mg
Quantity: 30 Tablets
Route of Administration: Oral
Frequency: Once daily
Duration of Therapy: 30 days

Refill Information
No Refills
Number of Refills: 2

Substitution Allowed?
Yes`;

console.log('\n========================================');
console.log('STRUCTURED FORM PARSER TEST');
console.log('========================================\n');

const result = parseStructuredForm(sampleOcrText);

if (!result) {
  console.log('❌ FAILED: parseStructuredForm returned null');
  process.exit(1);
}

console.log('✅ Structured form detected:', result.isStructured);
console.log('\nExtracted fields:');
console.log('  Medicine:', result.fields.medName);
console.log('  Strength:', result.fields.strength);
console.log('  Form:', result.fields.form);
console.log('  Frequency:', result.fields.frequency);
console.log('  Duration:', result.fields.duration);
console.log('\nSynthesized medicine line:');
console.log(' ', result.medicineLines[0]);

// Assertions
const passed = [];
const failed = [];

if (result.fields.medName === 'Atorvastatin') passed.push('medName = Atorvastatin');
else failed.push(`medName expected "Atorvastatin", got "${result.fields.medName}"`);

if (result.fields.strength && result.fields.strength.includes('40')) passed.push('strength contains 40mg');
else failed.push(`strength expected "40 mg", got "${result.fields.strength}"`);

if (result.fields.form && result.fields.form.toLowerCase().includes('tablet')) passed.push('form = Tablet');
else failed.push(`form expected "Tablet", got "${result.fields.form}"`);

if (result.fields.frequency) passed.push('frequency extracted');
else failed.push('frequency not extracted');

console.log('\n======== Assertions ========');
passed.forEach(p => console.log(`  ✅ ${p}`));
failed.forEach(f => console.log(`  ❌ ${f}`));

console.log(`\nResult: ${failed.length === 0 ? '✅ ALL PASSED' : `❌ ${failed.length} FAILED`}`);
