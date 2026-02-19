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
*   **Security**: CORS, Dotenv

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

Each request to a protected route must include a valid JWT in the `token` header.

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
