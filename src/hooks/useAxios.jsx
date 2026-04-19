import axios from "axios";
import { API_BASE_URL } from "../config/api";

const useAxios = () => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  return axiosInstance;
};

export default useAxios;