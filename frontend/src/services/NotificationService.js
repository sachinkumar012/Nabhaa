// Notification service for doctor call alerts
class NotificationService {
  constructor() {
    this.permission = null;
    this.audioContext = null;
    this.ringtone = null;
  }

  // Request notification permission
  async requestPermission() {
    if ("Notification" in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === "granted";
    }
    return false;
  }

  // Show incoming call notification
  showIncomingCallNotification(callData) {
    const { patientName, patientInfo, roomId } = callData;

    if (this.permission === "granted") {
      const notification = new Notification("Incoming Video Call", {
        body: `${patientName} is requesting a video consultation`,
        icon: "/vite.svg", // Replace with your app icon
        badge: "/vite.svg",
        tag: `call-${roomId}`,
        requireInteraction: true,
        actions: [
          {
            action: "accept",
            title: "Accept Call",
            icon: "/icons/accept-call.png",
          },
          {
            action: "decline",
            title: "Decline Call",
            icon: "/icons/decline-call.png",
          },
        ],
        data: {
          roomId,
          patientInfo,
          type: "video-call",
        },
      });

      // Handle notification clicks
      notification.onclick = () => {
        window.focus();
        this.onCallAccepted?.(callData);
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close();
      }, 30000);

      return notification;
    }

    return null;
  }

  // Play ringtone
  async playRingtone() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // Create a simple ringtone using Web Audio API
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        600,
        this.audioContext.currentTime + 0.5
      );

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 1
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 1);

      // Repeat every 2 seconds
      this.ringtoneInterval = setInterval(() => {
        this.playRingtone();
      }, 2000);
    } catch (error) {
      console.error("Failed to play ringtone:", error);
    }
  }

  // Stop ringtone
  stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // Show call ended notification
  showCallEndedNotification(duration) {
    if (this.permission === "granted") {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;

      new Notification("Call Ended", {
        body: `Call duration: ${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`,
        icon: "/vite.svg",
        tag: "call-ended",
      });
    }
  }
}

export default NotificationService;
