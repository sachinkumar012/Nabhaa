const fs = require('fs');
const envContent = fs.readFileSync('./.env', 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeneration() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  console.log('Testing key:', GEMINI_API_KEY.slice(0, 10) + '...');
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: "Hello, just reply with '{" + '"ready": true' + "}' as valid JSON." }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 256,
      responseMimeType: "application/json"
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    console.log("Status Code:", res.status);
    const data = await res.json();
    if (!res.ok) {
      console.log("Error details:", JSON.stringify(data, null, 2));
    } else {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Success Output:", text);
    }
  } catch (err) {
    console.log("Fetch failed:", err.message);
  }
}

testGeneration();
