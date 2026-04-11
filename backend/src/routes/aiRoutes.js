const express = require('express');
const router = express.Router();
const { checkSymptoms, voiceChat } = require('../controllers/symptomController');
const { generateAvatarVideoResponse } = require('../controllers/avatarController');

// POST /api/ai/symptom-check
router.post('/symptom-check', checkSymptoms);

// POST /api/ai/voice-chat  (real-time conversational voice endpoint)
router.post('/voice-chat', voiceChat);

// POST /api/ai/avatar-response
router.post('/avatar-response', generateAvatarVideoResponse);

module.exports = router;
