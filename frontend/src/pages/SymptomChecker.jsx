import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Send, Volume2, VolumeX, Stethoscope,
  AlertCircle, CheckCircle, ShoppingCart, MapPin,
  Clock, ChevronDown, ChevronUp, Zap, Heart,
  Pill, UserCheck, Shield, Loader2, Globe, PhoneCall, Sparkles, Trash2
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
    <div className="flex flex-col items-center p-4 sm:p-6 h-full relative w-full">
      <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-[0_8px_30px_rgba(59,130,246,0.15)] bg-gradient-to-br from-[#EEF2FF] to-white border-4 border-white transition-transform duration-500 hover:scale-[1.02]">
        
        {/* Dynamic Glowing Border while speaking/generating */}
        <div className={`absolute inset-0 rounded-full z-20 pointer-events-none transition-opacity duration-300 ${isPlaying || isGenerating ? "opacity-100 ring-4 ring-[#3B82F6] animate-pulse" : "opacity-0"}`} />

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

      <div className="text-center mt-4 sm:mt-6 w-full">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight">Nabha AI</h3>
        <p className="text-[11px] sm:text-sm text-[#6B7280] mt-0.5 sm:mt-1 font-medium italic">Your Personal Health Assistant</p>
        
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E2E8F0] rounded-full shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${isGenerating ? "bg-[#F59E0B] animate-pulse" : isPlaying ? "bg-[#10B981] animate-pulse" : isThinking ? "bg-[#3B82F6] animate-pulse" : "bg-[#10B981]"}`} />
            <span className="text-[10px] text-[#4B5563] font-bold tracking-widest uppercase">
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
                className="w-1.5 rounded-full bg-gradient-to-t from-[#3B82F6] to-[#60A5FA] origin-bottom"
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
      <div className="mt-auto flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2 w-full pt-6 sm:pt-8 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#DBEAFE] text-[#1D4ED8] rounded-full text-[10px] sm:text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-default">
          <Mic className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Voice AI
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#EEF2FF] text-[#4338CA] rounded-full text-[10px] sm:text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-default">
          <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Multi-lang
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ECFDF5] text-[#047857] rounded-full text-[10px] sm:text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-default">
          <PhoneCall className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Real Doctors
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
      <button onClick={handleAdd} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:-translate-y-0.5 ${added ? "bg-[#D1FAE5] text-[#059669] ring-2 ring-[#059669] ring-offset-1" : "bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:shadow-lg hover:shadow-blue-200"}`}>
        {added ? <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{LANG[lang].addedCart}</span> : <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" />{LANG[lang].addCart}</span>}
      </button>
    </div>
  );
};

const DoctorCard = ({ doctor }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F1F5F9] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 hover:border-[#E2E8F0]">
    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-[#EFF6FF]">
      {doctor.image ? <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center"><UserCheck className="w-5 h-5 text-white" /></div>}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-[#1F2937] text-sm truncate">Dr. {doctor.name}</p>
      <p className="text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold mt-0.5">{doctor.specialty}</p>
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
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-md flex-shrink-0"><Sparkles className="w-5 h-5 text-white" /></div>
    <div className="bg-white border border-[#E2E8F0] rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-3 relative">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2.5 h-2.5 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2.5 h-2.5 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-[#6B7280] font-bold tracking-wide">{text}</span>
    </div>
  </div>
);

const MessageBubble = ({ msg, lang, onAddToCart, onSpeak }) => {
  if (msg.type === "user") {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500 group">
        <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-[#DBEAFE] text-[#1E40AF] rounded-[20px] sm:rounded-[24px] rounded-br-sm px-4 sm:px-6 py-3 sm:py-4 shadow-sm hover:shadow-md transition-all duration-300 border border-[#BFDBFE]">
            <p className="leading-relaxed text-sm sm:text-[15px] font-medium tracking-wide">{msg.text}</p>
          </div>
          <span className="text-[10px] text-[#94A3B8] font-bold px-2 tracking-widest uppercase">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }
  if (msg.type === "agent") {
    const sd = msg.structuredData;
    return (
      <div className="flex gap-2 sm:gap-4 items-end max-w-[95%] sm:max-w-[90%] w-full animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-md flex-shrink-0 relative">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#10B981] border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
          <div className="bg-white border border-[#E2E8F0] rounded-[20px] sm:rounded-[24px] rounded-bl-sm px-4 sm:px-6 py-4 sm:py-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden w-full">
            <p className="text-[#334155] leading-relaxed text-sm sm:text-[15px] whitespace-pre-wrap font-medium">{msg.text}</p>
            {sd?.urgencyLevel && (
              <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${sd.urgencyLevel === 'high' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : sd.urgencyLevel === 'medium' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'}`}>
                <Zap className="w-3.5 h-3.5" />URGENCY: {sd.urgencyLevel.toUpperCase()}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#F1F5F9]">
              <span className="text-[10px] text-[#94A3B8] font-bold tracking-widest uppercase italic">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button 
                onClick={() => onSpeak(msg.text)} 
                className="group flex items-center justify-center w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm hover:border-[#8B5CF6] hover:bg-[#F3E8FF] transition-all duration-300 relative"
              >
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
      <div className="flex gap-4 items-start animate-in fade-in slide-in-from-left-4 duration-300 max-w-[85%]">
        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0 border border-[#FCA5A5] shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#EF4444]" />
        </div>
        <div className="flex-1 bg-white border border-[#FCA5A5] rounded-[24px] rounded-bl-sm px-6 py-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#991B1B] font-bold">Something went wrong</span>
          </div>
          <p className="text-xs text-[#6B7280] font-medium leading-relaxed italic">{msg.text}</p>
          {msg.onRetry && (
            <button 
              onClick={msg.onRetry} 
              className="mt-1 w-max px-5 py-2 bg-white border-2 border-[#EF4444] text-[#EF4444] rounded-xl text-xs font-bold hover:bg-[#FEF2F2] transition-all duration-300 shadow-sm flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 rotate-45" />
              Retry Now
            </button>
          )}
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

  const [isMuted, setIsMuted] = useState(false);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setAvatarVideoUrl(null);
    synthRef.current.cancel();
    
    // Add back the initial welcome message
    const welcomes = {
      en: "Hello! I'm Nabha AI. I can analyze your symptoms instantly and even speak with you. Describe how you're feeling today!",
      hi: "नमस्ते! मैं Nabha AI हूँ। आपके लक्षणों का विश्लेषण कर सकता हूँ और आपसे बात भी कर सकता हूँ। बताएं आप कैसा महसूस कर रहे हैं?",
      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Nabha AI ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਸਕਦਾ ਹਾਂ। ਦੱਸੋ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?"
    };
    setTimeout(() => {
      setMessages([{ type: "agent", text: welcomes[language], structuredData: null, timestamp: Date.now() }]);
    }, 100);
  }, [language]);

  const toggleListening = () => {
    if (!recogRef.current) return;
    if (isListening) { recogRef.current.stop(); setIsListening(false); } 
    else { recogRef.current.lang = langConf.speechCode; recogRef.current.start(); setIsListening(true); }
  };

  /* ── Fallback Browser TTS ── */
  const speakFallback = useCallback((text) => {
    if (!text || isMuted) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 500));
    u.lang = langConf.speechCode;
    synthRef.current.speak(u);
  }, [langConf.speechCode, isMuted]);

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
      <div className="h-[100dvh] bg-[#F8FAFC] flex flex-col items-center font-sans overflow-hidden">
        <div className="w-full max-w-[1400px] h-full flex flex-col lg:flex-row gap-4 sm:gap-6 lg:p-8 sm:p-4 p-0 min-h-0">
          
          {/* LEFT: Text Chat Container (65%) */}
          <div className="flex-1 lg:flex-[0.65] bg-white rounded-none lg:rounded-[16px] shadow-sm border-x-0 lg:border border-[#E2E8F0] flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] shadow-sm z-30 sticky top-0 rounded-none lg:rounded-t-[16px]">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight leading-tight">AI Health Agent</h1>
                  <p className="text-[9px] sm:text-[10px] text-white/90 font-bold tracking-wider mt-0.5 flex items-center gap-1 sm:gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-sm"></span>
                    Ready<span className="hidden sm:inline"> to Help</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="p-2 lg:p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                </button>
                <button 
                  onClick={handleClearChat} 
                  className="p-2 lg:p-2.5 rounded-lg bg-white/10 hover:bg-[#EF4444] text-white transition-all backdrop-blur-sm group border border-white/10"
                  title="Clear Chat"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" />
                </button>
                <div className="h-5 sm:h-6 w-px bg-white/20 mx-0.5 sm:mx-1"></div>
                <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  {Object.entries(LANG).map(([code, l]) => (
                    <button 
                      key={code} 
                      onClick={() => { setLanguage(code); synthRef.current.cancel(); setAvatarVideoUrl(null); }} 
                      className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all duration-300 ${language === code ? "bg-white text-[#3B82F6] shadow-sm" : "bg-transparent text-[#E2E8F0] hover:text-white"}`}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 bg-white" style={{ scrollBehavior: 'smooth' }}>
              {messages.map((msg, i) => (
                <div key={i}><MessageBubble msg={msg} lang={language} onAddToCart={handleAddToCart} onSpeak={speakFallback} /></div>
              ))}
              {isThinking && <TypingIndicator text={langConf.thinking} />}
            </div>

            {/* Sticky Input Area */}
            <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 bg-white border-t border-[#E2E8F0] z-30">
              {isListening && (
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[9px] sm:text-[10px] font-bold rounded-full w-max animate-pulse shadow-sm mx-auto">
                    <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#3B82F6]" /> {langConf.listenLabel}
                </div>
              )}
              <div className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-full px-1.5 sm:px-2 py-1 sm:py-1.5 focus-within:border-[#3B82F6] focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white transition-all duration-300 group shadow-sm">
                <button 
                  onClick={toggleListening} 
                  className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 ${isListening ? "bg-[#EFF6FF] text-[#2563EB] scale-110" : "text-[#94A3B8] hover:bg-[#EFF6FF] hover:text-[#3B82F6]"}`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                </button>
                
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={langConf.placeholder}
                  className="flex-1 bg-transparent py-1.5 sm:py-2 px-1 sm:px-2 text-xs sm:text-[14px] lg:text-[15px] text-[#1F2937] font-medium outline-none placeholder-[#94A3B8]"
                />
                
                <button 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || isThinking} 
                  className="p-2 sm:p-2.5 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white rounded-full shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Avatar Panel (35%) */}
          <div className="flex-[0.35] flex flex-col gap-6 order-first lg:order-last px-4 lg:px-0">
            
            {/* Avatar Card */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col items-center p-2">
              <div className="w-full bg-gradient-to-b from-[#F0F7FF] to-white rounded-xl pb-8">
                <AIAvatar
                  videoUrl={avatarVideoUrl}
                  isGenerating={isGeneratingVideo}
                  isThinking={isThinking}
                  lang={language}
                />
              </div>
            </div>
            
            {/* Quick Symptoms Card */}
            <div className="bg-white rounded-[16px] shadow-sm border border-[#E2E8F0] p-4 sm:p-6 flex flex-col items-center lg:items-start w-full">
              <h4 className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-3 sm:mb-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3B82F6]" />
                Quick Symptoms
              </h4>
              <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2">
                {["Fever & Chills", "Severe Headache", "Persistent Cough", "Stomach Pain"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => sendMessage(s)} 
                    disabled={isThinking} 
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-[#4B5563] border border-[#E2E8F0] rounded-full text-[10px] sm:text-[12px] font-bold hover:bg-[#EFF6FF] hover:text-[#3B82F6] hover:border-[#BFDBFE] transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5 shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer Mini Card */}
            <div className="bg-[#FEF2F2] rounded-[16px] border border-[#FEE2E2] p-3 sm:p-4 flex items-start gap-3 mt-auto lg:mt-0 lg:flex md:flex sm:hidden hidden">
               <Shield className="w-4 h-4 sm:w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
               <p className="text-[10px] sm:text-[11px] text-[#991B1B] font-bold leading-relaxed">{langConf.disclaimer}</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}