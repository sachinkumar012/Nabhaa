import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import socket from '../../utils/socket';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('doctorToken');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const { data } = await api.get('/doctors/profile', config);
                setProfile(data);

                // Fetch Appointments
                // Note: We need to use the token to get strictly this doctor's appointments
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
                    // Start of rudimentary check to avoid dupes if api already fetched it
                    // But instant calls might not be in the initial fetch if they just happened.
                    const exists = prev.find(apt => apt.videoCallId === data.callId);
                    if (exists) return prev;

                    return [{
                        _id: 'temp_' + Date.now(),
                        patientName: data.patientName,
                        time: new Date().toLocaleTimeString(),
                        date: new Date().toISOString().split('T')[0],
                        type: 'instant',
                        videoCallId: data.callId,
                        meetingLink: `${window.location.origin}/video-call/${data.callId}?type=doctor&name=${encodeURIComponent(profile.name)}`,
                        status: 'waiting'
                    }, ...prev];
                });

                const CustomToast = ({ closeToast }) => (
                    <div>
                        <p className="font-bold">Incoming Call from {data.patientName}</p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => {
                                    window.open(`/video-call/${data.callId}?type=doctor&name=${encodeURIComponent(profile.name)}`, '_blank');
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
        <div className="min-h-screen bg-gray-50 pt-20 px-4">
            <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-6 mb-6">
                    <img
                        className="h-24 w-24 rounded-full object-cover"
                        src={profile.image || 'https://via.placeholder.com/150'}
                        alt={profile.name}
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                        <p className="text-blue-600 font-medium">{profile.specialty}</p>
                        <p className="text-gray-500">{profile.location} | {profile.experience} Experience</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-bold mb-4">Video Consultation Dashboard</h2>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                No appointments found. Wait for incoming calls or scheduled consultations.
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.map((apt) => (
                                            <tr key={apt._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{apt.patientName}</div>
                                                    <div className="text-xs text-gray-500">{apt.reason}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{apt.date}</div>
                                                    <div className="text-sm text-gray-500">{apt.time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.type === 'instant' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {apt.type === 'instant' ? 'Instant' : 'Scheduled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a
                                                        href={apt.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md transition-colors"
                                                    >
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
        </div>
    );
};

export default DoctorDashboard;
