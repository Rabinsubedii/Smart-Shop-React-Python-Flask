import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Home() {
  const navigate = useNavigate();
const [products, setProducts] = useState([]);
const [visibleCount, setVisibleCount] = useState(8);

useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.slice(0, 40));
    } catch (error) {
      console.log("Failed to load products", error);
    }
  };

  loadProducts();
}, []);

const visibleProducts = products.slice(0, visibleCount);
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.content}>
          <span style={styles.badge}>SMART E-COMMERCE SYSTEM</span>

          <h1 style={styles.title}>
            Shop Smarter, Save More, <br />
            Enjoy Better Deals
          </h1>

          <p style={styles.subtitle}>
            Discover electronics, fashion, accessories, and daily best deals
            with a fast, simple, and modern shopping experience.
          </p>

          <div style={styles.buttons}>
            <Link to="/products" style={styles.primaryBtn}>
              Start Shopping
            </Link>

            <Link to="/best-deals" style={styles.secondaryBtn}>
              View Best Deals
            </Link>
          </div>

          <div style={styles.stats}>
            <div>
              <strong>100+</strong>
              <span> Products</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span> Shopping</span>
            </div>
            <div>
              <strong>COD</strong>
              <span> Payment</span>
            </div>
          </div>
        </div>



        <div style={styles.visualBox}>
          <div style={styles.discountCard}>
            🔥 Up to <strong>50% OFF</strong>
          </div>

          <img
            src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=900"
            alt="Online Shopping"
            style={styles.image}
          />

          <div style={styles.floatingCard}>
            ⭐ Best Deal Score
          </div>
        </div>
      </section>

<section style={styles.latestSection}>
  <div style={styles.sectionHeader}>
    <div>
      <h2 style={styles.sectionTitle}>Latest Products</h2>
      <p style={styles.sectionSubtitle}>
        Explore newly added products from our smart catalog.
      </p>
    </div>

    <Link to="/products" style={styles.viewAllBtn}>
      View All
    </Link>
  </div>

<div style={styles.productGrid}>
  {visibleProducts.map((product) => (
    <div
      style={styles.productCard}
      key={product.id}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div style={styles.productImageBox}>
        <img
          src={product.thumbnail_url || product.main_image_url}
          alt={product.title}
          style={styles.productImage}
        />
      </div>

      <div style={styles.productContent}>
        <h3 style={styles.productTitle}>
          {product.title?.length > 45
            ? product.title.substring(0, 45) + "..."
            : product.title}
        </h3>

        <div style={styles.productPriceRow}>
          <span style={styles.productPrice}>
            Rs.{Number(product.price).toLocaleString()}
          </span>

          {product.discount > 0 && (
            <span style={styles.productDiscountText}>
              -{product.discount}%
            </span>
          )}
        </div>

        <div style={styles.productRating}>
          ★★★★☆
          <span style={styles.productRatingCount}>
            ({product.rating || 0})
          </span>
        </div>
      </div>
    </div>
  ))}
</div>

  {visibleCount < products.length && (
    <div style={styles.loadMoreBox}>
      <button
        style={styles.loadMoreBtn}
        onClick={() => setVisibleCount((prev) => prev + 8)}
      >
        Load More Products
      </button>
    </div>
  )}
</section>


      <section style={styles.features}>
        <div style={styles.card}>
          <div style={styles.icon}>🚚</div>
          <h3>Fast Delivery</h3>
          <p>Quick and reliable product delivery experience.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>💵</div>
          <h3>Cash on Delivery</h3>
          <p>Order easily and pay safely when your product arrives.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>⭐</div>
          <h3>Quality Products</h3>
          <p>Browse selected products with ratings and descriptions.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🎁</div>
          <h3>Smart Best Deals</h3>
          <p>Find discounted products ranked by deal score.</p>
        </div>
      </section>

      {/* <section style={styles.promo}>
        <div>
          <h2 style={styles.promoTitle}>Ready to find your next favorite product?</h2>
          <p style={styles.promoText}>
            Explore our product catalog and discover smart recommendations.
          </p>
        </div>

        <Link to="/products" style={styles.promoBtn}>
          Explore Products
        </Link>
      </section> */}
    </div>
  );
}

const styles = {
  page: {
    background: "linear-gradient(180deg, #eff6ff 0%, #f5f5f5 45%)",
    minHeight: "calc(100vh - 70px)",
    padding: "45px"
  },

  latestSection: {
  maxWidth: "1250px",
  margin: "45px auto 0",
  // background: "#ffffff",
  padding: "35px",
  borderRadius: "24px",
  // boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
},

sectionHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px"
},

sectionTitle: {
  fontSize: "30px",
  color: "#111827",
  margin: 0
},

sectionSubtitle: {
  color: "#6b7280",
  marginTop: "8px"
},

viewAllBtn: {
  background: "#252526",
  color: "#ffffff",
  padding: "10px 18px",
  borderRadius: "10px",
  textDecoration: "none",
},

productGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px"
},

productCard: {
  background: "#ffffff",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  cursor: "pointer"
},

productImageBox: {
  height: "150px",
  width: "100%",
  overflow: "hidden",
  background: "#f5f5f5",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
},

productImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover"
},

productContent: {
  padding: "14px"
},

productTitle: {
  fontSize: "16px",
  fontWeight: "700",
  color: "#111827",
  lineHeight: "1.25",
  marginBottom: "10px"
},

productPriceRow: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px"
},

productPrice: {
  color: "#f97316",
  fontSize: "14px",
  fontWeight: "700"
},

productDiscountText: {
  color: "#555",
  fontSize: "11px"
},

productRating: {
  color: "#fbbf24",
  fontSize: "16px",
  marginBottom: "8px"
},

productRatingCount: {
  color: "#666",
  marginLeft: "6px"
},

loadMoreBox: {
  display: "flex",
  justifyContent: "center",
  marginTop: "30px"
},

loadMoreBtn: {
  padding: "13px 30px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  // fontWeight: "800"
},
  hero: {
    maxWidth: "1250px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "55px",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: "28px",
    padding: "65px",
    boxShadow: "0 20px 50px rgba(37,99,235,0.14)",
    position: "relative",
    overflow: "hidden"
  },

  content: {
    position: "relative",
    zIndex: 2
  },

  badge: {
    background: "#dbeafe",
    color: "#2563eb",
    padding: "9px 18px",
    borderRadius: "30px",
    fontWeight: "800",
    fontSize: "13px",
    letterSpacing: "0.5px"
  },

  title: {
    marginTop: "26px",
    fontSize: "56px",
    color: "#111827",
    lineHeight: "1.12",
    marginBottom: 0
  },

  subtitle: {
    marginTop: "22px",
    fontSize: "18px",
    color: "#6b7280",
    lineHeight: "1.8",
    maxWidth: "560px"
  },

  buttons: {
    display: "flex",
    gap: "18px",
    marginTop: "35px",
    flexWrap: "wrap"
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "15px 30px",
    borderRadius: "12px",
    textDecoration: "none",
    // fontWeight: "800",
    boxShadow: "0 10px 22px rgba(37,99,235,0.25)"
  },

  secondaryBtn: {
    background: "#ffffff",
    color: "#2563eb",
    border: "2px solid #2563eb",
    padding: "13px 28px",
    borderRadius: "12px",
    textDecoration: "none",
    // fontWeight: "800"
  },

  stats: {
    display: "flex",
    gap: "28px",
    marginTop: "38px",
    color: "#374151",
    flexWrap: "wrap"
  },

  visualBox: {
    position: "relative",
    display: "flex",
    justifyContent: "center"
  },

  image: {
    width: "100%",
    maxWidth: "520px",
    height: "420px",
    objectFit: "cover",
    borderRadius: "28px",
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)"
  },

  discountCard: {
    position: "absolute",
    top: "24px",
    left: "10px",
    background: "#ffffff",
    padding: "14px 18px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.16)",
    zIndex: 2,
    fontWeight: "700"
  },

  floatingCard: {
    position: "absolute",
    right: "12px",
    bottom: "28px",
    background: "#111827",
    color: "#ffffff",
    padding: "14px 18px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.16)",
    fontWeight: "800"
  },

  

  features: {
    maxWidth: "1250px",
    margin: "45px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "22px"
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "22px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb"
  },

  icon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    borderRadius: "18px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px"
  },

  promo: {
    maxWidth: "1250px",
    margin: "45px auto 0",
    background: "linear-gradient(135deg, #2563eb, #111827)",
    color: "#ffffff",
    borderRadius: "24px",
    padding: "36px 42px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.16)"
  },

  promoTitle: {
    margin: 0,
    fontSize: "28px"
  },

  promoText: {
    opacity: 0.9,
    marginTop: "10px"
  },

  promoBtn: {
    background: "#ffffff",
    color: "#2563eb",
    padding: "14px 26px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "800",
    whiteSpace: "nowrap"
  }
};

export default Home;