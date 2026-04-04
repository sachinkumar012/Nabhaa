import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiPlus, 
    FiEdit2, 
    FiTrash2, 
    FiSearch, 
    FiPackage, 
    FiAlertCircle,
    FiFilter,
    FiUploadCloud,
    FiX,
    FiCheckCircle,
    FiChevronRight
} from 'react-icons/fi';
import PharmacistSidebar from '../../components/Pharmacist/PharmacistSidebar';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistMedicines() {
    const { pharmacistToken } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentMedicine, setCurrentMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        salt: '',
        category: 'Allopathy',
        price: '',
        stock: '',
        description: '',
        expiryDate: '',
        requiresPrescription: false,
        manufacturer: ''
    });

    useEffect(() => {
        if (pharmacistToken) {
            fetchMedicines();
        }
    }, [pharmacistToken]);

    const fetchMedicines = async () => {
        try {
            const response = await axios.get('/api/medicines/my-medicines', {
                headers: { Authorization: `Bearer ${pharmacistToken}` }
            });
            setMedicines(response.data.data);
        } catch (err) {
            console.error("Failed to fetch medicines", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (medicine = null) => {
        if (medicine) {
            setCurrentMedicine(medicine);
            setFormData({
                name: medicine.name,
                brand: medicine.brand,
                salt: medicine.salt,
                category: medicine.category,
                price: medicine.price,
                stock: medicine.stock,
                description: medicine.description || '',
                expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
                requiresPrescription: medicine.requiresPrescription,
                manufacturer: medicine.manufacturer
            });
        } else {
            setCurrentMedicine(null);
            setFormData({
                name: '',
                brand: '',
                salt: '',
                category: 'Allopathy',
                price: '',
                stock: '',
                description: '',
                expiryDate: '',
                requiresPrescription: false,
                manufacturer: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${pharmacistToken}` }
            };
            if (currentMedicine) {
                await axios.put(`/api/medicines/${currentMedicine._id}`, formData, config);
            } else {
                await axios.post('/api/medicines', formData, config);
            }
            fetchMedicines();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save medicine", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await axios.delete(`/api/medicines/${id}`, {
                    headers: { Authorization: `Bearer ${pharmacistToken}` }
                });
                setMedicines(prev => prev.filter(m => m._id !== id));
            } catch (err) {
                console.error("Failed to delete medicine", err);
            }
        }
    };

    const filteredMedicines = medicines.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <PharmacistSidebar />
            
            <main className="flex-grow p-8 lg:p-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Medicine Inventory</h1>
                        <p className="text-slate-500 font-medium">Manage your stock, prices, and medicine details easily.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 border border-slate-100 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-sm">
                            <FiUploadCloud /> Bulk Upload
                        </button>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm"
                        >
                            <FiPlus /> Add New Medicine
                        </button>
                    </div>
                </header>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name, brand or salt..." 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all text-sm">
                        <FiFilter /> Filters
                    </button>
                </div>

                {/* Medicine Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-slate-400 font-medium">Loading inventory...</div>
                    ) : filteredMedicines.length > 0 ? (
                        filteredMedicines.map((medicine) => (
                            <div key={medicine._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            <FiPackage size={24} />
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleOpenModal(medicine)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(medicine._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{medicine.name}</h3>
                                    <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">{medicine.brand}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Stock</p>
                                            <p className={`text-sm font-bold ${medicine.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                                                {medicine.stock} units
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Price</p>
                                            <p className="text-lg font-black text-slate-800">₹{medicine.price}</p>
                                        </div>
                                    </div>
                                    
                                    {medicine.stock < 10 && (
                                        <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                            <FiAlertCircle /> 
                                            <span>Low stock warning!</span>
                                        </div>
                                    )}
                                </div>
                                <div className="px-6 py-3 bg-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Exp: {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <FiChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Inventory is empty</h3>
                            <p className="text-slate-500 mb-6">Start adding medicines to your inventory to receive orders.</p>
                            <button 
                                onClick={() => handleOpenModal()}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-bold text-sm"
                            >
                                <FiPlus className="inline mr-2" /> Add First Medicine
                            </button>
                        </div>
                    )}
                </div>

                {/* Medicine Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                        {currentMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium">Enter medicine details for your inventory.</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Medicine Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Paracetamol 500mg"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Brand Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Dolo"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Salt / Generic Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Acetaminophen"
                                            value={formData.salt}
                                            onChange={(e) => setFormData({...formData, salt: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Manufacturer</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Micro Labs Ltd"
                                            value={formData.manufacturer}
                                            onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Price (₹)</label>
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="120"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Stock Quantity</label>
                                        <input 
                                            type="number" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="100"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Expiry Date</label>
                                        <input 
                                            type="date" 
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6 px-1">
                                        <input 
                                            type="checkbox" 
                                            id="prescription"
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                            checked={formData.requiresPrescription}
                                            onChange={(e) => setFormData({...formData, requiresPrescription: e.target.checked})}
                                        />
                                        <label htmlFor="prescription" className="text-sm font-bold text-slate-600 cursor-pointer">
                                            Requires Prescription
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description</label>
                                    <textarea 
                                        rows="3"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium resize-none"
                                        placeholder="Add medicine usage details, side effects etc..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit"
                                    className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                >
                                    <FiCheckCircle /> {currentMedicine ? 'Update Medicine' : 'Add to Inventory'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
