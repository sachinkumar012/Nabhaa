import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Phone, MessageCircle, CheckCircle, XCircle, Video, Users, User, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AuthSidebar from '../components/Auth/AuthSidebar';
import SimpleVideoBooking from '../components/VideoCall/SimpleVideoBooking';
import api from '../services/api';


export default function Doctors() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showVideoBooking, setShowVideoBooking] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Fetching doctors...');
        const response = await api.get('/doctors');
        console.log('Doctors response:', response.data);
        if (response.data.success) {
          // Transform data if necessary
          const mappedDoctors = response.data.data.map(doc => ({
            ...doc,
            id: doc._id,
            image: doc.image || 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
            available: true,
            availableTime: '9:00 AM - 6:00 PM',
            languages: ['English', 'Hindi']
          }));
          setDoctors(mappedDoctors);
        }
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleWhatsAppCall = (phone, doctorName) => {
    const message = encodeURIComponent(`Hello Dr. ${doctorName}, I would like to schedule a consultation through Nabha Healthcare.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleVideoConsultation = (doctor) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedDoctor(doctor);
    setShowVideoBooking(true);
  };

  const closeVideoBooking = () => {
    setShowVideoBooking(false);
    setSelectedDoctor(null);
  };

  const isCurrentlyAvailable = (doctor, currentTime) => {
    const hour = currentTime.getHours();
    return doctor.available && hour >= 9 && hour < 18;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#075985] to-[#1e3a8a] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <User size={16} />
            Expert Medical Professionals
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Consult Top Doctors <br className="hidden sm:block" />
            <span className="text-yellow-300">Online & Offline</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Connect with experienced doctors who understand rural healthcare needs. Book video consultations or in-person visits instantly.
          </p>
        </div>
      </div>

      {/* Trust Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Users size={22} />, value: '100+', label: 'Active Doctors' },
            { icon: <Heart size={22} />, value: '20+', label: 'Specialties' },
            { icon: <Clock size={22} />, value: '< 15 min', label: 'Wait Time' },
            { icon: <Star size={22} />, value: '4.9/5', label: 'Patient Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-xl mb-2">
                {stat.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container max-w-6xl mx-auto">

        <div className="grid grid-md-2 gap-8">
          {loading && <div className="text-center col-span-2">Loading Doctors...</div>}
          {!loading && doctors.length === 0 && <div className="text-center col-span-2">No doctors found.</div>}
          {doctors.map((doctor, index) => {
            const available = isCurrentlyAvailable(doctor, currentTime);

            return (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="doctor-card"
              >
                <div className="doctor-header">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="doctor-avatar"
                  />

                  <div className="doctor-info" style={{ flex: 1 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                      <h3>{doctor.name}</h3>
                      <div className={`availability-badge ${available ? 'available' : 'unavailable'}`}>
                        {available ? (
                          <>
                            <CheckCircle size={12} />
                            <span>{t('availability')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>{t('unavailable')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="doctor-specialization">{doctor.specialization}</p>

                    <div className="doctor-meta">
                      <span>{doctor.experience} {t('experience')}</span>
                      <div className="flex items-center">
                        <Star size={16} style={{ color: '#fbbf24', fill: 'currentColor' }} />
                        <span style={{ marginLeft: '0.25rem' }}>{doctor.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      <Clock size={16} style={{ marginRight: '0.25rem' }} />
                      <span>{doctor.availableTime}</span>
                    </div>
                  </div>
                </div>

                <div className="doctor-languages">
                  {doctor.languages.map((lang, idx) => (
                    <span key={idx} className="language-tag">
                      {lang}
                    </span>
                  ))}
                </div>

                <div className="doctor-actions" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVideoConsultation(doctor)}
                    disabled={false} // Always enabled for testing
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--primary-500)',
                      color: 'white',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      pointerEvents: 'auto'
                    }}
                  >
                    <Video size={16} style={{ marginRight: '0.5rem' }} />
                    <span>Video Call</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWhatsAppCall(doctor.phone, doctor.name)}
                    disabled={false} // Always enabled for testing
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--secondary-500)',
                      color: 'white',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    <MessageCircle size={16} style={{ marginRight: '0.5rem' }} />
                    <span>{t('consultNow')}</span>
                  </motion.button>

                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`tel:${doctor.phone}`}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem' }}
                  >
                    <Phone size={16} />
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Video Call Booking Modal */}
      {showVideoBooking && selectedDoctor && (
        <SimpleVideoBooking
          doctor={selectedDoctor}
          onClose={closeVideoBooking}
        />
      )}

      {/* Auth Sidebar for Login Prompt */}
      <AuthSidebar
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}