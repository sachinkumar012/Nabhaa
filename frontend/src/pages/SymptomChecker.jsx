import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Mic, MicOff, Send, Volume2, VolumeX, Stethoscope,
  AlertCircle, CheckCircle, ShoppingCart, MapPin,
  Clock, ChevronDown, ChevronUp, Zap, Heart,
  Pill, UserCheck, Shield, Loader2, Globe, PhoneCall, Sparkles, Trash2, Phone
} from "lucide-react";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_URL;
const AVATAR_IMG = "https://res.cloudinary.com/dnnkimx5e/image/upload/v1775154589/avatars/l974ooq6loifpxn0rlux.png";

const LANG = {
  en: { name:"EN", speechCode:"en-US" },
  hi: { name:"हिंदी", speechCode:"hi-IN" },
  pa: { name:"ਪੰਜਾਬੀ", speechCode:"pa-IN" },
};

/* ── Sub-components ─────────────────────────────────────────── */
const ConditionCard = ({ c }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all">
    <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0"><Heart className="w-4 h-4 text-[#3B82F6]" /></div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <span className="font-bold text-[#1E293B] text-sm">{c.name}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${c.probability?.toLowerCase()==='high'?'bg-[#FEE2E2] text-[#DC2626]':c.probability?.toLowerCase()==='medium'?'bg-[#FEF3C7] text-[#D97706]':'bg-[#DBEAFE] text-[#2563EB]'}`}>{c.probability}</span>
      </div>
      {c.description && <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{c.description}</p>}
    </div>
  </div>
);

const MedCard = ({ m, onAdd, added }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all">
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shrink-0"><Pill className="w-5 h-5 text-white" /></div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-[#1E293B] text-sm truncate">{m.name}</p>
      {m.salt && <p className="text-xs text-[#64748B] truncate">{m.salt}</p>}
      <span className="text-sm font-extrabold text-[#059669]">₹{m.price}</span>
    </div>
    <button onClick={()=>onAdd(m)} className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${added?'bg-[#D1FAE5] text-[#059669]':'bg-[#3B82F6] text-white hover:bg-[#2563EB]'}`}>
      {added ? <><CheckCircle className="w-3.5 h-3.5 inline mr-1"/>Added</> : <><ShoppingCart className="w-3.5 h-3.5 inline mr-1"/>Add</>}
    </button>
  </div>
);

const DocCard = ({ d }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all">
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-[#EFF6FF]">
      {d.image ? <img src={d.image} alt={d.name} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center"><UserCheck className="w-4 h-4 text-white"/></div>}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-[#1F2937] text-sm truncate">Dr. {d.name}</p>
      <p className="text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">{d.specialty}</p>
      <div className="flex items-center gap-2 mt-1">
        {d.experience && <span className="flex items-center gap-1 text-xs text-[#64748B]"><Clock className="w-3 h-3"/>{d.experience}</span>}
        {d.location && <span className="flex items-center gap-1 text-xs text-[#64748B] truncate"><MapPin className="w-3 h-3"/>{d.location}</span>}
      </div>
    </div>
  </div>
);

const Section = ({ icon:Icon, title, children, open:defOpen=true }) => {
  const [open, setOpen] = useState(defOpen);
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors">
        <div className="flex items-center gap-2"><div className="p-1 bg-white rounded-md shadow-sm border border-[#E2E8F0]"><Icon className="w-3.5 h-3.5 text-[#64748B]"/></div><span className="text-sm font-bold text-[#334155]">{title}</span></div>
        {open ? <ChevronUp className="w-4 h-4 text-[#94A3B8]"/> : <ChevronDown className="w-4 h-4 text-[#94A3B8]"/>}
      </button>
      {open && <div className="p-3 space-y-2">{children}</div>}
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
export default function SymptomChecker() {
  const { addToCart } = useCart();
  const chatRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recogRef = useRef(null);
  const silenceTimer = useRef(null);
  const historyRef = useRef([]);
  const addedMeds = useRef(new Set());

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [status, setStatus] = useState("idle");
  const [addedSet, setAddedSet] = useState(new Set());
  const { t, i18n } = useTranslation();
  const rawLang = i18n.language || 'en';
  const language = LANG[rawLang.split('-')[0]] ? rawLang.split('-')[0] : 'en';

  const L = LANG[language];

  const [statusText, setStatusText] = useState("");

  const AGENT_STATUS = {
    thinking: [
      { en: "Analyzing your symptoms...", hi: "लक्षणों का विश्लेषण कर रही हूँ...", pa: "ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਹੀ ਹਾਂ..." },
      { en: "Checking clinical protocols...", hi: "क्लिनिकल प्रोटोकॉल की जांच कर रही हूँ...", pa: "ਕਲੀਨਿਕਲ ਪ੍ਰੋਟੋਕੋਲ ਦੀ ਜਾਂਚ ਕਰ ਰਹੀ ਹਾਂ..." },
      { en: "Correlating with database...", hi: "डेटाबेस के साथ मिलान कर रही हूँ...", pa: "ਡਾਟਾਬੇਸ ਨਾਲ ਮਿਲਾਨ ਕਰ ਰਹੀ ਹਾਂ..." },
      { en: "Finalizing health guidance...", hi: "स्वास्थ्य मार्गदर्शन तैयार कर रही हूँ...", pa: "ਸਿਹਤ ਮਾਰਗਦਰਸ਼ਨ ਤਿਆਰ ਕਰ ਰਹੀ ਹਾਂ..." }
    ]
  };

  /* ── Welcome message ── */
  useEffect(() => {
    const w = { 
      en: "Hello! I'm Nabha AI, your personal health assistant. I'm here to listen and help you feel better. How are you feeling today?", 
      hi: "नमस्ते! मैं नाभा AI हूँ, आपकी पर्सनल हेल्थ असिस्टेंट। मैं आपकी बात सुनने और आपकी मदद करने के लिए यहाँ हूँ। आज आप कैसा महसूस कर रहे हैं?", 
      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨਾਭਾ AI ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?" 
    };
    setMessages([{ role: "ai", text: w[language], ts: Date.now() }]);
    historyRef.current = [];
  }, [language]);

  /* ── Agentic Status Rotation ── */
  useEffect(() => {
    if (isThinking) {
      let idx = 0;
      setStatusText(AGENT_STATUS.thinking[0][language]);
      const int = setInterval(() => {
        idx = (idx + 1) % AGENT_STATUS.thinking.length;
        setStatusText(AGENT_STATUS.thinking[idx][language]);
      }, 2500);
      return () => clearInterval(int);
    } else {
      setStatusText(t('symptoms.thinking'));
    }
  }, [isThinking, language, t]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:"smooth" });
  }, [messages, isThinking]);

  /* ── Speech Recognition setup ── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (transcript.trim()) sendVoiceMessage(transcript);
      setIsListening(false);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recogRef.current = r;
  }, []);

  /* ── TTS helpers ── */
  const getVoice = useCallback(() => {
    const voices = synthRef.current.getVoices();
    const lang = L.speechCode;
    const fem = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    const pref = fem.find(v => /zira|samantha|jenny|female|swara/i.test(v.name));
    return pref || fem[0] || voices[0];
  }, [L.speechCode]);

  const speak = useCallback((text) => {
    if (!text || isMuted) return Promise.resolve();
    return new Promise((resolve) => {
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text.slice(0, 500));
      u.lang = L.speechCode;
      u.rate = 0.95;
      u.pitch = 1.1;
      const v = getVoice();
      if (v) u.voice = v;
      u.onstart = () => { setIsSpeaking(true); setStatus("speaking"); };
      u.onend = () => { setIsSpeaking(false); setStatus("idle"); resolve(); };
      u.onerror = () => { setIsSpeaking(false); setStatus("idle"); resolve(); };
      synthRef.current.speak(u);
    });
  }, [L.speechCode, isMuted, getVoice]);

  /* ── Auto-speak welcome ── */
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "ai" && !isMuted) {
      const timer = setTimeout(() => speak(messages[0].text), 600);
      return () => clearTimeout(timer);
    }
  }, [messages, isMuted, speak]);

  /* ── Silence re-prompt (voice mode) ── */
  useEffect(() => {
    if (voiceMode && status === "idle" && messages.length > 1) {
      silenceTimer.current = setTimeout(() => {
        const prompts = { en:"I'm still here. Take your time.", hi:"मैं यहाँ हूँ, आराम से बताइए।", pa:"ਮੈਂ ਇੱਥੇ ਹਾਂ, ਆਰਾਮ ਨਾਲ ਦੱਸੋ।" };
        const reP = prompts[language];
        setMessages(p => [...p, { role:"ai", text:reP, ts:Date.now() }]);
        speak(reP);
      }, 10000);
      return () => clearTimeout(silenceTimer.current);
    }
  }, [voiceMode, status, messages.length, language, speak]);

  /* ── Start / Stop Listening ── */
  const startListening = useCallback(() => {
    if (!recogRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    try {
      recogRef.current.lang = L.speechCode;
      recogRef.current.start();
      setIsListening(true);
      setStatus("listening");
    } catch(e) { console.warn("Recognition start error:", e); }
  }, [L.speechCode]);

  const stopListening = useCallback(() => {
    if (!recogRef.current) return;
    recogRef.current.stop();
    setIsListening(false);
    if (status === "listening") setStatus("idle");
  }, [status]);

  const toggleVoiceMode = useCallback(() => {
    if (voiceMode) {
      setVoiceMode(false);
      stopListening();
      synthRef.current.cancel();
      setStatus("idle");
    } else {
      setVoiceMode(true);
      startListening();
    }
  }, [voiceMode, startListening, stopListening]);

  /* ── Send message to voice-chat API ── */
  const sendVoiceMessage = useCallback(async (text) => {
    if (!text?.trim() || isThinking) return;
    const msg = text.trim();
    setInput("");
    setMessages(p => [...p, { role:"user", text:msg, ts:Date.now() }]);
    setIsThinking(true);
    setStatus("thinking");

    try {
      // Realistic delay
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

      const res = await fetch(`${API_BASE}/api/ai/voice-chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message:msg, language, conversationHistory: historyRef.current.slice(-10) })
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (!data.success) throw new Error("AI failed");

      const aiMsg = {
        role:"ai", text: data.voiceText, ts:Date.now(),
        sd: data.shouldShowResults ? data.structuredData : null,
        urgent: data.structuredData?.requiresUrgentCare
      };
      setMessages(p => [...p, aiMsg]);
      historyRef.current.push({ role:"user", text:msg }, { role:"model", text:data.voiceText });

      // Auto-speak then re-listen
      setIsThinking(false);
      await speak(data.voiceText);
      if (voiceMode && !isMuted) {
        setTimeout(() => startListening(), 500);
      }
    } catch (err) {
      setMessages(p => [...p, { role:"error", text:"Connection failed. Please try again.", ts:Date.now() }]);
      setIsThinking(false);
      setStatus("idle");
    }
  }, [isThinking, language, speak, voiceMode, isMuted, startListening]);

  const handleSend = useCallback(() => {
    if (input.trim()) sendVoiceMessage(input);
  }, [input, sendVoiceMessage]);

  const handleClear = useCallback(() => {
    synthRef.current.cancel();
    setIsSpeaking(false);
    historyRef.current = [];
    setVoiceMode(false);
    stopListening();
    setStatus("idle");
    const w = { en:"Hello! I'm Nabha AI, your personal health assistant. How are you feeling today?", hi:"नमस्ते! मैं नाभा AI हूँ। आज आप कैसा महसूस कर रहे हैं?", pa:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨਾਭਾ AI ਹਾਂ। ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?" };
    setMessages([{ role:"ai", text:w[language], ts:Date.now() }]);
  }, [language, stopListening]);

  const handleAddToCart = useCallback((m) => {
    addToCart({ id:m._id, _id:m._id, name:m.name, price:m.price, packSize:m.dosage||"", type:m.type||"Medicine" }, 1, "symptom-checker");
    setAddedSet(prev => new Set(prev).add(m._id));
    setTimeout(() => setAddedSet(prev => { const n = new Set(prev); n.delete(m._id); return n; }), 2500);
  }, [addToCart]);

  /* ── Render ── */
  return (
    <>
      <style>{`
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes soundWave { 0%,100%{transform:scaleY(0.15)} 50%{transform:scaleY(1)} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        body { background-color:#F0F5FF; }
      `}</style>

      <div className="bg-gradient-to-br from-[#F0F5FF] to-[#E8F0FE] flex flex-col items-center font-sans overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-0 lg:gap-6 lg:p-6 min-h-0 lg:h-[calc(100vh-120px)]">

          {/* ═══ LEFT: Chat Panel (65%) ═══ */}
          <div className="flex-1 lg:flex-[0.65] bg-white rounded-none lg:rounded-2xl shadow-lg border-0 lg:border border-[#E2E8F0] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-4 lg:px-6 py-3 border-b border-[#E2E8F0] flex justify-between items-center bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#60A5FA] shadow-md z-30 sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm lg:text-base font-bold text-white tracking-tight">Nabha AI</h1>
                  <p className="text-[9px] text-white/80 font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status==='listening'?'bg-[#F59E0B]':status==='thinking'?'bg-[#8B5CF6]':status==='speaking'?'bg-[#10B981]':'bg-[#10B981]'} animate-pulse`}/>
                    {status==='listening'?'Listening':status==='thinking'?'Thinking':status==='speaking'?'Speaking':'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={()=>{setIsMuted(!isMuted);if(!isMuted)synthRef.current.cancel();}} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all" title={isMuted?"Unmute":"Mute"}>
                  {isMuted?<VolumeX className="w-4 h-4"/>:<Volume2 className="w-4 h-4"/>}
                </button>
                <button onClick={handleClear} className="p-2 rounded-lg bg-white/10 hover:bg-[#EF4444] text-white transition-all group" title="Clear">
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                </button>
                <div className="h-5 w-px bg-white/20 mx-1"/>
                <div className="flex gap-0.5 p-0.5 bg-white/10 rounded-full border border-white/20">
                  {Object.entries(LANG).map(([code,l])=>(
                    <button key={code} onClick={()=>{i18n.changeLanguage(code);synthRef.current.cancel();}} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${language===code?'bg-white text-[#3B82F6] shadow-sm':'text-[#E2E8F0] hover:text-white'}`}>{code.toUpperCase()}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-4 bg-gradient-to-b from-[#FAFBFF] to-white" style={{scrollBehavior:'smooth'}}>
              {messages.map((msg,i) => (
                <div key={i}>
                  {msg.role==="user" && (
                    <div className="flex justify-end animate-in fade-in slide-in-from-right-3 duration-400">
                      <div className="max-w-[80%]">
                        <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-md">
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-[#94A3B8] font-bold px-2 float-right mt-1">{new Date(msg.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                    </div>
                  )}
                  {msg.role==="ai" && (
                    <div className="flex gap-3 items-end max-w-[90%] animate-in fade-in slide-in-from-left-3 duration-400">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center shadow-md shrink-0">
                        <Sparkles className="w-4 h-4 text-white"/>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                          <p className="text-[#334155] text-sm leading-relaxed font-medium">{msg.text}</p>
                          {msg.urgent && (
                            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                              <AlertCircle className="w-5 h-5 text-[#DC2626] animate-pulse shrink-0"/>
                              <p className="text-xs font-bold text-[#991B1B]">Please seek emergency medical help immediately.</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F1F5F9]">
                            <span className="text-[9px] text-[#94A3B8] font-bold uppercase">{new Date(msg.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                            <button onClick={()=>speak(msg.text)} className="p-1.5 rounded-full hover:bg-[#EFF6FF] transition-all" title="Listen">
                              <Volume2 className="w-3.5 h-3.5 text-[#64748B] hover:text-[#3B82F6]"/>
                            </button>
                          </div>
                        </div>
                        {/* Structured Results */}
                        {msg.sd?.possibleConditions?.length>0 && <Section icon={Heart} title="Possible Conditions">{msg.sd.possibleConditions.map((c,j)=><ConditionCard key={j} c={c}/>)}</Section>}
                        {msg.sd?.medicines?.length>0 && <Section icon={Pill} title="Recommended Medicines">{msg.sd.medicines.map((m,j)=><MedCard key={j} m={m} onAdd={handleAddToCart} added={addedSet.has(m._id)}/>)}</Section>}
                        {msg.sd?.doctors?.length>0 && <Section icon={UserCheck} title="Nearby Doctors">{msg.sd.doctors.map((d,j)=><DocCard key={j} d={d}/>)}</Section>}
                        {msg.sd?.precautions?.length>0 && <Section icon={Shield} title="Precautions" open={false}><ul className="space-y-2 p-1">{msg.sd.precautions.map((p,j)=><li key={j} className="flex items-start gap-2 text-sm text-[#475569]"><CheckCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5"/>{p}</li>)}</ul></Section>}
                      </div>
                    </div>
                  )}
                  {msg.role==="error" && (
                    <div className="flex gap-3 items-start max-w-[80%] animate-in fade-in duration-300">
                      <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0 border border-[#FCA5A5]"><AlertCircle className="w-4 h-4 text-[#EF4444]"/></div>
                      <div className="bg-white border border-[#FCA5A5] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <p className="text-sm text-[#991B1B] font-bold">{msg.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-3 items-end max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center shadow-md shrink-0"><Sparkles className="w-4 h-4 text-white"/></div>
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:0ms]"/>
                      <span className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:150ms]"/>
                      <span className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:300ms]"/>
                    </div>
                    <span className="text-xs text-[#6B7280] font-bold">{statusText}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-3 lg:px-6 py-3 lg:py-4 bg-white border-t border-[#E2E8F0] z-30">
              {isListening && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[10px] font-bold rounded-full w-max animate-pulse mx-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"/> {t('symptoms.listening')}
                </div>
              )}
              <div className="max-w-3xl mx-auto flex items-center gap-2 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-full px-2 py-1 focus-within:border-[#3B82F6] focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white transition-all shadow-sm">
                <button onClick={isListening?stopListening:startListening} className={`p-2.5 rounded-full transition-all ${isListening?'bg-[#FEF3C7] text-[#D97706] scale-110':'text-[#94A3B8] hover:bg-[#EFF6FF] hover:text-[#3B82F6]'}`} title="Voice Input">
                  {isListening?<MicOff className="w-5 h-5"/>:<Mic className="w-5 h-5"/>}
                </button>
                <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder={t('symptoms.placeholder')} className="flex-1 bg-transparent py-2 px-1 text-sm text-[#1F2937] font-medium outline-none placeholder-[#94A3B8]"/>
                <button onClick={handleSend} disabled={!input.trim()||isThinking} className="p-2.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-full shadow-md hover:shadow-lg disabled:opacity-40 transition-all flex items-center justify-center h-10 w-10 shrink-0">
                  <Send className="w-4 h-4 ml-0.5"/>
                </button>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: Avatar Panel (35%) ═══ */}
          <div className="flex-[0.35] flex flex-col gap-2.5 order-first lg:order-last px-4 lg:px-0 py-2 lg:py-0 overflow-y-auto">

            {/* Avatar Card — Compact */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-4 relative">
              <div className="flex flex-col items-center">

                {/* Avatar + Status Row */}
                <div className="flex items-center gap-4 w-full">
                  {/* Avatar Image */}
                  <div className="relative shrink-0">
                    {isListening && <>
                      <div className="absolute inset-0 rounded-full border-2 border-[#3B82F6]/30" style={{animation:'ripple 2s infinite'}}/>
                      <div className="absolute inset-0 rounded-full border-2 border-[#3B82F6]/20" style={{animation:'ripple 2s infinite 0.6s'}}/>
                    </>}
                    <div className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-[3px] ${isListening?'border-[#F59E0B]':isSpeaking?'border-[#10B981]':isThinking?'border-[#8B5CF6]':'border-[#E2E8F0]'} shadow-lg transition-all duration-500`}
                      style={{animation: status==='idle'?'breathe 4s ease-in-out infinite':'none'}}>
                      <img src={AVATAR_IMG} alt="Nabha AI" className="w-full h-full object-cover"/>
                      {isSpeaking && <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/20 to-transparent animate-pulse"/>}
                      {isThinking && <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin"/></div>}
                    </div>
                  </div>

                  {/* Name + Status + Tags */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg lg:text-xl font-extrabold text-[#1F2937] tracking-tight leading-tight">Nabha AI</h3>
                    <p className="text-[10px] text-[#6B7280] font-medium italic mt-0.5">Your Caring Health Companion</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${status==='listening'?'bg-[#F59E0B]':status==='thinking'?'bg-[#8B5CF6]':status==='speaking'?'bg-[#10B981]':'bg-[#10B981]'}`}/>
                      <span className="text-[9px] text-[#4B5563] font-bold tracking-widest uppercase">
                        {status==='listening'?'Listening':status==='thinking'?'Analyzing':status==='speaking'?'Speaking':'Ready'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sound wave when speaking */}
                {isSpeaking && (
                  <div className="mt-3 flex gap-1 items-center justify-center h-5 w-full">
                    {[...Array(12)].map((_,i)=>(<div key={i} className="w-1 rounded-full bg-gradient-to-t from-[#10B981] to-[#34D399] origin-bottom" style={{height:'100%',animation:'soundWave 0.8s ease-in-out infinite',animationDelay:`${i*0.07}s`}}/>))}
                  </div>
                )}

                {/* Voice Consultation Button */}
                <button onClick={toggleVoiceMode} className={`w-full mt-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${voiceMode?'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white':'bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] text-white'}`}>
                  {voiceMode ? <><PhoneCall className="w-4 h-4"/>{t('symptoms.endVoice')}</> : <><Phone className="w-4 h-4"/>{t('symptoms.startVoice')}</>}
                </button>

                {/* Feature tags */}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5 w-full pt-3 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#DBEAFE] text-[#1D4ED8] rounded-full text-[9px] font-bold"><Mic className="w-2.5 h-2.5"/>Voice AI</div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#4338CA] rounded-full text-[9px] font-bold"><Globe className="w-2.5 h-2.5"/>Multi-lang</div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#ECFDF5] text-[#047857] rounded-full text-[9px] font-bold"><Shield className="w-2.5 h-2.5"/>Safe AI</div>
                </div>
              </div>
            </div>

            {/* Quick Symptoms */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-3 lg:p-4">
              <h4 className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#3B82F6]"/>Quick Symptoms</h4>
              <div className="flex flex-wrap gap-1.5">
                {["Fever & Chills","Severe Headache","Persistent Cough","Stomach Pain","Back Pain","Chest Pain"].map(s=>(
                  <button key={s} onClick={()=>sendVoiceMessage(s)} disabled={isThinking} className="px-2.5 py-1 bg-white text-[#4B5563] border border-[#E2E8F0] rounded-full text-[10px] font-bold hover:bg-[#EFF6FF] hover:text-[#3B82F6] hover:border-[#BFDBFE] transition-all disabled:opacity-50 shadow-sm hover:-translate-y-0.5">{s}</button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-[#FEF2F2] rounded-xl border border-[#FEE2E2] p-2.5 items-start gap-2 hidden lg:flex">
              <Shield className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5"/>
              <p className="text-[9px] text-[#991B1B] font-bold leading-relaxed">{t('symptoms.disclaimer')}</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}