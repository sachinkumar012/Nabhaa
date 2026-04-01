import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Stethoscope, Search, ShoppingCart, User, MapPin, ChevronDown, Percent, LogOut, FileText, Heart, Wallet, Bell, Gift, Phone, Clock, Award, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocationContext } from '../../modules/location/presentation/LocationContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { user, logout, setAuthModalOpen } = useAuth();
  const { location: userLocation, updatePincode, detectLocation, isLoading, error } = useLocationContext();
  const location = useLocation();

  const handlePincodeSubmit = async () => {
    if (pincodeInput.length === 6) {
      await updatePincode(pincodeInput);
      setIsPincodeOpen(false);
    }
  };

  const handleDetectLocation = async () => {
    await detectLocation();
    setIsPincodeOpen(false);
  };

  const navigation = [
    { name: t('home'), href: '/', key: 'home' },
    { name: t('doctors'), href: '/doctors', key: 'doctors' },
    { name: 'Hospitals', href: '/hospitals', key: 'hospitals' },
    { name: 'Health Records', href: '/records', key: 'records' },
    { name: t('pharmacy'), href: '/pharmacy', key: 'pharmacy' },
    { name: t('symptomsNav'), href: '/symptoms', key: 'symptoms' },
    { name: 'AI Analyzer', href: '/prescription-analysis', key: 'prescription-analysis' },
    { name: 'Health Blog', href: '/blog', key: 'blog' },
    { name: t('about'), href: '/about', key: 'about' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  const mainNav = [
    { name: 'HOME', href: '/' },
    { name: 'DOCTORS', href: '/doctors' },
    { name: 'HOSPITALS', href: '/hospitals' },
    { name: 'AI ANALYZER', href: '/prescription-analysis' },
    { name: 'HEALTH RECORDS', href: '/records' },
    { name: 'PHARMACY', href: '/pharmacy' },
    { name: 'SYMPTOM CHECKER', href: '/symptoms' },
    { name: 'HEALTH BLOG', href: '/blog' },
    { name: 'ABOUT', href: '/about' }
  ];

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 font-sans">
      {/* 1. TOP STRIP - TEAL */}
      <div className="bg-[#0F8B8D] text-white py-1.5 px-4 text-xs md:text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-medium tracking-wide">
              <Phone size={14} /> <span>HELPLINE : 9318496221</span>
            </div>
            <div className="hidden md:flex items-center gap-2 opacity-90">
              <Clock size={14} /> <span>OPD Timings : 10:00AM - 5:00PM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline opacity-80">View in :</span>
              <div className="flex gap-2.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`hover:text-blue-100 transition-colors ${currentLanguage === lang.code ? 'font-bold decoration-white underline underline-offset-2' : 'opacity-80'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Seamless User Auth Integration */}
            <div className="border-l border-white/30 pl-4 relative">
              {user ? (
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-1.5 font-medium hover:text-white transition-colors cursor-pointer">
                    <User size={14} /> <span className="hidden sm:inline">{user.name}</span> <ChevronDown size={14} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-[150%] right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-1 text-gray-800 z-50 overflow-hidden">
                      <Link to="/records" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"><FileText size={16} /> Medical Records</Link>
                      <Link to="/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"><ShoppingCart size={16} /> My Orders</Link>
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"><User size={16} /> My Profile</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Log Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setAuthModalOpen(true)} className="flex items-center gap-1.5 font-medium hover:text-white transition-colors">
                  <User size={14} /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BRAND STRIP */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">

          {/* Logo Assembly */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-gradient-to-br from-[#075985] to-[#1e3a8a] text-yellow-400 p-2 md:p-3 rounded-full shadow border-2 border-red-500">
              <Stethoscope size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-bold text-[#0284c7] leading-tight uppercase tracking-wide">
                Nabha <span className="text-[#0ea5e9]">Hospital</span>
              </h1>
              <span className="text-[9px] md:text-[11px] text-red-600 font-bold tracking-widest uppercase mt-0.5">
                & Lifeline Medical Institutions
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
              <input type="text" placeholder="Search..." className="w-full pl-3 pr-8 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-[#0F8B8D] text-sm bg-gray-50 focus:bg-white transition-colors" />
              <Search size={16} className="absolute right-2.5 top-2 text-gray-400" />
            </div>

            {/* Cart */}
            <Link to="/pharmacy" className="relative text-[#0284c7] hover:text-[#0F8B8D] transition-colors bg-blue-50 p-2 rounded-full">
              <ShoppingCart size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow">2</span>
            </Link>

            {/* Mobile Hamburger */}
            <button className="md:hidden text-[#0284c7] p-1 bg-blue-50 rounded" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM NAV STRIP - DESKTOP NAV */}
      <nav className="hidden md:flex bg-[#2573CA] border-y border-blue-500 text-white w-full h-[46px] items-stretch shadow-[0_4px_10px_rgba(0,0,0,0.05)] relative z-20">
        <div className="container mx-auto px-0 flex justify-between h-full">
          <div className="flex items-center h-full w-full">
            {mainNav.map((item, idx) => (
              <Link
                key={item.href + idx}
                to={item.href}
                className={`flex-1 flex items-center justify-center h-full px-1 lg:px-2 text-[10px] lg:text-[11px] xl:text-[12px] text-white hover:text-white font-semibold tracking-wider uppercase border-r border-blue-400/50 hover:bg-blue-600/50 transition-colors whitespace-nowrap overflow-hidden ${idx === 0 ? 'border-l' : ''} ${location.pathname === item.href ? 'bg-[#155fc2]' : ''}`}
              >
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center justify-center h-full bg-[#E51C23] hover:bg-[#D3181E] transition-colors text-white px-6 font-bold text-[12px] xl:text-[13px] tracking-wider leading-none uppercase shrink-0 border-l border-red-700"
          >
            FREE E-CONSULTATION
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER MENU - REPLICATING SCREENSHOT */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 md:hidden flex ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}></div>

        {/* Drawer Panel */}
        <div className="relative w-[85%] max-w-[360px] h-full bg-white shadow-2xl flex flex-col z-10">
          {/* Header / Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMenuOpen(false)} className="p-1 border border-primary/20 bg-primary-50 rounded text-primary hover:bg-primary/20"><X size={22} /></button>
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
              <button onClick={() => setAuthModalOpen(true)}><User size={20} className="text-gray-600" /></button>
              <button className="relative text-gray-600"><Percent size={20} /></button>
              <button className="relative text-gray-600"><ShoppingCart size={20} /><span className="absolute -top-1.5 -right-1.5 bg-teal-500 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">0</span></button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 pt-3 pb-2 border-b border-gray-50">
            <div className="relative">
              <input type="text" placeholder="Search..." className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#0F8B8D] text-sm bg-gray-50 focus:bg-white" />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Scrolling Menu Links */}
          <div className="flex-1 overflow-y-auto w-full pb-4 scrollbar-hide">
            <div className="px-5 py-3 pt-4 text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-1">MENU</div>
            <div className="flex flex-col px-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Doctors', href: '/doctors' },
                { name: 'Hospitals', href: '/hospitals' },
                { name: 'Health Records', href: '/records' },
                { name: 'Pharmacy', href: '/pharmacy' },
                { name: 'Symptom Checker', href: '/symptoms' },
                { name: 'AI Analyzer', href: '/prescription-analysis' },
                { name: 'Health Blog', href: '/blog' },
                { name: 'About', href: '/about' }
              ].map(item => (
                <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded text-[15px] font-medium transition-colors ${location.pathname === item.href ? 'text-teal-700 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mx-5 my-6 border-t border-gray-100"></div>

            {/* Settings Section */}
            <div className="px-5 text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-4">SETTINGS</div>
            <div className="px-5 flex items-center justify-between mb-8">
              <span className="text-[15px] text-gray-700 font-medium">Language</span>
              <div className="flex gap-1.5">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`px-2.5 py-1.5 text-[12px] rounded border transition-colors ${currentLanguage === lang.code ? 'border-teal-300 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="p-5 border-t border-gray-100 bg-white shrink-0">
            <button onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }} className="w-full bg-[#5A52E5] hover:bg-[#4a42c5] text-white py-3.5 rounded-full font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2 shadow-soft-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#5A52E5]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}