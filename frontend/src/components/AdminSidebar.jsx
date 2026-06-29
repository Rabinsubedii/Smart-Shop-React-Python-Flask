import { Link, useLocation } from "react-router-dom";

function AdminSidebar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>SmartShop Admin</h2>

      <Link
        to="/admin"
        style={
          isActive("/admin")
            ? styles.activeNavItem
            : styles.navItem
        }
      >
        Dashboard
      </Link>

      <Link
        to="/admin/orders"
        style={
          isActive("/admin/orders")
            ? styles.activeNavItem
            : styles.navItem
        }
      >
        Orders
      </Link>

      <Link
        to="/admin/products"
        style={
          isActive("/admin/products")
            ? styles.activeNavItem
            : styles.navItem
        }
      >
        Products
      </Link>

      <Link
        to="/admin/categories"
        style={
          isActive("/admin/categories")
            ? styles.activeNavItem
            : styles.navItem
        }
      >
        Categories
      </Link>

      <Link
        to="/admin/users"
        style={
          isActive("/admin/users")
            ? styles.activeNavItem
            : styles.navItem
        }
      >
        Users
      </Link>
    </aside>
  );
}

const styles = {
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
    marginBottom: "8px",
    textDecoration: "none"
  },
  activeNavItem: {
    display: "block",
    color: "#ffffff",
    background: "#2563eb",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "8px",
    fontWeight: "700",
    textDecoration: "none"
  }
};

export default AdminSidebar;