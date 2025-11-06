import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Register from "./Register"; // import Register component
import "./Auth.css";

function Login({ setUser }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegister, setShowRegister] = useState(false); // local state to toggle Register
  const navigate = useNavigate();

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
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
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
