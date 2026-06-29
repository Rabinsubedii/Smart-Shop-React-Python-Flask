import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Login successful");

      setTimeout(() => {
       window.location.href = "/products";
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.left}>
          <h1 style={styles.brand}>SmartShop</h1>
          <h2 style={styles.leftTitle}>Welcome back</h2>
          <p style={styles.leftText}>
            Login to access your wishlist, orders, best deals, and personalized shopping tools.
          </p>
        </div>

        <div style={styles.right}>
          <h2 style={styles.title}>Login</h2>
          <p style={styles.subtitle}>Continue to your account.</p>

          {message && <div style={styles.message}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={styles.bottomText}>
            Don’t have an account?{" "}
            <Link to="/register" style={styles.link}>
              Register
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#f5f7fb"
  },
  card: {
    width: "100%",
    maxWidth: "950px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)"
  },
  left: {
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "white",
    padding: "60px 45px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  brand: {
    fontSize: "28px",
    marginBottom: "50px"
  },
  leftTitle: {
    fontSize: "36px",
    marginBottom: "18px"
  },
  leftText: {
    fontSize: "16px",
    lineHeight: "1.7",
    opacity: 0.9
  },
  right: {
    padding: "50px 45px"
  },
  title: {
    fontSize: "30px",
    marginBottom: "8px",
    color: "#111827"
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "25px"
  },
  message: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    marginBottom: "18px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "5px"
  },
  bottomText: {
    marginTop: "22px",
    textAlign: "center",
    color: "#6b7280"
  },
  link: {
    color: "#2563eb",
    fontWeight: "600"
  }
};

export default Login;