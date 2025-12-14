import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  User,
  Monitor,
  Settings,
  Copy,
  Share2,
  Users,
  Clock
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoCallRoom = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [userType, setUserType] = useState(''); // 'patient' or 'doctor'
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const chatRef = useRef(null);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (isCallStarted && connectionStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallStarted, connectionStatus]);

  // Initialize user and setup call
  useEffect(() => {
    if (!callId) {
      navigate('/doctors');
      return;
    }
    
    initializeUser();
    joinCallRoom();
    
    return () => {
      cleanup();
    };
  }, [callId]);

  const initializeUser = () => {
    // Check if user is coming from doctor link or patient
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'patient';
    const name = urlParams.get('name') || (type === 'doctor' ? 'Doctor' : 'Patient');
    
    setUserType(type);
    setUserName(name);
  };

  const joinCallRoom = async () => {
    try {
      setConnectionStatus('connecting');
      setWaitingMessage('Connecting to call room...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add current user to participants
      const currentUser = {
        id: generateUserId(),
        name: userName,
        type: userType,
        isLocal: true
      };
      
      setParticipants([currentUser]);
      setConnectionStatus('waiting');
      setWaitingMessage(`Waiting for ${userType === 'patient' ? 'doctor' : 'patient'} to join...`);
      
      // Simulate other participant joining after 3 seconds
      setTimeout(() => {
        simulateParticipantJoin();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to join call room:', error);
      setConnectionStatus('failed');
      setWaitingMessage('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const simulateParticipantJoin = () => {
    const otherUser = {
      id: generateUserId(),
      name: userType === 'patient' ? 'Dr. Sachin Kumar' : 'Patient',
      type: userType === 'patient' ? 'doctor' : 'patient',
      isLocal: false
    };
    
    setParticipants(prev => [...prev, otherUser]);
    setConnectionStatus('connected');
    setIsCallStarted(true);
    setWaitingMessage('');
    
    // Simulate receiving remote video stream
    setTimeout(() => {
      if (remoteVideoRef.current) {
        // In a real implementation, this would be the remote stream
        remoteVideoRef.current.style.backgroundColor = '#374151';
      }
    }, 1000);
  };

  const generateUserId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleToggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
        
        setIsScreenSharing(true);
      } else {
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share failed:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        id: Date.now(),
        message: newMessage,
        sender: userName,
        senderType: userType,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, messageData]);
      setNewMessage('');
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleEndCall = () => {
    cleanup();
    navigate('/doctors');
  };

  const handleCopyRoomLink = async () => {
    try {
      const roomUrl = window.location.href;
      await navigator.clipboard.writeText(roomUrl);
      alert('Room link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#059669';
      case 'connecting': return '#f59e0b';
      case 'waiting': return '#3b82f6';
      case 'failed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.callInfo}>
          <div style={styles.roomInfo}>
            <Video size={20} />
            <div>
              <h3 style={styles.roomTitle}>Video Consultation</h3>
              <p style={styles.roomId}>Room: {callId}</p>
            </div>
          </div>
          
          <div style={styles.participantsList}>
            <Users size={16} />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div style={styles.callStatus}>
            <div style={{
              ...styles.statusIndicator,
              backgroundColor: getConnectionStatusColor()
            }}></div>
            <span style={styles.statusText}>
              {isCallStarted ? formatTime(callDuration) : connectionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Video area */}
      <div style={styles.videoArea}>
        {/* Remote video */}
        <div style={styles.remoteVideoContainer}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.remoteVideo}
          />
          
          {!isCallStarted && (
            <div style={styles.waitingScreen}>
              <div style={styles.waitingContent}>
                <div style={styles.spinner}></div>
                <h2 style={styles.waitingTitle}>{waitingMessage}</h2>
                <p style={styles.waitingSubtext}>
                  Share the room link with the other participant to start the consultation
                </p>
                <button 
                  onClick={handleCopyRoomLink}
                  style={styles.copyLinkButton}
                >
                  <Copy size={20} />
                  Copy Room Link
                </button>
              </div>
            </div>
          )}
          
          {isCallStarted && !remoteStreamRef.current && (
            <div style={styles.noVideoPlaceholder}>
              <User size={64} />
              <p>Waiting for {userType === 'patient' ? 'doctor' : 'patient'} video...</p>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <div style={styles.localVideoContainer}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={styles.localVideo}
          />
          {!isVideoEnabled && (
            <div style={styles.videoOffIndicator}>
              <VideoOff size={24} />
            </div>
          )}
          <div style={styles.localVideoLabel}>
            You ({userType})
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div style={styles.chatSidebar}>
            <div style={styles.chatHeader}>
              <MessageSquare size={20} />
              <span>Chat</span>
              <button 
                onClick={() => setShowChat(false)}
                style={styles.closeChatButton}
              >
                ×
              </button>
            </div>
            
            <div ref={chatRef} style={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    ...styles.chatMessage,
                    alignSelf: msg.senderType === userType ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={styles.messageSender}>
                    {msg.sender} ({msg.senderType})
                  </div>
                  <div style={styles.messageText}>{msg.message}</div>
                  <div style={styles.messageTime}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={styles.chatInput}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                style={styles.messageInput}
              />
              <button onClick={handleSendMessage} style={styles.sendButton}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div style={styles.controlBar}>
        <div style={styles.controlGroup}>
          {/* Audio toggle */}
          <button
            onClick={handleToggleAudio}
            style={{
              ...styles.controlButton,
              backgroundColor: isAudioEnabled ? '#374151' : '#dc2626'
            }}
            title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Video toggle */}
          <button
            onClick={handleToggleVideo}
            style={{
              ...styles.controlButton,
              backgroundColor: isVideoEnabled ? '#374151' : '#dc2626'
            }}
            title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen share */}
          <button
            onClick={handleScreenShare}
            style={{
              ...styles.controlButton,
              backgroundColor: isScreenSharing ? '#059669' : '#374151'
            }}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor size={20} />
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              ...styles.controlButton,
              backgroundColor: showChat ? '#059669' : '#374151'
            }}
            title="Toggle Chat"
          >
            <MessageSquare size={20} />
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopyRoomLink}
            style={styles.controlButton}
            title="Copy Room Link"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* End call button */}
        <button
          onClick={handleEndCall}
          style={styles.endCallButton}
          title="End Call"
        >
          <PhoneOff size={20} />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1f2937',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
  },

  header: {
    backgroundColor: '#374151',
    padding: '16px 24px',
    borderBottom: '1px solid #4b5563',
    color: 'white',
  },

  callInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  roomInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  roomTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
  },

  roomId: {
    margin: 0,
    fontSize: '12px',
    opacity: 0.8,
  },

  participantsList: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
  },

  callStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },

  statusText: {
    fontSize: '14px',
    fontWeight: '500',
  },

  videoArea: {
    flex: 1,
    position: 'relative',
    display: 'flex',
  },

  remoteVideoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#111827',
  },

  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  waitingScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },

  waitingContent: {
    textAlign: 'center',
    color: 'white',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #374151',
    borderTop: '4px solid #059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },

  waitingTitle: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },

  waitingSubtext: {
    fontSize: '16px',
    opacity: 0.8,
    margin: '0 0 24px 0',
  },

  copyLinkButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    margin: '0 auto',
  },

  noVideoPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: 'white',
    opacity: 0.7,
  },

  localVideoContainer: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '240px',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#374151',
    border: '2px solid #059669',
    zIndex: 10,
  },

  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror effect for selfie view
  },

  localVideoLabel: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },

  videoOffIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '50%',
    padding: '12px',
  },

  chatSidebar: {
    width: '300px',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #e5e7eb',
  },

  chatHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  closeChatButton: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
  },

  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
  },

  chatMessage: {
    padding: '8px 12px',
    borderRadius: '8px',
    maxWidth: '80%',
    backgroundColor: '#f3f4f6',
  },

  messageSender: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#059669',
    marginBottom: '4px',
  },

  messageText: {
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '4px',
  },

  messageTime: {
    fontSize: '12px',
    color: '#6b7280',
  },

  chatInput: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '8px',
  },

  messageInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },

  sendButton: {
    padding: '8px 16px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },

  controlBar: {
    backgroundColor: '#374151',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #4b5563',
  },

  controlGroup: {
    display: 'flex',
    gap: '12px',
  },

  controlButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    backgroundColor: '#374151',
  },

  endCallButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
};

// Add spinner animation
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleElement);

export default VideoCallRoom;