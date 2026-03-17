# Nabhaa Health Mart - Admin Portal

The **Admin Portal** provides platform administrators tools to oversee the **Nabhaa Health Mart** platform. This includes managing registered users (patients and doctors), reviewing platform financial transactions, and curating available medicines.

## Features

- **Dashboard**: Comprehensive overview of the total number of users, overall revenue, pending appointments, and platform metrics.
- **User Management**: Approve or suspend doctors and handle patient accounts.
- **Inventory/Services Control**: Verify and add products to the medicine mart system.
- **Real-time Notifications**: Instantly monitor significant platform activity and incoming requests using `Socket.io-client`.
- **Modern UI**: Smooth interface interactions with responsive layout designed in `Tailwind CSS`.

## Tech Stack

This portal uses the newest stable tooling for React applications:
- **Framework:** React 19 via Vite (with `rolldown-vite` overrides for speed).
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer.
- **Real-Time Client:** `socket.io-client`.
- **Routing:** React Router DOM (v7).
- **Utilities:** Axios, Lucide React, React Toastify.
- **Linting:** ESLint 9 for rigorous code-quality checks.

## Getting Started

### Prerequisites
Make sure you have Node.js installed, along with your preferred package manager (npm). Ensure you also start the main `/backend` server before testing the Admin APIs locally.

### Installation

1. Navigate to the `admin` directory:
   ```bash
   cd admin
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables via a `.env` script (configure the API and Socket server endpoints).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and access `http://localhost:5174/` or the prompt's fallback port.

## Available Scripts

- `npm run dev` - Start the Vite development server.
- `npm run build` - Bundle and minify the React application into the `dist` folder.
- `npm run lint` - Run ESLint over your JavaScript/React files.
- `npm run preview` - Preview the built project artifact locally.

---
The admin ecosystem forms the final distinct structural module of Nabhaa, orchestrating tasks behind the scenes of the main frontend website.
