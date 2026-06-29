import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchWishlist = async () => {
      try {
        const response = await api.get("/wishlist");

        if (isMounted) {
          setWishlist(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load wishlist");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const removeWishlist = async (wishlistId) => {
    try {
      await api.delete(`/wishlist/${wishlistId}`);

      setWishlist((prevItems) =>
        prevItems.filter((item) => item.wishlist_id !== wishlistId)
      );

      setMessage("Product removed from wishlist");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove product");
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post("/cart", {
        product_id: productId,
        quantity: 1
      });

      setMessage("Product added to cart");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add cart");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading wishlist...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Wishlist</h1>
            <p style={styles.subtitle}>
              Products you saved for later.
            </p>
          </div>

          <div style={styles.countBox}>
            {wishlist.length} Items
          </div>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        {wishlist.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2>Your wishlist is empty.</h2>
            <p>Save products you like and they will appear here.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {wishlist.map((item) => (
              <div style={styles.card} key={item.wishlist_id}>
                <div
                  style={styles.imageBox}
                  onClick={() => navigate(`/products/${item.product.id}`)}
                >
                  <img
                    src={
                      item.product.thumbnail_url ||
                      item.product.main_image_url
                    }
                    alt={item.product.title}
                    style={styles.image}
                  />
                </div>

                <div style={styles.body}>
                  <h3
                    style={styles.productTitle}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    {item.product.title?.length > 45
                      ? item.product.title.slice(0, 45) + "..."
                      : item.product.title}
                  </h3>

                  <p style={styles.price}>
                    Rs.{Number(item.product.price).toLocaleString()}
                  </p>

                  <div style={styles.actions}>
                    <button
                      style={styles.cartBtn}
                      onClick={() => addToCart(item.product.id)}
                    >
                      Add to Cart
                    </button>

                    <button
                      style={styles.removeBtn}
                      onClick={() => removeWishlist(item.wishlist_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    maxWidth: "1200px",
    margin: "0 auto"
  },
  loading: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px"
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
  countBox: {
    background: "#ffffff",
    color: "#2563eb",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  emptyBox: {
    background: "#ffffff",
    padding: "55px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#6b7280",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  imageBox: {
    height: "180px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "12px"
  },
  body: {
    padding: "16px"
  },
  productTitle: {
    fontSize: "17px",
    color: "#111827",
    minHeight: "45px",
    cursor: "pointer",
    marginBottom: "10px"
  },
  price: {
    color: "#f97316",
    fontWeight: "800",
    fontSize: "18px",
    marginBottom: "14px"
  },
  actions: {
    display: "flex",
    gap: "10px"
  },
  cartBtn: {
    flex: 1,
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "11px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
  },
  removeBtn: {
    flex: 1,
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "11px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
  }
};

export default Wishlist;