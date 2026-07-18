import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: ""
  });

  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    if (name === "password") {
      validatePassword(value);
    }

    if (name === "confirm_password") {
      setPasswordError("");
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError(
        "Password must contain at least one uppercase letter."
      );
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setPasswordError(
        "Password must contain at least one lowercase letter."
      );
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number.");
      return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError(
        "Password must contain at least one special character."
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setMessage("");

    const isPasswordValid = validatePassword(formData.password);

    if (!isPasswordValid) {
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password
      };

      await api.post("/auth/register", registrationData);

      setMessage("Registration successful. Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
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
              minLength={2}
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
              style={{
                ...styles.input,
                borderColor: passwordError ? "#dc2626" : "#d1d5db"
              }}
              minLength={8}
              required
            />

            {/* <div style={styles.passwordRules}>
              <p
                style={
                  formData.password.length >= 8
                    ? styles.validRule
                    : styles.rule
                }
              >
                {formData.password.length >= 8 ? "✓" : "•"} At least 8
                characters
              </p>

              <p
                style={
                  /[A-Z]/.test(formData.password)
                    ? styles.validRule
                    : styles.rule
                }
              >
                {/[A-Z]/.test(formData.password) ? "✓" : "•"} One uppercase
                letter
              </p>

              <p
                style={
                  /[a-z]/.test(formData.password)
                    ? styles.validRule
                    : styles.rule
                }
              >
                {/[a-z]/.test(formData.password) ? "✓" : "•"} One lowercase
                letter
              </p>

              <p
                style={
                  /[0-9]/.test(formData.password)
                    ? styles.validRule
                    : styles.rule
                }
              >
                {/[0-9]/.test(formData.password) ? "✓" : "•"} One number
              </p>

              <p
                style={
                  /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                    ? styles.validRule
                    : styles.rule
                }
              >
                {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                  ? "✓"
                  : "•"}{" "}
                One special character
              </p>
            </div> */}

            <label style={styles.label}>Confirm Password</label>

            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: passwordError ? "#dc2626" : "#d1d5db"
              }}
              required
            />

            {passwordError && (
              <p style={styles.errorMessage}>{passwordError}</p>
            )}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
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
    maxWidth: "100%",
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

  errorMessage: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "-8px",
    marginBottom: "16px",
    fontSize: "14px"
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
    fontSize: "15px",
    boxSizing: "border-box"
  },

  passwordRules: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "-8px",
    marginBottom: "18px"
  },

  rule: {
    margin: "4px 0",
    color: "#6b7280",
    fontSize: "13px"
  },

  validRule: {
    margin: "4px 0",
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: "600"
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