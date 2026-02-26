# Prescripto - Backend API (Express.js)

The **Prescripto Backend API** is the core business logic layer of the application, built on **Node.js** and **Express.js**. It manages user roles, handles secure authentication, processes payments, and interacts with the **MongoDB** database.

## 🛠️ Tech Stack & Key Modules

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose ODM)
*   **Authentication**: JSON Web Tokens (JWT) & Bcrypt
*   **File Storage**: Cloudinary (Image Uploads via Multer)
*   **Payment Gateway**: Razorpay Integration
*   **Validation**: Validator.js
*   **Security & Hardening**: Helmet, Express Rate Limit, CORS, Cookie Parser

## 📂 Project Structure

```
backend/
├── config/              # Configuration for DB & Cloudinary
├── controllers/         # Logic for API endpoints (User, Doctor, Admin)
├── middlewares/         # Auth verification (authAdmin, authUser) & Multer
├── models/              # Mongoose Schemas (User, Doctor, Appointment)
├── routes/              # API Route definitions
└── server.js            # Application entry point
```

## 🔐 Authentication & Roles

The system implements Role-Based Access Control (RBAC) with three distinct roles:

1.  **Patient (`authUser`)**: Can book appointments, view history, and update profile.
2.  **Doctor (`authDoctor`)**: Can manage availability and view assigned appointments.
3.  **Admin (`authAdmin`)**: Has full system control, doctor onboarding, and analytics access.

Each request to a protected route must include a valid, short-lived `AccessToken` in the headers.

### Dual-Token Architecture
The backend implements a highly secure authentication flow:
1. **Access Token**: Short lifespan (15 minutes). Sent in the standard JSON response to authorize API access.
2. **Refresh Token**: Long lifespan (7 days). Securely attached to the client via an **`HttpOnly` Cookie**, completely protecting it against XSS attacks. 
3. **Rotation Endpoints**: `/api/user/refresh` (and admin/doctor equivalents) silently validate the secure cookie and issue fresh Access Tokens on the fly.

## 🛡️ Advanced Security Features

*   **Global Hardening**: `helmet` is configured to set tight HTTP headers, and `express-rate-limit` prevents brute-force logins and basic DDoS attempts.
*   **Strict CORS Policy**: Discards wildcard origins in favor of explicit client arrays.
*   **Mongoose Transactions**: `bookAppointment` flows use MongoDB session transactions to ensure atomic locking and eliminate double-booking race conditions.
*   **Injection & Traversal Protection**: Explicit parameter casting blocks NoSQL injections, and Multer regex sanitization prevents Arbitrary File Writes on image uploads.

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v16.x or higher)
*   MongoDB Atlas Account (or local instance)
*   Cloudinary Account

### 1. Install Dependencies
Navigate to the backend directory and install required packages:

```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `backend` directory. Define the following variables:

```ini
# Server Port
PORT=4000

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prescripto

# Cloudinary Configuration (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret for Token Signing
JWT_SECRET=your_secure_jwt_secret

# Admin Credentials (Hardcoded for initial access)
ADMIN_EMAIL=admin@prescripto.com
ADMIN_PASSWORD=secure_admin_password

# Payment Gateway Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
```

### 3. Start the Server
Run the API server:

```bash
npm start
```
The server will start on port `4000`.

For development with auto-reload (using Nodemon):
```bash
npm run server
```

## ⚠️ Troubleshooting

*   **Database Connection Error**: Verify your `MONGODB_URI` and ensure your IP is whitelisted in MongoDB Atlas.
*   **Image Upload Failures**: Check your Cloudinary credentials in `.env`.
*   **Authentication Issues**: Ensure the `JWT_SECRET` matches across environments if scaling horizontally.
