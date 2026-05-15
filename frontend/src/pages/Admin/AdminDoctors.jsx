import React, { useEffect, useState } from 'react';
import api from '../../utils/adminApi';
import { toast } from 'react-toastify';
import { UserPlus, Stethoscope, ShieldCheck, ShieldAlert, Mail, Copy, Check, X, KeyRound, Eye, EyeOff } from 'lucide-react';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null); // {name, email, password}
    const [copiedField, setCopiedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', specialty: '', experience: '', location: ''
    });

    useEffect(() => { fetchDoctors(); }, []);

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/admin/doctors');
            setDoctors(data);
        } catch { toast.error('Failed to fetch doctors'); }
        finally { setLoading(false); }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/doctors', formData);
            toast.success('Doctor created successfully!');
            // Show credentials modal so admin can share with doctor
            setCreatedCredentials({ name: formData.name, email: formData.email, password: formData.password });
            setFormData({ name: '', email: '', password: '', specialty: '', experience: '', location: '' });
            setShowForm(false);
            fetchDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create doctor');
        }
    };

    const toggleDoctorStatus = async (id) => {
        try {
            await api.put(`/admin/doctors/${id}/approve`);
            toast.success('Doctor Access Updated');
            fetchDoctors();
        } catch { toast.error('Failed to update doctor status'); }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`${field === 'email' ? 'Email' : 'Password'} copied!`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600" />
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Doctor Provisioning</h1>
                    <p className="text-gray-500 mt-1">Manually onboard and manage specialist accounts.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <UserPlus size={18} />
                    {showForm ? 'Cancel' : 'Create New Doctor'}
                </button>
            </div>

            {/* ── Create Form ── */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-8 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Stethoscope className="text-indigo-600" /> Onboard Specialist Profile
                    </h2>
                    <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            { label: 'Full Name', key: 'name', ph: 'Dr. Harpreet Singh', type: 'text' },
                            { label: 'Email Address', key: 'email', ph: 'doctor@nabhaa.in', type: 'email' },
                            { label: 'Specialty', key: 'specialty', ph: 'e.g., General Physician', type: 'text' },
                            { label: 'Experience', key: 'experience', ph: 'e.g., 8 Years', type: 'text' },
                            { label: 'Location / Clinic', key: 'location', ph: 'Primary Health Centre, Tarn Taran, Punjab', type: 'text' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                                <input type={f.type} required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={formData[f.key]} placeholder={f.ph}
                                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                />
                            </div>
                        ))}
                        {/* Password field — visible so admin can note it */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Initial Password <span className="text-xs font-normal text-gray-400">(share this with the doctor)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} required
                                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={formData.password} placeholder="Set a temporary password"
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <button type="submit"
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-colors flex items-center justify-center gap-2">
                                <UserPlus size={18} /> Create Doctor & Generate Credentials
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Doctors Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor Profile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Domain</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Login Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Access Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {doctors.map((doctor) => (
                                <tr key={doctor._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                <Stethoscope size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{doctor.name}</div>
                                                <div className="text-xs text-gray-400">{doctor.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{doctor.specialty}</span>
                                        <div className="text-xs text-gray-400 mt-1 pl-1">{doctor.experience}</div>
                                    </td>
                                    {/* Login Email with copy button */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700 font-mono">{doctor.email}</span>
                                            <button
                                                onClick={() => copyToClipboard(doctor.email, 'email')}
                                                title="Copy email"
                                                className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                                            >
                                                {copiedField === 'email' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                            <KeyRound size={10} />
                                            Password set during creation
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${doctor.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'}`}>
                                            {doctor.isApproved ? 'Active & Approved' : 'System Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!doctor.isApproved ? (
                                            <button onClick={() => toggleDoctorStatus(doctor._id)}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors">
                                                <ShieldCheck size={16} /> Activate
                                            </button>
                                        ) : (
                                            <button onClick={() => toast.info('Contact system admin to suspend.')}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                                                <ShieldAlert size={16} /> Suspend
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {doctors.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Stethoscope size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No doctors onboarded yet. Click "Create New Doctor" to start.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Credentials Modal ── */}
            {createdCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">✅ Doctor Created!</h2>
                                    <p className="text-green-100 text-sm mt-1">Share these credentials with {createdCredentials.name}</p>
                                </div>
                                <button onClick={() => setCreatedCredentials(null)}
                                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Mail size={12} /> Login Email
                                </p>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-mono text-gray-800 font-semibold text-sm break-all">{createdCredentials.email}</span>
                                    <button onClick={() => copyToClipboard(createdCredentials.email, 'modal-email')}
                                        className="shrink-0 flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold">
                                        {copiedField === 'modal-email' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <KeyRound size={12} /> Password
                                </p>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-mono text-gray-800 font-semibold text-sm">{createdCredentials.password}</span>
                                    <button onClick={() => copyToClipboard(createdCredentials.password, 'modal-pass')}
                                        className="shrink-0 flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-semibold">
                                        {copiedField === 'modal-pass' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800">
                                ⚠️ <strong>Important:</strong> This password is shown only once. Please copy and securely share it with the doctor via WhatsApp or email. The doctor can use these credentials at{' '}
                                <a href="/doctor/login" target="_blank" className="text-blue-600 underline font-semibold">/doctor/login</a>
                            </div>

                            {/* Copy All button */}
                            <button
                                onClick={() => {
                                    copyToClipboard(
                                        `Doctor Login Credentials\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nLogin at: ${window.location.origin}/doctor/login`,
                                        'all'
                                    );
                                }}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
                            >
                                {copiedField === 'all' ? <><Check size={16} /> All Copied!</> : <><Copy size={16} /> Copy All Credentials</>}
                            </button>

                            <button onClick={() => setCreatedCredentials(null)}
                                className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition">
                                Close & Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.35s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdminDoctors;
