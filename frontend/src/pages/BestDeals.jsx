import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function BestDeals() {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const openProductDetails = (product) => {
  localStorage.setItem(
    "selectedBestDeal",
    JSON.stringify(product)
  );

  navigate(`/best-deals/${product.id}`, {
    state: { product }
  });
};


  useEffect(() => {
    let isMounted = true;

    const loadDeals = async () => {
      try {
        const response = await api.get("/recommendations/best-deals");

        if (isMounted) {
          const result = Array.isArray(response.data)
            ? response.data
            : response.data.products || [];
          setDeals(result);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error.response?.data?.message || "Failed to load best deals",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDeals();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 150
      ) {
        setVisibleCount((prev) => {
          if (prev >= deals.length) return prev;
          return prev + 8;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [deals.length]);

  const visibleDeals = deals.slice(0, visibleCount);

  if (loading) {
    return <div style={styles.loading}>Loading best deals...</div>;
  }


  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <span style={styles.badge}>🔥 Limited Time Offers</span>
          <h1 style={styles.title}>Best Deals</h1>
          <p style={styles.subtitle}>
            Discover discounted products with the highest deal score.
          </p>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        {deals.length === 0 ? (
          <div style={styles.emptyBox}>No best deals available.</div>
        ) : (
          <>
            <div style={styles.grid}>
              {visibleDeals.map((product) => (
                <div
                  key={`${product.source}-${product.id}`}
                  style={styles.card}
                 onClick={() => openProductDetails(product)}
                >
                  <div style={styles.imageBox}>
                    {Number(product.discount) > 0 && (
                      <span style={styles.discountBadge}>
                        {Math.round(product.discount)}% OFF
                      </span>
                    )}

                    <img
                      src={product.thumbnail_url || product.main_image_url}
                      alt={product.title}
                      style={styles.image}
                    />
                  </div>

                  <div style={styles.body}>
                    <h3 style={styles.productTitle}>{product.title}</h3>

                    <p style={styles.desc}>
                      {product.description
                        ? product.description.slice(0, 75) + "..."
                        : "No description available."}
                    </p>

                    <div style={styles.infoRow}>
                      <strong style={styles.price}>
                        Rs.{Number(product.price).toLocaleString()}
                      </strong>

                      <span style={styles.rating}>
                        ⭐ {Number(product.rating).toFixed(1)}
                      </span>
                    </div>

                    <div style={styles.dealBox}>
                      <span>Deal Score</span>
                      <strong>{product.deal_score}</strong>
                    </div>

                    <button
                      type="button"style={styles.viewBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        openProductDetails(product);
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < deals.length && (
              <div style={styles.loadingMore}>Loading more deals...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight: "calc(100vh - 70px)",
    padding: "40px",
  },
  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },
  loading: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  hero: {
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#ffffff",
    padding: "45px",
    borderRadius: "20px",
    marginBottom: "30px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  },
  badge: {
    background: "rgba(255,255,255,0.18)",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "13px",
  },
  title: {
    fontSize: "44px",
    marginTop: "18px",
    marginBottom: "10px",
  },
  subtitle: {
    opacity: 0.9,
    fontSize: "17px",
  },
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "22px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    cursor: "pointer",
  },
  imageBox: {
    height: "190px",
    background: "#f9fafb",
    position: "relative",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#ef4444",
    color: "#ffffff",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "14px",
  },
  body: {
    padding: "18px",
  },
  productTitle: {
    fontSize: "17px",
    color: "#111827",
    minHeight: "45px",
    marginBottom: "10px",
  },
  desc: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    minHeight: "42px",
    marginBottom: "14px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  price: {
    color: "#f97316",
    fontSize: "18px",
  },
  rating: {
    color: "#374151",
    fontWeight: "700",
  },
  dealBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  viewBtn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
  emptyBox: {
    background: "#ffffff",
    padding: "45px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#6b7280",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  loadingMore: {
    textAlign: "center",
    padding: "25px",
    color: "#6b7280",
    fontWeight: "600",
    fontSize: "16px",
  },
};

export default BestDeals;
