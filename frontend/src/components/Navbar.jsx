import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import api from "../api/axios";
function Navbar() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [cartCount, setCartCount] = useState(0);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const firstLetter = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : "U";

    useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpenMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  const loadCartCount = async () => {
    try {
      const response = await api.get("/cart");
      setCartCount(response.data.length);
    } catch (error) {
      setCartCount(0);
    }
  };

  if (user) {
    loadCartCount();
  } else {
    setCartCount(0);
  }

  window.addEventListener("cartUpdated", loadCartCount);

  return () => {
    window.removeEventListener("cartUpdated", loadCartCount);
  };
}, [user]);
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>SmartShop</Link>

      <div style={styles.links}>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/products">Products</Link>
        <Link style={styles.link} to="/best-deals">Best Deals</Link>
        
                <Link to="/cart" style={styles.cart}>
                  <FaShoppingCart size={20} />

                  {cartCount > 0 && (
                      <span style={styles.cartBadge}>
                          {cartCount}
                      </span>
                  )}
                </Link>
        {user ? (
          <div style={styles.userMenu} ref={menuRef}>
            <button
              style={styles.avatarBtn}
              onClick={() => setOpenMenu(!openMenu)}
            >
              {firstLetter}
            </button>

            {openMenu && (
              <div style={styles.dropdown}>
                <p style={styles.userName}>{user.full_name}</p>

                <Link style={styles.dropdownItem} to="/profile">Profile</Link>
                <Link style={styles.dropdownItem} to="/orders">Orders</Link>
                <Link style={styles.dropdownItem} to="/wishlist">Wishlist</Link>
                {user.role === "ADMIN" && (
                  <Link style={styles.dropdownItem} to="/admin">
                    Dashboard
                  </Link>
                )}

                <button style={styles.logoutItem} onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link style={styles.link} to="/login">Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
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
    fontWeight: "500",
    fontSize: "15px"
  },
  cart: {
    position: "relative",
    color: "#111827",
    marginRight: "10px"
},

cartBadge: {
    position: "absolute",
    top: "-8px",
    right: "-10px",
    background: "#ef4444",
    color: "#fff",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    fontSize: "11px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "700"
},
  registerBtn: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "9px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "700"
  },
  userMenu: {
    position: "relative"
  },
  avatarBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "18px",
    cursor: "pointer"
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "52px",
    width: "190px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    padding: "12px",
    zIndex: 1000
  },
  userName: {
    fontWeight: "800",
    color: "#111827",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #e5e7eb"
  },
  dropdownItem: {
    display: "block",
    padding: "10px",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600"
  },
  logoutItem: {
    width: "100%",
    padding: "10px",
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    marginTop: "8px",
    cursor: "pointer",
    fontWeight: "700",
    textAlign: "left"
  }
};

export default Navbar;