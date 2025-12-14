import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { HealthProvider } from './context/HealthContext';
import { LocationProvider } from './modules/location/presentation/LocationContext';
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

import HealthBlog from './pages/HealthBlog';
import BlogPost from './pages/BlogPost';
import Profile from './pages/Profile';

function App() {
  return (
    <LanguageProvider>
      <HealthProvider>
        <LocationProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Routes>
                <Route path="/video-call/:callId" element={<VideoCallRoom />} />
                <Route path="/pharmacy" element={
                  <>
                    <Pharmacy />
                    <Footer />
                  </>
                } />
                <Route path="/*" element={
                  <>
                    <Header />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/doctors" element={<Doctors />} />
                        <Route path="/hospitals" element={<Hospitals />} />
                        <Route path="/records" element={<HealthRecords />} />
                        <Route path="/abha" element={<AbhaManagement />} />
                        <Route path="/mobile-view" element={<MobileAbhaCard />} />
                        <Route path="/lab-tests" element={<LabTests />} />
                        {/* Pharmacy route moved to outer Routes to remove custom Header */}
                        <Route path="/symptoms" element={<SymptomChecker />} />
                        <Route path="/blog" element={<HealthBlog />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/patient/auth" element={<PatientAuth />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </LocationProvider>
      </HealthProvider>
    </LanguageProvider>
  );
}

export default App;