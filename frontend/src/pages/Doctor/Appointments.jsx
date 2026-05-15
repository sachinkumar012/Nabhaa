import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Clock, User, Video, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, scheduled, waiting, completed, cancelled

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('doctorToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await api.get('/appointments/doctor/list', config);
            setAppointments(data.data);
        } catch (error) {
            toast.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('doctorToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.patch(`/appointments/${id}/status`, { status: newStatus }, config);
            toast.success(`Appointment marked as ${newStatus}!`);
            fetchAppointments();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        return apt.status === filter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" /> Appointment Manager
                    </h1>
                    <p className="text-gray-500">View and manage your consultation schedule.</p>
                </div>
                
                <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                    {['all', 'scheduled', 'waiting', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all
                                ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                        <div key={apt._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className="bg-blue-50 p-4 rounded-2xl hidden md:block">
                                    <CalendarIcon className="text-blue-600" size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{apt.type} Appointment</div>
                                    <h3 className="text-lg font-bold text-gray-800">{apt.patientName}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5"><CalendarIcon size={14} /> {apt.date}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> {apt.time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-2 rounded-xl text-sm italic text-gray-600 w-full md:w-1/3">
                                <span className="font-bold text-xs uppercase text-gray-400 block mb-1">Reason:</span>
                                {apt.reason || 'Routine checkup'}
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                                {apt.status === 'scheduled' || apt.status === 'waiting' ? (
                                    <>
                                        {apt.videoCallId && (
                                            <a 
                                                href={apt.meetingLink}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                                            >
                                                <Video size={16} /> Join Call
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => updateStatus(apt._id, 'completed')}
                                            className="flex items-center gap-2 border border-green-500 text-green-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors"
                                        >
                                            <CheckCircle size={16} /> Mark Done
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(apt._id, 'cancelled')}
                                            className="flex items-center gap-2 text-gray-400 hover:text-red-500 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <XCircle size={16} /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest
                                        ${apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {apt.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">No appointments found</h3>
                            <p className="text-gray-500">There are no {filter !== 'all' ? filter : ''} appointments to display.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
