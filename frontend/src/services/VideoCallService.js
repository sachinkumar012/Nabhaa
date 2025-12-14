// WebRTC Video Call Service with Socket.IO signaling
import io from "socket.io-client";

class VideoCallService {
  constructor() {
    this.socket = null;
    this.localPeerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.roomId = null;
    this.doctorId = null;
    this.patientId = null;

    // WebRTC configuration
    this.pcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        // Add free TURN servers
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    };

    // Media constraints
    this.mediaConstraints = {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
  }

  // Initialize socket connection
  async initializeSocket(serverUrl) {
    try {
      // Use environment-based server URL
      const socketUrl =
        serverUrl ||
        process.env.REACT_APP_SOCKET_SERVER ||
        (process.env.NODE_ENV === "production"
          ? "https://your-socket-server.herokuapp.com"
          : "http://localhost:3001");

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
      });

      this.setupSocketListeners();

      return new Promise((resolve, reject) => {
        this.socket.on("connect", () => {
          console.log("✅ Connected to signaling server");
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      throw error;
    }
  }

  // Setup socket event listeners
  setupSocketListeners() {
    // Room management
    this.socket.on("room-joined", (data) => {
      console.log("✅ Joined room:", data.roomId);
      this.roomId = data.roomId;
      this.isInitiator = data.isInitiator;
      this.onRoomJoined?.(data);
    });

    this.socket.on("user-joined", (data) => {
      console.log("👤 User joined room:", data.userId);
      if (this.isInitiator) {
        this.createOffer();
      }
      this.onUserJoined?.(data);
    });

    this.socket.on("user-left", (data) => {
      console.log("👤 User left room:", data.userId);
      this.onUserLeft?.(data);
    });

    // WebRTC signaling
    this.socket.on("offer", async (data) => {
      console.log("📞 Received offer");
      await this.handleOffer(data.offer, data.senderId);
    });

    this.socket.on("answer", async (data) => {
      console.log("📞 Received answer");
      await this.handleAnswer(data.answer);
    });

    this.socket.on("ice-candidate", async (data) => {
      console.log("🧊 Received ICE candidate");
      await this.handleIceCandidate(data.candidate);
    });

    // Call management
    this.socket.on("call-ended", (data) => {
      console.log("📱 Call ended by remote user");
      this.cleanup();
      this.onCallEnded?.(data);
    });

    // Chat messages
    this.socket.on("chat-message", (data) => {
      this.onChatMessage?.(data);
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      this.onError?.(error);
    });
  }

  // Start a video call (Patient initiating call to doctor)
  async startCall(doctorId, patientInfo) {
    try {
      console.log("🚀 Starting video call to doctor:", doctorId);

      this.doctorId = doctorId;
      this.patientId = patientInfo.id || `patient-${Date.now()}`;

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia(
        this.mediaConstraints
      );

      // Create room ID
      this.roomId = `call-${doctorId}-${this.patientId}-${Date.now()}`;

      // Join room
      this.socket.emit("join-room", {
        roomId: this.roomId,
        userId: this.patientId,
        userType: "patient",
        doctorId: doctorId,
        patientInfo: patientInfo,
      });

      // Setup peer connection
      await this.createPeerConnection();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.localPeerConnection.addTrack(track, this.localStream);
      });

      return {
        success: true,
        localStream: this.localStream,
        roomId: this.roomId,
      };
    } catch (error) {
      console.error("❌ Failed to start call:", error);
      throw error;
    }
  }

  // Accept incoming call (Doctor accepting call from patient)
  async acceptCall(roomId, doctorInfo) {
    try {
      console.log("✅ Accepting call in room:", roomId);

      this.roomId = roomId;
      this.doctorId = doctorInfo.id;

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia(
        this.mediaConstraints
      );

      // Join room
      this.socket.emit("join-room", {
        roomId: roomId,
        userId: this.doctorId,
        userType: "doctor",
        doctorInfo: doctorInfo,
      });

      // Setup peer connection
      await this.createPeerConnection();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.localPeerConnection.addTrack(track, this.localStream);
      });

      return {
        success: true,
        localStream: this.localStream,
      };
    } catch (error) {
      console.error("❌ Failed to accept call:", error);
      throw error;
    }
  }

  // Create peer connection
  async createPeerConnection() {
    try {
      this.localPeerConnection = new RTCPeerConnection(this.pcConfig);

      // Handle ICE candidates
      this.localPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 Sending ICE candidate");
          this.socket.emit("ice-candidate", {
            roomId: this.roomId,
            candidate: event.candidate,
          });
        }
      };

      // Handle remote stream
      this.localPeerConnection.ontrack = (event) => {
        console.log("📹 Received remote stream");
        this.remoteStream = event.streams[0];
        this.onRemoteStream?.(event.streams[0]);
      };

      // Handle connection state changes
      this.localPeerConnection.onconnectionstatechange = () => {
        const state = this.localPeerConnection.connectionState;
        console.log("🔗 Connection state:", state);
        this.onConnectionStateChange?.(state);
      };

      // Handle ICE connection state changes
      this.localPeerConnection.oniceconnectionstatechange = () => {
        const state = this.localPeerConnection.iceConnectionState;
        console.log("🧊 ICE connection state:", state);
        this.onIceConnectionStateChange?.(state);
      };
    } catch (error) {
      console.error("❌ Failed to create peer connection:", error);
      throw error;
    }
  }

  // Create offer (initiator)
  async createOffer() {
    try {
      console.log("📞 Creating offer");
      const offer = await this.localPeerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.localPeerConnection.setLocalDescription(offer);

      this.socket.emit("offer", {
        roomId: this.roomId,
        offer: offer,
        senderId: this.isInitiator ? this.patientId : this.doctorId,
      });
    } catch (error) {
      console.error("❌ Failed to create offer:", error);
      throw error;
    }
  }

  // Handle offer (receiver)
  async handleOffer(offer, senderId) {
    try {
      console.log("📞 Handling offer from:", senderId);
      await this.localPeerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await this.localPeerConnection.createAnswer();
      await this.localPeerConnection.setLocalDescription(answer);

      this.socket.emit("answer", {
        roomId: this.roomId,
        answer: answer,
        senderId: this.doctorId || this.patientId,
      });
    } catch (error) {
      console.error("❌ Failed to handle offer:", error);
      throw error;
    }
  }

  // Handle answer (initiator)
  async handleAnswer(answer) {
    try {
      console.log("📞 Handling answer");
      await this.localPeerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } catch (error) {
      console.error("❌ Failed to handle answer:", error);
      throw error;
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(candidate) {
    try {
      await this.localPeerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (error) {
      console.error("❌ Failed to handle ICE candidate:", error);
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Send chat message
  sendChatMessage(message, senderInfo) {
    this.socket.emit("chat-message", {
      roomId: this.roomId,
      message: message,
      sender: senderInfo,
      timestamp: new Date().toISOString(),
    });
  }

  // End call
  endCall() {
    console.log("📱 Ending call");

    this.socket.emit("end-call", {
      roomId: this.roomId,
      userId: this.doctorId || this.patientId,
    });

    this.cleanup();
  }

  // Cleanup resources
  cleanup() {
    console.log("🧹 Cleaning up resources");

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.localPeerConnection) {
      this.localPeerConnection.close();
      this.localPeerConnection = null;
    }

    // Reset variables
    this.remoteStream = null;
    this.isInitiator = false;
    this.roomId = null;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.cleanup();
  }
}

export default VideoCallService;
