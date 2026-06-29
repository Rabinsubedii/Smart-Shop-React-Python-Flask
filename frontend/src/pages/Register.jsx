import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", formData);

      setMessage("Registration successful. Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.leftBox}>
          <h1 style={styles.brand}>SmartShop</h1>
          <p style={styles.brandText}>
            Create your account and start shopping with a smart e-commerce
            experience.
          </p>
        </div>

        <div style={styles.formBox}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Register as a new customer.</p>

          {message && <p style={styles.message}>{message}</p>}

          <form onSubmit={registerUser}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <button type="submit" style={styles.button}>
              Register
            </button>
          </form>

          <p style={styles.linkText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px"
  },
  card: {
    width: "950px",
    background: "#ffffff",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)"
  },
  leftBox: {
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#ffffff",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  brand: {
    fontSize: "42px",
    marginBottom: "18px"
  },
  brandText: {
    fontSize: "18px",
    lineHeight: "1.8",
    opacity: 0.9
  },
  formBox: {
    padding: "55px"
  },
  title: {
    fontSize: "34px",
    color: "#111827",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "25px"
  },
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px"
  },
  label: {
    display: "block",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "13px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px"
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px"
  },
  linkText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#6b7280"
  },
  link: {
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none"
  }
};

export default Register;