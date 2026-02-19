# Prescripto - Patient Portal (Frontend)

![Prescripto Banner](public/prescripto-banner.png)

<p align="center">
  <a href="https://prescripto-dev.netlify.app" target="_blank" rel="noopener noreferrer"><strong>Live Patient App</strong></a>
</p>

The **Prescripto Patient Portal** is a high-performance React application designed to provide patients with a seamless experience for discovering doctors, booking appointments, and managing their personal health profiles. Built with **Vite** for rapid development and **Tailwind CSS** for a modern, responsive UI, it serves as the primary client-facing interface of the ecosystem.

## 🛠️ Tech Stack

*   **Core Framework**: React 19
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS v4
*   **Routing**: React Router DOM v7
*   **State Management**: Context API (Global App State)
*   **HTTP Client**: Axios
*   **Notifications**: React Toastify

## 📂 Project Structure

```
frontend/
├── public/              # Static assets and redirects
├── src/
│   ├── assets/          # Images, icons, and static media
│   ├── components/      # Reusable UI components (Navbar, Footer, etc.)
│   ├── context/         # AppContext for auth and global state
│   ├── pages/           # Application views (Home, Doctors, Login)
│   ├── App.jsx          # Main application component and routing configuration
│   └── main.jsx         # Entry point
└── ...
```

## 🔐 Authentication & Flow

The application uses **JWT (JSON Web Tokens)** for secure authentication.
1.  **Registration/Login**: Users authenticate via the `/api/user/login` or `/api/user/register` endpoints.
2.  **Token Storage**: Upon success, a `token` is stored in the browser's `localStorage`.
3.  **Protected Routes**: Components like `MyAppointments` and `MyProfile` check for the existence of this token before rendering.
4.  **Session Persistence**: The `AppContext` initializes the user session by validating the stored token against the backend.

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v16.x or higher)
*   npm or yarn

### 1. Install Dependencies
Navigate to the frontend directory and install the required packages:

```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `frontend` directory. Configure the connection to the Backend API and payment gateway:

```ini
# Base URL for the Express Backend API
VITE_BACKEND_URL=http://localhost:4000

# Razorpay Key ID for processing payments
RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Start Development Server
Run the local development server:

```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 4. Build for Production
To generate a production-ready build:

```bash
npm run build
```
The output will be generated in the `dist/` directory, ready for deployment.

## ⚠️ Troubleshooting

*   **CORS Errors**: Ensure the Backend API is running and configured to accept requests from `http://localhost:5173`.
*   **API Connection Failed**: Verify that `VITE_BACKEND_URL` is correct and the backend server is active.
*   **Payment Gateway Issues**: Ensure valid Razorpay keys are provided in the `.env` file.
