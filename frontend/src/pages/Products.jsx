import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.log("Failed to fetch products", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.log("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await fetchCategories();
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory = selectedCategory
      ? product.category_id === Number(selectedCategory)
      : true;

    const matchesPrice = maxPrice
      ? Number(product.price) <= Number(maxPrice)
      : true;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMaxPrice("");
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
    <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Products</h1>
            <p style={styles.subtitle}>
              Search products, filter by category and price.
            </p>
          </div>

          <div style={styles.countBox}>
            {filteredProducts.length} Products
          </div>
        </div>

        <div style={styles.topSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.mainLayout}>
          <div style={styles.productArea}>
            {filteredProducts.length === 0 ? (
              <div style={styles.emptyBox}>
                <h3>No products found</h3>
                <p>Try another keyword, category, or price range.</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filteredProducts.map((product) => (
                  <div
                    style={styles.card}
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div style={styles.imageWrap}>
                      <img
                        src={product.thumbnail_url || product.main_image_url}
                        alt={product.title}
                        style={styles.image}
                      />
                    </div>

                    <div style={styles.content}>
                      <h3 style={styles.productTitle}>
                        {product.title?.length > 45
                          ? product.title.substring(0, 45) + "..."
                          : product.title}
                      </h3>

                      <div style={styles.priceRow}>
                        <span style={styles.price}>
                          Rs.{Number(product.price).toLocaleString()}
                        </span>

                        {product.discount > 0 && (
                          <span style={styles.discountText}>
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      <div style={styles.rating}>
                        ★★★★☆
                        <span style={styles.ratingCount}>
                          ({product.rating || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Categories</h3>

              <button
                style={
                  selectedCategory === ""
                    ? styles.activeCategory
                    : styles.categoryItem
                }
                onClick={() => setSelectedCategory("")}
              >
                All Categories
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  style={
                    selectedCategory === String(category.id)
                      ? styles.activeCategory
                      : styles.categoryItem
                  }
                  onClick={() => setSelectedCategory(String(category.id))}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Price Filter</h3>

              <label style={styles.label}>Maximum Price</label>
              <input
                type="number"
                placeholder="Example: 500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={styles.priceInput}
              />

              <div style={styles.priceButtons}>
                <button
                  style={styles.priceBtn}
                  onClick={() => setMaxPrice("100")}
                >
                  Under Rs.100
                </button>

                <button
                  style={styles.priceBtn}
                  onClick={() => setMaxPrice("500")}
                >
                  Under Rs.500
                </button>

                <button
                  style={styles.priceBtn}
                  onClick={() => setMaxPrice("1000")}
                >
                  Under Rs.1000
                </button>
              </div>

              <button style={styles.resetBtn} onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const styles = {
page: {
  padding: "40px 0",
  background: "#f5f5f5",
  minHeight: "calc(100vh - 70px)"
},
  container: {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "0 30px"
},
  loading: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
    padding: "12px 18px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    fontWeight: "600",
    color: "#2563eb"
  },
  topSearch: {
    marginBottom: "25px"
  },
  searchInput: {
    width: "100%",
    padding: "13px 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff"
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 260px",
    gap: "25px",
    alignItems: "start"
  },
  productArea: {
    width: "100%"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer"
  },
  imageWrap: {
    height: "150px",
    width: "100%",
    overflow: "hidden",
    background: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  content: {
    padding: "14px"
  },
  productTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    lineHeight: "1.25",
    marginBottom: "10px"
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px"
  },
  price: {
    color: "#f97316",
    fontSize: "14px",
    fontWeight: "700"
  },
  discountText: {
    color: "#555",
    fontSize: "11px"
  },
  rating: {
    color: "#fbbf24",
    fontSize: "16px",
    marginBottom: "8px"
  },
  ratingCount: {
    color: "#666",
    marginLeft: "6px"
  },
  sidebar: {
    position: "sticky",
    top: "90px"
  },
  sidebarCard: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "18px"
  },
  sidebarTitle: {
    fontSize: "18px",
    marginBottom: "14px",
    color: "#111827"
  },
  categoryItem: {
    width: "100%",
    display: "block",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "10px 8px",
    cursor: "pointer",
    borderRadius: "8px",
    color: "#374151",
    fontSize: "14px"
  },
  activeCategory: {
    width: "100%",
    display: "block",
    textAlign: "left",
    background: "#eff6ff",
    border: "none",
    padding: "10px 8px",
    cursor: "pointer",
    borderRadius: "8px",
    color: "#2563eb",
    fontWeight: "700",
    fontSize: "14px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "600"
  },
  priceInput: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px"
  },
  priceButtons: {
    display: "grid",
    gap: "8px",
    marginBottom: "12px"
  },
  priceBtn: {
    padding: "9px",
    border: "1px solid #ddd",
    background: "#ffffff",
    borderRadius: "8px",
    cursor: "pointer"
  },
  resetBtn: {
    width: "100%",
    padding: "10px",
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },
  emptyBox: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    color: "#6b7280"
  }
};

export default Products;