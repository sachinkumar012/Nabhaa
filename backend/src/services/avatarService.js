// Use native fetch (Node.js 18+)
const fetchApi = global.fetch;

// Default D-ID presenter image (Professional female)
const DEFAULT_AVATAR_IMAGE = 'https://res.cloudinary.com/dnnkimx5e/image/upload/v1775154589/avatars/l974ooq6loifpxn0rlux.png';

// Map languages to Microsoft Azure TTS Voice IDs (supported by D-ID)
const VOICE_MAP = {
  en: 'en-US-JennyNeural',
  hi: 'hi-IN-SwaraNeural',
  pa: 'hi-IN-SwaraNeural' // Fallback to Hindi voice for Punjabi if needed, as Swara is good for Indian context
};

/**
 * Generate a talking avatar video from text using D-ID API
 * @param {string} text - The text for the avatar to speak
 * @param {string} language - Language code (en, hi, pa)
 * @returns {Promise<string>} - Returns the URL of the generated MP4 video
 */
exports.generateAvatarVideo = async (text, language = 'en') => {
  const DID_API_KEY = process.env.DID_API_KEY;
  if (!DID_API_KEY) {
    console.warn('DID_API_KEY is not set. Skipping avatar generation.');
    return null;
  }

  const voiceId = VOICE_MAP[language] || VOICE_MAP.en;
  const base64Key = Buffer.from(DID_API_KEY).toString('base64');
  
  try {
    // 1. Initiate the talk generation
    const createReq = await fetchApi('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: DEFAULT_AVATAR_IMAGE,
        script: {
          type: 'text',
          input: text.substring(0, 500), // Limit text length to avoid long generation times/costs
          provider: {
            type: 'microsoft',
            voice_id: voiceId
          }
        },
        config: {
          fluent: true,
          pad_audio: 0.0
        }
      })
    });

    if (!createReq.ok) {
      const err = await createReq.text();
      console.error('D-ID API Create Error:', createReq.status, err);
      return null;
    }

    const createData = await createReq.json();
    const talkId = createData.id;

    if (!talkId) return null;

    // 2. Poll for results (usually takes 3-10 seconds)
    // We will poll every 2 seconds, up to 10 times max (20 seconds)
    for (let i = 0; i < 10; i++) {
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const getReq = await fetchApi(`https://api.d-id.com/talks/${talkId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64Key}`,
                'Accept': 'application/json'
            }
        });

        if (!getReq.ok) continue;

        const getData = await getReq.json();
        
        if (getData.status === 'done' && getData.result_url) {
            return getData.result_url;
        } else if (getData.status === 'error') {
            console.error('D-ID Video Generation Failed:', getData);
            return null;
        }
        // If 'created' or 'started', keep polling
    }

    console.error('D-ID Polling timed out');
    return null;

  } catch (error) {
    console.error('Error generating avatar video:', error);
    return null;
  }
};
