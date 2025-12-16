import React, { useEffect, useState } from 'react';
import api from '../api';
import socket from '../socket';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Check for doctor token
                const token = localStorage.getItem('doctorToken');
                if (!token) {
                    // Redirect or handle error if not logged in
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                // Fetch Profile
                const { data } = await api.get('/doctors/profile', config);
                setProfile(data);

                // Fetch Appointments
                const aptResponse = await api.get('/appointments/doctor/list', config);
                setAppointments(aptResponse.data.data);

            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch profile or appointments');
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (profile?._id) {
            console.log('Joining doctor room:', profile._id);
            socket.emit('join_doctor_room', profile._id);

            socket.on('incoming_call', (data) => {
                console.log('Incoming call received:', data);

                // Add to appointments list if not already there (Instant call)
                setAppointments(prev => {
                    const exists = prev.find(apt => apt.videoCallId === data.callId);
                    if (exists) return prev;

                    return [{
                        _id: 'temp_' + Date.now(),
                        patientName: data.patientName,
                        time: new Date().toLocaleTimeString(),
                        date: new Date().toISOString().split('T')[0],
                        type: 'instant',
                        videoCallId: data.callId,
                        meetingLink: `${window.location.origin}/video-call/${data.callId}?type=doctor&name=${encodeURIComponent(profile.name)}`, // Note: calls usually open in frontend, but admin can link to it? Yes.
                        // Ideally, the video room component should also exist in Admin or redirect to frontend. 
                        // For simplicity, redirecting to frontend for the actual call room is safer as it has the media logic setup.
                        // Assumes frontend is running on 5173. 
                        // Let's use absolute URL to Frontend if possible or relative if ported.
                        status: 'waiting'
                    }, ...prev];
                });

                const CustomToast = ({ closeToast }) => (
                    <div>
                        <p className="font-bold">Incoming Call from {data.patientName}</p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => {
                                    // Redirect to Frontend for Video Call 
                                    // Assuming frontend port 5173.
                                    window.open(`http://localhost:5173/video-call/${data.callId}?type=doctor&name=${encodeURIComponent(profile.name)}`, '_blank');
                                    closeToast();
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Accept
                            </button>
                            <button onClick={closeToast} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                Decline
                            </button>
                        </div>
                    </div>
                );

                toast.info(<CustomToast />, {
                    position: "top-center",
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false
                });
            });

            return () => {
                socket.off('incoming_call');
            };
        }
    }, [profile]);

    if (!profile) return <div className="text-center mt-20">Loading Profile...</div>;

    return (
        <div className="animate-fadeInUp">
            {/* Header / Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex items-center space-x-6">
                <img
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary-50"
                    src={profile.image || 'https://via.placeholder.com/150'}
                    alt={profile.name}
                />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{profile.specialty}</span>
                        <span className="text-gray-500 text-sm">{profile.location}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            Video Consultations
                        </h2>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <p className="text-lg font-medium mb-1">No pending consultations</p>
                                            <p className="text-sm">You will be notified when a patient joins.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((apt) => (
                                        <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{apt.patientName}</div>
                                                <div className="text-xs text-gray-500">{apt.reason || 'General Consultation'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{apt.date}</div>
                                                <div className="text-xs text-gray-500">{apt.time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.type === 'instant' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {apt.type === 'instant' ? 'Instant' : 'Scheduled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a
                                                    href={apt.meetingLink.startsWith('http') ? apt.meetingLink : `http://localhost:5173${apt.meetingLink}`} // Ensure absolute link to frontend
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
                                                >
                                                    <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Join Call
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
