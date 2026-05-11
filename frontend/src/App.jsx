import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy, useEffect } from 'react';
import LoadingSpinner from './components/UI/LoadingSpinner';
import OfflineBanner from './components/UI/OfflineBanner';
import { syncManager } from './services/syncManager';
import useToast from './components/UI/Toast';
import { useSocket } from './context/SocketContext';


import { HealthProvider } from './context/HealthContext';
import { LocationProvider } from './modules/location/presentation/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthSidebar from './components/Auth/AuthSidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
// import Home from './pages/Home'; (converted to lazy)
// import Doctors from './pages/Doctors'; (converted to lazy)
// import Hospitals from './pages/Hospitals'; (converted to lazy)
// import HealthRecords from './pages/HealthRecords'; (converted to lazy)
// import LabTests from './pages/LabTests'; (converted to lazy)
// import AbhaManagement from './pages/AbhaManagement'; (converted to lazy)
// import MobileAbhaCard from './pages/MobileAbhaCard'; (converted to lazy)
// import Pharmacy from './pages/Pharmacy'; (converted to lazy)
// import SymptomChecker from './pages/SymptomChecker'; (converted to lazy)
// import About from './pages/About'; (converted to lazy)
// import PatientAuth from './Login/PatientAuth'; (converted to lazy)
import VideoCallRoom from './components/VideoCall/VideoCallRoom';
// import ProductDetailPage from './pages/ProductDetailPage'; (converted to lazy)
// import OrdersPage from './pages/OrdersPage'; (converted to lazy)
// import OrderDetailPage from './pages/OrderDetailPage'; (converted to lazy)
// import CartPage from './pages/CartPage'; (converted to lazy)
// import Insurance from './pages/Insurance'; (converted to lazy)

// import HealthBlog from './pages/HealthBlog'; (converted to lazy)
// import BlogPost from './pages/BlogPost'; (converted to lazy)
// import Profile from './pages/Profile'; (converted to lazy)
// import DoctorLogin from './pages/Doctor/DoctorLogin'; (converted to lazy)
// import DoctorDashboard from './pages/Doctor/DoctorDashboard'; (converted to lazy)
// import PrescriptionAnalysis from './pages/PrescriptionAnalysis'; (converted to lazy)
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pharmacist Pages
// import PharmacistLogin from './pages/Pharmacist/Login'; (converted to lazy)
// import PharmacistRegister from './pages/Pharmacist/Register'; (converted to lazy)
// import PharmacistDashboard from './pages/Pharmacist/Dashboard'; (converted to lazy)
// import PharmacistOrders from './pages/Pharmacist/Orders'; (converted to lazy)
// import PharmacistMedicines from './pages/Pharmacist/Medicines'; (converted to lazy)
// import PharmacistLabTests from './pages/Pharmacist/LabTests'; (converted to lazy)
// import PharmacistAnalytics from './pages/Pharmacist/Analytics'; (converted to lazy)
// import PharmacistProfile from './pages/Pharmacist/Profile'; (converted to lazy)
// import AdminLogin from './pages/AdminLogin'; (converted to lazy)
// import AdminLayout from './components/Admin/AdminLayout'; (converted to lazy)
// import AdminDashboard from './pages/Admin/AdminDashboard'; (converted to lazy)
// import AdminAppointments from './pages/Admin/AdminAppointments'; (converted to lazy)
// import AdminDoctors from './pages/Admin/AdminDoctors'; (converted to lazy)
// import AdminOrders from './pages/Admin/AdminOrders'; (converted to lazy)
// import AdminUsers from './pages/Admin/AdminUsers'; (converted to lazy)
// import AdminPartners from './pages/Admin/AdminPartners'; (converted to lazy)

// Doctor Pages
// import DoctorLayout from './components/Doctor/DoctorLayout'; (converted to lazy)
// import DoctorPatientList from './pages/Doctor/PatientList'; (converted to lazy)
// import DoctorPatientHistory from './pages/Doctor/PatientHistory'; (converted to lazy)
// import DoctorAppointments from './pages/Doctor/Appointments'; (converted to lazy)
// import DoctorPrescriptionWriter from './pages/Doctor/PrescriptionWriter'; (converted to lazy)
// import DoctorProfile from './pages/Doctor/Profile'; (converted to lazy)

import PatientLayout from './components/Layout/PatientLayout';

const Home = lazy(() => import('./pages/Home'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Hospitals = lazy(() => import('./pages/Hospitals'));
const HealthRecords = lazy(() => import('./pages/HealthRecords'));
const LabTests = lazy(() => import('./pages/LabTests'));
const AbhaManagement = lazy(() => import('./pages/AbhaManagement'));
const MobileAbhaCard = lazy(() => import('./pages/MobileAbhaCard'));
const Pharmacy = lazy(() => import('./pages/Pharmacy'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const About = lazy(() => import('./pages/About'));
const PatientAuth = lazy(() => import('./Login/PatientAuth'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Insurance = lazy(() => import('./pages/Insurance'));
const HealthBlog = lazy(() => import('./pages/HealthBlog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Profile = lazy(() => import('./pages/Profile'));
const DoctorLogin = lazy(() => import('./pages/Doctor/DoctorLogin'));
const DoctorDashboard = lazy(() => import('./pages/Doctor/DoctorDashboard'));
const PrescriptionAnalysis = lazy(() => import('./pages/PrescriptionAnalysis'));
const PharmacistLogin = lazy(() => import('./pages/Pharmacist/Login'));
const PharmacistRegister = lazy(() => import('./pages/Pharmacist/Register'));
const PharmacistDashboard = lazy(() => import('./pages/Pharmacist/Dashboard'));
const PharmacistOrders = lazy(() => import('./pages/Pharmacist/Orders'));
const PharmacistMedicines = lazy(() => import('./pages/Pharmacist/Medicines'));
const PharmacistLabTests = lazy(() => import('./pages/Pharmacist/LabTests'));
const PharmacistAnalytics = lazy(() => import('./pages/Pharmacist/Analytics'));
const PharmacistProfile = lazy(() => import('./pages/Pharmacist/Profile'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminAppointments = lazy(() => import('./pages/Admin/AdminAppointments'));
const AdminDoctors = lazy(() => import('./pages/Admin/AdminDoctors'));
const AdminOrders = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminPartners = lazy(() => import('./pages/Admin/AdminPartners'));
const DoctorLayout = lazy(() => import('./components/Doctor/DoctorLayout'));
const DoctorPatientList = lazy(() => import('./pages/Doctor/PatientList'));
const DoctorPatientHistory = lazy(() => import('./pages/Doctor/PatientHistory'));
const DoctorAppointments = lazy(() => import('./pages/Doctor/Appointments'));
const DoctorPrescriptionWriter = lazy(() => import('./pages/Doctor/PrescriptionWriter'));
const DoctorProfile = lazy(() => import('./pages/Doctor/Profile'));


function App() {
  const { showToast, ToastContainer } = useToast();
  const { onOrderUpdate } = useSocket();

  useEffect(() => {
    const unsub = onOrderUpdate((data) => {
      const statusToast = {
        'Pending':          { type: 'info',     title: '⏳ Order Placed',         message: 'Your order has been placed.' },
        'Accepted':         { type: 'success',  title: '✅ Order Accepted',        message: 'Pharmacy accepted your order!' },
        'Processing':       { type: 'info',     title: '🔄 Processing',           message: 'Your medicines are being packed.' },
        'Packed':           { type: 'info',     title: '📦 Order Packed',         message: 'Ready for pickup by delivery agent.' },
        'Out for Delivery': { type: 'delivery', title: '🚚 Out for Delivery',     message: 'Your order is on its way!' },
        'Delivered':        { type: 'success',  title: '✔️ Delivered!',           message: 'Order delivered successfully.' },
        'Cancelled':        { type: 'error',    title: '❌ Order Cancelled',      message: 'Your order was cancelled.' },
      };

      if (data.event === 'cod_reminder') {
        showToast({ type: 'warning', title: '💳 Pay Online', message: 'Pay now for faster dispatch & priority delivery!', duration: 6000 });
      } else if (data.event === 'payment_success') {
        showToast({ type: 'payment', title: '💚 Payment Confirmed', message: 'Your payment was received. Order prioritized!', duration: 5000 });
      } else if (data.status && statusToast[data.status]) {
        showToast({ ...statusToast[data.status], duration: 5000 });
      } else if (data.message) {
        showToast({ type: 'info', title: 'Order Update', message: data.message });
      }
    });
    return unsub;
  }, [onOrderUpdate, showToast]);

  return (
    <HealthProvider>
        <LocationProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen flex flex-col font-outfit">
                  <OfflineBanner />
                  <AuthSidebar />
                  <ToastContainer />

                  <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Video call — full screen, no chrome */}
                    <Route path="/video-call/:callId" element={<VideoCallRoom />} />

                    {/* PORTAL ROUTES (Isolated - No site Header/Footer) */}
                    
                    {/* Doctor Routes */}
                    <Route path="/doctor/login" element={<DoctorLogin />} />
                    <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorDashboard /></DoctorLayout></ProtectedRoute>} />
                    <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorPatientList /></DoctorLayout></ProtectedRoute>} />
                    <Route path="/doctor/patients/:email/history" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorPatientHistory /></DoctorLayout></ProtectedRoute>} />
                    <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorAppointments /></DoctorLayout></ProtectedRoute>} />
                    <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorPrescriptionWriter /></DoctorLayout></ProtectedRoute>} />
                    <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><DoctorProfile /></DoctorLayout></ProtectedRoute>} />

                    {/* Pharmacist Routes */}
                    <Route path="/pharmacist/login" element={<PharmacistLogin />} />
                    <Route path="/pharmacist/register" element={<PharmacistRegister />} />
                    <Route path="/pharmacist/dashboard" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
                    <Route path="/pharmacist/orders" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistOrders /></ProtectedRoute>} />
                    <Route path="/pharmacist/medicines" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistMedicines /></ProtectedRoute>} />
                    <Route path="/pharmacist/lab-tests" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistLabTests /></ProtectedRoute>} />
                    <Route path="/pharmacist/analytics" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistAnalytics /></ProtectedRoute>} />
                    <Route path="/pharmacist/profile" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistProfile /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                    <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminAppointments /></AdminLayout></ProtectedRoute>} />
                    <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDoctors /></AdminLayout></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
                    <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPartners /></AdminLayout></ProtectedRoute>} />

                    {/* PATIENT ROUTES (Wrapped in PatientLayout) */}
                    <Route path="*" element={
                      <PatientLayout>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/doctors" element={<Doctors />} />
                          <Route path="/hospitals" element={<Hospitals />} />
                          <Route path="/pharmacy" element={<Pharmacy />} />
                          <Route path="/product/:id" element={<ProductDetailPage />} />
                          <Route path="/lab-tests" element={<LabTests />} />
                          <Route path="/abha" element={<AbhaManagement />} />
                          <Route path="/mobile-view" element={<MobileAbhaCard />} />
                          <Route path="/insurance" element={<Insurance />} />
                          <Route path="/symptoms" element={<SymptomChecker />} />
                          <Route path="/prescription-analysis" element={<PrescriptionAnalysis />} />
                          <Route path="/blog" element={<HealthBlog />} />
                          <Route path="/blog/:id" element={<BlogPost />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/patient/auth" element={<PatientAuth />} />

                          {/* Protected Patient Routes */}
                          <Route path="/records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
                          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        </Routes>
                      </PatientLayout>
                    } />
                  </Routes>
                  </Suspense>
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </LocationProvider>
    </HealthProvider>
  );
}

export default App;