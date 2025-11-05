// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("chatUser")) || null
  );

  const login = (data) => {
    setUser(data);
    localStorage.setItem("chatUser", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chatUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(Authcontext);
