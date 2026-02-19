# Prescripto - Admin Panel

The **Admin Panel** is a dashboard for administrators and doctors to manage the Prescripto platform. It provides tools for appointment scheduling, doctor profile management, and system-wide settings.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1.  Navigate to the directory:
    ```bash
    cd admin
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the `admin` root directory:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Running the App

Start the development server:

```bash
npm run dev
```
The app will be available at `http://localhost:5174` (or the next available port).

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
-   **Styling**: Tailwind CSS (v3)
-   **Routing**: React Router DOM (v7)
-   **State Management**: Context API (`AdminContext`, `DoctorContext`)
-   **Notifications**: React Toastify

## 📂 Key Directories

-   `src/context`: Contains `AdminContext` and `DoctorContext` for managing role-specific state.
-   `src/pages/Admin`: specialized pages for Admin role (`Dashboard`, `AllAppointments`, `AddDoctor`, `DoctorsList`).
-   `src/pages/Doctor`: specialized pages for Doctor role (`DoctorDashboard`, `DoctorAppointments`, `DoctorProfile`).
-   `src/components`: UI components like `Sidebar`, `Navbar`.
