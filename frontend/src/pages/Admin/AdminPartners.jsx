import React, { useEffect, useState } from 'react';
import api from '../../utils/adminApi';
import { toast } from 'react-toastify';
import { Store, FileText, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

const AdminPartners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All'); // All, Pending, Approved, Rejected

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const { data } = await api.get('/admin/pharmacists');
            setPartners(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch partners');
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this partner as ${status}?`)) return;

        try {
            await api.put(`/admin/pharmacists/${id}/status`, { status });
            toast.success(`Partner successfully marked as ${status}`);
            fetchPartners();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update partner status');
        }
    };

    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              partner.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || partner.verificationStatus === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Partner Control</h1>
                    <p className="text-gray-500 mt-1">Review and approve pharmacy partners (Zomato-model).</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm"
                    >
                        <option value="All">All Partners</option>
                        <option value="Pending">Pending Approvals</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <div className="relative flex-grow md:w-64 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search partners..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pharmacy Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">License info</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPartners.length > 0 ? filteredPartners.map((partner) => (
                                <tr key={partner._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                                                <Store size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{partner.pharmacyName}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-[150px]">{partner.address}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                                        <div className="text-sm text-gray-500">{partner.email}</div>
                                        <div className="text-sm text-gray-500">{partner.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-mono text-gray-600 mb-1">
                                            <FileText size={14} className="mr-2 text-gray-400" />
                                            {partner.licenseNumber}
                                        </div>
                                        <div className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">View Documents</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                                            partner.verificationStatus === 'Approved' ? 'bg-green-100 text-green-800' : 
                                            partner.verificationStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                            'bg-yellow-100 text-yellow-800 animate-pulse'
                                        }`}>
                                            {partner.verificationStatus === 'Approved' && <CheckCircle size={12} />}
                                            {partner.verificationStatus === 'Rejected' && <XCircle size={12} />}
                                            {partner.verificationStatus === 'Pending' && <Clock size={12} />}
                                            {partner.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {partner.verificationStatus === 'Pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(partner._id, 'Approved')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                                                >
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(partner._id, 'Rejected')}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </div>
                                        ) : partner.verificationStatus === 'Approved' ? (
                                             <button
                                                onClick={() => handleUpdateStatus(partner._id, 'Rejected')}
                                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded transition-colors"
                                            >
                                                Revoke Access
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUpdateStatus(partner._id, 'Approved')}
                                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1.5 rounded transition-colors"
                                            >
                                                Re-Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No partners found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AdminPartners;
