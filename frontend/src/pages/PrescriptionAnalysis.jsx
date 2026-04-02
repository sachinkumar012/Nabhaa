import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  UploadCloud, AlertCircle, ShoppingCart, MapPin, Search,
  CheckCircle2, Loader2, Bot, Zap, AlertTriangle, X,
  FileImage, RefreshCw, Pill, Sparkles, ChevronRight,
  Activity, FlaskConical, Info, Shield, Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions`;

// ─── Confidence Badge ────────────────────────────────────────────────────────
const ConfidenceBadge = ({ score, matchType }) => {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 85 ? 'badge-confidence-high' : pct >= 65 ? 'badge-confidence-mid' : 'badge-confidence-low';
  const label = matchType === 'exact' ? 'Exact Match'
    : matchType === 'prefix' ? 'Prefix Match'
    : matchType === 'fuzzy' ? '~AI Matched'
    : matchType === 'rxnorm' ? 'RxNorm'
    : 'Unverified';
  return <span className={`rx-confidence-badge ${color}`}>{label} · {pct}%</span>;
};

// ─── OCR Progress Steps ─────────────────────────────────────────────────────
const OcrProgressStep = ({ step, currentStep, label }) => {
  const done = currentStep > step;
  const active = currentStep === step;
  return (
    <div className={`rx-progress-step ${done ? 'done' : active ? 'active' : ''}`}>
      <div className="rx-progress-dot">
        {done ? <CheckCircle2 size={14} /> : active ? <Loader2 size={14} className="spin" /> : step}
      </div>
      <span>{label}</span>
    </div>
  );
};

// ─── Manual Search Autocomplete ─────────────────────────────────────────────
const ManualSearch = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback((q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/validate-medicine?q=${encodeURIComponent(q)}`);
        setSuggestions(res.data.suggestions || []);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 350);
  }, []);

  return (
    <div className="rx-manual-search">
      <div className="rx-manual-input-wrap">
        <Search size={16} className="rx-manual-icon" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); fetchSuggestions(e.target.value); }}
          placeholder={placeholder || 'Search medicine name…'}
          className="rx-manual-input"
        />
        {loading && <Loader2 size={14} className="rx-manual-spinner spin" />}
      </div>
      {suggestions.length > 0 && (
        <ul className="rx-suggestions-list">
          {suggestions.map(s => (
            <li key={s._id} className="rx-suggestion-item"
              onClick={() => { onSelect(s); setSuggestions([]); setQuery(''); }}>
              <div className="rx-suggestion-name">{s.name}</div>
              <div className="rx-suggestion-meta">{s.composition} · ₹{s.price}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Fallback Salt Alternative Card ─────────────────────────────────────────
const FallbackSection = ({ fallbackMedicines, onAddToCart }) => {
  return (
    <div className="rx-fallback-section">
      {fallbackMedicines.map((fb, i) => (
        <div key={i} className="rx-fallback-card">
          {/* Header */}
          <div className="rx-fallback-header">
            <div className="rx-fallback-title-row">
              <FlaskConical size={18} className="rx-fallback-icon" />
              <div>
                <div className="rx-fallback-label">
                  {fb.originalInput
                    ? <>OCR Detected: <strong>"{fb.originalInput}"</strong></>
                    : 'No medicine detected'}
                  {fb.dosage && <span className="rx-dosage-pill"> · {fb.dosage}</span>}
                  {fb.form && <span className="rx-freq-pill"> · {fb.form}</span>}
                </div>
                {fb.salt && (
                  <div className="rx-salt-badge">
                    <FlaskConical size={11} /> Salt: <strong>{fb.salt}</strong>
                  </div>
                )}
              </div>
            </div>
            <span className="rx-fallback-tag">Fallback Active</span>
          </div>

          {/* Message */}
          <p className="rx-fallback-message">{fb.message}</p>

          {/* Dosage warning */}
          {fb.dosageWarning && (
            <div className="rx-dosage-warning">
              <Info size={14} /> {fb.dosageWarning}
            </div>
          )}

          {/* Substitutes grid */}
          {fb.hasSubstitutes && fb.substitutes.length > 0 ? (
            <div className="rx-fallback-grid">
              {fb.substitutes.map(sub => (
                <div key={sub._id} className="rx-fallback-sub-card">
                  <div className="rx-fallback-sub-top">
                    <span className="rx-fallback-sub-name">{sub.name}</span>
                    <span className="rx-same-salt-badge">
                      <FlaskConical size={10} /> {sub.tag}
                    </span>
                  </div>
                  <div className="rx-fallback-sub-comp">{sub.composition}</div>
                  {sub.packSize && <div className="rx-fallback-sub-pack">{sub.packSize}</div>}
                  <div className="rx-fallback-sub-mfr">{sub.manufacturer}</div>
                  <div className="rx-fallback-sub-footer">
                    <span className="rx-fallback-sub-price">₹{sub.price}</span>
                    <div className="rx-stock-dot">
                      <span className={`rx-stock-indicator ${sub.stock ? 'in-stock' : 'out-stock'}`} />
                      {sub.stock ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <button
                      className="rx-btn-primary rx-btn-sm"
                      onClick={() => onAddToCart(sub)}
                      disabled={!sub.stock}
                    >
                      <ShoppingCart size={13} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rx-fallback-manual">
              <Search size={16} className="rx-fallback-search-icon" />
              <p>No alternatives found. Search manually:</p>
              <ManualSearch
                placeholder={fb.originalInput ? `Search for "${fb.originalInput}"…` : 'Type a medicine name…'}
                onSelect={onAddToCart}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Normal Medicine Card (in-stock / substitute / unsafe) ──────────────────
const MedicineCard = ({ result, onAddToCart }) => {
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [manualSelected, setManualSelected] = useState(null);

  if (result.inventoryStatus === 'ORIGINAL') {
    const med = result.data;
    return (
      <div className="rx-med-card rx-card-original">
        <div className="rx-card-header">
          <div>
            <div className="rx-card-badges">
              <span className="rx-form-badge">{result.form || med.type || 'Medicine'}</span>
              <ConfidenceBadge score={result.confidence} matchType={result.matchType} />
            </div>
            <h3 className="rx-med-name">{med.name}</h3>
            <p className="rx-med-meta">
              {med.composition}
              {result.dosage && <span className="rx-dosage-pill"> · {result.dosage}</span>}
              {result.frequency && <span className="rx-freq-pill"> · {result.frequency}</span>}
            </p>
            {med.packSize && <p className="rx-pack-size">{med.packSize}</p>}
          </div>
          <div className="rx-card-right">
            <div className="rx-price">₹{med.price}</div>
            <button className="rx-btn-primary" onClick={() => onAddToCart(med)}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result.inventoryStatus === 'SUBSTITUTE') {
    return (
      <div className="rx-med-card rx-card-substitute">
        <div className="rx-out-of-stock-banner">
          <AlertTriangle size={16} />
          <span>Original <strong>{result.original || result.matchedName}</strong> is out of stock</span>
          {result.dosage && <span className="rx-dosage-pill">{result.dosage}</span>}
          <ConfidenceBadge score={result.confidence} matchType={result.matchType} />
        </div>
        <div className="rx-substitutes-header" onClick={() => setShowSubstitutes(!showSubstitutes)}>
          <span className="rx-substitutes-label">
            <Sparkles size={14} /> {result.substitutes?.length || 0} Safe Substitutes Available
          </span>
          <ChevronRight className={`rx-chevron ${showSubstitutes ? 'rotated' : ''}`} size={16} />
        </div>
        {showSubstitutes && (
          <div className="rx-substitutes-grid">
            {(result.substitutes || []).map(sub => (
              <div key={sub._id} className="rx-sub-card">
                <div className="rx-sub-top">
                  <div className="rx-sub-name">{sub.name}</div>
                  <span className="rx-match-badge">{sub.matchPercentage}% match</span>
                </div>
                <div className="rx-sub-comp">{sub.composition}</div>
                <div className="rx-sub-mfr">{sub.manufacturer}</div>
                <div className="rx-sub-footer">
                  <span className="rx-sub-price">₹{sub.price}</span>
                  {sub.distance && <span className="rx-distance"><MapPin size={12} />{sub.distance}km</span>}
                  <button className="rx-btn-outline" onClick={() => onAddToCart(sub)}>
                    <ShoppingCart size={14} /> Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (result.inventoryStatus === 'UNSAFE') {
    return (
      <div className="rx-med-card rx-card-unsafe">
        <div className="rx-unsafe-icon"><AlertCircle size={24} /></div>
        <div>
          <h3 className="rx-unsafe-name">{result.matchedName || result.extractedName}</h3>
          {result.dosage && <span className="rx-dosage-pill">{result.dosage}</span>}
          <p className="rx-unsafe-alert">{result.alert || 'Consult pharmacist before purchasing.'}</p>
        </div>
        <button className="rx-btn-danger">Consult Pharmacist</button>
      </div>
    );
  }

  // UNVERIFIED — show inline salt substitutes if available
  if (result.inventoryStatus === 'UNVERIFIED') {
    return (
      <div className="rx-med-card rx-card-unverified">
        <div className="rx-unverified-header">
          <div>
            <span className="rx-ocr-raw-label">OCR Detected:</span>
            <span className="rx-ocr-raw-name">"{result.extractedName}"</span>
            {result.dosage && <span className="rx-dosage-pill">{result.dosage}</span>}
          </div>
          <ConfidenceBadge score={result.confidence} matchType={result.matchType} />
        </div>

        {/* Salt substitutes if fallback ran for this med */}
        {result.saltSubstitutes && result.saltSubstitutes.length > 0 ? (
          <div>
            {result.salt && (
              <div className="rx-salt-badge rx-salt-badge-inline">
                <FlaskConical size={11} /> Salt: <strong>{result.salt}</strong>
              </div>
            )}
            <p className="rx-unverified-prompt">{result.message}</p>
            <div className="rx-fallback-grid">
              {result.saltSubstitutes.map(sub => (
                <div key={sub._id} className="rx-fallback-sub-card">
                  <div className="rx-fallback-sub-top">
                    <span className="rx-fallback-sub-name">{sub.name}</span>
                    <span className="rx-same-salt-badge"><FlaskConical size={10} /> Same Salt</span>
                  </div>
                  <div className="rx-fallback-sub-comp">{sub.composition}</div>
                  <div className="rx-fallback-sub-footer">
                    <span className="rx-fallback-sub-price">₹{sub.price}</span>
                    <button className="rx-btn-primary rx-btn-sm" onClick={() => onAddToCart(sub)}>
                      <ShoppingCart size={13} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="rx-unverified-prompt">We couldn't fully verify this medicine. Please confirm:</p>
            {manualSelected ? (
              <div className="rx-confirmed-pill">
                <CheckCircle2 size={14} /> Confirmed: <strong>{manualSelected.name}</strong> — ₹{manualSelected.price}
                <button className="rx-add-confirmed-btn" onClick={() => onAddToCart(manualSelected)}>
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            ) : (
              <ManualSearch
                placeholder={`Search for "${result.extractedName}"…`}
                onSelect={s => setManualSelected(s)}
              />
            )}
          </>
        )}
      </div>
    );
  }

  return null;
};

// ─── Main Page Component ─────────────────────────────────────────────────────
const PrescriptionAnalysis = () => {
  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [localCartCount, setLocalCartCount] = useState(0); // track how many added THIS session
  const fileInputRef = useRef(null);

  const STEPS = ['Preprocessing Image', 'Running OCR Engine', 'Detecting Medicine Lines', 'Matching & Validating'];

  const handleFile = (selected) => {
    if (!selected) return;
    // Client-side size check: warn if > 25MB
    if (selected.size > 25 * 1024 * 1024) {
      setError('Image is too large (max 25 MB). Please choose a smaller image or take a photo at lower resolution.');
      return;
    }
    setFile(selected); setPreviewUrl(URL.createObjectURL(selected));
    setResults(null); setError(''); setAnalysisStep(0);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) handleFile(dropped);
  }, []);

  const simulateSteps = () => {
    setAnalysisStep(1);
    [900, 1800, 2800].forEach((t, i) => setTimeout(() => setAnalysisStep(i + 2), t));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true); setError(''); setResults(null);
    simulateSteps();
    const formData = new FormData();
    formData.append('prescription', file);
    try {
      const response = await axios.post(`${API_BASE}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000, // 90 seconds — mobile OCR (Gemini + Tesseract) can be slow on Render
        onUploadProgress: (progressEvent) => {
          // Show upload progress for large mobile images
          const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          if (pct < 100) console.log(`[Upload] ${pct}% uploaded`);
        },
      });
      setAnalysisStep(4);
      setTimeout(() => setResults(response.data), 400);
    } catch (err) {
      // Extract the most useful error message
      const responseData = err.response?.data;
      const code = responseData?.code;
      let userMessage = 'Failed to analyze prescription. Please try a clearer image.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        userMessage = 'Analysis timed out. Your connection may be slow — please try again or use a smaller image.';
      } else if (code === 'FILE_TOO_LARGE') {
        userMessage = 'Image is too large. Please take a photo at a lower resolution or compress it.';
      } else if (code === 'UNSUPPORTED_FORMAT') {
        userMessage = 'Image format not supported. Please save it as JPG or PNG and try again.';
      } else if (code === 'AI_UNAVAILABLE') {
        userMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
      } else if (code === 'UPLOAD_ERROR') {
        userMessage = responseData?.message || 'Upload failed. Please try again.';
      } else if (responseData?.message) {
        userMessage = responseData.message;
      }

      setError(userMessage);
      setAnalysisStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToCart = (med) => {
    addToCart(
      {
        id: med._id || med.id || String(med.name),
        _id: med._id,
        name: med.name,
        price: med.price || 0,
        packSize: med.packSize || '',
        type: med.type || 'Medicine',
        composition: med.composition || '',
      },
      1,
      'prescription'
    );
    setLocalCartCount(prev => prev + 1);
  };

  const handleReset = () => {
    setFile(null); setPreviewUrl(null); setResults(null);
    setError(''); setAnalysisStep(0);
  };

  const isFallback = results?.status === 'fallback_used';
  const overallPct = results ? Math.round((results.overallConfidence || 0) * 100) : 0;

  const fallbackReasonLabel = {
    low_confidence: 'Low OCR Confidence',
    not_found: 'Medicine Not Found in Database',
    no_detection: 'No Medicines Detected',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E2f8f7] via-[#ebfcfb] to-[#d4f0f0] relative overflow-x-hidden flex flex-col items-center pt-24 pb-20 px-4 font-sans">
      
      {/* Background Decorative Blurs */}
      <div className="absolute top-[-5%] left-[5%] w-[50%] h-[50%] bg-[#ffffff]/60 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#AEE2DD]/40 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Floating Cart Toast */}
      {localCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f4e4b] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
          <ShoppingCart size={20} />
          <span className="font-medium">{localCartCount} item{localCartCount > 1 ? 's' : ''} added</span>
          <button
            className="bg-[#42B0A6] hover:bg-[#32968D] px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
            onClick={() => navigate('/cart')}
          >View Cart ({cartCount})</button>
        </div>
      )}

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-[#075985] to-[#1e3a8a] text-white py-16 px-4 absolute top-0 left-0 right-0 z-10 block">
        <div className="max-w-6xl mx-auto text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Bot size={16} />
            AI Prescriptions
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Smart AI Prescription <br className="hidden sm:block" />
            <span className="text-yellow-300">Analyzer</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Upload a handwritten or printed prescription. AI extracts medicine names, dosages and frequencies — then checks stock and finds safe substitutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pb-4">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
              <Zap size={15} strokeWidth={2.5} /> Gemini Vision OCR
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
              <Sparkles size={15} strokeWidth={2.5} /> Fuzzy NLP Matching
            </span>
          </div>
        </div>
      </div>

      {/* Trust Stats mt-72 to clear the absolute hero height */}
      <div className="max-w-6xl w-full mx-auto px-4 mt-72 mb-10 z-20 relative">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Bot size={22} />, value: '99.9%', label: 'AI Accuracy' },
            { icon: <CheckCircle2 size={22} />, value: 'Verified', label: 'Safe Substitutes' },
            { icon: <Clock size={22} />, value: '< 5 sec', label: 'Processing Time' },
            { icon: <Shield size={22} />, value: '100%', label: 'Data Privacy' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-xl mb-2">
                {stat.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Zone matching screenshot */}
      <div className="relative z-10 w-full max-w-[850px] bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-5 shadow-[0_30px_60px_-15px_rgba(45,153,143,0.15)] border border-white/60 mb-10">
        <div
            className={`relative border-[2px] border-dashed rounded-[2rem] text-center transition-all cursor-pointer overflow-hidden group 
              ${isDragging ? 'border-[#42B0A6] bg-white/80 p-10 md:p-14' : 'border-[#9FD4CD] bg-white/40 hover:bg-white/60 p-10 md:p-14'}
              ${previewUrl ? 'border-solid border-[#42B0A6]/30 p-8 bg-white/30' : ''}
            `}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
        >
          <input ref={fileInputRef} id="prescriptionUpload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          
          {previewUrl ? (
             <div className="flex flex-col items-center">
                 <img src={previewUrl} alt="Preview" className="w-full max-w-sm rounded-[1.5rem] shadow-[0_8px_20px_rgba(0,0,0,0.1)] mb-6 object-contain max-h-[300px] border-[4px] border-white" />
                 <div className="flex items-center justify-center gap-4 bg-white/80 py-3 px-6 rounded-full shadow-sm">
                    <span className="flex items-center gap-2 text-[#207068] font-bold"><CheckCircle2 size={18}/> Ready for analysis</span>
                    <div className="w-px h-5 bg-teal-200"></div>
                    <button className="flex items-center gap-1.5 text-[#E51C23] hover:text-[#b3141a] font-bold transition-colors" onClick={e => { e.stopPropagation(); handleReset();}}>
                       <X size={16} strokeWidth={3}/> Change Image
                    </button>
                 </div>
             </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#AEE2DD] rounded-[1.15rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-[#9DE0DA] transition-transform duration-300 shadow-sm relative z-10">
                  <UploadCloud size={30} className="text-[#207068]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[1.4rem] font-bold text-[#194D48] mb-2.5 relative z-10">Drop prescription here or click to upload</h3>
              <p className="text-[#5b918b] text-[14px] mb-8 font-medium relative z-10">JPG, PNG, WebP up to 10MB · Handwritten prescriptions supported</p>
              
              <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-7 bg-white/80 backdrop-blur-md px-6 md:px-8 py-3.5 rounded-[2rem] text-[#3A948C] text-sm font-semibold border border-[#e0f4f2] shadow-sm relative z-20">
                  <span className="flex items-center gap-2 text-[#466661]"><FileImage size={17} className="text-[#51B3A8]" /> Clear photos work best</span>
                  <span className="flex items-center gap-2 text-[#466661]"><Pill size={17} className="text-[#51B3A8]" /> Detects Tab, Cap, Syp, Inj</span>
                  <span className="flex items-center gap-2 text-[#466661]"><Sparkles size={17} className="text-[#51B3A8]" /> AI corrects OCR</span>
              </div>
            </>
          )}
        </div>

        {/* Floating Action Buttons */}
        {file && !isAnalyzing && !results && (
            <div className="flex justify-center mt-6 relative z-10 pb-2">
              <button id="btnRunAnalysis" className="flex items-center gap-2 bg-[#42B0A6] hover:bg-[#32968D] text-white px-10 py-3.5 rounded-full font-bold text-[16px] tracking-wide shadow-[0_8px_20px_rgba(66,176,166,0.3)] hover:shadow-[0_12px_24px_rgba(66,176,166,0.4)] transition-all hover:-translate-y-1 group" onClick={handleAnalyze}>
                <Bot size={22} className="group-hover:animate-bounce" /> Run AI Analysis
              </button>
            </div>
        )}
        {error && (
            <div className="mt-8 flex flex-col items-center relative z-10 pb-2">
              <div className="flex flex-col items-center gap-3 bg-red-50/90 backdrop-blur text-red-700 border border-red-200 p-6 rounded-[1.5rem] w-full max-w-lg mb-4 shadow-sm text-center">
                 <AlertCircle size={32} className="mb-2" />
                 <h4 className="font-bold text-lg">Analysis Failed</h4>
                 <p className="text-[14px] font-medium opacity-90">{error}</p>
                 <button className="mt-4 flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-full text-sm font-bold border border-red-200 shadow-sm transition-colors cursor-pointer" onClick={handleReset}>
                   <RefreshCw size={16} strokeWidth={2.5}/> Try Another Image
                 </button>
              </div>
            </div>
        )}
        {results && !isAnalyzing && (
            <div className="flex justify-center mt-6 relative z-10 pb-2">
              <button className="flex items-center gap-2 bg-white/90 backdrop-blur border-2 border-[#42B0A6]/30 text-[#42B0A6] hover:bg-[#eaf8f6] px-8 py-3 rounded-full font-bold shadow-sm transition-all text-sm uppercase tracking-wide" onClick={handleReset}>
                <RefreshCw size={18} /> Analyze New Prescription
              </button>
            </div>
        )}
      </div>

      {/* Results Container Wrapper */}
      <div className="w-full max-w-[900px] relative z-20 flex flex-col gap-6">

        {/* OCR Progress */}
        {isAnalyzing && (
          <div className="rx-progress-card">
            <p className="rx-progress-title"><Loader2 size={16} className="spin" /> Analyzing prescription…</p>
            <div className="rx-progress-steps">
              {STEPS.map((label, i) => (
                <OcrProgressStep key={i} step={i + 1} currentStep={analysisStep} label={label} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="rx-results-section">

            {/* Summary Bar */}
            <div className="rx-summary-bar">
              <div className="rx-summary-left">
                {isFallback
                  ? <AlertTriangle size={20} className="rx-summary-warn" />
                  : <CheckCircle2 size={20} className="rx-summary-check" />
                }
                <div>
                  <h2 className="rx-summary-title">
                    {isFallback
                      ? `Fallback: ${fallbackReasonLabel[results.reason] || 'Showing Alternatives'}`
                      : `${results.totalMedicinesFound} Medicine${results.totalMedicinesFound !== 1 ? 's' : ''} Found`
                    }
                  </h2>
                  <p className="rx-summary-meta">
                    OCR: <strong>{results.ocrEngine === 'gemini' ? 'Gemini Vision' : 'Tesseract LSTM'}</strong>
                    {' · '}Lines scanned: <strong>{results.medicineLines?.length || 0}</strong>
                  </p>
                </div>
              </div>
              <div className="rx-confidence-gauge">
                <div className="rx-gauge-label">Confidence</div>
                <div className="rx-gauge-bar">
                  <div
                    className={`rx-gauge-fill ${overallPct >= 80 ? 'high' : overallPct >= 60 ? 'mid' : 'low'}`}
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <div className="rx-gauge-pct">{overallPct}%</div>
              </div>
            </div>

            {/* ── FALLBACK MODE UI ── */}
            {isFallback && (
              <>
                {/* Fallback warning banner */}
                <div className="rx-fallback-warning-banner">
                  <div className="rx-fallback-banner-left">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Medicine not detected clearly</strong>
                      <p>
                        {results.reason === 'low_confidence'
                          ? `OCR confidence is ${overallPct}% — too low to verify. `
                          : results.reason === 'no_detection'
                          ? 'No medicine lines were detected in the prescription. '
                          : 'Medicine could not be found in our database. '}
                        Showing alternatives based on same composition.
                      </p>
                    </div>
                  </div>
                  <span className="rx-fallback-banner-badge">Fallback Engine Active</span>
                </div>

                {/* Fallback medicine cards */}
                <FallbackSection
                  fallbackMedicines={results.fallbackMedicines || []}
                  onAddToCart={handleAddToCart}
                />

                {/* Always show manual search at bottom */}
                <div className="rx-manual-fallback-footer">
                  <Search size={18} />
                  <div style={{ flex: 1 }}>
                    <p className="rx-manual-fallback-hint">
                      Can't find what you're looking for? Search manually:
                    </p>
                    <ManualSearch
                      placeholder="Type any medicine name…"
                      onSelect={handleAddToCart}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── NORMAL MODE UI ── */}
            {!isFallback && (
              <>
                {results.requiresConfirmation && (
                  <div className="rx-confirm-warning">
                    <AlertTriangle size={16} />
                    <span>Some medicines need confirmation — OCR confidence is low. Please verify below.</span>
                  </div>
                )}
                {results.extractedMedicines?.map((result, i) => (
                  <MedicineCard key={i} result={result} onAddToCart={handleAddToCart} />
                ))}
              </>
            )}

            {/* Cart Summary — now just a redirect CTA, actual cart in /cart */}
            {localCartCount > 0 && (
              <div className="rx-cart-summary">
                <div className="rx-cart-summary-header">
                  <ShoppingCart size={18} />
                  <h3>{localCartCount} medicine{localCartCount !== 1 ? 's' : ''} added to cart</h3>
                </div>
                <div className="rx-cart-total">
                  <button
                    className="rx-checkout-btn"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart & Checkout <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Error-state manual search (when OCR completely fails) */}
        {error && (
          <div className="rx-error-manual-search">
            <h3><Search size={18} /> Search Medicine Manually</h3>
            <p>Even when the image can't be read, you can still find your medicine:</p>
            <ManualSearch placeholder="Type medicine name…" onSelect={handleAddToCart} />
          </div>
        )}

      </div>
    </div>
  );
};

export default PrescriptionAnalysis;
