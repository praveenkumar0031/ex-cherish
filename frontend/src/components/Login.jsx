import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Register from "./Register";
import "./Auth.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setSuccess("");
      return;
    }

    try {
      const res = await API.post("users/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      let finalProfilePic = null;
      if (user.profilePic) {
        if (user.profilePic.startsWith("/uploads")) {
          finalProfilePic = `http://localhost:5000${user.profilePic}`;
        } else if (user.profilePic.startsWith("http")) {
          finalProfilePic = user.profilePic;
        }
      }

      const cleanUser = {
        ...user,
        profilePic: finalProfilePic,
        token: token
      };

      // Update Context
      login(cleanUser);

      setError("");
      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setSuccess("");
    }
  };

  if (showRegister) {
    return <Register setShowRegister={setShowRegister} />;
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <input
        type="email"
        name="email"
        placeholder="Enter email..."
        value={formData.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Enter password..."
        value={formData.password}
        onChange={handleChange}
      />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account?{" "}
        <span className="link" onClick={() => setShowRegister(true)}>
          Register
        </span>
      </p>
    </div>
  );
}

export default Login;
