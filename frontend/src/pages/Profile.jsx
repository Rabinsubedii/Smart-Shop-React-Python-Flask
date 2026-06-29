import { useEffect, useState } from "react";
import api from "../api/axios";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: ""
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");

        if (isMounted) {
          setProfile(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load profile");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      await api.put("/auth/profile", profile);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    try {
      await api.put("/auth/change-password", passwordData);

      setPasswordData({
        current_password: "",
        new_password: ""
      });

      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading Profile...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Profile</h1>

        <p style={styles.subtitle}>
          Manage your personal information.
        </p>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2>Personal Information</h2>

            <form onSubmit={updateProfile}>
              <label style={styles.label}>Full Name</label>

              <input
                style={styles.input}
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    full_name: e.target.value
                  })
                }
              />

              <label style={styles.label}>Email</label>

              <input
                style={styles.input}
                value={profile.email}
                disabled
              />

              <label style={styles.label}>Phone</label>

              <input
                style={styles.input}
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    phone: e.target.value
                  })
                }
              />

              <button style={styles.button}>
                Save Changes
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h2>Change Password</h2>

            <form onSubmit={updatePassword}>
              <label style={styles.label}>
                Current Password
              </label>

              <input
                type="password"
                style={styles.input}
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    current_password: e.target.value
                  })
                }
              />

              <label style={styles.label}>
                New Password
              </label>

              <input
                type="password"
                style={styles.input}
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value
                  })
                }
              />

              <button style={styles.passwordBtn}>
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight: "calc(100vh - 70px)",
    padding: "40px"
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto"
  },

  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    fontSize: "22px"
  },

  title: {
    fontSize: "36px",
    color: "#111827",
    marginBottom: "8px"
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: "30px"
  },

  message: {
    background: "#ecfdf5",
    color: "#16a34a",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px"
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,.08)"
  },

  label: {
    display: "block",
    marginTop: "18px",
    marginBottom: "8px",
    fontWeight: "600"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  },

  button: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700"
  },

  passwordBtn: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700"
  }
};

export default Profile;