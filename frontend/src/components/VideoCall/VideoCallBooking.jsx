import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, MessageCircle, User, MapPin } from 'lucide-react';
import VideoConsultation from './VideoConsultation';
import { useLanguage } from '../../context/LanguageContext';

const VideoCallBooking = ({ doctor, onClose }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState({
    type: 'video',
    date: '',
    time: '',
    reason: '',
    patientInfo: {
      name: '',
      age: '',
      phone: '',
      email: '',
      symptoms: ''
    }
  });
  const [isCallActive, setIsCallActive] = useState(false);
  const [showBooking, setShowBooking] = useState(true);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const consultationTypes = [
    {
      type: 'video',
      title: 'Video Consultation',
      description: 'Face-to-face consultation via video call',
      icon: Video,
      price: '₹500',
      duration: '30 mins'
    },
    {
      type: 'audio',
      title: 'Audio Consultation',
      description: 'Voice-only consultation call',
      icon: Phone,
      price: '₹300',
      duration: '20 mins'
    },
    {
      type: 'chat',
      title: 'Text Consultation',
      description: 'Text-based consultation',
      icon: MessageCircle,
      price: '₹200',
      duration: 'Ongoing'
    }
  ];

  const handleInputChange = (section, field, value) => {
    if (section === 'patientInfo') {
      setAppointmentData(prev => ({
        ...prev,
        patientInfo: {
          ...prev.patientInfo,
          [field]: value
        }
      }));
    } else {
      setAppointmentData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    // Here you would normally send the appointment data to your backend
    console.log('Appointment booked:', appointmentData);
    
    // For video calls, start the call immediately
    if (appointmentData.type === 'video') {
      setIsCallActive(true);
      setShowBooking(false);
    } else {
      // For other types, show confirmation
      alert('Appointment booked successfully! You will receive a confirmation shortly.');
      onClose();
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setShowBooking(false);
    onClose();
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return appointmentData.type;
      case 2: return appointmentData.date && appointmentData.time;
      case 3: return appointmentData.patientInfo.name && 
                     appointmentData.patientInfo.phone && 
                     appointmentData.patientInfo.email;
      default: return true;
    }
  };

  const nextStep = () => {
    if (isStepValid() && step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (isCallActive) {
    return <VideoConsultation doctor={doctor} onEndCall={handleEndCall} isCallActive={isCallActive} />;
  }

  if (!showBooking) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.doctorInfo}>
            <img 
              src={doctor?.image || 'https://via.placeholder.com/60'} 
              alt={doctor?.name} 
              style={styles.doctorImage}
            />
            <div>
              <h2 style={styles.doctorName}>{doctor?.name}</h2>
              <p style={styles.doctorSpecialty}>{doctor?.specialization}</p>
              <div style={styles.doctorMeta}>
                <span style={styles.experience}>{doctor?.experience} years experience</span>
                <div style={styles.rating}>
                  ⭐ {doctor?.rating || '4.8'}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          {[1, 2, 3, 4].map(num => (
            <div
              key={num}
              style={{
                ...styles.progressStep,
                ...(step >= num ? styles.progressStepActive : {})
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={styles.content}>
          {/* Step 1: Consultation Type */}
          {step === 1 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Choose Consultation Type</h3>
              <div style={styles.consultationTypes}>
                {consultationTypes.map(consultation => (
                  <div
                    key={consultation.type}
                    style={{
                      ...styles.consultationType,
                      ...(appointmentData.type === consultation.type ? styles.consultationTypeActive : {})
                    }}
                    onClick={() => handleInputChange(null, 'type', consultation.type)}
                  >
                    <consultation.icon size={24} style={styles.consultationIcon} />
                    <div style={styles.consultationInfo}>
                      <h4 style={styles.consultationTitle}>{consultation.title}</h4>
                      <p style={styles.consultationDescription}>{consultation.description}</p>
                      <div style={styles.consultationMeta}>
                        <span style={styles.price}>{consultation.price}</span>
                        <span style={styles.duration}>{consultation.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Select Date & Time</h3>
              
              <div style={styles.dateTimeContainer}>
                <div style={styles.dateSection}>
                  <label style={styles.label}>
                    <Calendar size={16} />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => handleInputChange(null, 'date', e.target.value)}
                    style={styles.dateInput}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div style={styles.timeSection}>
                  <label style={styles.label}>
                    <Clock size={16} />
                    Available Time Slots
                  </label>
                  <div style={styles.timeSlots}>
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        style={{
                          ...styles.timeSlot,
                          ...(appointmentData.time === time ? styles.timeSlotActive : {})
                        }}
                        onClick={() => handleInputChange(null, 'time', time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.reasonSection}>
                <label style={styles.label}>Reason for Consultation (Optional)</label>
                <textarea
                  value={appointmentData.reason}
                  onChange={(e) => handleInputChange(null, 'reason', e.target.value)}
                  placeholder="Brief description of your concern..."
                  style={styles.reasonInput}
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* Step 3: Patient Information */}
          {step === 3 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Patient Information</h3>
              
              <div style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      value={appointmentData.patientInfo.name}
                      onChange={(e) => handleInputChange('patientInfo', 'name', e.target.value)}
                      style={styles.formInput}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Age</label>
                    <input
                      type="number"
                      value={appointmentData.patientInfo.age}
                      onChange={(e) => handleInputChange('patientInfo', 'age', e.target.value)}
                      style={styles.formInput}
                      placeholder="Your age"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number *</label>
                    <input
                      type="tel"
                      value={appointmentData.patientInfo.phone}
                      onChange={(e) => handleInputChange('patientInfo', 'phone', e.target.value)}
                      style={styles.formInput}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      value={appointmentData.patientInfo.email}
                      onChange={(e) => handleInputChange('patientInfo', 'email', e.target.value)}
                      style={styles.formInput}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Symptoms (Optional)</label>
                  <textarea
                    value={appointmentData.patientInfo.symptoms}
                    onChange={(e) => handleInputChange('patientInfo', 'symptoms', e.target.value)}
                    style={styles.textArea}
                    placeholder="Describe your current symptoms..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div style={styles.step}>
              <h3 style={styles.stepTitle}>Confirm Appointment</h3>
              
              <div style={styles.confirmationCard}>
                <div style={styles.confirmationSection}>
                  <h4 style={styles.confirmationTitle}>Consultation Details</h4>
                  <div style={styles.confirmationItem}>
                    <strong>Type:</strong> {consultationTypes.find(c => c.type === appointmentData.type)?.title}
                  </div>
                  <div style={styles.confirmationItem}>
                    <strong>Date:</strong> {new Date(appointmentData.date).toLocaleDateString()}
                  </div>
                  <div style={styles.confirmationItem}>
                    <strong>Time:</strong> {appointmentData.time}
                  </div>
                  <div style={styles.confirmationItem}>
                    <strong>Fee:</strong> {consultationTypes.find(c => c.type === appointmentData.type)?.price}
                  </div>
                </div>

                <div style={styles.confirmationSection}>
                  <h4 style={styles.confirmationTitle}>Patient Details</h4>
                  <div style={styles.confirmationItem}>
                    <strong>Name:</strong> {appointmentData.patientInfo.name}
                  </div>
                  <div style={styles.confirmationItem}>
                    <strong>Phone:</strong> {appointmentData.patientInfo.phone}
                  </div>
                  <div style={styles.confirmationItem}>
                    <strong>Email:</strong> {appointmentData.patientInfo.email}
                  </div>
                </div>

                <div style={styles.paymentInfo}>
                  <h4 style={styles.confirmationTitle}>Payment Information</h4>
                  <p style={styles.paymentText}>
                    You will be charged {consultationTypes.find(c => c.type === appointmentData.type)?.price} for this consultation.
                    Payment will be processed securely after the appointment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {step > 1 && (
            <button onClick={prevStep} style={styles.backButton}>
              Back
            </button>
          )}
          
          <div style={styles.footerRight}>
            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                style={{
                  ...styles.nextButton,
                  ...(isStepValid() ? {} : styles.nextButtonDisabled)
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={styles.confirmButton}
              >
                {appointmentData.type === 'video' ? 'Start Video Call' : 'Confirm Appointment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    padding: '20px',
  },

  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  doctorInfo: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },

  doctorImage: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  doctorName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
  },

  doctorSpecialty: {
    margin: 0,
    color: '#059669',
    fontSize: '14px',
    fontWeight: '600',
  },

  doctorMeta: {
    display: 'flex',
    gap: '16px',
    marginTop: '4px',
  },

  experience: {
    fontSize: '12px',
    color: '#6b7280',
  },

  rating: {
    fontSize: '12px',
    color: '#f59e0b',
    fontWeight: '600',
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },

  progressBar: {
    display: 'flex',
    padding: '20px 24px',
    gap: '8px',
  },

  progressStep: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
  },

  progressStepActive: {
    backgroundColor: '#059669',
    color: '#059669',
  },

  content: {
    flex: 1,
    padding: '0 24px',
    overflowY: 'auto',
  },

  step: {
    paddingBottom: '24px',
  },

  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px',
  },

  consultationTypes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  consultationType: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  consultationTypeActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },

  consultationIcon: {
    color: '#059669',
    marginTop: '4px',
  },

  consultationInfo: {
    flex: 1,
  },

  consultationTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },

  consultationDescription: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#6b7280',
  },

  consultationMeta: {
    display: 'flex',
    gap: '16px',
  },

  price: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#059669',
  },

  duration: {
    fontSize: '14px',
    color: '#6b7280',
  },

  dateTimeContainer: {
    display: 'grid',
    gap: '24px',
    marginBottom: '24px',
  },

  dateSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  timeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },

  dateInput: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },

  timeSlots: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '8px',
  },

  timeSlot: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  timeSlotActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
    color: 'white',
  },

  reasonSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  reasonInput: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  formInput: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },

  textArea: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
  },

  confirmationCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#f9fafb',
  },

  confirmationSection: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },

  confirmationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px',
  },

  confirmationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#374151',
    marginBottom: '8px',
  },

  paymentInfo: {
    marginBottom: '0',
    paddingBottom: '0',
    border: 'none',
  },

  paymentText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0,
  },

  footer: {
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },

  footerRight: {
    display: 'flex',
    gap: '12px',
  },

  nextButton: {
    padding: '10px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },

  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },

  confirmButton: {
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default VideoCallBooking;