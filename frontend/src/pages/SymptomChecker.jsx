import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Send, Volume2, VolumeX, Stethoscope,
  AlertCircle, CheckCircle, ShoppingCart, MapPin,
  Clock, ChevronDown, ChevronUp, Zap, Heart,
  Pill, UserCheck, Shield, Loader2, Globe, PhoneCall, Sparkles
} from "lucide-react";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_URL;
const DEFAULT_AVATAR_POSTER = "https://res.cloudinary.com/dnnkimx5e/image/upload/v1775154589/avatars/l974ooq6loifpxn0rlux.png";

/* ─── Language Config ──────────────────────────────────────────────────────── */
const LANG = {
  en: {
    name: "EN", speechCode: "en-US",
    placeholder: "Describe your symptoms (e.g. fever, headache for 2 days)…",
    thinking: "Analyzing your symptoms…",
    generatingVideo: "Generating AI Response...",
    disclaimer: "⚠️ This is not a medical diagnosis. Always consult a qualified doctor.",
    urgentAlert: "🚨 Your symptoms may require immediate medical attention. Please visit a hospital now.",
    sections: { conditions: "Possible Conditions", medicines: "Recommended Medicines", doctors: "Nearby Doctors", precautions: "Precautions", homeRemedies: "Home Remedies" },
    addCart: "Add to Cart", addedCart: "Added ✓", retry: "Try Again", clear: "Clear Chat", listenLabel: "Listening…",
  },
  hi: {
    name: "हिंदी", speechCode: "hi-IN",
    placeholder: "अपने लक्षण बताएं (जैसे: बुखार, सिरदर्द)…",
    thinking: "आपके लक्षणों का विश्लेषण हो रहा है…",
    generatingVideo: "AI वीडियो बना रहा है...",
    disclaimer: "⚠️ यह चिकित्सा निदान नहीं है। हमेशा योग्य डॉक्टर से परामर्श लें।",
    urgentAlert: "🚨 आपके लक्षणों के लिए तत्काल चिकित्सा आवश्यकता हो सकती है।",
    sections: { conditions: "संभावित स्थितियाँ", medicines: "अनुशंसित दवाएं", doctors: "नजदीकी डॉक्टर", precautions: "सावधानियाँ", homeRemedies: "घरेलू उपचार" },
    addCart: "कार्ट में जोड़ें", addedCart: "जोड़ा गया ✓", retry: "पुनः प्रयास", clear: "चैट साफ करें", listenLabel: "सुन रहा हूँ…",
  },
  pa: {
    name: "ਪੰਜਾਬੀ", speechCode: "pa-IN",
    placeholder: "ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ (ਜਿਵੇਂ: ਬੁਖਾਰ, ਸਿਰਦਰਦ)…",
    thinking: "ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ…",
    generatingVideo: "AI ਵੀਡੀਓ ਬਣਾ ਰਿਹਾ ਹੈ...",
    disclaimer: "⚠️ ਇਹ ਡਾਕਟਰੀ ਨਿਦਾਨ ਨਹੀਂ ਹੈ। ਹਮੇਸ਼ਾ ਯੋਗ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",
    urgentAlert: "🚨 ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਲਈ ਤੁਰੰਤ ਡਾਕਟਰੀ ਧਿਆਨ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ।",
    sections: { conditions: "ਸੰਭਾਵਿਤ ਸਥਿਤੀਆਂ", medicines: "ਸਿਫਾਰਸ਼ੀ ਦਵਾਈਆਂ", doctors: "ਨੇੜੇ ਦੇ ਡਾਕਟਰ", precautions: "ਸਾਵਧਾਨੀਆਂ", homeRemedies: "ਘਰੇਲੂ ਉਪਾਅ" },
    addCart: "ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ", addedCart: "ਜੋੜਿਆ ✓", retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼", clear: "ਚੈਟ ਸਾਫ਼ ਕਰੋ", listenLabel: "ਸੁਣ ਰਿਹਾ ਹਾਂ…",
  }
};

/* ─── Interactive D-ID Video Avatar ────────────────────────────────────────── */
const AIAvatar = ({ videoUrl, isGenerating, isThinking, lang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video play prevented:", e));
    }
  }, [videoUrl]);

  return (
    <div className="flex flex-col items-center p-6 h-full relative w-full">
      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-gradient-to-br from-[#EAE6F9] to-white border-4 border-white transition-transform duration-500 hover:scale-[1.02]">
        
        {/* Dynamic Glowing Border while speaking/generating */}
        <div className={`absolute inset-0 rounded-full z-20 pointer-events-none transition-opacity duration-300 ${isPlaying || isGenerating ? "opacity-100 ring-4 ring-[#8B5CF6] animate-pulse" : "opacity-0"}`} />

        <video
          ref={videoRef}
          src={videoUrl}
          poster={DEFAULT_AVATAR_POSTER}
          className="absolute inset-0 w-full h-full object-cover z-10"
          autoPlay
          playsInline
          onPlay={() => setIsPlaying(true)}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Overlays */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white p-4 text-center rounded-full">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#DDD6FE]" />
            <p className="text-[10px] font-bold tracking-wider uppercase animate-pulse">{LANG[lang].generatingVideo}</p>
          </div>
        )}
      </div>

      <div className="text-center mt-6 w-full">
        <h3 className="text-xl font-bold text-[#1E293B] tracking-tight">Nabha AI</h3>
        <p className="text-sm text-[#64748B] mt-0.5 font-medium">Ready to assist</p>
        
        <div className="flex justify-center mt-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isGenerating ? "bg-[#F59E0B] animate-pulse" : isPlaying ? "bg-[#10B981] animate-pulse" : isThinking ? "bg-[#8B5CF6] animate-pulse" : "bg-[#10B981]"}`} />
            <span className="text-[10px] text-[#475569] font-bold tracking-widest uppercase">
              {isGenerating ? "Processing" : isPlaying ? "Speaking" : isThinking ? "Listening" : "Online"}
            </span>
          </div>
        </div>
      </div>

      {isPlaying && (
        <div className="mt-5 flex gap-1 items-center justify-center h-8 overflow-hidden">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#8B5CF6] to-[#A78BFA] origin-bottom"
                style={{
                  height: '100%',
                  animation: `soundWave 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
        </div>
      )}

      {/* Feature tags (Pills) */}
      <div className="mt-auto flex flex-wrap justify-center gap-2 px-2 w-full pt-6 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3E8FF] text-[#7E22CE] rounded-full text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-default">
          <Mic className="w-3.5 h-3.5" /> Voice AI
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E0E7FF] text-[#4338CA] rounded-full text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-default">
          <Globe className="w-3.5 h-3.5" /> Multi-lang
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] text-[#047857] rounded-full text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-default">
          <PhoneCall className="w-3.5 h-3.5" /> Real Doctors
        </div>
      </div>
    </div>
  );
};

/* ─── Structured Response Cards ────────────────────────────────────────────── */
const ConditionCard = ({ condition }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300 hover:border-[#E2E8F0]">
    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
      <Heart className="w-5 h-5 text-[#3B82F6]" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold text-[#1E293B] text-sm">{condition.name}</span>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${condition.probability?.toLowerCase() === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' : condition.probability?.toLowerCase() === 'medium' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#DBEAFE] text-[#2563EB]'}`}>
          {condition.probability} PROBABILITY
        </span>
      </div>
      {condition.description && (
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{condition.description}</p>
      )}
    </div>
  </div>
);

const MedicineCard = ({ medicine, onAddToCart, lang }) => {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { onAddToCart(medicine); setAdded(true); setTimeout(() => setAdded(false), 2500); };
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300 hover:border-[#E2E8F0]">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center flex-shrink-0 shadow-sm">
        <Pill className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1E293B] text-sm truncate">{medicine.name}</p>
        {medicine.salt && <p className="text-xs text-[#64748B] truncate mt-0.5">{medicine.salt}</p>}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-extrabold text-[#059669]">₹{medicine.price}</span>
          {medicine.dosage && <span className="text-xs font-medium text-[#94A3B8] px-2 py-0.5 bg-[#F8FAFC] rounded-md">{medicine.dosage}</span>}
        </div>
      </div>
      <button onClick={handleAdd} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:-translate-y-0.5 ${added ? "bg-[#D1FAE5] text-[#059669] ring-2 ring-[#059669] ring-offset-1" : "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-200"}`}>
        {added ? <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{LANG[lang].addedCart}</span> : <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" />{LANG[lang].addCart}</span>}
      </button>
    </div>
  );
};

const DoctorCard = ({ doctor }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-300 hover:border-[#E2E8F0]">
    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-[#F3E8FF]">
      {doctor.image ? <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center"><UserCheck className="w-5 h-5 text-white" /></div>}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-[#1E293B] text-sm truncate">Dr. {doctor.name}</p>
      <p className="text-[10px] uppercase tracking-widest text-[#7C3AED] font-bold mt-0.5">{doctor.specialty}</p>
      <div className="flex items-center gap-3 mt-1.5">
        {doctor.experience && <span className="flex items-center gap-1 text-xs font-medium text-[#64748B]"><Clock className="w-3.5 h-3.5 text-[#94A3B8]" />{doctor.experience}</span>}
        {doctor.location && <span className="flex items-center gap-1 text-xs font-medium text-[#64748B] truncate"><MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />{doctor.location}</span>}
      </div>
    </div>
  </div>
);

const Section = ({ icon: Icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border border-[#E2E8F0] overflow-hidden bg-white shadow-sm transition-all duration-300 ${open ? 'pb-2' : ''}`}>
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between px-5 py-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors`}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-lg shadow-sm border border-[#E2E8F0]"><Icon className="w-4 h-4 text-[#64748B]" /></div>
          <span className="text-sm font-bold text-[#334155]">{title}</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-[#94A3B8]" /> : <ChevronDown className="w-5 h-5 text-[#94A3B8]" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-white animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

const TypingIndicator = ({ text }) => (
  <div className="flex gap-4 items-end max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-md flex-shrink-0"><Stethoscope className="w-5 h-5 text-white" /></div>
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-3 relative">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 bg-[#A78BFA] rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2.5 h-2.5 bg-[#A78BFA] rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2.5 h-2.5 bg-[#A78BFA] rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-[#64748B] font-bold tracking-wide">{text}</span>
    </div>
  </div>
);

const MessageBubble = ({ msg, lang, onAddToCart, onSpeak }) => {
  if (msg.type === "user") {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="max-w-[75%] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-[24px] rounded-br-sm px-6 py-4 shadow-[0_4px_20px_rgb(139,92,246,0.25)] hover:shadow-[0_6px_25px_rgb(139,92,246,0.3)] transition-shadow">
          <p className="leading-relaxed text-sm font-medium tracking-wide text-white">{msg.text}</p>
        </div>
      </div>
    );
  }
  if (msg.type === "agent") {
    const sd = msg.structuredData;
    return (
      <div className="flex gap-4 items-end max-w-[90%] w-full animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center shadow-md flex-shrink-0 relative">
          <Stethoscope className="w-5 h-5 text-white" />
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1 space-y-4 min-w-0">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] rounded-bl-sm px-6 py-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden w-full">
            <p className="text-[#334155] leading-relaxed text-[15px] whitespace-pre-wrap font-medium">{msg.text}</p>
            {sd?.urgencyLevel && (
              <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${sd.urgencyLevel === 'high' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : sd.urgencyLevel === 'medium' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'}`}>
                <Zap className="w-3.5 h-3.5" />URGENCY: {sd.urgencyLevel.toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
              <button onClick={() => onSpeak(msg.text)} className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm hover:border-[#8B5CF6] hover:bg-[#F3E8FF] transition-all duration-300 relative">
                <Volume2 className="w-4 h-4 text-[#64748B] group-hover:text-[#8B5CF6]" />
                <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#1E293B] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap font-bold">Listen</span>
              </button>
            </div>
          </div>
          {sd?.requiresUrgentCare && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] shadow-sm">
              <AlertCircle className="w-8 h-8 text-[#DC2626] animate-pulse flex-shrink-0" />
              <p className="text-sm font-bold text-[#991B1B] leading-snug">{LANG[lang].urgentAlert}</p>
            </div>
          )}
          {sd?.possibleConditions?.length > 0 && <Section icon={Heart} title={LANG[lang].sections.conditions} defaultOpen={true}>{sd.possibleConditions.map((c, i) => <ConditionCard key={i} condition={c} />)}</Section>}
          {sd?.medicines?.length > 0 && <Section icon={Pill} title={LANG[lang].sections.medicines} defaultOpen={true}>{sd.medicines.map((m, i) => <MedicineCard key={i} medicine={m} onAddToCart={onAddToCart} lang={lang} />)}</Section>}
          {sd?.doctors?.length > 0 && <Section icon={UserCheck} title={LANG[lang].sections.doctors} defaultOpen={true}>{sd.doctors.map((d, i) => <DoctorCard key={i} doctor={d} />)}</Section>}
          {sd?.precautions?.length > 0 && <Section icon={Shield} title={LANG[lang].sections.precautions} defaultOpen={false}>
            <ul className="space-y-3 p-1">{sd.precautions.map((p, i) => <li key={i} className="flex items-start gap-3 text-sm text-[#475569] font-medium"><CheckCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />{p}</li>)}</ul>
          </Section>}
        </div>
      </div>
    );
  }
  if (msg.type === "error") {
    return (
      <div className="flex gap-4 items-start animate-in fade-in slide-in-from-left-4 duration-300">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5 h-5 text-[#EF4444]" /></div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[24px] rounded-bl-sm px-6 py-4 shadow-sm flex items-center justify-between w-full max-w-[80%]">
          <p className="text-sm text-[#991B1B] font-bold">{msg.text}</p>
          {msg.onRetry && <button onClick={msg.onRetry} className="ml-4 px-4 py-1.5 bg-[#EF4444] text-white rounded-lg text-xs font-bold hover:bg-[#DC2626] transition-colors shadow-sm">Try Again</button>}
        </div>
      </div>
    );
  }
  return null;
};

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function SymptomChecker() {
  const { addToCart } = useCart();
  const chatRef   = useRef(null);
  const synthRef  = useRef(window.speechSynthesis);
  const recogRef  = useRef(null);

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [isThinking,  setIsThinking]  = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language,    setLanguage]    = useState("en");
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(null);
  
  const langConf = LANG[language];
  const historyRef = useRef([]);

  /* ── Initial welcome ── */
  useEffect(() => {
    const welcomes = {
      en: "Hello! I'm Nabha AI. I can analyze your symptoms instantly and even speak with you. Describe how you're feeling today!",
      hi: "नमस्ते! मैं Nabha AI हूँ। आपके लक्षणों का विश्लेषण कर सकता हूँ और आपसे बात भी कर सकता हूँ। बताएं आप कैसा महसूस कर रहे हैं?",
      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Nabha AI ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਸਕਦਾ ਹਾਂ। ਦੱਸੋ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?"
    };
    setMessages([{ type: "agent", text: welcomes[language], structuredData: null, timestamp: Date.now() }]);
  }, [language]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  /* ── Speech Recognition setup ── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recogRef.current = r;
  }, []);

  const toggleListening = () => {
    if (!recogRef.current) return;
    if (isListening) { recogRef.current.stop(); setIsListening(false); } 
    else { recogRef.current.lang = langConf.speechCode; recogRef.current.start(); setIsListening(true); }
  };

  /* ── Fallback Browser TTS ── */
  const speakFallback = useCallback((text) => {
    if (!text) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 500));
    u.lang = langConf.speechCode;
    synthRef.current.speak(u);
  }, [langConf.speechCode]);

  /* ── Add to cart ── */
  const handleAddToCart = useCallback((m) => {
    addToCart({ id: m._id, _id: m._id, name: m.name, price: m.price, packSize: m.dosage || "", type: m.type || "Medicine" }, 1, "symptom-checker");
  }, [addToCart]);

  /* ── Fetch Avatar Video via D-ID ── */
  const generateAvatarTalk = async (textToSpeak) => {
    try {
      setIsGeneratingVideo(true);
      const res = await fetch(`${API_BASE}/api/ai/avatar-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, language })
      });
      const data = await res.json();
      if (data.success && data.videoUrl) {
         setAvatarVideoUrl(data.videoUrl); // Will auto-play in the AIAvatar component
      } else {
         console.warn("Avatar video generation failed, falling back to TTS");
         speakFallback(textToSpeak);
      }
    } catch (err) {
      console.error("Avatar API Error:", err);
      speakFallback(textToSpeak);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  /* ── Send message (Text generation + Avatar call) ── */
  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || isThinking) return;

    setInput("");
    setMessages(prev => [...prev, { type: "user", text, timestamp: Date.now() }]);
    setIsThinking(true);
    setAvatarVideoUrl(null); // Clear previous video

    try {
      const res = await fetch(`${API_BASE}/api/ai/symptom-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language, conversationHistory: historyRef.current.slice(-6) })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (!data.success) throw new Error("AI failed");

      // 1. Show Text UI instantly
      setMessages(prev => [...prev, { type: "agent", text: data.text, structuredData: data.structuredData, timestamp: Date.now() }]);
      historyRef.current.push({ type: "user", text }, { type: "agent", text: data.text });

      // 2. Trigger Avatar Video Processing in background
      if (data.text) {
        generateAvatarTalk(data.text);
      }

    } catch (err) {
      setMessages(prev => [...prev, { type: "error", text: "Connection failed. Make sure your local server is running.", onRetry: () => sendMessage(text), timestamp: Date.now() }]);
    } finally {
      setIsThinking(false);
    }
  }, [input, language, isThinking, speakFallback]);

  return (
    <>
      <style>{`
        @keyframes soundWave { 0%,100%{transform:scaleY(0.2)} 50%{transform:scaleY(1)} }
        body { background-color: #F8FAFC; }
      `}</style>
      <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] flex flex-col items-center p-4 md:p-8 font-sans">
        <div className="w-full max-w-[1500px] flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
          
          {/* LEFT: Text Chat Container (70%) */}
          <div className="flex-[7] bg-white rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-[#F1F5F9] flex flex-col overflow-hidden min-h-[600px] relative">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#F1F5F9] flex justify-between items-center bg-white/95 backdrop-blur-xl z-20 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-[0_4px_20px_rgb(139,92,246,0.3)] border border-[#A78BFA]">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-[#1E293B] tracking-tight">Symptom Checker</h1>
                  <p className="text-sm text-[#8B5CF6] font-bold tracking-wide mt-0.5">{isThinking ? langConf.thinking : "Powered by Nabha AI"}</p>
                </div>
              </div>
              <div className="flex gap-2 p-1.5 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] shadow-inner">
                {Object.entries(LANG).map(([code, l]) => (
                  <button 
                    key={code} 
                    onClick={() => { setLanguage(code); synthRef.current.cancel(); setAvatarVideoUrl(null); }} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${language === code ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-200 translate-y-[1px]" : "bg-transparent text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]"}`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 bg-[#FAFAFA]" style={{ scrollBehavior: 'smooth' }}>
              {messages.map((msg, i) => (
                <div key={i}><MessageBubble msg={msg} lang={language} onAddToCart={handleAddToCart} onSpeak={speakFallback} /></div>
              ))}
              {isThinking && <TypingIndicator text={langConf.thinking} />}
            </div>

            {/* Sticky Input Area */}
            <div className="p-6 bg-white border-t border-[#F1F5F9] z-20 shadow-[0_-10px_40px_rgb(0,0,0,0.02)]">
              {isListening && <div className="flex items-center gap-2 mb-3 px-4 py-2 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-bold rounded-xl w-max animate-pulse shadow-sm"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> {langConf.listenLabel}</div>}
              <div className="flex gap-3 relative group">
                <button 
                  onClick={toggleListening} 
                  className={`absolute left-2 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl transition-all duration-300 z-10 ${isListening ? "bg-[#FEF2F2] text-[#DC2626] scale-105" : "bg-transparent text-[#94A3B8] hover:bg-[#F3E8FF] hover:text-[#8B5CF6]"}`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={langConf.placeholder}
                  className="w-full pl-16 pr-20 py-5 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[24px] focus:ring-4 focus:ring-[#EDE9FE] focus:border-[#A78BFA] focus:bg-white text-[15px] text-[#1E293B] font-medium transition-all duration-300 placeholder-[#94A3B8] shadow-inner"
                />
                <button 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || isThinking} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-2xl shadow-md hover:shadow-lg hover:shadow-purple-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Avatar Panel (30%) */}
          <div className="hidden lg:flex flex-[3] flex-col gap-6">
            
            {/* Avatar Card */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-[#F1F5F9] overflow-hidden flex flex-col items-center">
              <div className="w-full h-24 bg-gradient-to-r from-[#F3E8FF] via-[#EAE6F9] to-[#F1F5F9]"></div>
              <div className="w-full px-6 pb-8 -mt-16 relative z-10 flex flex-col items-center">
                <AIAvatar
                  videoUrl={avatarVideoUrl}
                  isGenerating={isGeneratingVideo}
                  isThinking={isThinking}
                  lang={language}
                />
              </div>
            </div>
            
            {/* Quick Symptoms Card */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-[#F1F5F9] p-7">
              <h4 className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                Quick Symptoms
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {["Fever & Chills", "Severe Headache", "Persistent Cough", "Stomach Pain"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => sendMessage(s)} 
                    disabled={isThinking} 
                    className="px-4 py-2 bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] rounded-[16px] text-[13px] font-bold hover:bg-[#F3E8FF] hover:text-[#8B5CF6] hover:border-[#C4B5FD] transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer Mini Card */}
            <div className="bg-[#FEF2F2] rounded-[24px] border border-[#FECACA] p-5 flex items-start gap-4">
               <Shield className="w-6 h-6 text-[#DC2626] flex-shrink-0" />
               <p className="text-xs text-[#991B1B] font-bold leading-relaxed">{langConf.disclaimer}</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}