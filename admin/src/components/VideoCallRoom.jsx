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
    Copy,
    Share2,
    Users
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket'; // Changed path for Admin

const VideoCallRoom = () => {
    const { callId } = useParams();
    const navigate = useNavigate();

    // Note: specific Doctor Auth context might be needed if we want specific names
    // For now, checking token presence.

    const [localStream, setLocalStream] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [callDuration, setCallDuration] = useState(0);

    // Connection States
    const [connectionStatus, setConnectionStatus] = useState('initializing');
    const [waitingMessage, setWaitingMessage] = useState('Initializing secure connection...');
    const [isCallStarted, setIsCallStarted] = useState(false);

    // User Info
    const [userName, setUserName] = useState('');
    const [userType, setUserType] = useState('doctor');

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const chatRef = useRef(null);

    // WebRTC connection references
    const peerConnection = useRef(null);
    const iceCandidatesQueue = useRef([]);

    // Keep-alive interval ref
    const keepAliveRef = useRef(null);

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

    useEffect(() => {
        if (!callId) {
            navigate('/doctor-dashboard');
            return;
        }

        // AUTH CHECK (Doctor or Admin)
        const doctorToken = localStorage.getItem('doctorToken');
        const adminToken = localStorage.getItem('adminToken');
        if (!doctorToken && !adminToken) {
            alert("Please login to join the consultation.");
            navigate('/login');
            return;
        }
        
        // We can fetch the name from localStorage if stored, or default
        const storedInfo = localStorage.getItem('doctorInfo');
        // Assuming doctorInfo might be stored as JSON string
        let drName = 'Doctor';
        try {
            if (storedInfo) {
                const parsed = JSON.parse(storedInfo);
                if (parsed.name) drName = parsed.name;
            } else if (adminToken) {
                drName = 'Admin';
            }
        } catch (e) { /* ignore */ }

        setUserName(drName);
        setUserType(adminToken && !doctorToken ? 'admin' : 'doctor');
        // AUTH CHECK END

        // Socket Listeners
        socket.on('user-connected', (userId) => {
            console.log('User connected:', userId);
            setParticipants(prev => {
                if (!prev.find(p => p.id === userId)) {
                    return [...prev, { id: userId, name: 'Patient', type: 'patient', isLocal: false }];
                }
                return prev;
            });
            connectToNewUser(userId, localStreamRef.current);
        });

        socket.on('user-disconnected', (userId) => {
            console.log('User disconnected:', userId);
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            setParticipants(prev => prev.filter(p => p.id !== userId));
            setConnectionStatus('waiting');
            setIsCallStarted(false);
            setWaitingMessage('Patient disconnected. Waiting...');
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        });

        socket.on('receive-offer', async (offer) => {
            console.log('socket: receive-offer', offer);
            if (!peerConnection.current) createPeerConnection();

            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

                while (iceCandidatesQueue.current.length > 0) {
                    const candidate = iceCandidatesQueue.current.shift();
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }

                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                console.log('sending answer');
                socket.emit('answer', { answer, roomId: callId });
                setConnectionStatus('connected');
                setIsCallStarted(true);
                setWaitingMessage('');
            } catch (err) {
                console.error("Error creating answer:", err);
            }
        });

        socket.on('receive-answer', async (answer) => {
            console.log('socket: receive-answer', answer);
            if (peerConnection.current) {
                try {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                    setConnectionStatus('connected');
                    setIsCallStarted(true);
                    setWaitingMessage('');
                } catch (err) {
                    console.error("Error setting remote description:", err);
                }
            }
        });

        socket.on('receive-ice-candidate', async (candidate) => {
            if (peerConnection.current) {
                if (peerConnection.current.remoteDescription) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                    iceCandidatesQueue.current.push(candidate);
                }
            }
        });

        startCall();

        return () => {
            cleanup();
            socket.off('user-connected');
            socket.off('user-disconnected');
            socket.off('receive-offer');
            socket.off('receive-answer');
            socket.off('receive-ice-candidate');
            socket.emit('leave-room', callId);
        };
    }, [callId]);

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, roomId: callId });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peerConnection.current = pc;
        return pc;
    };

    const startCall = async () => {
        try {
            setConnectionStatus('connecting');
            setWaitingMessage('Accessing camera and microphone...');

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Generate a temporary user ID for this session or use actual if in token
            const myId = 'doc_' + Math.random().toString(36).substr(2, 9);
            const currentUser = {
                id: myId,
                name: userName,
                type: 'doctor',
                isLocal: true
            };
            setParticipants([currentUser]);

            // Join the signaling room
            console.log('Joining room:', callId);
            socket.emit('join-room', { roomId: callId, userId: myId });

            setConnectionStatus('waiting');
            setWaitingMessage(`Waiting for patient to join...`);

        } catch (error) {
            console.error("Error accessing media:", error);
            setConnectionStatus('failed');
            setWaitingMessage('Could not access camera/microphone');
        }
    };

    const connectToNewUser = async (userId, stream) => {
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { offer, roomId: callId });
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
        // Implementation same as frontend
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

                if (peerConnection.current) {
                    const senders = peerConnection.current.getSenders();
                    const sender = senders.find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        await sender.replaceTrack(videoTrack);
                    }
                }

                videoTrack.onended = () => {
                    setIsScreenSharing(false);
                    const cameraTrack = localStreamRef.current.getVideoTracks()[0];
                    if (localVideoRef.current && localStreamRef.current) {
                        localVideoRef.current.srcObject = localStreamRef.current;
                    }
                    if (peerConnection.current) {
                        const senders = peerConnection.current.getSenders();
                        const sender = senders.find(s => s.track && s.track.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(cameraTrack);
                        }
                    }
                };

                setIsScreenSharing(true);
            } else {
                const cameraTrack = localStreamRef.current.getVideoTracks()[0];
                if (localVideoRef.current && localStreamRef.current) {
                    localVideoRef.current.srcObject = localStreamRef.current;
                }
                if (peerConnection.current) {
                    const senders = peerConnection.current.getSenders();
                    const sender = senders.find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(cameraTrack);
                    }
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
            setTimeout(() => {
                if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }, 100);
        }
    };

    const handleEndCall = () => {
        cleanup();
        navigate('/doctor-dashboard');
    };

    const cleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        socket.emit('leave-room', callId);
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

    // Styles (simplified reused object)
    const styles = {
        container: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#1f2937', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' },
        header: { backgroundColor: '#374151', padding: '16px 24px', borderBottom: '1px solid #4b5563', color: 'white' },
        callInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        roomInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
        roomTitle: { margin: 0, fontSize: '18px', fontWeight: '600' },
        roomId: { margin: 0, fontSize: '12px', opacity: 0.8 },
        participantsList: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' },
        callStatus: { display: 'flex', alignItems: 'center', gap: '8px' },
        statusIndicator: { width: '8px', height: '8px', borderRadius: '50%' },
        statusText: { fontSize: '14px', fontWeight: '500' },
        videoArea: { flex: 1, position: 'relative', display: 'flex', minHeight: 0, overflow: 'hidden' },
        remoteVideoContainer: { flex: 1, position: 'relative', backgroundColor: '#111827', minHeight: 0, overflow: 'hidden' },
        remoteVideo: { width: '100%', height: '100%', objectFit: 'cover' },
        waitingScreen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' },
        waitingContent: { textAlign: 'center', color: 'white' },
        spinner: { width: '40px', height: '40px', border: '4px solid #374151', borderTop: '4px solid #059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
        waitingTitle: { fontSize: '24px', fontWeight: '600', margin: '0 0 12px 0' },
        waitingSubtext: { fontSize: '16px', opacity: 0.8, margin: '0 0 24px 0' },
        copyLinkButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', margin: '0 auto' },
        noVideoPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        localVideoContainer: { position: 'absolute', bottom: '24px', right: '24px', width: '240px', height: '180px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', backgroundColor: '#374151' },
        localVideo: { width: '100%', height: '100%', objectFit: 'cover' },
        videoOffIndicator: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#374151' },
        localVideoLabel: { position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' },
        controlBar: { padding: '24px', backgroundColor: '#1f2937', color: 'white', display: 'flex', justifyContent: 'center', gap: '24px' },
        controlGroup: { display: 'flex', gap: '16px' },
        controlButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer', transition: 'background-color 0.2s' },
        endCallButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', height: '48px', borderRadius: '24px', backgroundColor: '#dc2626', color: 'white', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
        chatSidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '320px', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', zIndex: 10 },
        chatHeader: { padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600' },
        closeChatButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' },
        chatMessages: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
        chatMessage: { maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', position: 'relative' },
        messageSender: { fontSize: '10px', opacity: 0.7, marginBottom: '4px' },
        messageText: { fontSize: '14px' },
        messageTime: { fontSize: '10px', opacity: 0.5, marginTop: '4px', textAlign: 'right' },
        chatInput: { padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' },
        messageInput: { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' },
        sendButton: { padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.callInfo}>
                    <div style={styles.roomInfo}>
                        <Video size={20} />
                        <div>
                            <h3 style={styles.roomTitle}>Doctor Video Console</h3>
                            <p style={styles.roomId}>Room: {callId}</p>
                        </div>
                    </div>
                    <div style={styles.participantsList}>
                        <Users size={16} />
                        <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={styles.callStatus}>
                        <span style={styles.statusText}>{connectionStatus}</span>
                    </div>
                </div>
            </div>
            <div style={styles.videoArea}>
                <div style={styles.remoteVideoContainer}>
                    <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
                    {!isCallStarted && <div style={styles.waitingScreen}><h2 style={styles.waitingTitle}>{waitingMessage}</h2></div>}
                </div>
                <div style={styles.localVideoContainer}>
                    <video ref={localVideoRef} autoPlay playsInline muted style={styles.localVideo} />
                </div>
            </div>
            <div style={styles.controlBar}>
                <div style={styles.controlGroup}>
                    <button onClick={handleToggleAudio} style={{ ...styles.controlButton, backgroundColor: isAudioEnabled ? '#374151' : '#dc2626' }}><Mic size={20} /></button>
                    <button onClick={handleToggleVideo} style={{ ...styles.controlButton, backgroundColor: isVideoEnabled ? '#374151' : '#dc2626' }}><Video size={20} /></button>
                    <button onClick={handleScreenShare} style={{ ...styles.controlButton, backgroundColor: '#374151' }}><Monitor size={20} /></button>
                    <button onClick={handleCopyRoomLink} style={styles.controlButton}><Share2 size={20} /></button>
                </div>
                <button onClick={handleEndCall} style={styles.endCallButton}><PhoneOff size={20} /> End Call</button>
            </div>
        </div>
    );
};

export default VideoCallRoom;
