import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState({
    doctors: 0,
    appointments: 0,
    patients: 0,
    latestAppointments: [],
  });
  const [patientData, setPatientData] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
        console.log(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getPatientProfile = async (patientId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/admin/patient-profile/${patientId}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setPatientData(data.patientData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getPatientAppointments = async (patientId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/admin/patient-appointments/${patientId}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setPatientAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getPatientPrescriptions = async (patientId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/admin/patient-prescriptions/${patientId}`,
        { headers: { aToken } }
      );
      if (data.success) {
        setPatientPrescriptions(data.prescriptions);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const downloadPrescriptionPDF = async (appointmentId) => {
    try {
      const response = await axios.get(
        backendUrl + `/api/prescription/admin/download/${appointmentId}`,
        { headers: { aToken }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download prescription.");
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    patientData,
    getPatientProfile,
    patientAppointments,
    getPatientAppointments,
    patientPrescriptions,
    getPatientPrescriptions,
    downloadPrescriptionPDF,
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Only trigger if a 401 error occurs, it's not a retry, and the original request had the Admin "aToken"
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes('/refresh') &&
          (originalRequest.headers.aToken || originalRequest.headers.get?.("aToken") || originalRequest.headers.atoken || originalRequest.headers.get?.("atoken"))
        ) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.get(backendUrl + "/api/admin/refresh", {
              withCredentials: true,
            });
            
            if (data.success) {
              setAToken(data.token);
              localStorage.setItem("aToken", data.token);
              
              if (originalRequest.headers.set) {
                originalRequest.headers.set("aToken", data.token);
              } else {
                originalRequest.headers.aToken = data.token;
              }

              return axios(originalRequest);
            }
          } catch (refreshError) {
            setAToken("");
            localStorage.removeItem("aToken");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};
export default AdminContextProvider;
