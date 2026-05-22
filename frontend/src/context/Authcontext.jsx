// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure id is present for consistency
      if (parsedUser && !parsedUser.id) {
        parsedUser.id = parsedUser._id;
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalizedUser = { ...userData, id: userData.id || userData._id };
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    if (normalizedUser.token) {
      localStorage.setItem("token", normalizedUser.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); //
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
