import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Search, User, Phone, ArrowUpRight, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('doctorToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch both appointment-based patients AND prescription patients
                const [aptsRes, presRes] = await Promise.all([
                    api.get('/doctors/patients', config),
                    api.get('/doctors/my-prescriptions', config).catch(() => ({ data: { data: [] } }))
                ]);

                const apptPatients = aptsRes.data.data || [];

                // Build a map keyed by email (or name if no email)
                const map = {};
                apptPatients.forEach(p => {
                    const key = p.email || p.name;
                    map[key] = { ...p, prescriptions: [] };
                });

                // Merge prescription patients
                const prescriptions = presRes.data.data || [];
                prescriptions.forEach(rx => {
                    const email = rx.patientDetails?.email || '';
                    const name  = rx.patientDetails?.name  || 'Unknown';
                    const key   = email || name;
                    if (!map[key]) {
                        map[key] = {
                            name,
                            email,
                            phone: rx.patientDetails?.phone || '',
                            address: rx.patientDetails?.address || '',
                            lastVisit: rx.createdAt?.split('T')[0] || '',
                            appointmentsCount: 0,
                            prescriptions: []
                        };
                    }
                    map[key].prescriptions = [...(map[key].prescriptions || []), rx];
                    // Keep most recent date
                    if (!map[key].lastVisit || rx.createdAt?.split('T')[0] > map[key].lastVisit) {
                        map[key].lastVisit = rx.createdAt?.split('T')[0] || map[key].lastVisit;
                    }
                });

                setPatients(Object.values(map));
            } catch (error) {
                toast.error('Failed to fetch patients');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // Search by name, email, or prescription ID
    const filteredPatients = patients.filter(p => {
        const q = searchTerm.toLowerCase();
        if (!q) return true;
        const nameMatch  = p.name?.toLowerCase().includes(q);
        const emailMatch = p.email?.toLowerCase().includes(q);
        const rxIdMatch  = p.prescriptions?.some(rx => rx._id?.toLowerCase().includes(q));
        return nameMatch || emailMatch || rxIdMatch;
    });

    return (
        <div className="space-y-6">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
                    <p className="text-gray-500 text-sm">Patients from appointments and prescriptions.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or prescription ID…"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Records</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredPatients.length > 0 ? filteredPatients.map((patient, idx) => (
                                <tr key={patient.email || idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                                                {(patient.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{patient.name}</div>
                                                <div className="text-xs text-gray-400">{patient.address || 'Address not recorded'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700 flex items-center gap-1">
                                            <Phone size={13} className="text-gray-400" /> {patient.phone || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">{patient.email || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <Calendar size={13} className="text-gray-400" />
                                            {patient.lastVisit || 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {patient.appointmentsCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 w-fit">
                                                    {patient.appointmentsCount} Appointment{patient.appointmentsCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {patient.prescriptions?.length > 0 && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit flex items-center gap-1">
                                                    <FileText size={10} /> {patient.prescriptions.length} Prescription{patient.prescriptions.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {!patient.appointmentsCount && !patient.prescriptions?.length && (
                                                <span className="text-xs text-gray-400">No records</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/doctor/patients/${patient.email || patient.name}/history`}
                                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                                        >
                                            View Details <ArrowUpRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <User size={36} className="mx-auto text-gray-200 mb-3" />
                                        <p className="text-gray-500 font-medium">
                                            {searchTerm ? `No patients matching "${searchTerm}"` : 'No patients yet.'}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">Patients appear here after appointments or prescriptions.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PatientList;
