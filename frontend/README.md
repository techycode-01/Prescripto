# Prescripto - Patient Frontend

The **Patient Frontend** is the user-facing interface of the Prescripto application. Built with **React** and **Vite**, it allows patients to browse doctors, book appointments, manage their profiles, and view their appointment history.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1.  Navigate to the directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the `frontend` root directory:

```env
VITE_BACKEND_URL=http://localhost:4000
RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Running the App

Start the development server:

```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with Vite. |
| `npm run build` | Builds the app for production. |
| `npm run lint` | Runs ESLint to check for code quality issues. |
| `npm run preview` | Previews the production build locally. |

## 🛠️ Tech Stack

-   **Framework**: React (v19)
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS (v4)
-   **Routing**: React Router DOM (v7)
-   **HTTP Client**: Axios
-   **Notifications**: React Toastify

## 📂 Key Directories

-   `src/pages`: Individual page components (Home, Doctors, Login, etc.).
-   `src/components`: Reusable UI components (Navbar, TopDoctors).
-   `src/context`: Global state management via Context API.
-   `src/assets`: Static images and icons.
