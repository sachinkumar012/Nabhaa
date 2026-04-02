const Medicine = require('../models/Medicine');
const Doctor   = require('../models/doctorModel');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── Use gemini-2.5-flash (confirmed available on this key) ──────────────────
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Symptom → Specialization map ────────────────────────────────────────────
const SYMPTOM_SPECIALTY_MAP = {
  fever: 'General Physician', headache: 'General Physician', cold: 'General Physician',
  flu: 'General Physician', cough: 'Pulmonologist', chest: 'Cardiologist',
  heart: 'Cardiologist', skin: 'Dermatologist', rash: 'Dermatologist',
  acne: 'Dermatologist', eye: 'Ophthalmologist', ear: 'ENT Specialist',
  throat: 'ENT Specialist', bone: 'Orthopedic', joint: 'Orthopedic',
  back: 'Orthopedic', stomach: 'Gastroenterologist', abdomen: 'Gastroenterologist',
  diabetes: 'Endocrinologist', thyroid: 'Endocrinologist', mental: 'Psychiatrist',
  anxiety: 'Psychiatrist', depression: 'Psychiatrist', child: 'Pediatrician',
  pregnancy: 'Gynecologist', women: 'Gynecologist', kidney: 'Nephrologist',
  urine: 'Nephrologist', brain: 'Neurologist', nerve: 'Neurologist', cancer: 'Oncologist',
};

function guessSpecialty(symptoms = []) {
  const lower = symptoms.join(' ').toLowerCase();
  for (const [keyword, specialty] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
    if (lower.includes(keyword)) return specialty;
  }
  return 'General Physician';
}

// ── Main controller ──────────────────────────────────────────────────────────
exports.checkSymptoms = async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }

    const langMap = { en: 'English', hi: 'Hindi', pa: 'Punjabi' };
    const langName = langMap[language] || 'English';

    // ── Build the full prompt including system context ──────────────────────
    // NOTE: We embed the system prompt as the first user turn to avoid
    // system_instruction format compatibility issues across model versions.
    const systemContext = `You are Nabha AI, an advanced AI Health Assistant for the Nabha HealthTech platform in India.
You MUST always respond in ${langName}.
You are NOT a doctor. This is informational only.

CRITICAL: Respond ONLY with a valid JSON object. No markdown fences, no explanation text, just raw JSON.

JSON format:
{
  "text": "conversational reply in ${langName} (2-3 sentences max)",
  "possibleConditions": [
    { "name": "Condition Name", "probability": "High", "description": "brief in ${langName}" }
  ],
  "symptoms": ["symptom1", "symptom2"],
  "severity": "low",
  "urgencyLevel": "low",
  "precautions": ["precaution in ${langName}"],
  "medicineKeywords": ["paracetamol", "ibuprofen"],
  "doctorSpecialization": "General Physician",
  "homeRemedies": ["remedy in ${langName}"],
  "followUpQuestion": "one follow-up question in ${langName}",
  "requiresUrgentCare": false
}

severity/urgencyLevel values: "low", "medium", or "high"
requiresUrgentCare: true only for severe symptoms like chest pain, difficulty breathing, stroke signs.

If not a health query: respond with text field only and empty arrays for everything else.`;

    // ── Build conversation contents ─────────────────────────────────────────
    const contents = [];

    // Inject system context as first model turn (workaround for system_instruction)
    contents.push({
      role: 'user',
      parts: [{ text: systemContext + '\n\nUnderstood? Reply with just: {"ready": true}' }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: '{"ready": true}' }]
    });

    // Add recent conversation history
    for (const msg of conversationHistory.slice(-6)) {
      contents.push({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: String(msg.text || '') }]
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // ── Call Gemini API ─────────────────────────────────────────────────────
    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API Error:', geminiResponse.status, errText.substring(0, 300));
      throw new Error(`Gemini API returned ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // ── Parse JSON response ─────────────────────────────────────────────────
    let aiData = null;
    try {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error('JSON parse error, raw text:', rawText.substring(0, 200));
    }

    // Fallback if parsing failed
    if (!aiData || aiData.ready) {
      aiData = {
        text: rawText || 'Please describe your symptoms in more detail.',
        possibleConditions: [],
        symptoms: [],
        severity: 'low',
        urgencyLevel: 'low',
        precautions: [],
        medicineKeywords: [],
        doctorSpecialization: 'General Physician',
        homeRemedies: [],
        followUpQuestion: '',
        requiresUrgentCare: false
      };
    }

    // ── Fetch medicines from MongoDB ────────────────────────────────────────
    let medicines = [];
    const keywords = aiData.medicineKeywords || [];
    if (keywords.length > 0) {
      try {
        const orClauses = keywords.flatMap(k => [
          { name: { $regex: k, $options: 'i' } },
          { composition: { $regex: k, $options: 'i' } }
        ]);
        medicines = await Medicine.find({ $or: orClauses, isDiscontinued: false })
          .select('name price manufacturer packSize composition type')
          .limit(6)
          .lean();
      } catch (e) {
        console.error('Medicine fetch error:', e.message);
      }
    }

    // Fallback: search by first symptom
    if (medicines.length === 0 && aiData.symptoms?.length > 0) {
      try {
        medicines = await Medicine.find({
          $or: [
            { name: { $regex: aiData.symptoms[0], $options: 'i' } },
            { composition: { $regex: aiData.symptoms[0], $options: 'i' } }
          ],
          isDiscontinued: false
        }).select('name price manufacturer packSize composition type').limit(4).lean();
      } catch (e) { /* silent */ }
    }

    // ── Fetch doctors from MongoDB ──────────────────────────────────────────
    let doctors = [];
    const specialty = aiData.doctorSpecialization || guessSpecialty(aiData.symptoms);
    try {
      doctors = await Doctor.find({
        $or: [
          { specialty: { $regex: specialty, $options: 'i' } },
          { specialty: { $regex: 'General', $options: 'i' } }
        ],
        isApproved: true
      })
        .select('name specialty experience location rating image')
        .limit(4)
        .lean();
    } catch (e) {
      console.error('Doctor fetch error:', e.message);
    }

    // ── Build final response ────────────────────────────────────────────────
    return res.json({
      success: true,
      text: aiData.text || '',
      structuredData: {
        possibleConditions: aiData.possibleConditions || [],
        medicines: medicines.map(m => ({
          _id: m._id,
          name: m.name,
          salt: m.composition || '',
          dosage: m.packSize || '',
          price: m.price,
          manufacturer: m.manufacturer,
          type: m.type
        })),
        doctors: doctors.map(d => ({
          _id: d._id,
          name: d.name,
          specialty: d.specialty,
          experience: d.experience,
          location: d.location,
          rating: d.rating,
          image: d.image
        })),
        precautions: aiData.precautions || [],
        homeRemedies: aiData.homeRemedies || [],
        urgencyLevel: aiData.urgencyLevel || 'low',
        severity: aiData.severity || 'low',
        requiresUrgentCare: Boolean(aiData.requiresUrgentCare),
        followUpQuestion: aiData.followUpQuestion || '',
        doctorSpecialization: specialty
      }
    });

  } catch (error) {
    console.error('Symptom Check Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again in a moment.',
      error: error.message
    });
  }
};
