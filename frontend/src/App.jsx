import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { HealthProvider } from './context/HealthContext';
import { LocationProvider } from './modules/location/presentation/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthSidebar from './components/Auth/AuthSidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Hospitals from './pages/Hospitals';
import HealthRecords from './pages/HealthRecords';
import LabTests from './pages/LabTests';
import AbhaManagement from './pages/AbhaManagement';
import MobileAbhaCard from './pages/MobileAbhaCard';
import Pharmacy from './pages/Pharmacy';
import SymptomChecker from './pages/SymptomChecker';
import About from './pages/About';
import PatientAuth from './Login/PatientAuth';
import VideoCallRoom from './components/VideoCall/VideoCallRoom';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CartPage from './pages/CartPage';
import Insurance from './pages/Insurance';

import HealthBlog from './pages/HealthBlog';
import BlogPost from './pages/BlogPost';
import Profile from './pages/Profile';
import DoctorLogin from './pages/Doctor/DoctorLogin';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import PrescriptionAnalysis from './pages/PrescriptionAnalysis';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <HealthProvider>
        <LocationProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen flex flex-col">
                  <AuthSidebar />

                  {/* ── Single global Header for ALL pages ──────────── */}
                  <Header />

                  <main className="flex-grow">
                    <Routes>
                      {/* Video call — full screen, no chrome */}
                      <Route path="/video-call/:callId" element={<VideoCallRoom />} />

                      {/* Public routes */}
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
                      <Route path="/doctor/login" element={<DoctorLogin />} />
                      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

                      {/* Protected routes */}
                      <Route path="/records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
                      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    </Routes>
                  </main>

                  {/* ── Single global Footer for ALL pages ─────────── */}
                  <Footer />
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </LocationProvider>
      </HealthProvider>
    </LanguageProvider>
  );
}

export default App;