// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate stored token with /api/auth/me instead of blindly trusting localStorage
  // This catches expired tokens that are still in storage
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("auth/me");
        const freshUser = res.data;
        // Merge fresh server data with stored token
        const normalizedUser = {
          ...freshUser,
          id: freshUser._id,
          token,
        };
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      } catch {
        // Token is invalid or expired — clear storage silently
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback((userData, token) => {
    // Support both: login(userObj) where userObj has .token, or login(user, token) separately
    const resolvedToken = token || userData.token;
    const resolvedUser = {
      ...userData,
      id: userData.id || userData._id,
      token: resolvedToken,
    };

    setUser(resolvedUser);
    localStorage.setItem("user", JSON.stringify(resolvedUser));
    if (resolvedToken) {
      localStorage.setItem("token", resolvedToken);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  // Update user data (e.g., after profile edit)
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
