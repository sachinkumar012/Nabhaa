require('dotenv').config({ path: __dirname + '/../../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log("Checking API KEY:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Gemini Error:", e);
    }
}
testGemini();
