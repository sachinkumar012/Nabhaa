import React, { useEffect, useState } from 'react';
import api from '../../utils/adminApi';
import { toast } from 'react-toastify';
import { UserPlus, Stethoscope, ShieldCheck, ShieldAlert, Mail } from 'lucide-react';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', specialty: '', experience: '', location: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/admin/doctors');
            setDoctors(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch doctors');
            setLoading(false);
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/doctors', formData);
            toast.success('Doctor created successfully! They can now log in.');
            setFormData({ name: '', email: '', password: '', specialty: '', experience: '', location: '' });
            setShowForm(false);
            fetchDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create doctor');
        }
    };

    const toggleDoctorStatus = async (id, currentStatus) => {
        // We'll map 'isApproved' to 'active' conceptually. False = blocked/deactivated.
        try {
            // Note: Currently backend route is /doctors/:id/approve which sets isApproved = true.
            // For a full toggle, we'll hit the existing route or simulate it if the backend doesn't support revoke yet.
            // Since we didn't add a revoke route, we'll just use the approve route as an example, 
            // but ideally we'd add a toggle route. 
            await api.put(`/admin/doctors/${id}/approve`);
            toast.success('Doctor Access Approved');
            fetchDoctors();
        } catch (error) {
            toast.error('Failed to update doctor status');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="animate-fade-in-up">
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
                    {showForm ? 'Cancel Creation' : 'Create New Doctor'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-soft-sm border border-indigo-100 p-6 mb-8 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Stethoscope className="text-indigo-600" />
                        Onboard Specialist Profile
                    </h2>
                    <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input type="text" required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input type="email" required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="doctor@hospital.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Password</label>
                            <input type="text" required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder="Temporary password..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Specialty</label>
                            <input type="text" required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}
                                placeholder="e.g., Cardiologist"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (Years)</label>
                            <input type="text" required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}
                                placeholder="e.g., 10+ Years"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Location Details</label>
                            <input type="text" required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                                placeholder="Hospital or Clinic Address"
                            />
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-colors flex items-center justify-center gap-2">
                                <UserPlus size={18} /> Complete Onboarding
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-soft-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor Profile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Domain</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Access Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {doctors.map((doctor) => (
                                <tr key={doctor._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                <Stethoscope size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{doctor.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={12}/>{doctor.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                            {doctor.specialty}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1 pl-1">{doctor.experience} experience</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                            doctor.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'
                                        }`}>
                                            {doctor.isApproved ? 'Active & Approved' : 'System Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!doctor.isApproved ? (
                                            <button
                                                onClick={() => toggleDoctorStatus(doctor._id, doctor.isApproved)}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors"
                                            >
                                                <ShieldCheck size={16} /> Activate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => toast.info('System mapping for deactivation pending API hook.')}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                                            >
                                                <ShieldAlert size={16} /> Suspend
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
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

export default AdminDoctors;
