import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  UploadCloud, AlertCircle, ShoppingCart, MapPin, Search,
  CheckCircle2, Loader2, Bot, Zap, AlertTriangle, X,
  FileImage, RefreshCw, Pill, Sparkles, ChevronRight,
  Activity, FlaskConical, Info
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/prescriptions';

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
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const fileInputRef = useRef(null);

  const STEPS = ['Preprocessing Image', 'Running OCR Engine', 'Detecting Medicine Lines', 'Matching & Validating'];

  const handleFile = (selected) => {
    if (!selected) return;
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
      });
      setAnalysisStep(4);
      setTimeout(() => setResults(response.data), 400);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze prescription. Please try a clearer image.');
      setAnalysisStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToCart = (med) => {
    if (!cartItems.find(c => c._id === med._id)) setCartItems(prev => [...prev, med]);
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
    <div className="rx-page">

      {/* Floating Cart Toast */}
      {cartItems.length > 0 && (
        <div className="rx-cart-toast">
          <ShoppingCart size={16} />
          {cartItems.length} item{cartItems.length > 1 ? 's' : ''} added
          <button className="rx-cart-toast-btn">View Cart</button>
        </div>
      )}

      <div className="rx-container">

        {/* Header */}
        <div className="rx-header">
          <div className="rx-header-icon"><Bot size={28} /></div>
          <h1 className="rx-title">AI Prescription Analysis</h1>
          <p className="rx-subtitle">
            Upload a handwritten or printed prescription. AI extracts medicine names, dosages and
            frequencies — then checks stock and finds safe substitutes.
          </p>
          <div className="rx-engine-pills">
            <span className="rx-engine-pill"><Zap size={12} /> Gemini Vision OCR</span>
            <span className="rx-engine-pill"><Activity size={12} /> Tesseract LSTM Fallback</span>
            <span className="rx-engine-pill"><Sparkles size={12} /> Fuzzy NLP Matching</span>
            <span className="rx-engine-pill"><FlaskConical size={12} /> Salt-Based Fallback</span>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="rx-upload-card">
          <div
            className={`rx-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
          >
            <input ref={fileInputRef} id="prescriptionUpload" type="file"
              accept="image/*" className="rx-file-input" onChange={handleFileChange} />

            {previewUrl ? (
              <div className="rx-preview-wrap">
                <img src={previewUrl} alt="Prescription preview" className="rx-preview-img" />
                <div className="rx-preview-footer">
                  <CheckCircle2 size={16} className="rx-check-icon" />
                  <span>Image ready for analysis</span>
                  <button className="rx-change-btn"
                    onClick={e => { e.stopPropagation(); handleReset(); }}>
                    <X size={14} /> Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="rx-upload-placeholder">
                <div className="rx-upload-icon-wrap"><UploadCloud size={40} /></div>
                <p className="rx-upload-title">Drop prescription here or click to upload</p>
                <p className="rx-upload-hint">JPG, PNG, WebP up to 10MB · Handwritten prescriptions supported</p>
                <div className="rx-upload-features">
                  <span><FileImage size={13} /> Clear photos work best</span>
                  <span><Pill size={13} /> Detects Tab, Cap, Syp, Inj</span>
                  <span><Sparkles size={13} /> AI corrects OCR errors</span>
                </div>
              </div>
            )}
          </div>

          {file && !isAnalyzing && !results && (
            <button id="btnRunAnalysis" className="rx-analyze-btn" onClick={handleAnalyze}>
              <Bot size={18} /> Run AI Analysis
            </button>
          )}
          {results && !isAnalyzing && (
            <button className="rx-reset-btn" onClick={handleReset}>
              <RefreshCw size={16} /> Analyze Another Prescription
            </button>
          )}
          {error && (
            <div className="rx-error-banner">
              <AlertCircle size={18} />
              <div>
                <p className="rx-error-msg">{error}</p>
                <p className="rx-error-hint">Try a clearer image, or use the manual search below.</p>
              </div>
            </div>
          )}
        </div>

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

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <div className="rx-cart-summary">
                <div className="rx-cart-summary-header">
                  <ShoppingCart size={18} />
                  <h3>Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</h3>
                </div>
                <div className="rx-cart-items">
                  {cartItems.map(item => (
                    <div key={item._id} className="rx-cart-item">
                      <span className="rx-cart-item-name">{item.name}</span>
                      <span className="rx-cart-item-price">₹{item.price}</span>
                      <button className="rx-cart-remove"
                        onClick={() => setCartItems(prev => prev.filter(c => c._id !== item._id))}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="rx-cart-total">
                  Total: ₹{cartItems.reduce((sum, i) => sum + (i.price || 0), 0)}
                  <button className="rx-checkout-btn">Checkout <ChevronRight size={16} /></button>
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
