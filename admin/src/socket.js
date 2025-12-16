import io from 'socket.io-client';

// Initialize socket connection
// Replace with your actual backend URL
const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

export default socket;
