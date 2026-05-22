import axios from "axios";

const API = axios.create({
  // Use VITE_BACKEND_URL if provided, otherwise default to localhost:5000
  // We ensure it ends with /api/ so all calls can just use relative paths
  baseURL: (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000") + "/api/",
});

// Add a request interceptor to attach the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., redirect to login or clear storage)
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
