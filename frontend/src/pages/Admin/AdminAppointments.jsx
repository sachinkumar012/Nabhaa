import React, { useEffect, useState } from 'react';
import { Video, Calendar, Clock, User, Link as LinkIcon, Share2 } from 'lucide-react';
import api from '../../utils/adminApi';
import { toast } from 'react-toastify';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data } = await api.get('/appointments/all');
                if (data.success) {
                    setAppointments(data.data);
                }
            } catch (error) {
                console.error("Failed to load appointments:", error);
                toast.error("Failed to load appointments.");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleGenerateLink = async (appointmentId) => {
        try {
            // Generate a secure meeting link if requested (if not already present or if we want to change it)
            // Currently, the backend creates `videoCallId` by default during booking.
            toast.info("A video link was automatically generated at booking. Please copy the existing link!");
        } catch (error) {
            toast.error("Error generating link");
        }
    };

    const handleCopyLink = (meetingLink) => {
        navigator.clipboard.writeText(meetingLink);
        toast.success("Meeting link copied to clipboard!");
    };

    // Open video room in new tab using admin app routes (or frontend routes depending on structure)
    // Using admin's own router:
    const handleJoinCall = (videoCallId) => {
        window.open(`/video-call/${videoCallId}`, '_blank');
    };

    if (loading) return <div className="text-center mt-20 text-gray-500">Loading Appointments...</div>;

    return (
        <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Scheduled Consultations</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <p className="text-lg font-medium mb-1">No scheduled consultations</p>
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((apt) => (
                                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary-100 p-2 rounded-full text-primary-600">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{apt.patientName}</div>
                                                    <div className="text-xs text-gray-500">{apt.patientEmail || 'No email provided'}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{apt.reason || 'General Consultation'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {apt.doctor ? apt.doctor.name : 'Not Assigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar size={14} className="mr-1.5 text-gray-400" />
                                                    {apt.date}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock size={14} className="mr-1.5 text-gray-400" />
                                                    {apt.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-max ${apt.type === 'instant' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {apt.type === 'instant' ? 'Instant Video' : 'Scheduled'}
                                                </span>
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-max ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {apt.meetingLink ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleCopyLink(apt.meetingLink)}
                                                            className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                            title="Copy Link to send to doctor/patient"
                                                        >
                                                            <Share2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleJoinCall(apt.videoCallId)}
                                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md"
                                                        >
                                                            <Video size={16} className="mr-2" />
                                                            Join / Start
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleGenerateLink(apt._id)}
                                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                    >
                                                        <LinkIcon size={16} className="mr-2" />
                                                        Generate Link
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Appointments;
