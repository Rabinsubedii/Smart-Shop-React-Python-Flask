import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.content}>
          <span style={styles.badge}>SMART E-COMMERCE SYSTEM</span>

          <h1 style={styles.title}>
            Discover the Latest <br />
            Products at the Best Prices
          </h1>

          <p style={styles.subtitle}>
            Shop electronics, fashion, accessories and many more with a modern
            shopping experience.
          </p>

          <div style={styles.buttons}>
            <Link to="/products" style={styles.primaryBtn}>
              Shop Now
            </Link>

            <Link to="/best-deals" style={styles.secondaryBtn}>
              Best Deals
            </Link>
          </div>
        </div>

        <div style={styles.imageBox}>
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900"
            alt="Shopping"
            style={styles.image}
          />
        </div>
      </div>

      <div style={styles.features}>
        <div style={styles.card}>
          <h3>🚚 Fast Delivery</h3>
          <p>Quick and secure delivery to your doorstep.</p>
        </div>

        <div style={styles.card}>
          <h3>💳 Secure Payment</h3>
          <p>Safe payment with Cash on Delivery.</p>
        </div>

        <div style={styles.card}>
          <h3>⭐ Quality Products</h3>
          <p>High-quality products at affordable prices.</p>
        </div>

        <div style={styles.card}>
          <h3>🎁 Best Deals</h3>
          <p>Daily discounts and exclusive offers.</p>
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

  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "50px",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "60px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
  },

  badge: {
    background: "#2563eb",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "30px",
    fontWeight: "700",
    fontSize: "13px"
  },

  title: {
    marginTop: "25px",
    fontSize: "52px",
    color: "#111827",
    lineHeight: "1.2"
  },

  subtitle: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#6b7280",
    lineHeight: "1.8"
  },

  buttons: {
    display: "flex",
    gap: "18px",
    marginTop: "35px"
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "14px 28px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700"
  },

  secondaryBtn: {
    background: "#fff",
    color: "#2563eb",
    border: "2px solid #2563eb",
    padding: "14px 28px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700"
  },

  imageBox: {
    textAlign: "center"
  },

  image: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "20px"
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "25px",
    marginTop: "45px"
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  }
};

export default Home;