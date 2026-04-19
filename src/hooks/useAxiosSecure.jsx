import axios from "axios";
import { useEffect } from "react";
import { auth } from "../firebase/firebase.init";
import { getFreshFirebaseIdToken } from "../utils/firebaseIdToken";
import { API_BASE_URL } from "../config/api";

const axiosSecure = axios.create({
  baseURL: API_BASE_URL,
});

const useAxiosSecure = () => {
  useEffect(() => {
    const id = axiosSecure.interceptors.request.use(
      async (config) => {
        try {
          const user = auth.currentUser;
          if (user) {
            try {
              const token = await getFreshFirebaseIdToken(user);
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            } catch (e) {
              console.warn(
                "[axios] Skipping Firebase token (public request can still proceed):",
                e?.message || e
              );
            }
          }
        } catch {
          /* never block the request */
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosSecure.interceptors.request.eject(id);
    };
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;