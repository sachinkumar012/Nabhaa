require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const http = require('http');
const socketIo = require('socket.io');

// Connect to Database
connectDB();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for now
        methods: ["GET", "POST"]
    }
});

// Expose io to all routes
app.set('io', io);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('join_doctor_room', (doctorId) => {
        socket.join(`doctor_${doctorId}`);
        console.log(`Socket ${socket.id} joined doctor room: doctor_${doctorId}`);
    });

    socket.on('join_pharmacist_room', (pharmacistId) => {
        socket.join(`pharmacist_${pharmacistId}`);
        console.log(`Socket ${socket.id} joined pharmacist room: pharmacist_${pharmacistId}`);
    });

    socket.on('call_doctor', (data) => {
        // data: { doctorId, patientName, callId }
        console.log('Incoming call for doctor:', data.doctorId);
        io.to(`doctor_${data.doctorId}`).emit('incoming_call', data);
    });

    // Track users for disconnect handling
    const users = {};

    // WebRTC Signaling
    socket.on('join-room', ({ roomId, userId }) => {
        console.log(`User ${userId} joined room ${roomId}`);

        // Store user info
        users[socket.id] = { roomId, userId };

        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });

    // Handle disconnect cleanly
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log(`User ${user.userId} disconnected from room ${user.roomId}`);
            socket.to(user.roomId).emit('user-disconnected', user.userId);
            delete users[socket.id];
        }
        console.log('Client disconnected', socket.id);
    });

    socket.on('offer', (data) => {
        // data: { offer, roomId }
        socket.to(data.roomId).emit('receive-offer', data.offer);
    });

    socket.on('answer', (data) => {
        // data: { answer, roomId }
        socket.to(data.roomId).emit('receive-answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
        // data: { candidate, roomId }
        socket.to(data.roomId).emit('receive-ice-candidate', data.candidate);
    });

});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
