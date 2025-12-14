import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Phone, MessageCircle, CheckCircle, XCircle, Video } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SimpleVideoBooking from '../components/VideoCall/SimpleVideoBooking';

export default function Doctors() {
  const { t } = useLanguage();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showVideoBooking, setShowVideoBooking] = useState(false);
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Sachin Kumar',
      specialization: 'General Medicine',
      experience: 15,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      languages: ['English', 'Hindi', 'Punjabi'],
      phone: '+91 9318496221',
      availableTime: '9:00 AM - 6:00 PM',
    },
    {
      id: 2,
      name: 'Dr. Tarun Thakur',
      specialization: 'Pediatrics',
      experience: 12,
      rating: 4.9,
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: false,
      languages: ['English', 'Hindi'],
      phone: '+91 98765 43211',
      availableTime: '6:00 AM - 4:00 PM',
    },
    {
      id: 3,
      name: 'Dr. Fouziya Siddiqui',
      specialization: 'Gynecology',
      experience: 20,
      rating: 4.7,
      image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      languages: ['English', 'Punjabi'],
      phone: '+91 98765 43212',
      availableTime: '11:00 AM - 7:00 PM',
    },
    {
      id: 4,
      name: 'Dr. Kamaljeet Kaur',
      specialization: 'Dermatology',
      experience: 18,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      languages: ['English', 'Hindi', 'Punjabi'],
      phone: '+91 98765 43213',
      availableTime: '9:00 AM - 5:00 PM',
    },
       {
      id: 5,
      name: 'Dr. Manish Sharma',
      specialization: 'Cardiology',
      experience: 18,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      languages: ['English', 'Hindi', 'Punjabi'],
      phone: '+91 98765 43213',
      availableTime: '2:00 AM - 3:00 AM',
    },
    
       {
      id: 6,
      name: 'Dr. Shashank',
      specialization: 'Orthopaedics',
      experience: 18,
      rating: 4.8,
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      languages: ['English', 'Hindi', 'Punjabi'],
      phone: '+91 98765 43213',
      availableTime: '9:00 AM - 5:00 PM',
    },
  ]);

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