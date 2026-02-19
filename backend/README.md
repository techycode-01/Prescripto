# Prescripto - Backend API

The **Backend API** handles the business logic, database operations, and authentication for the Prescripto platform. It is built with **Node.js** and **Express.js**, using **MongoDB** for data persistence.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local)
- Cloudinary Account (for image uploads)

### Installation

1.  Navigate to the directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the `backend` root directory with the following variables:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@prescripto.com
ADMIN_PASSWORD=secure_admin_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
```

### Running the Server

Start the server:

```bash
npm start
```
The server will run on `http://localhost:4000`.

For development with auto-restart:
```bash
npm run server
```

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `npm start` | Starts the server using Node.js. |
| `npm run server` | Starts the server using Nodemon for development. |

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose ODM)
-   **Auth**: JWT, Bcrypt
-   **File Storage**: Cloudinary, Multer
-   **Validation**: Validator

## 📂 Key Directories

-   `config`: Database and Cloudinary configuration files.
-   `controllers`: Logic for handling API requests (`user`, `doctor`, `admin`).
-   `middlewares`: Auth checks (`authAdmin`, `authUser`) and file upload (`multer`).
-   `models`: Mongoose schemas (`userModel`, `doctorModel`, `appointmentModel`).
-   `routes`: API route definitions.
