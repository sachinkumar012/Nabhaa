import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  User,
  Stethoscope,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';
import PropTypes from 'prop-types';
import VideoCallService from '../../services/VideoCallService';
import NotificationService from '../../services/NotificationService';
import VideoConsultation from '../VideoCall/VideoConsultation';

const DoctorDashboard = ({ doctor }) => {
  const [videoCallService] = useState(() => new VideoCallService());
  const [notificationService] = useState(() => new NotificationService());
  const [isOnline, setIsOnline] = useState(false);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    initializeServices();
    return () => {
      videoCallService.disconnect();
    };
  }, [initializeServices, videoCallService]);

  const initializeServices = async () => {
    try {
      // Initialize video call service
      await videoCallService.initializeSocket();
      
      // Request notification permission
      await notificationService.requestPermission();
      
      // Setup event listeners
      setupVideoCallListeners();
      
      // Register doctor as online
      await registerDoctorOnline();
      
    } catch (error) {
      console.error('Failed to initialize services:', error);
      addNotification('Failed to connect to server', 'error');
    }
  };

  const setupVideoCallListeners = () => {
    // Incoming call
    videoCallService.onIncomingCall = (callData) => {
      console.log('📞 Incoming call:', callData);
      setIncomingCalls(prev => [...prev, callData]);
      
      // Show notification
      notificationService.showIncomingCallNotification(callData);
      notificationService.playRingtone();
      
      addNotification(`Incoming call from ${callData.patientInfo.name}`, 'call');
    };

    // Call accepted
    videoCallService.onCallAccepted = (callData) => {
      console.log('✅ Call accepted:', callData);
      setActiveCall(callData);
      setIncomingCalls(prev => prev.filter(call => call.roomId !== callData.roomId));
      notificationService.stopRingtone();
    };

    // Call ended
    videoCallService.onCallEnded = (callData) => {
      console.log('📱 Call ended:', callData);
      setActiveCall(null);
      notificationService.stopRingtone();
      notificationService.showCallEndedNotification(callData.duration || 0);
      addNotification('Call ended', 'info');
    };

    // Connection state changes
    videoCallService.onConnectionStateChange = (state) => {
      console.log('🔗 Connection state:', state);
      if (state === 'connected') {
        addNotification('Video call connected', 'success');
      } else if (state === 'disconnected') {
        addNotification('Call disconnected', 'warning');
      }
    };

    // Errors
    videoCallService.onError = (error) => {
      console.error('❌ Video call error:', error);
      addNotification('Video call error occurred', 'error');
    };
  };

  const registerDoctorOnline = async () => {
    try {
      videoCallService.socket.emit('doctor-online', {
        doctorId: doctor.id,
        doctorInfo: {
          id: doctor.id,
          name: doctor.name,
          specialization: doctor.specialization,
          experience: doctor.experience,
          rating: doctor.rating,
          image: doctor.image
        }
      });
      
      setIsOnline(true);
      addNotification('You are now online and available for video calls', 'success');
      
    } catch (error) {
      console.error('Failed to register doctor online:', error);
      addNotification('Failed to go online', 'error');
    }
  };

  const toggleOnlineStatus = async () => {
    if (isOnline) {
      videoCallService.socket.emit('doctor-offline', { doctorId: doctor.id });
      setIsOnline(false);
      addNotification('You are now offline', 'info');
    } else {
      await registerDoctorOnline();
    }
  };

  const acceptCall = async (callData) => {
    try {
      console.log('✅ Accepting call:', callData.roomId);
      
      const result = await videoCallService.acceptCall(callData.roomId, {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization
      });
      
      if (result.success) {
        setActiveCall({
          ...callData,
          localStream: result.localStream,
          isActive: true
        });
        setIncomingCalls(prev => prev.filter(call => call.roomId !== callData.roomId));
        notificationService.stopRingtone();
      }
      
    } catch (error) {
      console.error('Failed to accept call:', error);
      addNotification('Failed to accept call', 'error');
    }
  };

  const declineCall = (callData) => {
    console.log('❌ Declining call:', callData.roomId);
    
    videoCallService.socket.emit('decline-call', {
      roomId: callData.roomId,
      doctorId: doctor.id,
      reason: 'Doctor declined the call'
    });
    
    setIncomingCalls(prev => prev.filter(call => call.roomId !== callData.roomId));
    notificationService.stopRingtone();
    addNotification('Call declined', 'info');
  };

  const endCall = () => {
    if (activeCall) {
      videoCallService.endCall();
      setActiveCall(null);
      addNotification('Call ended', 'info');
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  if (activeCall?.isActive) {
    return (
      <VideoConsultation
        doctor={doctor}
        patient={activeCall.patientInfo}
        isCallActive={true}
        onEndCall={endCall}
        videoCallService={videoCallService}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.doctorInfo}>
          <img src={doctor.image} alt={doctor.name} style={styles.doctorAvatar} />
          <div>
            <h2 style={styles.doctorName}>Dr. {doctor.name}</h2>
            <p style={styles.doctorSpecialty}>{doctor.specialization}</p>
          </div>
        </div>
        
        <div style={styles.statusControls}>
          <div style={{
            ...styles.statusBadge,
            ...(isOnline ? styles.statusOnline : styles.statusOffline)
          }}>
            <div style={styles.statusDot}></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          
          <button
            onClick={toggleOnlineStatus}
            style={{
              ...styles.toggleButton,
              backgroundColor: isOnline ? '#dc2626' : '#059669'
            }}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.notifications}>
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                ...styles.notification,
                borderLeft: `4px solid ${getNotificationColor(notification.type)}`
              }}
            >
              <div style={styles.notificationContent}>
                {getNotificationIcon(notification.type)}
                <span>{notification.message}</span>
              </div>
              <span style={styles.notificationTime}>
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Incoming Calls */}
      <div style={styles.incomingCallsSection}>
        <h3 style={styles.sectionTitle}>
          <Bell size={20} />
          Incoming Calls ({incomingCalls.length})
        </h3>
        
        <AnimatePresence>
          {incomingCalls.map(call => (
            <motion.div
              key={call.roomId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={styles.incomingCall}
            >
              <div style={styles.callerInfo}>
                <div style={styles.callerAvatar}>
                  <User size={24} />
                </div>
                <div>
                  <h4 style={styles.callerName}>{call.patientInfo.name}</h4>
                  <p style={styles.callerDetails}>
                    Age: {call.patientInfo.age} | Phone: {call.patientInfo.phone}
                  </p>
                  {call.patientInfo.symptoms && (
                    <p style={styles.symptoms}>
                      Symptoms: {call.patientInfo.symptoms}
                    </p>
                  )}
                </div>
              </div>
              
              <div style={styles.callActions}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => acceptCall(call)}
                  style={styles.acceptButton}
                >
                  <Video size={20} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => declineCall(call)}
                  style={styles.declineButton}
                >
                  <PhoneOff size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {incomingCalls.length === 0 && (
          <div style={styles.noCallsMessage}>
            <Stethoscope size={48} style={{ opacity: 0.3 }} />
            <p>No incoming calls</p>
            <p style={{ fontSize: '14px', opacity: 0.6 }}>
              {isOnline ? 'Waiting for patient calls...' : 'Go online to receive calls'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success': return '#059669';
    case 'error': return '#dc2626';
    case 'warning': return '#f59e0b';
    case 'call': return '#3b82f6';
    default: return '#6b7280';
  }
};

const getNotificationIcon = (type) => {
  const iconSize = 16;
  const iconColor = getNotificationColor(type);
  
  switch (type) {
    case 'success': return <CheckCircle size={iconSize} style={{ color: iconColor }} />;
    case 'error': return <XCircle size={iconSize} style={{ color: iconColor }} />;
    case 'warning': return <Bell size={iconSize} style={{ color: iconColor }} />;
    case 'call': return <Phone size={iconSize} style={{ color: iconColor }} />;
    default: return <Bell size={iconSize} style={{ color: iconColor }} />;
  }
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },

  header: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  doctorAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  doctorName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
  },

  doctorSpecialty: {
    margin: 0,
    color: '#059669',
    fontSize: '16px',
    fontWeight: '500',
  },

  statusControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },

  statusOnline: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
  },

  statusOffline: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },

  toggleButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  notifications: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  notification: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '300px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notificationContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },

  notificationTime: {
    fontSize: '12px',
    color: '#6b7280',
  },

  incomingCallsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
  },

  incomingCall: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    marginBottom: '16px',
    backgroundColor: '#eff6ff',
  },

  callerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  callerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },

  callerName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },

  callerDetails: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#6b7280',
  },

  symptoms: {
    margin: 0,
    fontSize: '14px',
    color: '#059669',
    fontStyle: 'italic',
  },

  callActions: {
    display: 'flex',
    gap: '12px',
  },

  acceptButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#059669',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  declineButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#dc2626',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  noCallsMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
};

DoctorDashboard.propTypes = {
  doctor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    specialization: PropTypes.string.isRequired,
    experience: PropTypes.string,
    rating: PropTypes.number,
    image: PropTypes.string,
  }).isRequired,
};

export default DoctorDashboard;
