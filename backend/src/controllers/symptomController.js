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
Match the user's LANGUAGE and SCRIPT.
- If user speaks Hindi (Devanagari) → Respond in Hindi (Devanagari).
- If user speaks Punjabi (Gurmukhi) → Respond in Punjabi (Gurmukhi).
- If user speaks English → Respond in English.
The user's preferred language is ${langName}, but you MUST prioritize the language used in their message.

You are NOT a doctor. This is informational only.

CRITICAL: Respond ONLY with a valid JSON object. No markdown fences, no explanation text, just raw JSON.

JSON format:
{
  "text": "conversational reply in native script (2-3 sentences max)",
  "possibleConditions": [
    { "name": "Condition Name", "probability": "High", "description": "brief explanation" }
  ],
  "symptoms": ["symptom1", "symptom2"],
  "severity": "low",
  "urgencyLevel": "low",
  "precautions": ["precaution"],
  "medicineKeywords": ["paracetamol", "ibuprofen"],
  "doctorSpecialization": "General Physician",
  "homeRemedies": ["remedy"],
  "followUpQuestion": "one follow-up question",
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

// ══════════════════════════════════════════════════════════════════════════════
// VOICE CHAT — Real-time conversational voice endpoint for Nabha AI
// ══════════════════════════════════════════════════════════════════════════════
exports.voiceChat = async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }

    const langMap = { en: 'English', hi: 'Hindi', pa: 'Punjabi' };
    const langName = langMap[language] || 'English';

    // ── Nabha AI Voice Persona Prompt ───────────────────────────────────────
    const systemContext = `You are "Nabha AI", a warm, calm, and intelligent FEMALE virtual health assistant. You are speaking through voice in real-time to a patient.

PERSONALITY & TONE:
- Speak in a soft, friendly, and reassuring tone
- Be polite, empathetic, and patient at all times
- Use simple, natural language (avoid medical jargon)
- Sound conversational, not robotic
- Add small human-like fillers occasionally (e.g., "okay", "hmm", "I understand", "alright")
- Never rush the user

VOICE RESPONSE RULES (CRITICAL):
- Keep responses SHORT: 1-2 sentences maximum unless absolutely necessary
- Ask ONE question at a time
- Structure responses for SPEECH, not text — no bullet points, no lists, no markdown
- Use natural pauses with commas and periods
- Never use emojis, special characters, or formatting

LANGUAGE: Respond in the SAME language and SCRIPT as the user.
- If user speaks Hindi (Devanagari) → Respond in Hindi (Devanagari script only). 
- If user speaks Punjabi (Gurmukhi) → Respond in Punjabi (Gurmukhi script only).
- If user speaks English → Respond in English.
Avoid Romanized script (Hinglish/Punglish). 
Avoid English fillers like "Okay", "Alright", or "I see" when speaking Hindi/Punjabi; use native equivalents (e.g., "ठीक है", "मैं समझ गई") instead.
The user's preferred language setting is ${langName}, but prioritize mirroring their actual speech.

MEDICAL SAFETY:
- Do NOT give dangerous or definitive diagnoses
- Provide general guidance only
- For serious symptoms (chest pain, breathing difficulty, stroke signs, unconsciousness, severe bleeding):
  → Set requiresUrgentCare to true and immediately suggest emergency help

CONVERSATION STYLE:
- If user sounds worried → be extra calming
- If user sounds confused → simplify your language
- Always acknowledge what the patient said before asking next question
- Example flow: "Okay, since when are you having this headache?" → "Got it. Is the pain mild or severe?" → "I understand. Let me suggest a few things that might help."

ERROR HANDLING:
- If you don't understand: "Sorry, I didn't quite catch that. Could you say that again?"

CRITICAL: Respond ONLY with a valid JSON object. No markdown, no explanation, just raw JSON.

JSON format:
{
  "voiceText": "your short conversational voice reply in ${langName} (1-2 sentences, structured for speech)",
  "symptoms": ["symptom1", "symptom2"],
  "severity": "low",
  "urgencyLevel": "low",
  "requiresUrgentCare": false,
  "possibleConditions": [{"name": "Condition", "probability": "Medium", "description": "brief"}],
  "medicineKeywords": ["paracetamol"],
  "doctorSpecialization": "General Physician",
  "precautions": ["precaution"],
  "homeRemedies": ["remedy"],
  "conversationPhase": "gathering_info",
  "shouldShowResults": false
}

conversationPhase values: "greeting", "gathering_info", "follow_up", "providing_advice", "suggesting_doctor"
shouldShowResults: set to true ONLY when you have gathered enough info and are ready to show conditions/medicines/doctors. During early conversation turns while asking questions, keep this false.
severity/urgencyLevel: "low", "medium", or "high"`;

    // ── Build conversation contents ────────────────────────────────────────
    const contents = [];

    contents.push({
      role: 'user',
      parts: [{ text: systemContext + '\n\nUnderstood? Reply with just: {"ready": true}' }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: '{"ready": true}' }]
    });

    // Add conversation history
    for (const msg of conversationHistory.slice(-10)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(msg.text || '') }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // ── Call Gemini ─────────────────────────────────────────────────────────
    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini Voice API Error:', geminiResponse.status, errText.substring(0, 300));
      throw new Error(`Gemini API returned ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // ── Parse JSON ─────────────────────────────────────────────────────────
    let aiData = null;
    try {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) aiData = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error('Voice chat JSON parse error:', rawText.substring(0, 200));
    }

    if (!aiData || aiData.ready) {
      aiData = {
        voiceText: rawText || "I'm sorry, could you repeat that?",
        symptoms: [], severity: 'low', urgencyLevel: 'low',
        requiresUrgentCare: false, possibleConditions: [],
        medicineKeywords: [], doctorSpecialization: 'General Physician',
        precautions: [], homeRemedies: [],
        conversationPhase: 'gathering_info', shouldShowResults: false
      };
    }

    // ── Fetch medicines & doctors only when results should be shown ──────
    let medicines = [];
    let doctors = [];

    if (aiData.shouldShowResults) {
      const keywords = aiData.medicineKeywords || [];
      if (keywords.length > 0) {
        try {
          const orClauses = keywords.flatMap(k => [
            { name: { $regex: k, $options: 'i' } },
            { composition: { $regex: k, $options: 'i' } }
          ]);
          medicines = await Medicine.find({ $or: orClauses, isDiscontinued: false })
            .select('name price manufacturer packSize composition type')
            .limit(6).lean();
        } catch (e) { /* silent */ }
      }

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

      const specialty = aiData.doctorSpecialization || guessSpecialty(aiData.symptoms);
      try {
        doctors = await Doctor.find({
          $or: [
            { specialty: { $regex: specialty, $options: 'i' } },
            { specialty: { $regex: 'General', $options: 'i' } }
          ],
          isApproved: true
        }).select('name specialty experience location rating image').limit(4).lean();
      } catch (e) { /* silent */ }
    }

    // ── Response ────────────────────────────────────────────────────────────
    return res.json({
      success: true,
      voiceText: aiData.voiceText || '',
      conversationPhase: aiData.conversationPhase || 'gathering_info',
      shouldShowResults: Boolean(aiData.shouldShowResults),
      structuredData: {
        possibleConditions: aiData.possibleConditions || [],
        medicines: medicines.map(m => ({
          _id: m._id, name: m.name, salt: m.composition || '',
          dosage: m.packSize || '', price: m.price,
          manufacturer: m.manufacturer, type: m.type
        })),
        doctors: doctors.map(d => ({
          _id: d._id, name: d.name, specialty: d.specialty,
          experience: d.experience, location: d.location,
          rating: d.rating, image: d.image
        })),
        precautions: aiData.precautions || [],
        homeRemedies: aiData.homeRemedies || [],
        urgencyLevel: aiData.urgencyLevel || 'low',
        severity: aiData.severity || 'low',
        requiresUrgentCare: Boolean(aiData.requiresUrgentCare),
        doctorSpecialization: aiData.doctorSpecialization || 'General Physician'
      }
    });

  } catch (error) {
    console.error('Voice Chat Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Voice service temporarily unavailable.',
      error: error.message
    });
  }
};
