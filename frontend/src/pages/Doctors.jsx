import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Phone, MessageCircle, CheckCircle, XCircle, Video, Users, User, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthSidebar from '../components/Auth/AuthSidebar';
import SimpleVideoBooking from '../components/VideoCall/SimpleVideoBooking';
import api from '../services/api';


export default function Doctors() {
  const { t } = useTranslation();
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

  // Doctor WhatsApp number map — add more doctors here as needed
  const DOCTOR_WHATSAPP_MAP = {
    'Dr. Harpreet Singh':  '919318496221',
    'Dr. Navneet Kaur': '918235254195',
  };
  const DEFAULT_WHATSAPP = '919318496221'; // fallback number

  const handleConsultNow = (doctor) => {
    // Look up number by name, fallback to default
    const phone = DOCTOR_WHATSAPP_MAP[doctor.name] || DEFAULT_WHATSAPP;

    const message = encodeURIComponent(
      `🏥 *Consultation Request - Nabhaa Healthcare*\n\n` +
      `Hello Dr. ${doctor.name}, I would like to book a consultation with you.\n\n` +
      `📋 *My Request:*\n` +
      `• Doctor: ${doctor.name}\n` +
      `• Specialization: ${doctor.specialization}\n` +
      `• Experience: ${doctor.experience}\n` +
      `• Preferred Time: ${doctor.availableTime}\n\n` +
      `Please confirm my appointment. Thank you! 🙏`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
                    onClick={() => handleConsultNow(doctor)}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      backgroundColor: '#25D366',
                      color: 'white',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      borderRadius: '0.75rem'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
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