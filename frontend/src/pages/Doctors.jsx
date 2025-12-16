import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Phone, MessageCircle, CheckCircle, XCircle, Video } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SimpleVideoBooking from '../components/VideoCall/SimpleVideoBooking';

export default function Doctors() {
  const { t } = useLanguage();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showVideoBooking, setShowVideoBooking] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await import('../services/api').then(module => module.default.get('/doctors'));
        if (response.data.success) {
          // Transform data if necessary, or just use as is. 
          // Backend returns { _id, name, specialty, ... }
          // Component expects id, name, ...
          // We can map _id to id
          const mappedDoctors = response.data.data.map(doc => ({
            ...doc,
            id: doc._id,
            // Ensure image exists or use fallback
            image: doc.image || 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
            available: true, // Default to true for now as backend doesn't track real-time status yet
            availableTime: '9:00 AM - 6:00 PM', // Default
            languages: ['English', 'Hindi'] // Default
          }));
          setDoctors(mappedDoctors);
        }
      } catch (error) {
        console.error("Failed to fetch doctors", error);
        // Fallback to mock if failed? Or just show error. 
        // For User experience let's fallback to empty for now or keep mock if needed.
        // But the goal is to test signaling, so we NEED real IDs.
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
    <div className="min-h-screen bg-light" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem' }}
        >
          <h1>{t('doctorsList')}</h1>
          <p className="text-gray-600">
            Connect with experienced doctors who understand rural healthcare needs
          </p>
        </motion.div>

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
    </div>
  );
}