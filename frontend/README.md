# Nabhaa Health Mart - Frontend

This is the main patient and doctor facing web application for the **Nabhaa Health Mart** platform. It provides a rich, responsive interface for scheduling appointments, viewing health records, ordering medicines, and conducting real-time video consultations.

## Features

- **Patient Dashboard**: Manage health records, view upcoming appointments, order medicines.
- **Doctor Portal**: Manage schedules, connect with patients.
- **Video Consultations**: Real-time WebRTC-based video calls between doctors and patients, powered by `simple-peer` and `Socket.io`.
- **Modern UI**: Smooth animations and aesthetically pleasing design using `Framer Motion` and `Tailwind CSS`.
- **Responsive Navigation**: Routing powered by `React Router DOM`.
- **Instant Feedback**: Interactive toast notifications via `React Toastify`.

## Tech Stack

Here's an overview of the key technologies running the frontend:
- **Framework:** React 18, set up with [Vite](https://vitejs.dev/)
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **State/API:** Axios for REST API calls
- **Real-Time Communication:** `socket.io-client` alongside `simple-peer`
- **Icons**: `lucide-react`
- **Linting:** ESLint with React support

## Getting Started

### Prerequisites
Make sure you have Node.js and a package manager (npm or yarn) installed. Add a `.env` file referencing your backend API and Socket URL.

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the app:
   Navigate to `http://localhost:5173/` in your browser.

## Available Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the application for production to the `dist` folder.
- `npm run lint` - Lints the codebase using ESLint.
- `npm run preview` - Locally preview the production build.

## Project Structure

- `src/`
  - `components/` - Reusable UI elements (auth sidebars, tables, call controls).
  - `pages/` - Key application routes and views (e.g., Doctor Dashboard).
  - `utils/` - Shared helper functions.
  - `App.jsx` - Root application component setting up routing and context.
  - `main.jsx` - Main React entry point.

---
This UI interfaces directly with the main API and WebSocket server hosted in the `backend` folder.
