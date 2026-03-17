# Nabhaa Health Mart - Backend

This is the central Express.js REST API and WebSocket server for the **Nabhaa Health Mart** platform. It handles all database operations, real-time messaging, video call signaling, user authentication, and third-party API integrations like Razorpay and Cloudinary.

## Features

- **Authentication System**: Secure JSON Web Token (JWT) based authentication and Google Auth library for OAuth.
- **RESTful API**: Manage doctors, patients, appointments, medicines, and transactions.
- **Real-time Engine**: Powered by `Socket.io` to handle instant messaging and WebRTC video call signaling between users and doctors.
- **Payment Processing**: Integration with `Razorpay` for appointment and medicine payments.
- **File Uploads**: Integration with `Cloudinary` to provide image and document storage for patient records and doctor verification.
- **Email Notifications**: Automatically send emails using `Nodemailer`.
- **Security**: Includes `helmet` and `express-rate-limit` to protect the API.

## Tech Stack

- **Server Environment:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB via Mongoose ORM
- **WebSockets:** Socket.io
- **Security:** bcryptjs, Helmet, Express Rate Limit, JWT
- **Integrations:** Razorpay, Cloudinary, Nodemailer, Google Auth Library.
- **Dev Tools:** Nodemon, Morgan (logging).

## Getting Started

### Prerequisites

Ensure you have Node.js and MongoDB installed locally or hosted via MongoDB Atlas. Note down the following environment variables.

### Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file referencing your MongoDB host, your API secrets (Razorpay, Cloudinary), JWT credentials, and any SMTP details for Nodemailer.
4. Start the development server using `nodemon`:
   ```bash
   npm run dev
   ```

## Database Seeding

You can optionally seed the initial medicine datasets into your MongoDB system:
```bash
npm run seed
```

## Available Scripts

- `npm run start` - Boot up the production Node context with `server.js`.
- `npm run dev` - Watch for changes and auto-restart using `nodemon`.
- `npm run seed` - Execute `seedMedicines.js` to seed the database.

---
This server handles incoming API calls and WebSocket connections from both the `/frontend` app and the `/admin` portal.
