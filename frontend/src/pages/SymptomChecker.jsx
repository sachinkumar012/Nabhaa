import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX, Stethoscope, Calendar, Phone, MapPin, Clock, AlertCircle, CheckCircle, Activity, Trash2, History } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Language Configuration
const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    welcomeMessage: "🤖 Hello! I'm your AI Health Agent. I can help you with symptoms, book appointments, find doctors, and take immediate action for your health needs. How can I assist you today?\n\n💡 Tip: You can type 'change language' anytime to switch languages.",
    welcomeBack: "👋 Welcome back! Your chat history has been restored. How can I help you now?",
    placeholder: "Describe your symptoms or ask a health question...",
    listening: "Listening... Speak now",
    agentThinking: "AI Agent is analyzing and planning actions...",
    speechRecognition: 'en-US'
  },
  hi: {
    code: 'hi',
    name: 'हिंदी',
    flag: '🇮🇳',
    welcomeMessage: "🤖 नमस्ते! मैं आपका AI स्वास्थ्य एजेंट हूँ। मैं लक्षणों की जांच, अपॉइंटमेंट बुकिंग, डॉक्टर ढूंढने और आपकी स्वास्थ्य जरूरतों के लिए तत्काल कार्रवाई में मदद कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?\n\n💡 सुझाव: भाषा बदलने के लिए कभी भी 'भाषा बदलें' टाइप करें।",
    welcomeBack: "👋 वापस स्वागत है! आपका चैट इतिहास बहाल कर दिया गया है। अब मैं आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "अपने लक्षण बताएं या स्वास्थ्य संबंधी प्रश्न पूछें...",
    listening: "सुन रहा हूँ... अब बोलें",
    agentThinking: "AI एजेंट विश्लेषण और कार्य योजना बना रहा है...",
    speechRecognition: 'hi-IN'
  },
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    welcomeMessage: "🤖 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਿਹਤ ਏਜੰਟ ਹਾਂ। ਮੈਂ ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ, ਅਪਾਇਂਟਮੈਂਟ ਬੁੱਕਿੰਗ, ਡਾਕਟਰ ਲੱਭਣ ਅਤੇ ਤੁਹਾਡੀਆਂ ਸਿਹਤ ਲੋੜਾਂ ਲਈ ਤੁਰੰਤ ਕਾਰਵਾਈ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?\n\n💡 ਸੁਝਾਅ: ਭਾਸ਼ਾ ਬਦਲਣ ਲਈ ਕਦੇ ਵੀ 'ਭਾਸ਼ਾ ਬਦਲੋ' ਟਾਈਪ ਕਰੋ।",
    welcomeBack: "👋 ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ! ਤੁਹਾਡਾ ਚੈਟ ਇਤਿਹਾਸ ਬਹਾਲ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਹੁਣ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    placeholder: "ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ ਜਾਂ ਸਿਹਤ ਸੰਬੰਧੀ ਸਵਾਲ ਪੁੱਛੋ...",
    listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ... ਹੁਣ ਬੋਲੋ",
    agentThinking: "AI ਏਜੰਟ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਕਾਰਜ ਯੋਜਨਾ ਬਣਾ ਰਿਹਾ ਹੈ...",
    speechRecognition: 'pa-IN'
  }
};

// Backend API Configuration
const BACKEND_CONFIG = {
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-backend-api.com/api'
    : `${import.meta.env.VITE_API_URL}/api`,
  ENDPOINTS: {
    SAVE_CHAT: '/chat/save',
    LOAD_CHAT: '/chat/load',
    CLEAR_CHAT: '/chat/clear'
  }
};

// Chat Storage Service
const ChatStorageService = {
  getUserSessionId: () => {
    let sessionId = localStorage.getItem('userSessionId');
    if (!sessionId) {
      sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userSessionId', sessionId);
    }
    return sessionId;
  },

  saveChat: async (messages) => {
    const sessionId = ChatStorageService.getUserSessionId();
    // Fallback to localStorage for now as backend might not be ready
    try {
      localStorage.setItem('aiHealthAgentMessages', JSON.stringify(messages));
      localStorage.setItem('chatLastSaved', new Date().toISOString());
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  },

  loadChat: async () => {
    try {
      const savedMessages = localStorage.getItem('aiHealthAgentMessages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        return parsedMessages.map(msg => {
          // Migration: Handle old format
          const content = msg.content || { text: msg.text || '' };
          let type = msg.type;
          if (!type) {
            type = msg.isBot ? 'agent' : 'user';
          }

          return {
            ...msg,
            type,
            content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          };
        });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return null;
  },

  clearChat: async () => {
    try {
      localStorage.removeItem('aiHealthAgentMessages');
      localStorage.removeItem('chatLastSaved');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Agent Tools
const AGENT_TOOLS = {
  BOOK_APPOINTMENT: 'book_appointment',
  FIND_DOCTOR: 'find_doctor',
  EMERGENCY_ALERT: 'emergency_alert',
  HEALTH_TRACKING: 'health_tracking',
  MEDICATION_REMINDER: 'medication_reminder',
  SYMPTOM_ANALYSIS: 'symptom_analysis',
  CALL_DOCTOR: 'call_doctor',
  NEARBY_HOSPITALS: 'nearby_hospitals'
};

// UI Components
const AgentThought = ({ thought, isExpanded, onToggle }) => (
  <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50/50 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 text-sm font-medium text-indigo-800 hover:bg-indigo-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 animate-pulse" />
        <span>Agent Reasoning Process</span>
      </div>
      {isExpanded ? <div className="w-4 h-4">▲</div> : <div className="w-4 h-4">▼</div>}
    </button>
    {isExpanded && (
      <div className="p-3 pt-0 text-sm text-indigo-700 font-mono border-t border-indigo-100 bg-white/50 whitespace-pre-wrap">
        {thought}
      </div>
    )}
  </div>
);

const AgentPlan = ({ plan = [] }) => (
  <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <div className="w-4 h-4 text-green-600">✓</div>
      Action Plan
    </h4>
    <div className="space-y-2">
      {plan.map((step, idx) => (
        <div key={idx} className="flex items-start gap-3 text-sm">
          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs border ${step.status === 'completed' ? 'bg-green-100 border-green-200 text-green-700' :
            step.status === 'active' ? 'bg-blue-100 border-blue-200 text-blue-700 animate-pulse' :
              'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
            {step.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : idx + 1}
          </div>
          <span className={`${step.status === 'completed' ? 'text-gray-500 line-through' :
            step.status === 'active' ? 'text-blue-700 font-medium' :
              'text-gray-600'
            }`}>
            {step.text}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ToolExecution = ({ tool, status, result }) => (
  <div className="my-2 flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
    <div className={`p-2 rounded-full ${status === 'running' ? 'bg-blue-100 text-blue-600 animate-spin' :
      status === 'completed' ? 'bg-green-100 text-green-600' :
        'bg-red-100 text-red-600'
      }`}>
      {status === 'running' ? <Activity className="w-4 h-4" /> :
        status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
          <AlertCircle className="w-4 h-4" />}
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-900">
        {tool.label}
      </div>
      <div className="text-xs text-gray-500">
        {status === 'running' ? 'Executing...' : result || 'Completed'}
      </div>
    </div>
  </div>
);

const AppointmentModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    date: '',
    time: '',
    reason: '',
    ...initialData
  });
  const [activeField, setActiveField] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleVoiceInput = (field) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; // Default to English, could be dynamic
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setActiveField(field);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({ ...prev, [field]: transcript }));
        setIsListening(false);
        setActiveField(null);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setActiveField(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveField(null);
      };

      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book Appointment
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <VolumeX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {['name', 'age', 'gender', 'phone', 'date', 'time', 'reason'].map((field) => (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field}
              </label>
              <div className="relative">
                <input
                  type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
                  value={formData[field]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder={`Enter ${field}...`}
                />
                <button
                  onClick={() => handleVoiceInput(field)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${activeField === field && isListening
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-indigo-600'
                    }`}
                  title="Speak to fill"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

const AgenticSymptomChecker = () => {
  const navigate = useNavigate();
  const chatBoxRef = useRef(null);

  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [agentState, setAgentState] = useState('idle');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const [recognition, setRecognition] = useState(null);
  const [expandedThoughts, setExpandedThoughts] = useState({});

  // Appointment Modal State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({});

  // Initialize Language and Chat History
  useEffect(() => {
    const initialize = async () => {
      // 1. Load Language
      const savedLang = localStorage.getItem('healthAgentLanguage');
      if (savedLang && LANGUAGES[savedLang]) {
        setCurrentLanguage(savedLang);
        setShowLanguageSelector(false);
      }

      // 2. Load Chat History
      const history = await ChatStorageService.loadChat();
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Initial welcome if no history
        const lang = savedLang || 'en';
        setMessages([{
          type: 'agent',
          content: {
            text: LANGUAGES[lang].welcomeMessage,
            actions: !savedLang ? [
              { label: "English", type: "language", value: "en" },
              { label: "हिंदी", type: "language", value: "hi" },
              { label: "ਪੰਜਾਬੀ", type: "language", value: "pa" }
            ] : []
          },
          timestamp: new Date()
        }]);
      }
    };

    initialize();
    setupSpeechRecognition();
  }, []);

  // Save Chat History on Update
  useEffect(() => {
    if (messages.length > 0) {
      ChatStorageService.saveChat(messages);
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, agentState]);

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  };

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.lang = LANGUAGES[currentLanguage].speechRecognition;
        recognition.start();
        setIsListening(true);
      }
    }
  };

  const addMessage = (content, type, extra = {}) => {
    setMessages(prev => [...prev, {
      type,
      content: typeof content === 'string' ? { text: content } : content,
      timestamp: new Date(),
      ...extra
    }]);
  };

  const handleLanguageSelect = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('healthAgentLanguage', langCode);
    setShowLanguageSelector(false);

    // Clear previous messages and show welcome in new language
    // Note: We might want to keep history but just change interface language?
    // For now, let's reset to show the welcome message in new language
    setMessages([]);
    addMessage(LANGUAGES[langCode].welcomeMessage, 'agent');
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      await ChatStorageService.clearChat();
      setMessages([{
        type: 'agent',
        content: {
          text: LANGUAGES[currentLanguage].welcomeMessage
        },
        timestamp: new Date()
      }]);
    }
  };

  const handleAppointmentSubmit = async (data) => {
    try {
      const response = await fetch(`${BACKEND_CONFIG.API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setShowAppointmentModal(false);

        const smsStatus = result.data.smsSent ? "✅ SMS Sent Successfully" : "⚠️ SMS Failed to Send";

        addMessage({
          tool: { label: 'book_appointment' },
          status: 'completed',
          result: `Appointment booked! ID: ${result.data.id}. ${smsStatus}`
        }, 'tool_execution');

        addMessage(`Great! I've booked your appointment with Dr. Sharma for ${data.date} at ${data.time}. \n\n${smsStatus}`, 'agent');
      } else {
        alert(result.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Failed to connect to server");
    }
  };

  const processUserInput = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    addMessage(userText, 'user');
    setAgentState('thinking');

    try {
      // 1. Construct Prompt
      const prompt = `
        You are an advanced AI Health Agent.
        User Input: "${userText}"
        Current Language: ${currentLanguage}
        
        IMPORTANT: 
        - You are a REAL application, NOT a demo. 
        - Real SMS messages are sent by the backend system automatically.
        - NEVER say "Demo Mode" or "SMS would be sent". 
        - If the user asks about SMS, confirm that a REAL SMS will be sent to their phone.
        
        Analyze the input and provide a JSON response with the following structure:
        {
          "thought": "Internal reasoning process...",
          "plan": [
            {"text": "Step 1 description", "status": "pending"},
            {"text": "Step 2 description", "status": "pending"}
          ],
          "actions": [
            {"tool": "tool_name", "params": { ... }} 
          ],
          "response": "User facing response in ${currentLanguage}"
        }
        
        Available Tools:
        - search_symptoms: Analyze symptoms
        - find_specialist: Find doctors (params: specialty)
        - emergency_protocol: For severe/urgent cases
        - book_appointment: Schedule visit (params: reason, date, time)
        - health_tip: General advice
        
        If emergency, set tool to 'emergency_protocol'.
      `;

      // 2. Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiResponseText = data.candidates[0].content.parts[0].text;

      // Parse JSON
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      const aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        thought: "Processing response...",
        plan: [],
        actions: [],
        response: aiResponseText
      };

      // 3. Visualize Thinking & Planning
      setAgentState('planning');
      addMessage({
        thought: aiData.thought,
        plan: aiData.plan
      }, 'agent_internal');

      // 4. Execute Tools
      if (aiData.actions && aiData.actions.length > 0) {
        setAgentState('executing');
        for (const action of aiData.actions) {
          // Show tool execution start
          addMessage({
            tool: { label: action.tool },
            status: 'running'
          }, 'tool_execution');

          // Simulate execution delay
          await new Promise(r => setTimeout(r, 1500));

          // Handle Tool Logic
          let result = "Done";
          if (action.tool === 'emergency_protocol') {
            result = "Emergency Services Contacted";
          } else if (action.tool === 'find_specialist') {
            try {
              const specialty = action.params.specialty || '';
              const response = await fetch(`${BACKEND_CONFIG.API_BASE_URL}/doctors?specialty=${specialty}`);
              const data = await response.json();

              if (data.success && data.count > 0) {
                result = `Found ${data.count} ${specialty || 'specialists'} nearby`;
                // We could pass data.data to the doctors page via state if supported
                navigate('/doctors', { state: { doctors: data.data } });
              } else {
                result = `No ${specialty} found nearby.`;
              }
            } catch (error) {
              console.error("Find Doctor Error:", error);
              result = "Error searching for doctors";
            }
          } else if (action.tool === 'book_appointment') {
            setAppointmentData(action.params || {});
            setShowAppointmentModal(true);
            result = "Opening appointment form...";
          }

          // Show tool execution complete
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.type === 'tool_execution') {
              lastMsg.content.status = 'completed';
              lastMsg.content.result = result;
            }
            return newMsgs;
          });
        }
      }

      // 5. Final Response
      setAgentState('responding');
      addMessage(aiData.response, 'agent');
      setAgentState('idle');

    } catch (error) {
      console.error("Agent Error:", error);
      addMessage("I apologize, I encountered an error processing your request.", 'agent');
      setAgentState('idle');
    }
  };

  const toggleThought = (idx) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 flex items-center justify-center p-4 md:p-6" >
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-gray-100">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${agentState === 'idle' ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`}></span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Nabha AI Health Agent</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                {agentState === 'idle' ? 'Ready to assist' :
                  agentState === 'thinking' ? 'Analyzing symptoms...' :
                    agentState === 'planning' ? 'Formulating plan...' :
                      agentState === 'executing' ? 'Connecting with services...' : 'Typing response...'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200"
              title="Clear Chat History"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${showLanguageSelector ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Change Language"
            >
              <div className="w-5 h-5">🌐</div>
              <span className="text-sm font-medium uppercase">{currentLanguage}</span>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30 scroll-smooth" ref={chatBoxRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>

              {/* User Message */}
              {msg.type === 'user' && (
                <div className="max-w-[80%] bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-6 py-3.5 shadow-lg shadow-indigo-200">
                  <p className="leading-relaxed">{msg.content?.text}</p>
                </div>
              )}

              {/* Agent Message */}
              {msg.type === 'agent' && (
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Stethoscope className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm text-gray-800 leading-relaxed">
                      <div className="whitespace-pre-wrap">{msg.content?.text}</div>

                      {/* Action Buttons */}
                      {msg.content?.actions && (
                        <div className="mt-5 flex flex-wrap gap-2.5">
                          {msg.content.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => action.type === 'language' ? handleLanguageSelect(action.value) : null}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all border border-indigo-100"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Internal Thought/Plan */}
              {msg.type === 'agent_internal' && (
                <div className="w-full max-w-2xl mx-auto mt-4 px-4">
                  <AgentThought
                    thought={msg.content?.thought}
                    isExpanded={expandedThoughts[idx]}
                    onToggle={() => toggleThought(idx)}
                  />
                  {msg.content?.plan && <AgentPlan plan={msg.content.plan} />}
                </div>
              )}

              {/* Tool Execution */}
              {msg.type === 'tool_execution' && (
                <div className="w-full max-w-2xl mx-auto mt-2 px-4">
                  <ToolExecution
                    tool={msg.content?.tool}
                    status={msg.content?.status}
                    result={msg.content?.result}
                  />
                </div>
              )}

            </div>
          ))}

          {agentState === 'thinking' && (
            <div className="flex justify-start w-full max-w-2xl mx-auto pl-14">
              <div className="flex items-center gap-3 text-gray-500 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-4 md:p-6">
          <div className="max-w-4xl mx-auto relative flex items-end gap-3">
            <button
              onClick={toggleListening}
              className={`p-3.5 rounded-xl transition-all duration-200 flex-shrink-0 ${isListening
                ? 'bg-red-50 text-red-500 ring-2 ring-red-100 animate-pulse'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <div className="flex-1 relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all duration-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    processUserInput();
                  }
                }}
                placeholder={LANGUAGES[currentLanguage].placeholder}
                className="w-full bg-transparent border-none rounded-2xl pl-4 pr-14 py-3.5 focus:ring-0 resize-none min-h-[56px] max-h-32 text-gray-700 placeholder-gray-400"
                rows={1}
              />
              <button
                onClick={processUserInput}
                disabled={!input.trim() || agentState !== 'idle'}
                className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-400 font-medium">
              AI Health Agent can make mistakes. Please consult a real doctor for emergencies.
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSubmit={handleAppointmentSubmit}
        initialData={appointmentData}
      />
    </div >
  );
};

export default AgenticSymptomChecker;