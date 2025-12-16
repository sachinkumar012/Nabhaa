import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Doctors from './pages/Doctors';
import Users from './pages/Users';
import Sidebar from './components/Sidebar';

import DoctorDashboard from './pages/DoctorDashboard';

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

// Protected Route for Doctor
const DoctorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('doctorToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Doctor might have a simpler layout without the full Admin sidebar 
                 or a custom sidebar. For now, let's keep it simple with a top bar or just the dashboard content.
                 The Dashboard component itself has a header. 
                 Let's add a logout button wrapper here.
             */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => {
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorInfo');
            window.location.href = '/login';
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <Doctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
