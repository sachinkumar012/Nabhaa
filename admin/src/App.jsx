import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Doctors from './pages/Doctors';
import Users from './pages/Users';
import Appointments from './pages/Appointments';
import Sidebar from './components/Sidebar';

import DoctorDashboard from './pages/DoctorDashboard';
import VideoCallRoom from './components/VideoCallRoom';

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center px-4 z-40 shadow-md">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-4 font-bold text-lg">Nabha Admin</span>
      </div>

      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'} pt-20 lg:pt-8`}>
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
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
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

        {/* Helper route for Video Call */}
        <Route
          path="/video-call/:callId"
          element={
            <VideoCallRoom />
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
