<div align="center">

<img src="frontend/public/logo.png" alt="Nabhaa Logo" width="120" />

# Nabhaa — AI-Powered Multilingual Telehealth PWA

**Bridging the healthcare communication gap for rural and multilingual India**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io)](https://socket.io)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📖 Overview

**Nabhaa** is a full-stack, production-ready Telehealth Progressive Web Application that delivers accessible digital healthcare services to patients, doctors, and pharmacists — in **English, Hindi, and Punjabi**.

The platform combines an AI symptom checker (powered by Google Gemini), multilingual voice recognition, real-time video consultations (WebRTC), OCR-based prescription reading, IoT-ready medicine reminders, and a secure payment gateway — all wrapped in an installable PWA that works offline and on low-bandwidth connections.

---

## ✨ Key Features

| Area | Features |
|---|---|
| 🌐 **Multilingual** | Full UI in English, Hindi & Punjabi; voice input & NLP symptom mapping |
| 🤖 **AI Health Assistant** | Gemini-powered symptom checker with structured differential-diagnosis output |
| 📹 **Teleconsultation** | Real-time WebRTC video/audio calls via Socket.io signalling |
| 📅 **Appointments** | Slot-based doctor booking, cancellations & calendar management |
| 💊 **Pharmacy** | Medicine search, cart, Razorpay checkout, digital prescriptions & pharmacist portal |
| 🔬 **OCR Reports** | Tesseract.js + Google Vision-based medical report parsing |
| 🏥 **Emergency** | One-tap SOS with live location sharing |
| 🔔 **Notifications** | In-app + email alerts (Resend API) for appointments, reports & reminders |
| 🔐 **Auth** | JWT + Google OAuth 2.0, bcrypt password hashing, rate limiting |
| 📱 **PWA** | Service worker, offline support, installable on Android & iOS |
| 📊 **Admin Dashboard** | User management, doctor verification, analytics & content moderation |

---

## 🏗️ Repository Structure

```
Nabhaa/
├── backend/          # Express.js REST API + Socket.io server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   └── .env.example
│
├── frontend/         # Patient & Doctor React PWA (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── i18n/       # English / Hindi / Punjabi locale files
│   │   └── main.jsx
│   └── public/
│
├── admin/            # Admin React dashboard (Vite)
│   └── src/
│
├── render.yaml       # One-click Render.com deployment manifest
└── README.md
```

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 22, Express.js 5 |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT, Google Auth Library, bcryptjs |
| Real-Time | Socket.io 4 |
| AI | Google Gemini (`@google/generative-ai`) |
| OCR | Tesseract.js, Google Cloud Vision |
| Payments | Razorpay |
| Storage | Cloudinary |
| Email | Resend API / Nodemailer (Gmail SMTP fallback) |
| Security | Helmet, express-rate-limit |
| PDF | PDFKit |

### Frontend & Admin
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS, Framer Motion |
| i18n | i18next + react-i18next |
| Video | Simple-Peer (WebRTC) |
| Charts | Recharts |
| PWA | vite-plugin-pwa (Workbox) |
| HTTP | Axios |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18  
- **MongoDB** (local) or a [MongoDB Atlas](https://cloud.mongodb.com) free cluster  
- Optional: Cloudinary, Razorpay, Resend, Google Cloud Vision, Gemini API keys

### 1. Clone the repository
```bash
git clone https://github.com/sachinkumar012/Nabhaa.git
cd Nabhaa
```

### 2. Configure Environment Variables

#### Backend
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your keys
```

Key variables to set in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nabhaa
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=Nabha Healthcare <onboarding@resend.dev>
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
PORT=5000
NODE_ENV=development
```

#### Frontend
```bash
# Create frontend/.env
echo "VITE_API_URL=http://localhost:5000" > frontend/.env
echo "VITE_GOOGLE_CLIENT_ID=your_google_client_id" >> frontend/.env
```

#### Admin
```bash
echo "VITE_API_URL=http://localhost:5000" > admin/.env
```

### 3. Install Dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Admin
cd admin && npm install && cd ..
```

### 4. Run Development Servers

Open **three terminals**:

```bash
# Terminal 1 – Backend (API + WebSocket)
cd backend && npm run dev

# Terminal 2 – Frontend PWA
cd frontend && npm run dev

# Terminal 3 – Admin Dashboard
cd admin && npm run dev
```

| App | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Admin | http://localhost:5174 |
| Backend API | http://localhost:5000 |

### 5. (Optional) Seed the Database

```bash
cd backend && npm run seed
```

---

## 📜 NPM Scripts

### Backend
| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Production start |
| `npm run seed` | Seed medicine catalogue |

### Frontend / Admin
| Script | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## ☁️ Deployment (Render.com)

The `render.yaml` at the repository root configures all three services (backend, frontend, admin) for one-click deployment on [Render](https://render.com).

1. Fork this repo and connect it to Render via **"New → Blueprint"**
2. Render will auto-detect `render.yaml` and create all three services
3. Set **secret** environment variables in the Render Dashboard (do **not** commit real keys):
   - `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`
   - `RESEND_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `CLOUDINARY_*`, `GOOGLE_CLIENT_ID`
4. Update `CORS_ORIGIN` in the backend service to your live frontend URLs

---

## 🔒 Security Notes

- **Never commit `.env` files** — they are gitignored.  
- Use `.env.example` as a template; it contains no real secrets.  
- All sensitive keys must be set via your deployment platform's environment panel.  
- The Razorpay signature verification happens **server-side**; keys are never exposed to the client.

---

## 🌐 Multilingual Support

Nabhaa supports **English (`en`)**, **Hindi (`hi`)**, and **Punjabi (`pa`)** through `i18next`. Translation JSON files live in:

```
frontend/src/i18n/locales/
├── en/translation.json
├── hi/translation.json
└── pa/translation.json
```

The language switcher is available in the top navigation bar on every page.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the project
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request** against `main`

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

Distributed under the **ISC License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ by **Sachin Kumar** · [GitHub](https://github.com/sachinkumar012)

</div>
