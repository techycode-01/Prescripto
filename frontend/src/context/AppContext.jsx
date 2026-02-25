import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userData, setUserData] = useState(false);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  useEffect(() => {
    getDoctorsData();

    // Enable sending cookies with requests globally
    axios.defaults.withCredentials = true;

    // Axios Interceptor for Silent Token Refresh
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If 401 Unauthorized and we haven't already retried
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Attempt to get a new access token using the HttpOnly Refresh Cookie
            const { data } = await axios.get(backendUrl + "/api/user/refresh", {
              withCredentials: true, 
            });
            
            if (data.success) {
              setToken(data.token);
              localStorage.setItem("token", data.token);
              
              // Update the failed request with the new token and retry it
              originalRequest.headers.token = data.token;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token expired or invalid, force logout
            console.log("Session expired. Please log in again.");
            setToken(false);
            localStorage.removeItem("token");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
