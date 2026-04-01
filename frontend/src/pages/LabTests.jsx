import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Clock, Calendar, FlaskConical, X, Phone, ArrowUpDown, Check
} from 'lucide-react';
import LabTestDetailsView from '../components/Pharmacy/LabTestDetailsView';
import MyLabBookingsView from '../components/Pharmacy/MyLabBookingsView';
import LabBookingModal from '../components/Pharmacy/LabBookingModal';

// ─── Brand color ─────────────────────────────────────────────────────────────
const TEAL = '#0F8B8D';
const TEAL_DARK = '#0a6b6d';
const DISCOUNT_PCT = 60;

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_META = [
  { label: 'Full Body\nCheckup',  icon: '🧬', bg: '#FFF3E0', key: 'Health Packages' },
  { label: 'Diabetes',            icon: '🩸', bg: '#FCE4EC', key: 'Diabetes' },
  { label: 'Heart',               icon: '❤️', bg: '#FDE8E8', key: 'Heart' },
  { label: 'Blood Studies',       icon: '💉', bg: '#E8F5E9', key: 'Blood' },
  { label: 'Vitamin',             icon: '☀️', bg: '#FFFDE7', key: 'Vitamins' },
  { label: 'Thyroid',             icon: '🦋', bg: '#EDE7F6', key: 'Hormonal' },
  { label: 'Kidney',              icon: '🫘', bg: '#E3F2FD', key: 'Kidney' },
  { label: 'Liver',               icon: '🫀', bg: '#F3E5F5', key: 'Liver' },
  { label: "Women's Health",      icon: '🌸', bg: '#FCE4EC', key: "Women's Health" },
  { label: 'Senior Citizen',      icon: '👴', bg: '#E8F5E9', key: 'Senior' },
  { label: 'Tax Saver',           icon: '🏦', bg: '#E0F7FA', key: 'Tax Saver' },
  { label: 'Fever',               icon: '🌡️', bg: '#FFF3E0', key: 'Fever' },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
const getOriginalPrice = (price) => Math.round(price / (1 - DISCOUNT_PCT / 100));

// ─── Category Tile ────────────────────────────────────────────────────────────
const CategoryTile = ({ cat, active, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 0.5rem', borderRadius: '12px',
    border: active ? `2px solid ${TEAL}` : '1.5px solid #e5e7eb',
    background: active ? '#E0F7FA' : 'white',
    cursor: 'pointer', flex: '0 0 auto', minWidth: 80,
    transition: 'all 0.18s',
  }}>
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
      {cat.icon}
    </div>
    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: active ? TEAL : '#374151', textAlign: 'center', lineHeight: 1.25, whiteSpace: 'pre-line' }}>
      {cat.label}
    </span>
  </button>
);

// ─── Test Card (used in both views) ──────────────────────────────────────────
const TestCard = ({ test, onView, onBook, layout = 'horizontal' }) => {
  const discPrice = Math.round(test.price);
  const origPrice = test.originalPrice || getOriginalPrice(test.price);
  const testsCount = test.testsIncluded || test.parameters?.length || Math.floor(Math.random() * 40) + 2;
  const isHoriz = layout === 'horizontal';

  return (
    <div
      onClick={() => onView(test._id)}
      style={{
        background: 'white', borderRadius: '14px', border: '1.5px solid #e5e7eb',
        padding: '1rem',
        minWidth: isHoriz ? 220 : 'unset',
        maxWidth: isHoriz ? 240 : 'unset',
        flex: isHoriz ? '0 0 auto' : 'unset',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px rgba(15,139,141,0.15)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Icon area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
          🧪
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', lineHeight: 1.3 }}>{test.title}</div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>{testsCount} Tests Included</div>
          {test.recommended && (
            <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 600, marginTop: 2 }}>Recommended for {test.recommended}</div>
          )}
        </div>
      </div>

      {test.reportsWithin && (
        <div style={{ fontSize: '0.7rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> Reports in {test.reportsWithin}
        </div>
      )}

      {test.isPackage && (
        <div style={{ display: 'inline-block', background: '#EDE7F6', color: '#7c3aed', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', width: 'fit-content' }}>
          PACKAGE
        </div>
      )}

      <div style={{ height: 1, background: '#f3f4f6' }} />

      {/* Price + Add */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>₹{discPrice}</span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', textDecoration: 'line-through' }}>₹{origPrice}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669' }}>{DISCOUNT_PCT}% off</span>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onBook(test); }}
          style={{
            background: TEAL, color: 'white', border: 'none', borderRadius: '8px',
            padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
          onMouseLeave={e => e.currentTarget.style.background = TEAL}
        >
          Add
        </button>
      </div>
    </div>
  );
};

// ─── Horizontal scroll row ────────────────────────────────────────────────────
const HScrollRow = ({ tests, onView, onBook }) => {
  const rowRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = dir => rowRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  const updateArrows = () => {
    const el = rowRef.current; if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };
  useEffect(() => {
    const el = rowRef.current;
    if (el) { el.addEventListener('scroll', updateArrows); updateArrows(); }
    return () => el?.removeEventListener('scroll', updateArrows);
  }, [tests]);

  const Arr = ({ dir, active }) => (
    <button onClick={() => scroll(dir)} disabled={!active} style={{
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      [dir === -1 ? 'left' : 'right']: '-16px', zIndex: 10,
      width: 32, height: 32, borderRadius: '50%',
      background: active ? 'white' : '#f3f4f6', border: '1.5px solid #e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: active ? 'pointer' : 'default',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
    }}>
      {dir === -1 ? <ChevronLeft size={14} color={active ? '#374151' : '#d1d5db'} />
                  : <ChevronRight size={14} color={active ? '#374151' : '#d1d5db'} />}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      <Arr dir={-1} active={canLeft} />
      <div ref={rowRef} style={{ display: 'flex', gap: '1rem', overflowX: 'auto', scrollbarWidth: 'none', padding: '0.5rem 0 1rem' }}>
        {tests.map(t => <TestCard key={t._id} test={t} onView={onView} onBook={onBook} layout="horizontal" />)}
      </div>
      <Arr dir={1} active={canRight} />
    </div>
  );
};

// ─── VIEW ALL — full-page layout (filters sidebar + grid) ─────────────────────
const ViewAllPage = ({ tests, title, onBack, onView, onBook }) => {
  const [sortBy, setSortBy] = useState('');
  const [checkedTests, setCheckedTests] = useState({});
  const [topDeals, setTopDeals] = useState(false);
  const [search, setSearch] = useState('');

  // Must-have test suggestions from actual data
  const mustHaveTests = tests.slice(0, 6).map(t => ({ id: t._id, label: t.title }));

  const toggleCheck = id => setCheckedTests(p => ({ ...p, [id]: !p[id] }));

  // Filter & sort
  let displayed = [...tests].filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  const checkedIds = Object.entries(checkedTests).filter(([,v]) => v).map(([k]) => k);
  if (checkedIds.length > 0) displayed = displayed.filter(t => checkedIds.includes(t._id));
  if (topDeals) displayed = displayed.filter(t => (t.originalPrice || getOriginalPrice(t.price)) - t.price > 200);
  if (sortBy === 'price_asc') displayed.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') displayed.sort((a, b) => b.price - a.price);
  if (sortBy === 'name') displayed.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .view-all-container { display: flex; gap: 1.25rem; align-items: flex-start; }
        .view-all-sidebar { width: 220px; flex-shrink: 0; background: white; border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 6px rgba(0,0,0,0.06); position: sticky; top: 80px; }
        @media (max-width: 800px) {
          .view-all-container { flex-direction: column; align-items: stretch; }
          .view-all-sidebar { width: 100%; position: static; box-sizing: border-box; }
        }
      `}</style>
      
      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontWeight: 600, fontSize: '0.875rem' }}>
          <ChevronLeft size={18} /> Back
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.1rem', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div className="view-all-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {/* ── Left Filters sidebar ── */}
        <aside className="view-all-sidebar">
          <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '1rem' }}>Filters</h3>

          {/* Type of Tests */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type of Tests</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#374151', marginBottom: 4 }}>
              <input type="checkbox" checked={topDeals} onChange={e => setTopDeals(e.target.checked)}
                style={{ accentColor: TEAL, width: 14, height: 14, cursor: 'pointer' }} />
              Top Deals
            </label>
          </div>

          <div style={{ height: 1, background: '#f3f4f6', marginBottom: '1rem' }} />

          {/* Must Have Tests */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Must Have Tests</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mustHaveTests.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: '#374151', lineHeight: 1.4 }}>
                  <input type="checkbox" checked={!!checkedTests[t.id]} onChange={() => toggleCheck(t.id)}
                    style={{ accentColor: TEAL, width: 14, height: 14, flexShrink: 0, marginTop: 2, cursor: 'pointer' }} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {(checkedIds.length > 0 || topDeals) && (
            <button onClick={() => { setCheckedTests({}); setTopDeals(false); }}
              style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', borderRadius: 8, border: `1.5px solid ${TEAL}`, background: 'none', color: TEAL, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── Right: results ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', margin: 0 }}>
              {title}
              <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', marginLeft: 6 }}>({displayed.length})</span>
            </h2>

            {/* Sort By */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.45rem 0.85rem', background: 'white', cursor: 'pointer' }}>
              <ArrowUpDown size={14} color="#6b7280" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.82rem', color: '#374151', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}>
                <option value="">Sort By</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
              <FlaskConical size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No tests match your filters. Try clearing some filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {displayed.map(t => (
                <TestCard key={t._id} test={t} onView={onView} onBook={onBook} layout="grid" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sticky Footer Callback Banner ────────────────────────────────────────────
const CallbackBanner = ({ onClose }) => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    const cleaned = phone.replace(/\s+/g, '').replace(/^(\+91|91)/, '');
    if (!/^\d{10}$/.test(cleaned)) {
      setMsg('Please enter a valid 10-digit phone number.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMsg('✅ Request submitted! Our advisor will call you shortly.');
        setPhone('');
      } else {
        setStatus('error');
        setMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMsg('Network error. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1a1a2e', color: 'white',
      padding: '0.85rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      flexWrap: 'wrap', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Phone icon */}
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Phone size={18} />
      </div>

      {/* Message */}
      <div style={{ flex: 1, fontSize: '0.875rem', minWidth: 160 }}>
        Need Assistance? Call{' '}
        <a href="tel:9318496221" style={{ color: '#4ade80', fontWeight: 800, textDecoration: 'none' }}>9318496221</a>
        {' '}or Request a Callback from our health advisor!
      </div>

      {/* Input row */}
      {status === 'success' ? (
        <div style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 600 }}>{msg}</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 8, overflow: 'hidden', border: status === 'error' ? '2px solid #f87171' : '2px solid transparent' }}>
            <span style={{ padding: '0.5rem 0.6rem', fontSize: '0.82rem', color: '#374151', fontWeight: 600, borderRight: '1px solid #e5e7eb' }}>+91</span>
            <input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={e => { setPhone(e.target.value); setStatus('idle'); setMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ border: 'none', outline: 'none', padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#111827', width: 160 }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={status === 'loading'}
            style={{
              background: status === 'loading' ? '#6b7280' : TEAL, color: 'white',
              border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
              fontSize: '0.82rem', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', transition: 'background 0.18s',
            }}
          >
            {status === 'loading' ? 'Sending...' : 'Request a CallBack'}
          </button>
          {msg && status === 'error' && (
            <div style={{ fontSize: '0.75rem', color: '#f87171', width: '100%' }}>{msg}</div>
          )}
        </div>
      )}

      {/* Close */}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, flexShrink: 0 }}>
        <X size={18} color="white" />
      </button>
    </div>
  );
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a, open, onToggle }) => (
  <div style={{ borderBottom: '1px solid #e5e7eb' }}>
    <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ fontWeight: 500, color: '#1f2937', fontSize: '0.9rem' }}>{q}</span>
      {open ? <ChevronUp size={17} color="#6b7280" /> : <ChevronDown size={17} color="#6b7280" />}
    </button>
    {open && <div style={{ paddingBottom: '1rem', color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.7 }}>{a}</div>}
  </div>
);

// ─── Main LabTests Component ──────────────────────────────────────────────────
const LabTests = ({ user }) => {
  const [view, setView] = useState('list');   // 'list' | 'details' | 'my-bookings' | 'view-all-top'
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetailTest, setSelectedDetailTest] = useState(null);
  const [bookingTest, setBookingTest] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/tests`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTests(data.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleViewDetails = async (testId) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/tests/${testId}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSelectedDetailTest({ ...data.data, suggestions: data.recommendations });
      setView('details');
      window.scrollTo(0, 0);
    } catch { alert('Failed to load details'); }
    finally { setLoading(false); }
  };

  const handleBookingSubmit = async (formData, test) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: test._id, patientDetails: formData, userId: user?.id || null }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Booking Confirmed!\nBooking ID: ${data.bookingId}`);
        setBookingTest(null); setView('my-bookings');
      } else alert(`Booking failed: ${data.message}`);
    } catch { alert('An error occurred. Please try again.'); }
  };

  const faqs = [
    { question: 'How often should you get a full body checkup?', answer: 'It is recommended to get a full body checkup once a year for adults over 18, and more frequently if you have existing health conditions.' },
    { question: 'How to get a free sample collection for a full body checkup?', answer: 'We offer free home sample collection for all full body checkup packages above ₹999.' },
    { question: 'How long will it take to get a test report for a full body checkup?', answer: 'Most reports are delivered within 24-48 hours via email and can be viewed on our portal.' },
    { question: 'What is the full body checkup cost?', answer: 'Our full body checkup packages start from ₹1499, offering a comprehensive range of 75+ tests.' },
    { question: 'Can specific conditions or medications affect full-body checkup results?', answer: 'Yes, certain medicines and conditions can affect results. Please inform the phlebotomist about any medications you are taking.' },
    { question: 'What information does a full body checkup provide about overall health?', answer: 'It provides a detailed overview of your vital organ functions including liver, kidney, heart, thyroid, and blood sugar levels.' },
    { question: 'Do you have to fast before a full body checkup?', answer: 'Yes, fasting for 8-10 hours is typically required for accurate results, especially for blood sugar and lipid profile tests.' },
    { question: 'Does a full body checkup include a urine test?', answer: 'Yes, a routine urine examination is included in most standard full body checkup packages.' },
  ];

  // Derived data
  const filteredTests = tests.filter(t => {
    const catMeta = CATEGORY_META.find(c => c.key === activeCategory);
    const matchCat = activeCategory === 'All' || t.category === activeCategory || (catMeta && t.category === catMeta.key);
    return matchCat && t.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const topBooked = [...tests].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

  // ── Render branches ───────────────────────────────────────────────────────
  if (view === 'details' && selectedDetailTest) return (
    <LabTestDetailsView test={selectedDetailTest} onBack={() => setView('list')} onBook={setBookingTest} onSuggestionClick={handleViewDetails} />
  );
  if (view === 'my-bookings') return <MyLabBookingsView user={user} onBack={() => setView('list')} />;

  if (view === 'view-all-top') return (
    <>
      <ViewAllPage
        tests={topBooked.length < 5 ? tests : tests}
        title="Top Booked Tests"
        onBack={() => setView('list')}
        onView={handleViewDetails}
        onBook={setBookingTest}
      />
      {showBanner && <CallbackBanner onClose={() => setShowBanner(false)} />}
      {bookingTest && <LabBookingModal test={bookingTest} user={user} onClose={() => setBookingTest(null)} onSubmit={handleBookingSubmit} />}
    </>
  );

  if (view === 'view-all-cat') return (
    <>
      <ViewAllPage
        tests={filteredTests.length > 0 ? filteredTests : tests}
        title={CATEGORY_META.find(c => c.key === activeCategory)?.label.replace('\n', ' ') || 'All Tests'}
        onBack={() => setView('list')}
        onView={handleViewDetails}
        onBook={setBookingTest}
      />
      {showBanner && <CallbackBanner onClose={() => setShowBanner(false)} />}
      {bookingTest && <LabBookingModal test={bookingTest} user={user} onClose={() => setBookingTest(null)} onSubmit={handleBookingSubmit} />}
    </>
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #e5e7eb', borderTop: `3px solid ${TEAL}`, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>Error: {error}</div>;

  // ── Main list view ────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: showBanner ? 80 : 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{display:none}`}</style>

      {/* Search + My Bookings bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Search for tests, health packages..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.1rem', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button onClick={() => setView('my-bookings')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: TEAL, color: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
          <Calendar size={15} /> My Bookings
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {/* ── Section 1: Doctor Created Health Checks ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', margin: 0 }}>
              Doctor Created Health Checks
              <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', marginLeft: 6 }}>({tests.length})</span>
            </h2>
            <button onClick={() => { setView('view-all-cat'); }}
              style={{ color: TEAL, fontWeight: 700, fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              View All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
            {/* All Tests tile */}
            <button onClick={() => setActiveCategory('All')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.5rem', borderRadius: 12, border: activeCategory === 'All' ? `2px solid ${TEAL}` : '1.5px solid #e5e7eb', background: activeCategory === 'All' ? '#E0F7FA' : 'white', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏥</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: activeCategory === 'All' ? TEAL : '#374151', textAlign: 'center' }}>All Tests</span>
            </button>
            {CATEGORY_META.map(cat => (
              <CategoryTile key={cat.key} cat={cat} active={activeCategory === cat.key} onClick={() => setActiveCategory(cat.key)} />
            ))}
          </div>
        </div>

        {/* ── Section 2: Top Booked Tests ── */}
        {!searchTerm && activeCategory === 'All' && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', margin: 0 }}>
                Top Booked Tests
                <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', marginLeft: 6 }}>({tests.length})</span>
              </h2>
              <button onClick={() => setView('view-all-top')}
                style={{ color: TEAL, fontWeight: 700, fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                View All
              </button>
            </div>
            <HScrollRow tests={topBooked} onView={handleViewDetails} onBook={setBookingTest} />
          </div>
        )}

        {/* ── Section 3: Category filter results ── */}
        {(searchTerm || activeCategory !== 'All') && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', margin: 0 }}>
                {activeCategory !== 'All' ? CATEGORY_META.find(c => c.key === activeCategory)?.label.replace('\n', ' ') || activeCategory : 'Search Results'}
                <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', marginLeft: 6 }}>({filteredTests.length})</span>
              </h2>
              {activeCategory !== 'All' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setView('view-all-cat')} style={{ color: TEAL, fontWeight: 700, fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                  <button onClick={() => setActiveCategory('All')} style={{ color: '#6b7280', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Clear</button>
                </div>
              )}
            </div>
            {filteredTests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <FlaskConical size={38} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p>No tests found.</p>
              </div>
            ) : (
              <HScrollRow tests={filteredTests} onView={handleViewDetails} onBook={setBookingTest} />
            )}
          </div>
        )}

        {/* ── Section 4: Trust strip ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['🏠','Free Home\nCollection'],['📋','Reports in\n24-48 hrs'],['🔬','NABL Certified\nLabs'],['💰','Affordable\nPricing'],['🔒','Secure &\nPrivate']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flexBasis: 100 }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151', textAlign: 'center', whiteSpace: 'pre-line' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: FAQ ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => <FAQItem key={i} q={f.question} a={f.answer} open={activeFaq === i} onToggle={() => setActiveFaq(activeFaq === i ? null : i)} />)}
        </div>

      </div>

      {/* Sticky footer callback banner */}
      {showBanner && <CallbackBanner onClose={() => setShowBanner(false)} />}

      {/* Booking Modal */}
      {bookingTest && <LabBookingModal test={bookingTest} user={user} onClose={() => setBookingTest(null)} onSubmit={handleBookingSubmit} />}
    </div>
  );
};

export default LabTests;
