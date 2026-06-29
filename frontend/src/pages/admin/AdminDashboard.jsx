import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        if (isMounted) {
          setStats(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error.response?.data?.message || "Failed to load dashboard"
          );
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!stats) {
    return <h2 style={{ padding: "40px" }}>Loading dashboard...</h2>;
  }

  const orderStatus = stats.order_status || {};

  const statusTotal =
    (orderStatus.pending || 0) +
    (orderStatus.processing || 0) +
    (orderStatus.shipped || 0) +
    (orderStatus.delivered || 0) +
    (orderStatus.cancelled || 0);

  const getPercent = (value) => {
    if (!statusTotal) return 0;
    return Math.round((value / statusTotal) * 100);
  };

  const recentOrders = stats.recent_orders || [];

  return (
    <div style={styles.page}>
      <AdminSidebar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Analytics</h1>
            <p style={styles.subtitle}>
              Monitor store performance, revenue, order status, and recent
              activity.
            </p>
          </div>

          <Link to="/admin/products" style={styles.addBtn}>
            + Add Product
          </Link>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p>Total Users</p>
            <h1>{stats.total_users}</h1>
            <span>Registered customers</span>
          </div>

          <div style={styles.statCard}>
            <p>Total Products</p>
            <h1>{stats.total_products}</h1>
            <span>Products available</span>
          </div>

          <div style={styles.statCard}>
            <p>Total Orders</p>
            <h1>{stats.total_orders}</h1>
            <span>All customer orders</span>
          </div>

          <div style={styles.revenueCard}>
            <p>Total Revenue</p>
            <h1>Rs.{Number(stats.total_revenue || 0).toLocaleString()}</h1>
            <span>Cash on delivery sales</span>
          </div>
        </div>

        <div style={styles.analyticsGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2>Order Status Analytics</h2>
                <p>Current distribution of customer orders.</p>
              </div>
            </div>

            <div style={styles.statusList}>
              <StatusRow
                label="Pending"
                value={orderStatus.pending || 0}
                percent={getPercent(orderStatus.pending || 0)}
                color="#f97316"
              />

              <StatusRow
                label="Processing"
                value={orderStatus.processing || 0}
                percent={getPercent(orderStatus.processing || 0)}
                color="#2563eb"
              />

              <StatusRow
                label="Shipped"
                value={orderStatus.shipped || 0}
                percent={getPercent(orderStatus.shipped || 0)}
                color="#0891b2"
              />

              <StatusRow
                label="Delivered"
                value={orderStatus.delivered || 0}
                percent={getPercent(orderStatus.delivered || 0)}
                color="#16a34a"
              />

              <StatusRow
                label="Cancelled"
                value={orderStatus.cancelled || 0}
                percent={getPercent(orderStatus.cancelled || 0)}
                color="#dc2626"
              />
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2>Store Summary</h2>
                <p>Quick overview of store modules.</p>
              </div>
            </div>

            <div style={styles.summaryGrid}>
              <div style={styles.summaryBox}>
                <strong>{stats.total_categories}</strong>
                <span>Categories</span>
              </div>

              <div style={styles.summaryBox}>
                <strong>{stats.total_products}</strong>
                <span>Products</span>
              </div>

              <div style={styles.summaryBox}>
                <strong>{stats.total_orders}</strong>
                <span>Orders</span>
              </div>

              <div style={styles.summaryBox}>
                <strong>{stats.total_users}</strong>
                <span>Users</span>
              </div>
            </div>

            <div style={styles.quickActions}>
              <Link to="/admin/orders" style={styles.quickBtn}>
                Manage Orders
              </Link>

              <Link to="/admin/products" style={styles.quickBtn}>
                Manage Products
              </Link>

              <Link to="/admin/users" style={styles.quickBtn}>
                Manage Users
              </Link>

              <Link to="/admin/categories" style={styles.quickBtn}>
                Manage Categories
              </Link>
            </div>
          </div>
        </div>

        <div style={styles.recentPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2>Recent Orders</h2>
              <p>Latest customer purchases.</p>
            </div>

            <Link to="/admin/orders" style={styles.viewAll}>
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={styles.emptyBox}>No recent orders found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>#{order.id}</td>
                    <td style={styles.td}>{order.customer}</td>
                    <td style={styles.td}>
                      <strong style={styles.amount}>
                        Rs.{Number(order.total_amount).toLocaleString()}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      {order.payment_method || "Cash on Delivery"}
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusRow({ label, value, percent, color }) {
  return (
    <div style={styles.statusRow}>
      <div style={styles.statusTop}>
        <strong>{label}</strong>
        <span>
          {value} orders · {percent}%
        </span>
      </div>

      <div style={styles.progressBg}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percent}%`,
            background: color
          }}
        />
      </div>
    </div>
  );
}

const getStatusBadge = (status) => {
  if (status === "Processing") {
    return { ...styles.badge, ...styles.processing };
  }

  if (status === "Shipped") {
    return { ...styles.badge, ...styles.shipped };
  }

  if (status === "Delivered") {
    return { ...styles.badge, ...styles.delivered };
  }

  if (status === "Cancelled") {
    return { ...styles.badge, ...styles.cancelled };
  }

  return { ...styles.badge, ...styles.pending };
};

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "260px minmax(0, 1fr)",
    minHeight: "calc(100vh - 70px)",
    background: "#f5f5f5",
    overflowX: "hidden"
  },
  main: {
    padding: "40px",
    minWidth: 0
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px"
  },
  title: {
    fontSize: "36px",
    color: "#111827",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#6b7280"
  },
  addBtn: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700"
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
    gap: "18px",
    marginBottom: "25px"
  },
  statCard: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  revenueCard: {
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#ffffff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "22px",
    marginBottom: "25px"
  },
  panel: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  statusList: {
    display: "grid",
    gap: "18px"
  },
  statusRow: {
    display: "grid",
    gap: "8px"
  },
  statusTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#374151"
  },
  progressBg: {
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "20px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: "20px"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "20px"
  },
  summaryBox: {
    background: "#f9fafb",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    display: "grid",
    gap: "6px"
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  quickBtn: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    textDecoration: "none",
    fontWeight: "700"
  },
  recentPanel: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  viewAll: {
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none"
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
    padding: "14px",
    borderBottom: "1px solid #e5e7eb"
  },
  amount: {
    color: "#f97316"
  },
  badge: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "13px"
  },
  pending: {
    background: "#fff7ed",
    color: "#f97316"
  },
  processing: {
    background: "#eff6ff",
    color: "#2563eb"
  },
  shipped: {
    background: "#ecfeff",
    color: "#0891b2"
  },
  delivered: {
    background: "#ecfdf5",
    color: "#16a34a"
  },
  cancelled: {
    background: "#fef2f2",
    color: "#dc2626"
  },
  emptyBox: {
    background: "#f9fafb",
    padding: "35px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#6b7280"
  }
};

export default AdminDashboard;