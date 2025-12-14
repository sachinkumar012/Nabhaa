import React, { useState, useEffect } from 'react';
import { Copy, Mail, MessageSquare, Share, Video, Clock, User, Phone } from 'lucide-react';

const VideoCallLink = ({ doctor, patient, onClose }) => {
  const [callId, setCallId] = useState('');
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    // Generate unique call ID
    const uniqueId = generateCallId();
    setCallId(uniqueId);
  }, []);

  const generateCallId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `${doctor.id}-${timestamp}-${randomStr}`;
  };

  const getVideoCallUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/video-call/${callId}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getVideoCallUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getVideoCallUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    const subject = `Video Consultation Invitation - Dr. ${doctor.name}`;
    const body = `Hello Dr. ${doctor.name},

You are invited to join a video consultation session.

Patient: ${patient?.name || 'Patient'}
${scheduledTime ? `Scheduled Time: ${scheduledTime}` : 'Time: At your convenience'}
Specialization Needed: ${doctor.specialization}

Video Call Link: ${getVideoCallUrl()}

Please click the link above to join the consultation when you're ready.

Best regards,
Nabha Health Care`;

    const mailtoUrl = `mailto:${doctor.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleWhatsAppShare = () => {
    const message = `🏥 *Video Consultation Invitation*

Hello Dr. ${doctor.name},

You're invited to join a video consultation:

👤 Patient: ${patient?.name || 'Patient'}
${scheduledTime ? `🕐 Time: ${scheduledTime}` : '🕐 Time: At your convenience'}
🩺 Consultation: ${doctor.specialization}

📹 Join Video Call: ${getVideoCallUrl()}

Click the link when you're ready to start the consultation.

_Nabha Health Care_`;

    const whatsappUrl = `https://wa.me/${doctor.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSShare = () => {
    const message = `Video Consultation - Dr. ${doctor.name}

Join video call: ${getVideoCallUrl()}

Patient: ${patient?.name || 'Patient'}
${scheduledTime ? `Time: ${scheduledTime}` : 'Time: At your convenience'}

- Nabha Health Care`;

    const smsUrl = `sms:${doctor.phone}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

  const handleGenerateLink = () => {
    setLinkGenerated(true);
  };

  const formatCurrentTime = () => {
    return new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <Video size={24} color="#059669" />
            <h2 style={styles.title}>Generate Video Call Link</h2>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        {/* Doctor Info */}
        <div style={styles.doctorInfo}>
          <img 
            src={doctor.image} 
            alt={doctor.name} 
            style={styles.doctorAvatar}
          />
          <div>
            <h3 style={styles.doctorName}>Dr. {doctor.name}</h3>
            <p style={styles.doctorSpec}>{doctor.specialization}</p>
            <p style={styles.doctorExp}>{doctor.experience} years experience</p>
          </div>
        </div>

        {/* Patient Info */}
        <div style={styles.patientInfo}>
          <div style={styles.infoItem}>
            <User size={16} />
            <span>Patient: {patient?.name || 'Walk-in Patient'}</span>
          </div>
          <div style={styles.infoItem}>
            <Clock size={16} />
            <span>Generated: {formatCurrentTime()}</span>
          </div>
        </div>

        {/* Schedule Time (Optional) */}
        <div style={styles.scheduleSection}>
          <label style={styles.label}>Schedule Time (Optional):</label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            style={styles.dateInput}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {!linkGenerated ? (
          <div style={styles.generateSection}>
            <p style={styles.description}>
              Generate a unique video call link to send to Dr. {doctor.name}. 
              The doctor can join the consultation by clicking the link.
            </p>
            <button 
              onClick={handleGenerateLink}
              style={styles.generateButton}
            >
              <Video size={20} />
              Generate Video Call Link
            </button>
          </div>
        ) : (
          <div style={styles.linkSection}>
            {/* Generated Link */}
            <div style={styles.linkContainer}>
              <label style={styles.label}>Video Call Link:</label>
              <div style={styles.linkBox}>
                <span style={styles.linkText}>{getVideoCallUrl()}</span>
                <button 
                  onClick={handleCopyLink}
                  style={{
                    ...styles.copyButton,
                    backgroundColor: copied ? '#059669' : '#374151'
                  }}
                >
                  {copied ? 'Copied!' : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div style={styles.shareSection}>
              <p style={styles.shareTitle}>Share with Doctor:</p>
              <div style={styles.shareButtons}>
                <button 
                  onClick={handleEmailShare}
                  style={styles.shareButton}
                  title="Share via Email"
                >
                  <Mail size={20} />
                  Email
                </button>
                <button 
                  onClick={handleWhatsAppShare}
                  style={{ ...styles.shareButton, backgroundColor: '#25D366' }}
                  title="Share via WhatsApp"
                >
                  <MessageSquare size={20} />
                  WhatsApp
                </button>
                <button 
                  onClick={handleSMSShare}
                  style={styles.shareButton}
                  title="Share via SMS"
                >
                  <Phone size={20} />
                  SMS
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div style={styles.instructions}>
              <h4 style={styles.instructionsTitle}>How it works:</h4>
              <ol style={styles.instructionsList}>
                <li>Share the video call link with Dr. {doctor.name}</li>
                <li>The doctor clicks the link to join the consultation</li>
                <li>Both you and the doctor will be connected in a video call</li>
                <li>You can chat, share screen, and have a full consultation</li>
              </ol>
            </div>

            {/* Patient Join Button */}
            <div style={styles.joinSection}>
              <button 
                onClick={() => {
                  window.open(getVideoCallUrl(), '_blank');
                }}
                style={styles.joinButton}
              >
                <Video size={20} />
                Join Call Now (Patient)
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Close
          </button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0',
  },

  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6b7280',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    margin: '20px 24px',
    borderRadius: '12px',
  },

  doctorAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  doctorName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },

  doctorSpec: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#059669',
    fontWeight: '500',
  },

  doctorExp: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
  },

  patientInfo: {
    padding: '0 24px',
    marginBottom: '20px',
  },

  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },

  scheduleSection: {
    padding: '0 24px',
    marginBottom: '20px',
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },

  dateInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },

  generateSection: {
    padding: '0 24px',
    textAlign: 'center',
  },

  description: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '24px',
  },

  generateButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  linkSection: {
    padding: '0 24px',
  },

  linkContainer: {
    marginBottom: '24px',
  },

  linkBox: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
  },

  linkText: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#f9fafb',
    wordBreak: 'break-all',
  },

  copyButton: {
    padding: '12px 16px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '80px',
    transition: 'background-color 0.2s',
  },

  shareSection: {
    marginBottom: '24px',
  },

  shareTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px',
  },

  shareButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  shareButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#374151',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'transform 0.2s, background-color 0.2s',
    flex: 1,
    justifyContent: 'center',
    minWidth: '120px',
  },

  instructions: {
    backgroundColor: '#f0f9ff',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },

  instructionsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af',
  },

  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#374151',
    fontSize: '14px',
    lineHeight: '1.6',
  },

  joinSection: {
    marginBottom: '20px',
  },

  joinButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  footer: {
    padding: '0 24px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },

  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default VideoCallLink;