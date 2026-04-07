import axios from "axios";
import { useEffect } from "react";
import { auth } from "../firebase/firebase.init";

const axiosSecure = axios.create({
  baseURL: "http://localhost:5000",
});

const useAxiosSecure = () => {
  useEffect(() => {
    const interceptor = axiosSecure.interceptors.request.use(
      async (config) => {
        const user = auth.currentUser;

        if (user) {
          // 🔥 ALWAYS fresh Firebase token
          const token = await user.getIdToken();

          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosSecure.interceptors.request.eject(interceptor);
    };
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;