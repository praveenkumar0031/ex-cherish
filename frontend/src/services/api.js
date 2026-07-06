import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/`,
  withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// BUG FIX: Previous 401 interceptor caused an infinite redirect loop:
// If /api/auth/login returned 401 (wrong password), the interceptor would
// clear storage and redirect to /login — which then re-triggers the request
// cycle. Now we skip the auto-logout for auth routes.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("auth/login") ||
                        error.config?.url?.includes("auth/register");

    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid for a protected route — force logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use replace to avoid back-button loop
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default API;
