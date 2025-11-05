import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Register({ setShowRegister }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { name, email, password } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });

      setSuccess("Registration successful! You can now login.");
      setError("");
      setTimeout(() => {
        setShowRegister(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setSuccess("");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <input
        type="text"
        name="name"
        placeholder="Enter your name..."
        value={formData.name}
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Enter your email..."
        value={formData.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Create a password..."
        value={formData.password}
        onChange={handleChange}
      />

      <button onClick={handleRegister}>Register</button>

      <p>
        Already have an account?{" "}
        <span onClick={() => setShowRegister(false)}>Login</span>
      </p>
    </div>
  );
}

export default Register;
