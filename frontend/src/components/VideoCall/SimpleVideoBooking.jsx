import React, { useState } from 'react';
import VideoCallLink from './VideoCallLink';
import socket from '../../utils/socket';
import api from '../../services/api';

const SimpleVideoBooking = ({ doctor, onClose }) => {
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  console.log('SimpleVideoBooking rendered with doctor:', doctor);

  // Mock patient data - in a real app, this would come from authentication
  const currentPatient = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    id: 'patient_123'
  };

  const handleStartVideoCall = () => {
    setShowLinkGenerator(true);
  };

  const handleInstantCall = async () => {
    // For instant call, generate a call ID and redirect both users
    const callId = `instant-${doctor.id}-${Date.now().toString(36)}`;
    const callUrl = `${window.location.origin}/video-call/${callId}?type=patient&name=${encodeURIComponent(currentPatient.name)}`;

    // Open window IMMEDIATELY to avoid popup blockers
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('Loading video call room... Please wait.');
    } else {
      alert('Please allow popups for this site to start the call.');
      return;
    }

    try {
      // Create appointment in backend
      await api.post('/appointments', {
        name: currentPatient.name,
        email: currentPatient.email,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: 'Instant Video Consultation',
        doctorId: doctor.id,
        type: 'instant',
        videoCallId: callId
      });

      // Emit event to inform doctor
      if (doctor && doctor.id) {
        // console.log('Emitting call_doctor to:', doctor.id);
        socket.emit('call_doctor', {
          doctorId: doctor.id,
          patientName: currentPatient.name,
          callId: callId
        });
      }

      // Redirect the opened window to the actual call URL
      if (newWindow) {
        newWindow.location.href = callUrl;
      }

      // Close the modal
      onClose();

    } catch (error) {
      console.error("Failed to start instant call:", error);
      if (newWindow) newWindow.close(); // Close the window if starting failed
      alert("Failed to start call. Please try again.");
    }
  };

  if (showLinkGenerator) {
    return (
      <VideoCallLink
        doctor={doctor}
        patient={currentPatient}
        onClose={() => {
          setShowLinkGenerator(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        margin: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            Video Consultation Options
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {/* Doctor Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <img
            src={doctor?.image}
            alt={doctor?.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
              Dr. {doctor?.name}
            </h3>
            <p style={{ margin: '0 0 4px 0', color: '#059669', fontSize: '14px', fontWeight: '500' }}>
              {doctor?.specialization}
            </p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
              {doctor?.experience} years experience
            </p>
          </div>
        </div>

        {/* Call Options */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Choose consultation method:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Generate Link Option */}
            <div
              style={{
                padding: '16px',
                border: selectedOption === 'link' ? '2px solid #059669' : '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: selectedOption === 'link' ? '#f0f9ff' : 'white',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedOption('link')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="radio"
                  checked={selectedOption === 'link'}
                  onChange={() => setSelectedOption('link')}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                    📧 Generate & Share Link
                  </h5>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                    Create a video call link and send it to the doctor via email, WhatsApp, or SMS.
                    Perfect for scheduled consultations.
                  </p>
                </div>
              </div>
            </div>

            {/* Instant Call Option */}
            <div
              style={{
                padding: '16px',
                border: selectedOption === 'instant' ? '2px solid #059669' : '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: selectedOption === 'instant' ? '#f0f9ff' : 'white',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedOption('instant')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="radio"
                  checked={selectedOption === 'instant'}
                  onChange={() => setSelectedOption('instant')}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                    🚀 Start Instant Call
                  </h5>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                    Join a video call room immediately. You can share the room link with the doctor
                    to join you when they're available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedOption === 'link') {
                handleStartVideoCall();
              } else if (selectedOption === 'instant') {
                handleInstantCall();
              } else {
                alert('Please select a consultation method');
              }
            }}
            disabled={!selectedOption}
            style={{
              flex: 2,
              padding: '14px 24px',
              backgroundColor: selectedOption ? '#059669' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
          >
            {selectedOption === 'link' ? '📧 Generate Link' :
              selectedOption === 'instant' ? '🚀 Start Call Now' :
                'Select Option'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleVideoBooking;