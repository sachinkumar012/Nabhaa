const Medicine = require('../models/Medicine');
const Doctor   = require('../models/doctorModel');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── Use gemini-2.5-flash (confirmed available on this key) ──────────────────
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

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
    const systemContext = `You are "Nabha AI", a Full Agentic Health Assistant. Your goal is to guide patients through their health concerns with empathy and precision.

AGENTIC PROTOCOL:
1. GREET & EMPATHIZE: Start with a warm greeting (native language).
2. TRIAZE: Check for emergency signs (chest pain, breathing issues). Set 'requiresUrgentCare' to true if found.
3. PROBE: If the user is vague (e.g., "I have a headache"), do NOT suggest conditions yet. Ask follow-up questions: "Since when?", "Is it throbbing?", "Any light sensitivity?".
4. CONSOLE & ADVISE: Once you have enough info, suggest possible conditions, precautions, and appropriate doctor specializations.

LANGUAGE & SCRIPT (CRITICAL):
- Match the user's LANGUAGE and SCRIPT perfectly.
- Hindi -> Devanagari script (e.g., नमस्ते).
- Punjabi -> Gurmukhi script (e.g., ਸਤ ਸ੍ਰੀ ਅਕਾਲ).
- English -> English.
- NEVER use Romanized Hindi/Punjabi (no Hinglish/Punglish).

TONE: Warm, professional, and proactive. Like a knowledgeable "elder sister" in Hindi/Punjabi.

JSON format:
{
  "text": "conversational reply in native script (max 3 sentences)",
  "possibleConditions": [{ "name": "Condition", "probability": "High", "description": "brief explanation" }],
  "symptoms": ["symptom1", "symptom2"],
  "severity": "low/medium/high",
  "urgencyLevel": "low/medium/high",
  "precautions": ["precaution"],
  "medicineKeywords": ["salt names or common medicine names"],
  "doctorSpecialization": "Specialist Type",
  "homeRemedies": ["remedy"],
  "followUpQuestion": "one specific follow-up question if info is missing",
  "requiresUrgentCare": false,
  "reasoning": "Internal brief reasoning for this turn (hidden from user)"
}

If you need more info before concluding, keep 'possibleConditions' empty and use 'followUpQuestion'.`;

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
      // ── Robust JSON Extraction ──
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error('JSON parse error. Attempting regex fallback.');
      const textMatch = rawText.match(/"text"\s*:\s*"([^"]+)"/);
      if (textMatch) {
        aiData = { text: textMatch[1] };
      }
    }

    // Fallback if parsing failed or handshake 'ready'
    if (!aiData || aiData.ready) {
      aiData = {
        text: typeof rawText === 'string' && rawText.startsWith('{') 
          ? "Tell me more about how you're feeling so I can help." 
          : (rawText || 'Please describe your symptoms in more detail.'),
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
    const systemContext = `You are "Nabha AI", a Full Agentic Voice Health Assistant. You are a warm, calm, "knowledgeable elder sister" persona.

VOICE AGENTIC PROTOCOL:
1. GREET: Warmly in native language (Hindi/Punjabi/English).
2. EMPATHIZE: "I understand that must be difficult/uncomfortable..."
3. PROACTIVE PROBING: Ask ONE clarifying question at a time to gather missing context. Do NOT jump to conclusions.
4. DURATION & SEVERITY: Always ask how long it has been happening.
5. EMERGENCY: Watch for critical keywords (chest pain, stroke signs). If found, prioritize emergency advice.

LANGUAGE & SCRIPT:
- Respond in the SAME SCRIPT as the user.
- Hindi -> Devanagari script (ठीक है, मैं समझ गई).
- Punjabi -> Gurmukhi script (ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਸਮਝ ਗਈ ਹਾਂ).
- English -> English.
- NO Hinglish/Punglish. Use pure native words for fillers.

JSON format:
{
  "voiceText": "your short conversational voice reply in ${langName} (1-2 sentences, structured for speech)",
  "symptoms": ["list"],
  "severity": "low/medium/high",
  "urgencyLevel": "low/medium/high",
  "requiresUrgentCare": false,
  "possibleConditions": [{"name": "Condition", "probability": "Medium", "description": "brief"}],
  "medicineKeywords": ["medicine"],
  "doctorSpecialization": "Specialist",
  "precautions": ["precaution"],
  "homeRemedies": ["remedy"],
  "conversationPhase": "greeting/gathering_info/providing_advice",
  "shouldShowResults": true/false (Set to true ONLY when you have analyzed enough info),
  "reasoning": "internal logic"
}`;

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
      // ── Robust JSON Extraction ──
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error('Voice chat JSON parse error. Attempting regex fallback.');
      // Regex fallback to extract voiceText if JSON parse fails
      const voiceTextMatch = rawText.match(/"voiceText"\s*:\s*"([^"]+)"/);
      if (voiceTextMatch) {
        aiData = { voiceText: voiceTextMatch[1] };
      }
    }

    // Fallback if parsing failed or returned the handshake 'ready'
    if (!aiData || aiData.ready) {
      aiData = {
        voiceText: typeof rawText === 'string' && rawText.startsWith('{') 
          ? "I'm processing your information. Could you tell me more about how you're feeling?" 
          : (rawText || "I'm sorry, could you repeat that?"),
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
