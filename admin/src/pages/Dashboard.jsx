import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        doctors: 0,
        orders: 0,
        pendingDoctors: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setStats(data);
            } catch (error) {
                toast.error('Failed to fetch stats');
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, color, icon }) => (
        <div className="card hover:transform hover:-translate-y-1 transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
            <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">{title}</h2>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-extrabold text-gray-800">{value}</p>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    +2.5% vs last week
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeInUp">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                Dashboard Overview
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    color="#1A73E8" // primary-500
                />
                <StatCard
                    title="Total Doctors"
                    value={stats.doctors}
                    color="#10B981" // success-500
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    color="#8B5CF6" // purple-500
                />
                <StatCard
                    title="Pending Doctors"
                    value={stats.pendingDoctors}
                    color="#F59E0B" // warning-500
                />
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Placeholder for charts or recent activity */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    <p className="text-gray-500">No recent activity.</p>
                </div>
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">System Health</h3>
                    <p className="text-green-600 font-medium">All systems operational.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
