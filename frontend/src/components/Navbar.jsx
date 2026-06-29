import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        SmartShop
      </Link>

      <div style={styles.links}>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/products">Products</Link>
        <Link style={styles.link} to="/best-deals">Best Deals</Link>

        {user ? (
          <>
            <Link style={styles.link} to="/wishlist">Wishlist</Link>
            <Link style={styles.link} to="/orders">Orders</Link>
            <Link style={styles.link} to="/cart">Cart</Link>
            <Link style={styles.link} to="/profile">Profile</Link>

            {user.role === "ADMIN" && (
              <Link style={styles.link} to="/admin">
                Dashboard
              </Link>
            )}

            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link style={styles.link} to="/login">Login</Link>
            <Link to="/register" style={styles.registerBtn}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: "70px",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 60px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 999
  },
  logo: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#2563eb",
    textDecoration: "none"
  },
  links: {
    display: "flex",
    gap: "22px",
    alignItems: "center"
  },
  link: {
    color: "#111827",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px"
  },
  registerBtn: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "9px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "700"
  },
  logoutBtn: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
  }
};

export default Navbar;