import React, { useState } from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronDown, Percent, FileText, Stethoscope, Activity, Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const PharmacyHeader = ({
    user,
    cartCount,
    onLoginClick,
    onCartClick,
    location = '',
    onLocationUpdate
}) => {
    const [pincode, setPincode] = useState(location);
    const [isPincodeOpen, setIsPincodeOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handlePincodeSubmit = (e) => {
        e.preventDefault();
        if (onLocationUpdate) onLocationUpdate(pincode);
        setIsPincodeOpen(false);
    };

    return (
        <div className="bg-white shadow-sm sticky top-0 z-50 font-sans w-full">
            {/* Top Bar */}
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

                {/* Mobile Menu Button */}
                <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <Menu size={24} className="text-gray-700" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="bg-teal-500 text-white p-1.5 rounded-lg">
                        <Stethoscope size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-teal-700 leading-none">Nabha</h1>
                        <span className="text-xs text-gray-500 font-medium tracking-wider">Health Mart</span>
                    </div>
                </div>

                {/* Delivery Location - Desktop */}
                <div className="hidden md:flex flex-col relative min-w-[180px]">
                    <div
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                        onClick={() => setIsPincodeOpen(!isPincodeOpen)}
                    >
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="truncate">Express delivery to</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                            <span className="truncate">{pincode || "Select Pincode"}</span>
                            <ChevronDown size={14} className="text-teal-500" />
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
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                />
                                <button
                                    onClick={handlePincodeSubmit}
                                    className="bg-teal-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-teal-600"
                                >
                                    Check
                                </button>
                            </div>
                            <button className="flex items-center gap-2 text-teal-600 text-sm font-medium w-full p-2 hover:bg-teal-50 rounded transition-colors">
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
                            placeholder="Search for medicines, health products..."
                            className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm bg-gray-50 transition-all"
                        />
                        <button className="absolute right-1 top-1 bottom-1 bg-teal-500 text-white rounded-full w-10 flex items-center justify-center hover:bg-teal-600 transition-colors">
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                    {user ? (
                        <div className="flex items-center gap-2 cursor-pointer group">
                            <div className="bg-gray-100 p-2 rounded-full group-hover:bg-teal-50 transition-colors">
                                <User size={20} className="text-gray-600 group-hover:text-teal-600" />
                            </div>
                            <span className="text-sm font-medium hidden sm:block text-gray-700 group-hover:text-teal-600">
                                {user.name.split(' ')[0]}
                            </span>
                        </div>
                    ) : (
                        <button onClick={onLoginClick} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                            <User size={20} />
                            <span className="hidden sm:block">Hello, Log in</span>
                        </button>
                    )}

                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors hidden sm:flex">
                        <Percent size={20} />
                        <span>Offers</span>
                    </button>

                    <button onClick={onCartClick} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors relative">
                        <ShoppingCart size={20} />
                        <span className="hidden sm:block">Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="border-t border-gray-100 hidden md:block">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-8 overflow-x-auto py-3 text-sm font-medium text-gray-600 scrollbar-hide">
                        <Link to="/pharmacy" className="text-teal-600 whitespace-nowrap border-b-2 border-teal-600 pb-3 -mb-3">Medicine</Link>
                        <Link to="/healthcare" className="hover:text-teal-600 whitespace-nowrap flex items-center gap-1 transition-colors">
                            Healthcare <ChevronDown size={14} />
                        </Link>
                        <Link to="/doctors" className="hover:text-teal-600 whitespace-nowrap transition-colors">Doctor Consult</Link>
                        <Link to="/lab-tests" className="hover:text-teal-600 whitespace-nowrap transition-colors">Lab Tests</Link>
                        <Link to="/plus" className="hover:text-teal-600 whitespace-nowrap bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">PLUS</Link>
                        <Link to="/health-insights" className="hover:text-teal-600 whitespace-nowrap transition-colors">Health Insights</Link>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white p-4 absolute w-full shadow-lg">
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search medicines..."
                                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <nav className="flex flex-col gap-3 text-sm font-medium text-gray-600">
                            <Link to="/pharmacy" className="text-teal-600">Medicine</Link>
                            <Link to="/healthcare">Healthcare</Link>
                            <Link to="/doctors">Doctor Consult</Link>
                            <Link to="/lab-tests">Lab Tests</Link>
                            <Link to="/plus">PLUS</Link>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyHeader;
