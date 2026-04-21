import axios from "axios";
import { useEffect } from "react";
import { getAppJwtIfValid } from "../utils/appJwtStorage";
import { API_BASE_URL } from "../config/api";

const axiosSecure = axios.create({
  baseURL: API_BASE_URL,
});

const useAxiosSecure = () => {
  useEffect(() => {
    const id = axiosSecure.interceptors.request.use(
      async (config) => {
        try {
          const token = getAppJwtIfValid();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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