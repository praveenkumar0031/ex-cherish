import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ import navigation hook
import "./Auth.css";

function Login({ setUser, setShowRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ create navigation instance

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { email, password } = formData;
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
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
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";


      setUser(user);
      setError("");

      // ✅ redirect to dashboard after login
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

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
        <span onClick={() => setShowRegister(true)}>Register</span>
      </p>
    </div>
  );
}

export default Login;
