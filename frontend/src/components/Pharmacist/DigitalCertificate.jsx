import React, { useRef, useState } from 'react';
import { FiShield, FiX, FiDownload, FiCheckCircle, FiLoader } from 'react-icons/fi';
import html2canvas from 'html2canvas';

export default function DigitalCertificate({ pharmacist, onClose }) {
    const certRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const issuedDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = `NABHA-${(pharmacist?.licenseNumber || 'PHARM').slice(0, 6).toUpperCase()}-${Date.now().toString(36).slice(-5).toUpperCase()}`;

    const handleDownload = async () => {
        if (!certRef.current || downloading) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(certRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0f172a',
                logging: false,
                removeContainer: true,
                imageTimeout: 0,
            });
            const link = document.createElement('a');
            link.download = `Nabha_Certificate_${pharmacist?.name?.replace(/\s+/g, '_') || 'Pharmacist'}_${pharmacist?.licenseNumber || 'cert'}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
        } catch (err) {
            console.error('Certificate download failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
        {/* ── Backdrop ── */}
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-start overflow-y-auto py-6 px-4 sm:px-8"
            style={{ background: 'rgba(4, 6, 20, 0.92)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-3xl"
                style={{ animation: 'fadeScale 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Top Action Bar ── */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        <span className="text-white/60 text-sm font-bold tracking-wider">NABHA HEALTHCARE · DIGITAL CERTIFICATE</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <FiX size={17} />
                    </button>
                </div>

                {/* ══════════════════════════════════════════════════
                    CERTIFICATE CARD  (this is what gets downloaded)
                ══════════════════════════════════════════════════ */}
                <div
                    ref={certRef}
                    style={{
                        background: 'linear-gradient(145deg, #0d1117 0%, #161b35 35%, #0d0f1e 70%, #11172b 100%)',
                        borderRadius: '24px',
                        padding: '2px',
                        boxShadow: '0 0 80px rgba(99,102,241,0.2), 0 0 0 1px rgba(245,158,11,0.3)',
                        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                    }}
                >
                    {/* Inner content with golden border effect */}
                    <div style={{
                        background: 'linear-gradient(145deg, #0d1117 0%, #161b35 35%, #0d0f1e 70%, #11172b 100%)',
                        borderRadius: '22px',
                        border: '1px solid rgba(245,158,11,0.4)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}>
                        {/* Background decorations — solid colors for html2canvas compatibility */}
                        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: '40%', right: 0, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', pointerEvents: 'none' }} />

                        {/* Corner ornaments */}
                        {[
                            { top: 0, left: 0 },
                            { top: 0, right: 0, transform: 'rotate(90deg)' },
                            { bottom: 0, left: 0, transform: 'rotate(-90deg)' },
                            { bottom: 0, right: 0, transform: 'rotate(180deg)' },
                        ].map((pos, i) => (
                            <div key={i} style={{ position: 'absolute', ...pos, width: 48, height: 48, pointerEvents: 'none' }}>
                                <svg viewBox="0 0 48 48" fill="none">
                                    <path d="M2 2 L18 2 L2 18 Z" fill="rgba(245,158,11,0.5)" />
                                    <path d="M2 2 L10 2 L2 10 Z" fill="rgba(245,158,11,0.8)" />
                                </svg>
                            </div>
                        ))}

                        <div style={{ padding: '44px 48px', position: 'relative', zIndex: 1 }}>
                            {/* ── TOP HEADER ── */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                                {/* Logo */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16,
                                        background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
                                    }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="32" height="32">
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ color: '#ffffff', fontWeight: 900, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1 }}>NABHA</div>
                                        <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', marginTop: 4 }}>HEALTHCARE AUTHORITY</div>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
                                        borderRadius: 10, padding: '8px 14px', marginBottom: 4
                                    }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px rgba(52,211,153,0.8)' }} />
                                        <span style={{ color: '#34d399', fontWeight: 800, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Verified & Active</span>
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, textAlign: 'right', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Govt. Recognized</div>
                                </div>
                            </div>

                            {/* ── GOLD DIVIDER ── */}
                            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.3) 20%, #f59e0b 50%, rgba(245,158,11,0.3) 80%, transparent 100%)', marginBottom: 36 }} />

                            {/* ── TITLE SECTION ── */}
                            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                <div style={{ color: '#f59e0b', fontWeight: 900, fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', marginBottom: 12 }}>
                                    ✦ OFFICIAL DIGITAL CERTIFICATE ✦
                                </div>
                                <div style={{ color: '#ffffff', fontWeight: 900, fontSize: 34, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
                                    Certificate of Authorization
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 500 }}>
                                    Pharmacy Practice & Distribution License
                                </div>
                            </div>

                            {/* ── BODY TEXT ── */}
                            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.8, fontWeight: 400 }}>
                                    This certifies that the following licensed professional has been duly verified
                                    <br />and authorized to operate under the{' '}
                                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>Nabha Healthcare Network</span>
                                </div>
                            </div>

                            {/* ── HOLDER SECTION ── */}
                            <div style={{ textAlign: 'center', marginBottom: 36 }}>
                                {/* Avatar circle */}
                                <div style={{
                                    width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 32, fontWeight: 900, color: '#ffffff',
                                    boxShadow: '0 16px 40px rgba(99,102,241,0.4), 0 0 0 3px rgba(99,102,241,0.2)'
                                }}>
                                    {(pharmacist?.name || 'P').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ color: '#ffffff', fontWeight: 900, fontSize: 28, letterSpacing: '-0.01em', marginBottom: 6 }}>
                                    {pharmacist?.name || 'Pharmacist Name'}
                                </div>
                                <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em' }}>
                                    {pharmacist?.pharmacyName || 'Pharmacy Name'}
                                </div>
                            </div>

                            {/* ── DETAILS GRID ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 36 }}>
                                {[
                                    { label: 'License No.', value: pharmacist?.licenseNumber || 'N/A', amber: true },
                                    { label: 'Issue Date', value: issuedDate },
                                    { label: 'Valid Until', value: expiryDate },
                                    { label: 'Status', value: '✓ Approved', green: true },
                                    { label: 'Authority', value: 'Nabha Healthcare' },
                                    { label: 'Category', value: 'Licensed Pharmacist' },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 14, padding: '14px 12px', textAlign: 'center'
                                    }}>
                                        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 8, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 6 }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontWeight: 800, fontSize: item.amber ? 10 : 12,
                                            letterSpacing: item.amber ? '0.15em' : 'normal',
                                            color: item.amber ? '#f59e0b' : item.green ? '#34d399' : '#ffffff',
                                            textTransform: item.amber ? 'uppercase' : 'none'
                                        }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── BOTTOM DIVIDER ── */}
                            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.3) 20%, #f59e0b 50%, rgba(245,158,11,0.3) 80%, transparent 100%)', marginBottom: 28 }} />

                            {/* ── FOOTER ROW ── */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* Cert ID */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: 'rgba(99,102,241,0.15)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" width="18" height="18">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 3 }}>Certificate ID</div>
                                        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{certId}</div>
                                    </div>
                                </div>

                                {/* Signature */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 3 }}>Digitally Signed By</div>
                                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 12 }}>Nabha Healthcare Authority</div>
                                    <div style={{ color: '#34d399', fontSize: 10, fontWeight: 700, marginTop: 2 }}>✓ Verified Signature</div>
                                </div>
                            </div>

                            {/* ── RAINBOW SECURITY STRIP ── */}
                            <div style={{ marginTop: 28, height: 5, borderRadius: 99, display: 'flex', overflow: 'hidden' }}>
                                {['#6366f1','#8b5cf6','#a78bfa','#f59e0b','#fbbf24','#10b981','#34d399','#3b82f6','#60a5fa','#f59e0b','#8b5cf6','#6366f1'].map((c, i) => (
                                    <div key={i} style={{ background: c, flex: 1 }} />
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 8, fontFamily: 'monospace', marginTop: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                                Secure Digital Document · Nabha Healthcare Authority · nabha.health · {new Date().getFullYear()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    DOWNLOAD BUTTON  (outside certRef so it won't appear in PNG)
                ══════════════════════════════════════════════════ */}
                <div className="mt-5 flex items-center justify-center gap-4">
                    {/* Main Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="relative group overflow-hidden flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{
                            background: downloaded
                                ? 'linear-gradient(135deg, #059669, #10b981)'
                                : 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)',
                            boxShadow: downloaded
                                ? '0 8px 32px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.3)'
                                : '0 8px 32px rgba(245,158,11,0.45), 0 0 0 1px rgba(245,158,11,0.3)',
                            color: '#0f172a',
                            transform: downloading ? 'scale(0.97)' : 'scale(1)',
                        }}
                    >
                        {/* Shine sweep */}
                        <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                        {downloading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                                    <path d="M12 2 A10 10 0 0 1 22 12" />
                                </svg>
                                <span>Generating...</span>
                            </>
                        ) : downloaded ? (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                <span style={{ color: '#ffffff' }}>Downloaded!</span>
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>Download Certificate</span>
                            </>
                        )}
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all tracking-wider uppercase"
                    >
                        <FiX size={15} /> Close
                    </button>
                </div>

                <p className="text-center text-white/20 text-xs mt-4 font-medium">
                    Downloads as a high-quality PNG image (3× resolution)
                </p>
            </div>
        </div>

        <style>{`
            @keyframes fadeScale {
                from { opacity: 0; transform: scale(0.88) translateY(24px); }
                to   { opacity: 1; transform: scale(1)   translateY(0);    }
            }
        `}</style>
        </>
    );
}
