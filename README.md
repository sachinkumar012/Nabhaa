# Nabhaa Health Mart

Welcome to the **Nabhaa Health Mart** repository! Nabhaa is a modern, comprehensive Healthcare Management System and Telemedicine Platform encompassing three distinct modules: a patient/doctor frontend, an administrative dashboard, and a robust backend API.

## 🚀 Project Overview

The Nabhaa platform is designed to provide seamless interaction between patients, doctors, and platform administrators. Main capabilities include:
- **Patient Portal**: Browse health services, order medicines, book appointments, and conduct live video consultations.
- **Doctor Dashboard**: Manage appointments, review patient history, and connect via secure live video calls.
- **Admin Panel**: Monitor platform activity, manage users (doctors/patients), handle medicine inventories, and oversee transactions.

---

## 📂 Repository Structure

This repository is organized into three main directories:

- [**frontend/**](./frontend/) - The React web application for patients and doctors.
- [**admin/**](./admin/) - The React administrative dashboard for managing the system.
- [**backend/**](./backend/) - The Express.js server providing the REST API and WebSocket functionality.

---

## 🛠️ Technology Stack

Our stack relies on modern, efficient tools across the MERN ecosystem:

### Frontend (Patients & Doctors)
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS, PostCSS, Framer Motion for smooth animations
- **Real-Time & Video**: Socket.io-client, Simple-Peer (WebRTC)
- **Utilities**: Axios, Lucide React, React Toastify

### Admin Panel
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Real-Time**: Socket.io-client
- **Utilities**: Axios, React Router DOM, React Toastify, Lucide React

### Backend
- **Core**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication & Security**: JSON Web Tokens (JWT), Google Auth Library, bcryptjs, Helmet, Express Rate Limit
- **Real-Time**: Socket.io
- **Integrations**: 
  - **Razorpay**: Payment gateway integration
  - **Cloudinary**: Cloud image/media storage
  - **Nodemailer**: Email notifications

---

## 🏁 Getting Started

To run the project locally, you will need Node.js and MongoDB installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Nabhaa.git
cd Nabhaa
```

### 2. Environment Variables
You'll need to set up the `.env` files in each of the environments.
- **backend/.env**: Database URI, JWT Secret, Cloudinary credentials, Razorpay Keys, etc.
- **frontend/.env**: Backend API URL, Socket server URL, etc.
- **admin/.env**: Backend API URL, Socket server URL, etc.

### 3. Install Dependencies
Open three separate terminal windows to install dependencies for each module:

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Admin:**
```bash
cd admin
npm install
```

### 4. Running the Development Servers

**Start the Backend API:**
```bash
cd backend
npm run dev
```

**Start the Frontend App:**
```bash
cd frontend
npm run dev
```

**Start the Admin Dashboard:**
```bash
cd admin
npm run dev
```

The applications will typically be accessible at:
- **Frontend**: `http://localhost:5173`
- **Admin**: `http://localhost:5174`
- **Backend**: `http://localhost:5000`

---

## 📜 Scripts Overview

### Backend
- `npm run dev`: Starts the backend server with `nodemon` for automatic reloads.
- `npm run start`: Starts the backend server intended for production.
- `npm run seed`: Seeds the database with initial medicine data.

### Frontend / Admin
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.

---

## 🤝 Contributing

We welcome contributions to the Nabhaa ecosystem! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
