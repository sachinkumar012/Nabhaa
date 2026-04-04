import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiPlus, 
    FiEdit2, 
    FiTrash2, 
    FiSearch, 
    FiActivity, 
    FiClock,
    FiFilter,
    FiX,
    FiCheckCircle,
    FiChevronRight,
    FiDroplet,
    FiCalendar
} from 'react-icons/fi';
import PharmacistSidebar from '../../components/Pharmacist/PharmacistSidebar';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistLabTests() {
    const { pharmacistToken } = useAuth();
    const [activeTab, setActiveTab] = useState('management'); // 'management' or 'bookings'
    const [bookings, setBookings] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTest, setCurrentTest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        category: 'Health Packages',
        price: '',
        originalPrice: '',
        description: '',
        reportsWithin: '24-48 hours',
        sampleType: 'Blood',
        fastingRequired: false,
        recommendedFor: 'All'
    });

    useEffect(() => {
        if (pharmacistToken) {
            if (activeTab === 'management') {
                fetchLabTests();
            } else {
                fetchBookings();
            }
        }
    }, [pharmacistToken, activeTab]);

    const fetchBookings = async () => {
        setBookingLoading(true);
        try {
            const response = await axios.get('/api/lab-tests/pharmacist/bookings', {
                headers: { Authorization: `Bearer ${pharmacistToken}` }
            });
            setBookings(response.data.data);
        } catch (err) {
            console.error("Failed to fetch lab bookings", err);
        } finally {
            setBookingLoading(false);
        }
    };

    const fetchLabTests = async () => {
        try {
            // Lab tests might be shared or pharmacist-specific depending on business model
            const response = await axios.get('/api/lab-tests/tests', {
                headers: { Authorization: `Bearer ${pharmacistToken}` }
            });
            setLabTests(response.data.data);
        } catch (err) {
            console.error("Failed to fetch lab tests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (test = null) => {
        if (test) {
            setCurrentTest(test);
            setFormData({
                title: test.title,
                category: test.category,
                price: test.price,
                originalPrice: test.originalPrice,
                description: test.description,
                reportsWithin: test.reportsWithin,
                sampleType: test.sampleType || 'Blood',
                fastingRequired: test.fastingRequired,
                recommendedFor: test.recommendedFor || 'All'
            });
        } else {
            setCurrentTest(null);
            setFormData({
                title: '',
                category: 'Health Packages',
                price: '',
                originalPrice: '',
                description: '',
                reportsWithin: '24-48 hours',
                sampleType: 'Blood',
                fastingRequired: false,
                recommendedFor: 'All'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Placeholder for real API endpoint
            // await axios.post('/api/lab-tests/tests', formData);
            fetchLabTests();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save lab test", err);
        }
    };

    const filteredTests = labTests.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <PharmacistSidebar />
            
            <main className="flex-grow p-8 lg:p-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Lab Test Management</h1>
                        <p className="text-slate-500 font-medium">Manage diagnostic tests, pricing, and patient bookings.</p>
                    </div>
                    {activeTab === 'management' && (
                        <button 
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm"
                        >
                            <FiPlus /> Add New Lab Test
                        </button>
                    )}
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit">
                    <button 
                        onClick={() => setActiveTab('management')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'management' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Management
                    </button>
                    <button 
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Recent Bookings
                        {bookings.length > 0 && <span className="ml-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">{bookings.length}</span>}
                    </button>
                </div>

                {/* Conditional View */}
                {activeTab === 'management' ? (
                    <>
                        {/* Search */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex gap-4">
                            <div className="relative flex-grow">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by test title..." 
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Lab Test Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full text-center py-20 text-slate-400 font-medium">Loading tests...</div>
                            ) : filteredTests.length > 0 ? (
                                filteredTests.map((test) => (
                                    <div key={test._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                    <FiActivity size={28} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => handleOpenModal(test)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{test.category}</span>
                                            <h3 className="text-xl font-bold text-slate-800 mt-4 mb-2">{test.title}</h3>
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">{test.description}</p>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                    <FiClock className="text-indigo-600" />
                                                    <span>{test.reportsWithin}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                    <FiDroplet className="text-red-500" />
                                                    <span>{test.sampleType || 'Blood'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-300 line-through">₹{test.originalPrice}</span>
                                                    <span className="text-2xl font-black text-slate-800">₹{test.price}</span>
                                                </div>
                                                <button className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all">
                                                    View Logs
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No lab tests found</h3>
                                    <p className="text-slate-500 mb-6">Create your first diagnostic test to offer it to patients.</p>
                                    <button 
                                        onClick={() => handleOpenModal()}
                                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-bold text-sm"
                                    >
                                        <FiPlus className="inline mr-2" /> Create First Test
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {bookingLoading ? (
                            <div className="text-center py-20 text-slate-400 font-medium">Loading bookings...</div>
                        ) : bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <div key={booking._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                            <FiCalendar size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800">{booking.patientDetails?.name}</h3>
                                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">{booking.status}</span>
                                            </div>
                                            <p className="text-slate-400 text-xs font-medium">Booked for {booking.test?.title}</p>
                                            <p className="text-slate-400 text-[10px] font-bold mt-1">ID: #{booking._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-4 py-3 bg-slate-50/50 rounded-2xl border border-slate-50 flex-grow max-w-2xl mx-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Contact</span>
                                            <span className="text-xs font-bold text-slate-600">{booking.patientDetails?.phone}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Age/Gender</span>
                                            <span className="text-xs font-bold text-slate-600">{booking.patientDetails?.age}y / {booking.patientDetails?.gender}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Price</span>
                                            <span className="text-xs font-black text-indigo-600">₹{booking.test?.price}</span>
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Address</span>
                                            <span className="text-xs font-medium text-slate-500 line-clamp-1">{booking.patientDetails?.address}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button className="p-2.5 bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-800/10 hover:bg-slate-700 transition-all">
                                            <FiCheckCircle size={18} />
                                        </button>
                                        <button className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 transition-all">
                                            <FiChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiCalendar className="text-slate-200" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No bookings yet</h3>
                                <p className="text-slate-500">When patients book lab tests with you, they will appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Lab Test Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {currentTest ? 'Edit Lab Test' : 'Add New Lab Test'}
                                </h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Test Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Complete Blood Count (CBC)"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Category</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option>Health Packages</option>
                                            <option>Diabetes</option>
                                            <option>Hormonal</option>
                                            <option>Vitamins</option>
                                            <option>Heart</option>
                                            <option>Kidney</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Sample Type</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Blood, Urine"
                                            value={formData.sampleType}
                                            onChange={(e) => setFormData({...formData, sampleType: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Original Price (₹)</label>
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="999"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Selling Price (₹)</label>
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="499"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Reports Timing</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. 24 hours"
                                            value={formData.reportsWithin}
                                            onChange={(e) => setFormData({...formData, reportsWithin: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6 px-1">
                                        <input 
                                            type="checkbox" 
                                            id="fasting"
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            checked={formData.fastingRequired}
                                            onChange={(e) => setFormData({...formData, fastingRequired: e.target.checked})}
                                        />
                                        <label htmlFor="fasting" className="text-sm font-bold text-slate-600 cursor-pointer">
                                            Fasting Required
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description</label>
                                    <textarea 
                                        rows="3"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium resize-none"
                                        placeholder="Add test details, why it's needed, etc..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit"
                                    className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                >
                                    <FiCheckCircle /> {currentTest ? 'Update Lab Test' : 'Create Lab Test'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
