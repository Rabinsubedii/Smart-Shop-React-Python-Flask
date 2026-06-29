import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const loadUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load users");
    }
  };

useEffect(() => {
  let isMounted = true;

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");

      if (isMounted) {
        setUsers(response.data);
      }
    } catch (error) {
      if (isMounted) {
        setMessage(
          error.response?.data?.message || "Failed to load users"
        );
      }
    }
  };

  fetchUsers();

  return () => {
    isMounted = false;
  };
}, []);
  const updateRole = async (userId, role) => {
    try {
      setUpdatingUserId(userId);
      await api.put(`/admin/users/${userId}/role`, { role });
      await loadUsers();
      setMessage("User role updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const blockUser = async (userId) => {
    try {
      setUpdatingUserId(userId);
      await api.put(`/admin/users/${userId}/block`);
      await loadUsers();
      setMessage("User blocked successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to block user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const unblockUser = async (userId) => {
    try {
      setUpdatingUserId(userId);
      await api.put(`/admin/users/${userId}/unblock`);
      await loadUsers();
      setMessage("User unblocked successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to unblock user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div style={styles.page}>
      <AdminSidebar />

      <main style={styles.main}>
        <h1 style={styles.title}>Manage Users</h1>
        <p style={styles.subtitle}>Manage customer accounts, roles, and status.</p>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p>Total Users</p>
            <h1>{users.length}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Admins</p>
            <h1>{users.filter((u) => u.role === "ADMIN").length}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Active</p>
            <h1>{users.filter((u) => u.status === "ACTIVE").length}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Blocked</p>
            <h1>{users.filter((u) => u.status === "BLOCKED").length}</h1>
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableTop}>
            <h2>User List</h2>

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isUpdating = updatingUserId === user.id;

                return (
                  <tr key={user.id}>
                    <td style={styles.td}>
                      <strong>{user.full_name}</strong>
                    </td>

                    <td style={styles.td}>{user.email}</td>

                    <td style={styles.td}>
                      <select
                        value={user.role}
                        disabled={isUpdating}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          user.status === "BLOCKED"
                            ? styles.blockedBadge
                            : styles.activeBadge
                        }
                      >
                        {user.status || "ACTIVE"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {user.status === "BLOCKED" ? (
                        <button
                          style={styles.unblockBtn}
                          disabled={isUpdating}
                          onClick={() => unblockUser(user.id)}
                        >
                          {isUpdating ? "Updating..." : "Unblock"}
                        </button>
                      ) : (
                        <button
                          style={styles.blockBtn}
                          disabled={isUpdating}
                          onClick={() => blockUser(user.id)}
                        >
                          {isUpdating ? "Updating..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "calc(100vh - 70px)",
    background: "#f5f5f5"
  },
  sidebar: {
    background: "#111827",
    color: "#fff",
    padding: "28px 22px"
  },
  logo: {
    fontSize: "22px",
    marginBottom: "30px"
  },
  navItem: {
    display: "block",
    color: "#d1d5db",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "8px"
  },
  activeNavItem: {
    display: "block",
    color: "#ffffff",
    background: "#2563eb",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "8px",
    fontWeight: "700"
  },
  main: {
    padding: "40px"
  },
  title: {
    fontSize: "36px",
    color: "#111827",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "24px"
  },
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px"
  },
  statCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  tableCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  search: {
    width: "320px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "14px",
    background: "#f9fafb",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb"
  },
  td: {
    padding: "16px 14px",
    borderBottom: "1px solid #e5e7eb"
  },
  select: {
    padding: "9px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  },
  activeBadge: {
    background: "#ecfdf5",
    color: "#16a34a",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700"
  },
  blockedBadge: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700"
  },
  blockBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "9px 13px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  unblockBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "9px 13px",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default AdminUsers;