import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Stethoscope, Search, ShoppingCart, User, ChevronDown, ChevronRight, LogOut, FileText, Phone, Clock, Award, ShieldCheck, Package, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocationContext } from '../../modules/location/presentation/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ConsultationModal from '../UI/ConsultationModal';
import NotificationBell from '../UI/NotificationBell';

/* ── Pharmacy dropdown sub-routes ─────────────────────────────────────────── */


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPharmacyDropdownOpen, setIsPharmacyDropdownOpen] = useState(false);
  const [isMobilePharmacyOpen, setIsMobilePharmacyOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const pharmacyRef = useRef(null);
  const userMenuRef = useRef(null);

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const changeLanguage = (lng) => i18n.changeLanguage(lng);
  const { user, logout, setAuthModalOpen } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const PHARMACY_DROPDOWN = [
    { name: t('nav.pharmacy'), href: '/pharmacy', icon: '💊' },
    { name: t('nav.labTests'), href: '/lab-tests', icon: '🧪' },
    { name: t('nav.abha'), href: '/abha', icon: '🆔' },
    { name: t('nav.insurance'), href: '/insurance', icon: '🛡' },
  ];
  const PHARMACY_PATHS = PHARMACY_DROPDOWN.map(d => d.href);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  /* ── Desktop nav items (Pharmacy handled separately) ────────────────────── */
  const mainNav = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.doctors'), href: '/doctors' },
    { name: t('nav.hospitals'), href: '/hospitals' },
    { name: t('nav.aiAnalyzer'), href: '/prescription-analysis' },
    { name: t('nav.pharmacy'), href: null, isDropdown: true },
    { name: t('nav.symptomsNav'), href: '/symptoms' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.about'), href: '/about' },
  ];

  /* ── Mobile nav (Pharmacy is accordion) ─────────────────────────────────── */
  const mobileNav = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.doctors'), href: '/doctors' },
    { name: t('nav.hospitals'), href: '/hospitals' },
    { name: t('nav.aiAnalyzer'), href: '/prescription-analysis' },
    { name: t('nav.pharmacy'), href: null, isDropdown: true },
    { name: t('nav.symptomsNav'), href: '/symptoms' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.about'), href: '/about' },
  ];

  /* ── Helper: is a pharmacy sub-route active? ────────────────────────────── */
  const isPharmacyActive = PHARMACY_PATHS.some(p => location.pathname === p);

  /* ── Helper: is a specific path active? ─────────────────────────────────── */
  const isActive = (href) => {
    if (!href) return false;
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  /* ── Profile avatar: first letter ───────────────────────────────────────── */
  const avatarLetter = user
    ? (user.name || user.email || 'U').charAt(0).toUpperCase()
    : '';

  /* ── Close dropdowns on outside click ───────────────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pharmacyRef.current && !pharmacyRef.current.contains(e.target)) {
        setIsPharmacyDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── Close dropdowns on navigation ──────────────────────────────────────── */
  useEffect(() => {
    setIsPharmacyDropdownOpen(false);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 font-sans">

      {/* ═══════════════════════════════════════════════════════════════════
          1. TOP STRIP - TEAL
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0F8B8D] text-white py-1.5 px-4 text-xs md:text-sm">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 font-medium tracking-wide">
              <Phone size={14} className="shrink-0" /> <span>{t('header.helpline')}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 opacity-90">
              <Clock size={14} className="shrink-0" /> <span>{t('header.opdTimings')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline opacity-80">{t('header.viewIn')}</span>
              <div className="flex gap-2 sm:gap-2.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`hover:text-blue-100 transition-colors text-[10px] sm:text-xs md:text-sm ${currentLanguage === lang.code ? 'font-bold decoration-white underline underline-offset-2' : 'opacity-80'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Profile / Login ─────────────────────────────────────── */}
            <div className="flex items-center relative" ref={userMenuRef}>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 font-medium hover:text-white transition-colors cursor-pointer"
                    id="profile-avatar-btn"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs font-bold text-white">
                      {avatarLetter}
                    </div>
                    <span className="hidden sm:inline text-sm">{user.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* ── Profile dropdown (Logged In) ────────────────────────── */}
                  <div className={`absolute top-[150%] right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 text-gray-800 z-50 overflow-hidden transition-all duration-200 origin-top-right ${isUserMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0284c7] to-[#1e3a8a] flex items-center justify-center text-white text-lg font-bold shadow-sm">
                          {avatarLetter}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link to="/records" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                        <FileText size={16} className="text-gray-400" /> {t('header.medicalRecords')}
                      </Link>
                      <Link to="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                        <Package size={16} className="text-gray-400" /> {t('header.myOrders')}
                      </Link>
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                        <User size={16} className="text-gray-400" /> {t('header.myProfile')}
                      </Link>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> {t('header.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 font-medium hover:text-white transition-colors cursor-pointer bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 shadow-sm"
                  >
                    <User size={14} />
                    <span className="text-sm">{t('nav.login')}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* ── Login / Portal Dropdown (Not Logged In) ────────────────────────── */}
                  <div className={`absolute top-[150%] right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 text-gray-800 z-50 overflow-hidden transition-all duration-200 origin-top-right ${isUserMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('header.selectPortal')}</h3>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setAuthModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{t('header.patientLogin')}</span>
                          <span className="text-[10px] text-gray-500">{t('header.patientLoginDesc')}</span>
                        </div>
                      </button>

                      <div className="h-[1px] bg-gray-100 my-1"></div>

                      <Link
                        to="/pharmacist/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                          <Briefcase size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{t('header.partnerLogin')}</span>
                          <span className="text-[10px] text-gray-500">{t('header.partnerLoginDesc')}</span>
                        </div>
                      </Link>

                      <Link
                        to="/doctor/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Stethoscope size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{t('header.doctorLogin')}</span>
                          <span className="text-[10px] text-gray-500">{t('header.doctorLoginDesc')}</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{t('header.adminPortal')}</span>
                          <span className="text-[10px] text-gray-500">{t('header.adminPortalDesc')}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. MIDDLE BRAND STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">

          {/* Logo Assembly */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="bg-gradient-to-br from-[#075985] to-[#1e3a8a] text-yellow-400 p-1.5 md:p-3 rounded-full shadow border-2 border-red-500">
              <Stethoscope size={22} className="md:w-8 md:h-8" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#0284c7] leading-tight uppercase tracking-wide">
                {t('header.hospitalTitle')}
              </h1>
              <span className="text-[7px] md:text-[11px] text-red-600 font-bold tracking-widest uppercase mt-0 md:mt-0.5">
                {t('header.hospitalSubtitle')}
              </span>
            </div>
          </Link>

          {/* Right Section: Badges & Utilities */}
          <div className="flex items-center gap-3 md:gap-6 ml-auto">

            {/* Hospital Certifications (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-[52px] h-[52px] rounded-full border-[3px] border-red-500 bg-white flex items-center justify-center p-0.5 relative shadow-sm">
                  <div className="w-full h-full rounded-full border border-blue-600 flex flex-col items-center justify-center bg-blue-50/50">
                    <Award size={16} className="text-blue-700" />
                    <span className="text-[5px] font-black text-red-600 leading-none">NABH</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[52px] h-[52px] rounded-full border-[3px] border-green-500 bg-white flex items-center justify-center p-0.5 relative shadow-sm">
                  <div className="w-full h-full rounded-full border border-blue-600 flex flex-col items-center justify-center bg-blue-50/50">
                    <ShieldCheck size={16} className="text-blue-700" />
                    <span className="text-[5px] font-black text-green-700 leading-none">NABH</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border border-blue-200 bg-white shadow-sm flex flex-col items-center justify-center p-1 relative rounded-sm">
                  <span className="text-[10px] font-black text-[#0284c7] leading-none mb-0.5">QCI</span>
                  <div className="h-[2px] w-full bg-red-600 rounded"></div>
                  <span className="text-[4px] text-gray-500 font-semibold text-center mt-1 leading-[1.2]">NATIONAL<br />QUALITY AWARD</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex relative w-48 lg:w-64">
              <input type="text" placeholder={t('header.searchPlaceholder')} className="w-full pl-3 pr-8 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-[#0F8B8D] text-sm bg-gray-50 focus:bg-white transition-colors" />
              <Search size={16} className="absolute right-2.5 top-2 text-gray-400" />
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative text-[#0284c7] hover:text-[#0F8B8D] transition-colors bg-blue-50 p-2 rounded-full" id="header-cart-btn">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell (logged-in customers) */}
            {user && <NotificationBell />}

            {/* Mobile Hamburger */}
            <button className="md:hidden text-[#0284c7] p-1 bg-blue-50 rounded" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3. BOTTOM NAV STRIP - DESKTOP (with Pharmacy dropdown)
      ═══════════════════════════════════════════════════════════════════ */}
      <nav className="hidden md:flex bg-[#2573CA] border-y border-blue-500 text-white w-full h-[46px] items-stretch shadow-[0_4px_10px_rgba(0,0,0,0.05)] relative z-20">
        <div className="container mx-auto px-0 flex justify-between h-full">
          <div className="flex items-center h-full w-full">
            {mainNav.map((item, idx) => {
              /* ── Pharmacy dropdown item ─────────────────────────── */
              if (item.isDropdown) {
                return (
                  <div
                    key="pharmacy-dropdown"
                    ref={pharmacyRef}
                    className="relative flex-1 h-full"
                    onMouseEnter={() => setIsPharmacyDropdownOpen(true)}
                    onMouseLeave={() => setIsPharmacyDropdownOpen(false)}
                  >
                    <button
                      onClick={() => setIsPharmacyDropdownOpen(!isPharmacyDropdownOpen)}
                      className={`w-full flex items-center justify-center gap-1 h-full px-1 lg:px-2 text-[10px] lg:text-[11px] xl:text-[12px] text-white hover:text-white font-semibold tracking-wider uppercase border-r border-blue-400/50 hover:bg-blue-600/50 transition-colors whitespace-nowrap overflow-hidden ${isPharmacyActive ? 'bg-[#155fc2]' : ''}`}
                      id="pharmacy-dropdown-trigger"
                    >
                      <span className="truncate">{item.name}</span>
                      <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isPharmacyDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* ── Dropdown panel ───────────────────────────── */}
                    <div
                      className={`absolute top-full left-0 w-56 bg-white rounded-b-xl shadow-2xl border border-gray-100 border-t-0 text-gray-800 z-50 overflow-hidden transition-all duration-200 origin-top ${isPharmacyDropdownOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}
                    >
                      {PHARMACY_DROPDOWN.map((sub) => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          onClick={() => setIsPharmacyDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors group ${
                            location.pathname === sub.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{sub.icon}</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">{sub.name}</span>
                          {location.pathname === sub.href && (
                            <ChevronRight size={14} className="ml-auto text-blue-400" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              /* ── Normal nav item ────────────────────────────────── */
              return (
                <Link
                  key={item.href + idx}
                  to={item.href}
                  className={`flex-1 flex items-center justify-center h-full px-1 lg:px-2 text-[10px] lg:text-[11px] xl:text-[12px] text-white hover:text-white font-semibold tracking-wider uppercase border-r border-blue-400/50 hover:bg-blue-600/50 transition-colors whitespace-nowrap overflow-hidden ${idx === 0 ? 'border-l' : ''} ${isActive(item.href) ? 'bg-[#155fc2]' : ''}`}
                >
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsConsultationModalOpen(true)}
            className="flex items-center justify-center h-full bg-[#E51C23] hover:bg-[#D3181E] transition-colors text-white px-6 font-bold text-[12px] xl:text-[13px] tracking-wider leading-none uppercase shrink-0 border-l border-red-700"
          >
            {t('header.freeConsultation')}
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          4. MOBILE DRAWER MENU
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 md:hidden flex ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}></div>

        {/* Drawer Panel */}
        <div className="relative w-[85%] max-w-[360px] h-full bg-white shadow-2xl flex flex-col z-10">
          {/* Header / Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMenuOpen(false)} className="p-1 border border-gray-200 bg-gray-50 rounded text-gray-600 hover:bg-gray-100">
                <X size={22} />
              </button>
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <div className="bg-[#1D70B8] text-white p-1.5 rounded-full">
                  <Stethoscope size={20} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-bold text-gray-900 leading-[1] text-base tracking-wide">Nabha</span>
                  <span className="text-[9px] text-[#0F8B8D] font-bold uppercase tracking-widest mt-0.5">HEALTH MART</span>
                </div>
              </Link>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-3">
              <button onClick={() => changeLanguage(currentLanguage === 'en' ? 'hi' : 'en')}><Globe size={20} className="text-gray-600" /></button>
              {user ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0284c7] to-[#1e3a8a] flex items-center justify-center text-white text-sm font-bold">
                  {avatarLetter}
                </div>
              ) : (
                <button onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }}><User size={20} className="text-gray-600" /></button>
              )}
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="relative text-gray-600">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-teal-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount > 99 ? '99+' : cartCount}</span>
                )}
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 pt-3 pb-2 border-b border-gray-50">
            <div className="relative">
              <input type="text" placeholder={t('header.searchPlaceholder')} className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B8D] text-sm bg-gray-50 focus:bg-white" />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Scrolling Menu Links */}
          <div className="flex-1 overflow-y-auto w-full pb-4 scrollbar-hide">
            {/* Profile section if logged in */}
            {user && (
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0284c7] to-[#1e3a8a] flex items-center justify-center text-white text-xl font-bold shadow">
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
                    {t('header.myOrders')}
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors">
                    {t('header.myProfile')}
                  </Link>
                </div>
              </div>
            )}

            <div className="px-5 py-3 pt-4 text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-1">{t('header.menu')}</div>
            <div className="flex flex-col px-3">
              {mobileNav.map((item) => {
                /* ── Pharmacy accordion ─────────────────────────── */
                if (item.isDropdown) {
                  return (
                    <div key="pharmacy-accordion">
                      <button
                        onClick={() => setIsMobilePharmacyOpen(!isMobilePharmacyOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded text-[15px] font-medium transition-colors ${isPharmacyActive ? 'text-teal-700 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>{t('nav.pharmacy')}</span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isMobilePharmacyOpen ? 'rotate-180' : ''} ${isPharmacyActive ? 'text-teal-600' : 'text-gray-400'}`} />
                      </button>

                      {/* Accordion content */}
                      <div className={`overflow-hidden transition-all duration-300 ${isMobilePharmacyOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-4 pr-2 pb-1 space-y-0.5">
                          {PHARMACY_DROPDOWN.map((sub) => (
                            <Link
                              key={sub.href}
                              to={sub.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                                location.pathname === sub.href
                                  ? 'text-teal-700 bg-teal-50/70'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span>{sub.icon}</span>
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                /* ── Normal mobile nav item ────────────────────── */
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded text-[15px] font-medium transition-colors ${isActive(item.href) ? 'text-teal-700 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="mx-5 my-6 border-t border-gray-100"></div>

            {/* Settings Section */}
            <div className="px-5 text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-4">{t('header.settings')}</div>
            <div className="px-5 flex items-center justify-between mb-4">
              <span className="text-[15px] text-gray-700 font-medium">{t('header.language')}</span>
              <div className="flex gap-1.5">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`px-2.5 py-1.5 text-[12px] rounded border transition-colors ${currentLanguage === lang.code ? 'border-teal-300 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout button if logged in */}
            {user && (
              <div className="px-5 mb-4">
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut size={16} /> {t('header.logout')}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-5 border-t border-gray-100 bg-white shrink-0">
            <button onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }} className="w-full bg-[#5A52E5] hover:bg-[#4a42c5] text-white py-3.5 rounded-full font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2 shadow-soft-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#5A52E5]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              {t('header.bookAppointment')}
            </button>
          </div>
        </div>
      </div>
      <ConsultationModal isOpen={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} />
    </header>
  );
}