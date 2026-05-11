import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
    Calendar, 
    FileText, 
    User, 
    ChevronLeft, 
    Clock, 
    Stethoscope,
    Download,
    ExternalLink,
    Activity
} from 'lucide-react';

const PatientHistory = () => {
    const { email } = useParams();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('doctorToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get(`/doctors/patients/${email}/history`, config);
                setHistory(data.data);
            } catch (error) {
                toast.error('Failed to load patient history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [email]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!history) return <div className="text-center py-20">Patient history not found.</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/doctor/patients" className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Medical History</h1>
                    <p className="text-gray-500">Patient: {email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Appointments Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                            <Activity className="text-blue-600" size={24} /> Consultation Timeline
                        </h3>
                        
                        <div className="relative border-l-2 border-blue-50 ml-4 space-y-12 pb-4">
                            {history.appointments.map((apt, index) => (
                                <div key={apt._id} className="relative pl-10">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-[-11px] top-2 w-5 h-5 rounded-full bg-white border-4 border-blue-600 shadow-sm"></div>
                                    
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-6 rounded-2xl hover:bg-blue-50 transition-colors group">
                                        <div>
                                            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{apt.date}</div>
                                            <h4 className="text-lg font-bold text-gray-800">{apt.reason || 'General Consultation'}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock size={14} /> {apt.time} • {apt.type} • Status: <span className="capitalize font-semibold">{apt.status}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-blue-100">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {history.appointments.length === 0 && (
                                <p className="text-center text-gray-400 py-10">No past appointments found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Prescriptions Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="text-blue-600" size={24} /> Prescriptions
                        </h3>
                        
                        <div className="space-y-4">
                            {history.prescriptions.map((pres) => (
                                <div key={pres._id} className="p-5 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                            Rx
                                        </div>
                                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-gray-800">{pres.diagnosis}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Written by Dr. {pres.doctorId?.name || 'Unknown'}</p>
                                    <p className="text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">{new Date(pres.createdAt).toLocaleDateString()}</p>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                                        {pres.medicines.slice(0, 3).map((m, i) => (
                                            <span key={i} className="text-[10px] bg-white border border-gray-100 px-2 py-1 rounded-md text-gray-600">{m.name.slice(0, 15)}...</span>
                                        ))}
                                        {pres.medicines.length > 3 && <span className="text-[10px] text-gray-400">+{pres.medicines.length - 3} more</span>}
                                    </div>
                                </div>
                            ))}
                            
                            {history.prescriptions.length === 0 && (
                                <div className="text-center py-10">
                                    <FileText className="mx-auto text-gray-200 mb-2" size={48} />
                                    <p className="text-sm text-gray-400">No prescriptions found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
                        <Stethoscope className="mb-4 opacity-50" size={32} />
                        <h3 className="text-lg font-bold mb-2">Patient Records</h3>
                        <p className="text-sm text-blue-100 font-light mb-6">Access all medical files, insurance papers, and lab reports uploaded by this patient.</p>
                        <button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl text-sm font-bold backdrop-blur-md transition-colors border border-white/20">
                            Cloud Records
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientHistory;
