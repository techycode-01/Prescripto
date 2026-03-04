# Prescripto - Healthcare Appointment Management System

![Prescripto Banner](frontend/public/prescripto-banner.png)

<p align="center">
  <a href="https://prescripto-dev.netlify.app" target="_blank" rel="noopener noreferrer"><strong>Live Patient App</strong></a> &nbsp;&nbsp;|&nbsp;&nbsp; 
  <a href="https://prescripto-adminpanel.netlify.app" target="_blank" rel="noopener noreferrer"><strong>Live Admin Panel</strong></a>
</p>

## 1. Project Overview

**Prescripto** is an enterprise-grade, full-stack healthcare doctor appointment booking platform designed to bridge the gap between patients and medical professionals. Built on the robust **MERN Stack** (MongoDB, Express.js, React.js, Node.js), it offers a seamless interface for patients to discover doctors, manage appointments, and maintain health records, while providing a comprehensive dashboard for doctors and administrators to streamline clinic operations.

This repository takes a "monorepo-style" approach, housing the Backend API, Patient Frontend, and Admin Panel within a single codebase for unified development and version control.

The application also integrates an online payment gateway, allowing patients to securely pay consultation fees during booking. Designed as a scalable and customizable solution, this project can be used by clinics or hospitals.

## 2. Problem Statement & Purpose

In the traditional healthcare landscape, booking appointments often involves phone calls, manual scheduling, and lack of real-time availability visibility.

**Prescripto solves this by:**
*   **Eliminating Friction**: Real-time slot booking reduces waiting times and administrative overhead.
*   **Centralizing Data**: A unified system for doctor profiles, availability, and appointment history.
*   **Role-Based Access**: Distinct workflows for Patients (discovery & booking), Doctors (schedule management), and Admins (system oversight).

## 3. Key Features

The system supports three levels of authentication: **Patients**, who can register, log in, book and manage appointments; **Doctors**, who can view scheduled appointments, track earnings, and update their profiles through a dedicated dashboard; and an **Admin**, who oversees the entire platform by managing doctors and appointments.

### 🏥 Patient Portal (<a href="https://prescripto-dev.netlify.app" target="_blank">Live Demo</a>)
*   **Doctor Discovery**: Advanced filtering by speciality, experience, and fees.
*   **Real-time Booking**: Interactive slot selection based on doctor availability.
*   **Secure Authentication**: JWT-based login and registration.
*   **Profile Management**: Update personal details and medical history visibility.
*   **Payment Integration**: Secure payment gateway integration (Razorpay) for booking fees.
*   **Email Notifications**: Automatic booking confirmation, cancellation, and 24-hour reminder emails.

### 👨‍⚕️ Doctor Dashboard (<a href="https://prescripto-adminpanel.netlify.app" target="_blank">Live Demo</a>)
*   **Appointment Management**: Accept, cancel, or complete patient appointments.
*   **Schedule Control**: Dynamic availability setting to manage practicing hours.
*   **Financial Overview**: Track earnings and completed consultations.
*   **Email Notifications**: Automated alerts for new bookings, cancellations, and completed appointments.

### 🛡️ Admin Panel (<a href="https://prescripto-adminpanel.netlify.app" target="_blank">Live Demo</a>)
*   **Provider Onboarding**: Add and verify new doctors and their credentials.
*   **System Analytics**: View total appointments, active doctors, and patient registrations.
*   **Global Management**: Override controls for users and appointments.

## 4. Tech Stack

### Frontend & Admin Panel
*   **Core**: React 19, Vite (High-performance build tool)
*   **Styling**: Tailwind CSS (Utility-first framework for rapid UI development)
*   **Routing**: React Router DOM v7
*   **State Management**: React Context API
*   **HTTP Client**: Axios
*   **Notifications**: React Toastify

### Backend API
*   **Runtime**: Node.js
*   **Framework**: Express.js (RESTful API architecture)
*   **Database**: MongoDB (NoSQL) with Mongoose ODM
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt (Password Hashing)
*   **File Storage**: Cloudinary (Image management via Multer)
*   **Email Service**: Nodemailer (Gmail SMTP for transactional emails)
*   **Security**: CORS, Dotenv, Validator

## 5. System Architecture

Prescripto follows a decoupled client-server architecture:

1.  **Frontend/Admin**: Single Page Applications (SPAs) that consume JSON APIs. Content is served statically (e.g., via Netlify) with client-side routing.
2.  **Backend**: A stateless REST API handling business logic. It connects to MongoDB for persistence and Cloudinary for asset offloading.
3.  **Database**: MongoDB Atlas (Cloud) serves as the centralized data store, ensuring scalability.

## 6. Installation & Local Setup

### Prerequisites
*   Node.js (v16.x or higher)
*   npm (v8.x or higher) or yarn
*   MongoDB Atlas Account (or local MongoDB instance)
*   Cloudinary Account
*   Razorpay Test Account (optional)

### Step-by-Step Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/prescripto.git
    cd prescripto
    ```

2.  **Install Dependencies**
    Execute the following commands in three separate terminal tabs or sequentially:

    ```bash
    # 1. Backend
    cd backend
    npm install

    # 2. Frontend
    cd ../frontend
    npm install

    # 3. Admin
    cd ../admin
    npm install
    ```

## 7. Environment Variables

Create a `.env` file in the root of **each** directory (`backend`, `frontend`, `admin`).

**`backend/.env`**
```ini
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prescripto
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=admin@prescripto.com
ADMIN_PASSWORD=secure_admin_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CURRENCY=INR
```

**`frontend/.env`**
```ini
VITE_BACKEND_URL=http://localhost:4000
RAZORPAY_KEY_ID=your_razorpay_key
```

**`admin/.env`**
```ini
VITE_BACKEND_URL=http://localhost:4000
```

## 8. Running the Application

For the best development experience, run all three services simultaneously.

**Terminal 1: Backend API**
```bash
cd backend
npm start
# Server listens on port 4000
```

**Terminal 2: User Frontend**
```bash
cd frontend
npm run dev
# Accessible at http://localhost:5173
```

**Terminal 3: Admin Panel**
```bash
cd admin
npm run dev
# Accessible at http://localhost:5174
```

## 9. Folder Structure Explanation

```
Prescripto/
├── admin/                      # Admin & Doctor Dashboard
│   ├── public/                 # Static assets & _redirects
│   ├── src/
│   │   ├── context/            # AdminContext, DoctorContext
│   │   ├── pages/              # Dashboard, AddDoctor, AllAppointments
│   │   └── components/         # Sidebar, Navbar
│   └── package.json
│
├── frontend/                   # Patient-facing Application
│   ├── public/                 # Static assets & _redirects
│   ├── src/
│   │   ├── assets/             # Images and Icons
│   │   ├── components/         # RelatedDoctors, TopDoctors, Header
│   │   ├── context/            # AppContext (Auth, Global State)
│   │   └── pages/              # Home, Login, MyProfile, Appointment
│   └── package.json
│
└── backend/                    # Core API Server
    ├── config/                 # DB & Cloudinary Config
    ├── controllers/            # Request Handlers (user, doctor, admin)
    ├── middlewares/            # Auth checks (authAdmin, authUser)
    ├── models/                 # Mongoose Schemas
    ├── routes/                 # API Routes Definition
    └── server.js               # Entry Point
```

## 10. API Integration Details

The frontend communicates with the backend via **Axios**.
*   **Base URL**: Configured via `VITE_BACKEND_URL`.
*   **Interceptors**: Tokens are passed in headers (e.g., `token: <jwt_string>`) for protected routes.
*   **Error Handling**: Centralized error management using React Toastify for user feedback.

## 11. Authentication & Advanced Security

Prescripto employs a highly secure, enterprise-grade security architecture:

*   **Dual-Token Architecture**: 
    *   **Access Tokens**: Short-lived (15 mins), sent via JSON, and explicitly tied to user roles (`user`, `doctor`, `admin`) to prevent structural token interchangeability.
    *   **Refresh Tokens**: Long-lived (7 days), securely stored in **`HttpOnly` cookies**, making them 100% immune to frontend Cross-Site Scripting (XSS) extraction attacks.
*   **Invisible Token Rotation**: The Frontend and Admin SPAs utilize **Axios Response Interceptors**. If an Access Token naturally expires (`401 Unauthorized`), the interceptor pauses the request, silently queries the backend's `/refresh` endpoint using the secure HttpOnly cookie, mints a new Access Token, and retries the original request entirely invisibly to the user.
*   **Global Backend Hardening**:
    *   **Helmet**: Automatically sets robust HTTP security headers against clickjacking and XSS.
    *   **Express Rate Limiter**: Caps requests to 100 per 15 minutes per IP to aggressively throttle credential stuffing and DDoS attempts.
    *   **Strict CORS Policy**: Whitelists specific origins and strictly enforces `credentials: true` for secure cross-origin cookie transmission.
*   **Database & Logic Security**:
    *   **Atomic Transactions**: Critical flows like appointment booking utilize MongoDB Sessions and Transactions to prevent race conditions.
    *   **NoSQL Injection Prevention**: Key query parameters are explicitly cast to Strings to nullify malicious MongoDB operators.
    *   **Path Traversal Prevention**: File uploads via Multer are sanitized and timestamped before saving.
*   **Password & Payment Security**: User passwords are encrypted using `bcrypt` (cost factor 10). Payments are secured via Razorpay HMAC SHA256 Signature validations.

## 12. Email Notification System

Prescripto sends automated transactional emails via **Nodemailer** (Gmail SMTP) for every critical event in the appointment lifecycle:

| Event | Patient | Doctor | Admin |
|---|---|---|---|
| Appointment Booked | ✅ Confirmation | ✅ New booking alert | ✅ System log |
| Cancelled by Patient | ✅ Cancellation notice | ✅ Slot released notice | ✅ System log |
| Cancelled by Doctor | ✅ Apology & rebook prompt | ✅ Confirmation | ✅ System log |
| Cancelled by Admin | ✅ Apology notice | ✅ Slot released notice | ✅ System log |
| Completed by Doctor | ✅ Completion & feedback | ✅ Confirmation | ✅ System log |
| 24h Reminder (Daily Cron) | ✅ Reminder | ✅ Reminder | — |

### Reminder Cron Job
A `node-cron` scheduler runs **every day at 8:00 AM** server time. It scans the database for all upcoming non-cancelled appointments occurring within the next 24 hours and dispatches reminder emails to both the patient and the doctor automatically.

## 12. Build & Deployment

### Frontend & Admin (Netlify/Vercel)
1.  Run `npm run build` to generate the `dist` folder.
2.  Ensure `_redirects` file exists in `public/` folder with `/* /index.html 200` content to handle Client-Side Routing.
3.  Deploy the `dist` folder.

### Backend (Render/Heroku/AWS)
1.  Ensure `start` script is defined ("node server.js").
2.  Set environment variables in the cloud provider's dashboard.
3.  Whitelist current IP in MongoDB Atlas if connecting from a new server instance.

## 13. Future Improvements

### 🏗 DevOps & Infrastructure
*   **CI/CD Pipelines**: Automated testing and deployment workflows using GitHub Actions.
*   **Docker Support**: Containerized environment for consistent deployment.

### 🛡️ Security & Scalability
*   **Two-Factor Authentication (2FA)**: Added security layer for Doctors and Admins.
*   **Redis Caching**: Performance optimization for high-traffic endpoints.
*   **Audit Logging**: Comprehensive admin activity tracking.

### 🧩 Feature Expansion
*   **Telemedicine**: Integration of WebRTC for video consultations.
*   **Prescriptions**: Digital prescription generation and PDF download.
*   **Chat System**: Real-time chat between doctor and patient.
*   **Multi-language Support**: i18n integration for global accessibility.

### 🤖 AI & Machine Learning
*   **AI Symptom Checker**: Preliminary diagnosis tool suggesting specialities based on patient symptoms.

### 📊 Analytics & Business
*   **Advanced Analytics**: Interactive charts for doctor performance, patient trends, and revenue.
*   **Subscription Models**: Tiered access for patients (Premium support) and doctors (Featured listings).

## 14. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by Anuj
</p>
