import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX, Calendar, X, MessageCircle, CheckCircle } from "lucide-react";

const API_KEY = "AIzaSyCAzGYeMcfLMCp1ghvQWBX2xdbLhbJS1Go"; // Gemini API Key

// SMS API Configuration
const SMS_CONFIG = {
  FAST2SMS: {
    API_URL: 'https://www.fast2sms.com/dev/bulkV2',
    API_KEY: 'WfJSNti4MYwE7zSllsz3gPDGbPtlsWmFCYgwgCj0k4rdLOv7yxTutXwPLSWE',
    SENDER_ID: 'FSTSMS',
  },
  DEMO_MODE: false
};

// Language configuration
const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    speechLang: 'en-US',
    placeholder: 'Type your message...',
    initialMessage: 'Hello! I\'m here to help you book an appointment with our doctors. How can I assist you today?',
    listening: 'Listening...',
  },
  hi: {
    code: 'hi',
    name: 'हिंदी',
    flag: '🇮🇳',
    speechLang: 'hi-IN',
    placeholder: 'अपना संदेश लिखें...',
    initialMessage: 'नमस्ते! मैं आपको हमारे डॉक्टरों के साथ अपॉइंटमेंट बुक करने में मदद करने यहाँ हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
    listening: 'सुन रहा हूँ...',
  },
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    speechLang: 'pa-IN',
    placeholder: 'ਆਪਣਾ ਸੰਦੇਸ਼ ਲਿਖੋ...',
    initialMessage: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਨੂੰ ਸਾਡੇ ਡਾਕਟਰਾਂ ਨਾਲ ਮੁਲਾਕਾਤ ਦਾ ਸਮਾਂ ਬੁੱਕ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    listening: 'ਸੁਣ ਰਿਹਾ ਹਾਂ...',
  }
};

// Doctor Database Context for AI
const DOCTORS_DATABASE = {
  'sachin-kumar': {
    name: 'Dr. Sachin Kumar',
    specialty: 'General Medicine',
    experience: 15,
    availability: '09:00 AM - 06:00 PM',
    rating: 4.8,
    languages: ['English', 'Hindi', 'Punjabi'],
    conditions: ['fever', 'cold', 'general checkup', 'diabetes', 'hypertension'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  },
  'tarun-thakur': {
    name: 'Dr. Tarun Thakur',
    specialty: 'Pediatrics',
    experience: 12,
    availability: '06:00 AM - 04:00 PM',
    rating: 4.9,
    languages: ['English', 'Hindi'],
    conditions: ['child fever', 'vaccination', 'growth issues', 'pediatric care'],
    slots: ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM']
  },
  'manish-sharma': {
    name: 'Dr. Manish Sharma',
    specialty: 'Cardiology',
    experience: 18,
    availability: '09:00 AM - 05:00 PM',
    rating: 4.9,
    languages: ['English', 'Hindi'],
    conditions: ['heart problems', 'chest pain', 'blood pressure', 'cardiac checkup'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
  },
  'fouziya-siddiqui': {
    name: 'Dr. Fouziya Siddiqui',
    specialty: 'Gynecology',
    experience: 20,
    availability: '11:00 AM - 07:00 PM',
    rating: 4.8,
    languages: ['English', 'Hindi', 'Urdu'],
    conditions: ['womens health', 'pregnancy', 'gynecological issues'],
    slots: ['11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM']
  },
  'shashank': {
    name: 'Dr. Shashank',
    specialty: 'Orthopaedics',
    experience: 18,
    availability: '09:00 AM - 05:00 PM',
    rating: 4.7,
    languages: ['English', 'Hindi'],
    conditions: ['bone problems', 'joint pain', 'fracture', 'back pain', 'sports injury'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
  },
  'kamaljeet-kaur': {
    name: 'Dr. Kamaljeet Kaur',
    specialty: 'Dermatology',
    experience: 18,
    availability: '09:00 AM - 05:00 PM',
    rating: 4.8,
    languages: ['English', 'Hindi', 'Punjabi'],
    conditions: ['skin problems', 'acne', 'rash', 'hair loss', 'dermatological issues'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
  }
};

const BookingForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    gender: 'Male',
    age: '',
    phoneNumber: '',
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    doctorName: '',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mt-2">
      <h3 className="text-sm font-bold text-gray-800 mb-3">Appointment Details</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="patientName"
          placeholder="Full Name"
          required
          className="w-full p-2 text-xs border rounded bg-gray-50"
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <select name="gender" className="w-1/2 p-2 text-xs border rounded bg-gray-50" onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            name="age"
            placeholder="Age"
            required
            className="w-1/2 p-2 text-xs border rounded bg-gray-50"
            onChange={handleChange}
          />
        </div>
        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          required
          className="w-full p-2 text-xs border rounded bg-gray-50"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          className="w-full p-2 text-xs border rounded bg-gray-50"
          onChange={handleChange}
        />
        <select name="doctorName" required className="w-full p-2 text-xs border rounded bg-gray-50" onChange={handleChange}>
          <option value="">Select Doctor</option>
          {Object.values(DOCTORS_DATABASE).map(doc => (
            <option key={doc.name} value={doc.name}>{doc.name} ({doc.specialty})</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            name="appointmentDate"
            required
            className="w-1/2 p-2 text-xs border rounded bg-gray-50"
            onChange={handleChange}
          />
          <input
            type="time"
            name="appointmentTime"
            required
            className="w-1/2 p-2 text-xs border rounded bg-gray-50"
            onChange={handleChange}
          />
        </div>
        <textarea
          name="reason"
          placeholder="Reason for Visit"
          required
          className="w-full p-2 text-xs border rounded bg-gray-50"
          rows="2"
          onChange={handleChange}
        ></textarea>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2 text-xs text-white bg-indigo-600 rounded hover:bg-indigo-700">
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  );
};

const AppointmentChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage("Hello! Welcome to Nabha Healthcare! 🏥", 'bot');
      setTimeout(() => {
        addMessage(LANGUAGES[currentLanguage].initialMessage, 'bot');
      }, 1000);
    }
  }, [isOpen]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = LANGUAGES[currentLanguage].speechLang;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, [currentLanguage]);

  const addMessage = (text, type, isForm = false) => {
    setMessages((prev) => [...prev, { text, type, isForm, timestamp: new Date() }]);
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 50);
  };

  const speakText = (text) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const callGeminiAPI = async (userText) => {
    // Create conversation history string
    const history = messages
      .filter(m => !m.isForm) // Exclude form messages from history
      .slice(-10) // Keep last 10 messages for context
      .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const prompt = `
      You are an AI Receptionist for Nabha Healthcare.
      Your goal is to help patients book appointments and answer basic health queries.

      Current Language: ${LANGUAGES[currentLanguage].name}
      
      CONTEXT - DOCTORS AVAILABLE:
      ${JSON.stringify(DOCTORS_DATABASE, null, 2)}
      
      CONVERSATION HISTORY:
      ${history}
      User: "${userText}"
      
      INSTRUCTIONS:
      1. Analyze the user's intent.
      2. **IF the user wants to book an appointment (e.g., "book appointment", "I need a doctor", "schedule visit"):**
         - DO NOT ask for details step-by-step.
         - Output the action "SHOW_BOOKING_FORM".
         - Respond with a polite message like "Sure, please fill out this form to book your appointment."
      3. **IF the user asks about doctors or availability:**
         - Answer based on the provided context.
      4. **IF the user asks general health questions:**
         - Provide a brief, helpful answer.
      5. Be polite and professional.
      
      OUTPUT FORMAT (JSON ONLY):
      {
        "thought": "Reasoning...",
        "response": "Response to user...",
        "action": "NONE" | "SHOW_BOOKING_FORM"
      }
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { response: text, action: "NONE" };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return { response: "I'm having trouble connecting. Please try again.", action: "NONE" };
    }
  };

  const handleBooking = async (details) => {
    // Remove the form message
    setMessages(prev => prev.filter(m => !m.isForm));

    addMessage("🔄 Processing your appointment...", 'bot');
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.patientName,
          phone: details.phoneNumber,
          email: details.email,
          date: details.appointmentDate,
          time: details.appointmentTime,
          reason: details.reason,
          gender: details.gender,
          age: details.age,
          doctor: details.doctorName
        })
      });

      const result = await response.json();
      if (result.success) {
        const emailStatus = result.data.emailSent
          ? "✅ The booking details have been sent to your Gmail. Kindly check your Gmail."
          : "⚠️ Email Failed";
        const bookingId = "NABHA-" + Math.floor(1000 + Math.random() * 9000);

        const confirmationMsg = `🎉 Appointment Confirmed!
        
Patient: ${details.patientName}
Doctor: ${details.doctorName}
Date: ${details.appointmentDate}
Time: ${details.appointmentTime}
Booking ID: ${bookingId}

${emailStatus}

Please arrive 15 minutes early for your appointment. Bring any previous medical records if available.`;

        addMessage(confirmationMsg, 'bot');
        speakText("Your appointment has been confirmed. Please check your email for details.");
      } else {
        addMessage("❌ Booking failed. Please try again.", 'bot');
      }
    } catch (error) {
      addMessage("⚠️ Server error. Please check your connection.", 'bot');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    addMessage(userText, "user");
    setLoading(true);

    const aiResult = await callGeminiAPI(userText);
    setLoading(false);

    if (aiResult.response) {
      addMessage(aiResult.response, 'bot');
      speakText(aiResult.response);
    }

    if (aiResult.action === "SHOW_BOOKING_FORM") {
      addMessage("", 'bot', true); // Add a message that triggers the form
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-medium pr-2">Book Appointment</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Nabha Assistant</h3>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online • AI Powered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${speechEnabled ? 'bg-white/20' : ''}`}
              >
                {speechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {msg.isForm ? (
                  <BookingForm
                    onSubmit={handleBooking}
                    onCancel={() => setMessages(prev => prev.filter(m => !m.isForm))}
                  />
                ) : (
                  <>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              {speechSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'}`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={LANGUAGES[currentLanguage].placeholder}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-full transition-all ${input.trim() && !loading ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentChatBot;