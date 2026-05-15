import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const apiClient = axios.create({
    baseURL: BASE_API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
