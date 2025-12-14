import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Stethoscope, Search, ShoppingCart, User, MapPin, ChevronDown, Percent, LogOut, FileText, Heart, Wallet, Bell, Gift } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocationContext } from '../../modules/location/presentation/LocationContext';
import { useAuth } from '../../context/AuthContext';
import AuthSidebar from '../Auth/AuthSidebar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
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
    { name: t('symptoms'), href: '/symptoms', key: 'symptoms' },
    { name: 'Health Blog', href: '/blog', key: 'blog' },
    { name: t('about'), href: '/about', key: 'about' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 font-sans w-full">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 min-w-fit group">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2 rounded-xl shadow-soft-md group-hover:shadow-soft-lg transition-all duration-300">
            <Stethoscope size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 leading-none group-hover:text-primary transition-colors">Nabha</h1>
            <span className="text-xs text-primary-600 font-bold tracking-wider uppercase">Health Mart</span>
          </div>
        </Link>

        {/* Delivery Location - Desktop */}
        <div className="hidden md:flex flex-col relative min-w-[160px]">
          <div
            className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
            onClick={() => setIsPincodeOpen(!isPincodeOpen)}
          >
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate">Express delivery to</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
              <span className="truncate">{userLocation ? `${userLocation.pincode} ${userLocation.city ? `- ${userLocation.city}` : ''}` : "Select Pincode"}</span>
              <ChevronDown size={14} className="text-primary" />
            </div>
          </div>

          {isPincodeOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl rounded-lg p-4 border border-gray-100 z-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Choose Location</h3>
                <button onClick={() => setIsPincodeOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  maxLength={6}
                />
                <button
                  onClick={handlePincodeSubmit}
                  disabled={isLoading}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 disabled:bg-primary-300 transition-colors shadow-soft-sm"
                >
                  {isLoading ? '...' : 'Check'}
                </button>
              </div>
              {error && <p className="text-xs text-error-500 mb-2">{error}</p>}
              <button
                onClick={handleDetectLocation}
                disabled={isLoading}
                className="flex items-center gap-2 text-primary-600 text-sm font-medium w-full p-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <MapPin size={16} /> Detect my location
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative hidden md:block mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for doctors, hospitals, medicines..."
              className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 shadow-soft-sm bg-gray-50 focus:bg-white transition-all"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-white rounded-full w-10 flex items-center justify-center hover:bg-primary-600 transition-colors shadow-sm">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <Globe size={20} />
              <span className="hidden lg:block">
                {languages.find(lang => lang.code === currentLanguage)?.name}
              </span>
            </button>

            {isLanguageOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLanguageOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-40 bg-white shadow-xl rounded-lg py-2 border border-gray-100 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        changeLanguage(language.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${currentLanguage === language.code ? 'text-teal-600 font-medium' : 'text-gray-700'
                        }`}
                    >
                      <span>{language.flag}</span> {language.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <User size={20} />
                <span className="hidden sm:block">{user.name}</span>
                <ChevronDown size={14} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-soft-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>

                  <div className="py-2">
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <FileText size={16} />
                      <span>My Orders</span>
                    </Link>
                    <Link to="/saved" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <Heart size={16} />
                      <span>Save For Later</span>
                    </Link>
                    <Link to="/records" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <FileText size={16} />
                      <span>Medical Records</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/wallet" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <Wallet size={16} />
                      <span>Wallet</span>
                    </Link>
                    <Link to="/refer" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <Gift size={16} />
                      <span>Refer & Earn</span>
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <Bell size={16} />
                      <span>Notifications</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-50 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <User size={20} />
              <span className="hidden sm:block">Hello, Log in</span>
            </button>
          )}

          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors hidden sm:flex">
            <Percent size={20} />
            <span className="hidden lg:block">Offers</span>
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors relative group">
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">0</span>
            </div>
            <span className="hidden sm:block">Cart</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <div className="border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 overflow-x-auto py-3 text-sm font-medium text-gray-600 scrollbar-hide">
            {navigation.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`whitespace-nowrap transition-colors hover:text-primary px-2 py-1 rounded-lg ${location.pathname === item.href
                  ? 'text-primary font-bold bg-primary-50'
                  : ''
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 absolute w-full shadow-lg h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</h3>
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-2 px-2 rounded-lg transition-colors ${location.pathname === item.href
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
              <div className="flex items-center justify-between py-2 px-2">
                <span className="text-sm text-gray-700">Language</span>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`text-xs px-2 py-1 rounded border ${currentLanguage === lang.code
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'border-gray-200 text-gray-600'
                        }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Auth Sidebar */}
      <AuthSidebar isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}