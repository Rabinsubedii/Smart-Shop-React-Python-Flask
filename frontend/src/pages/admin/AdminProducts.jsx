import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail_url: "",
    main_image_url: "",
    rating: "",
    discount: "",
    deal_score: "",
    category_id: "",
    source: "LOCAL"
  });

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load products");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const productResponse = await api.get("/products");
        const categoryResponse = await api.get("/categories");

        if (isMounted) {
          setProducts(productResponse.data);
          setCategories(categoryResponse.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load data");
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      thumbnail_url: "",
      main_image_url: "",
      rating: "",
      discount: "",
      deal_score: "",
      category_id: "",
      source: "LOCAL"
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);

    setFormData({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      thumbnail_url: product.thumbnail_url || "",
      main_image_url: product.main_image_url || "",
      rating: product.rating || "",
      discount: product.discount || "",
      deal_score: product.deal_score || "",
      category_id: product.category_id || "",
      source: product.source || "LOCAL"
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];

    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setUploadingImage(true);

      const response = await api.post("/upload-image", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setFormData((prev) => ({
        ...prev,
        [fieldName]: response.data.image_url
      }));

      setMessage("Image uploaded successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        rating: Number(formData.rating || 0),
        discount: Number(formData.discount || 0),
        deal_score: Number(formData.deal_score || 0),
        category_id: Number(formData.category_id)
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage("Product updated successfully");
      } else {
        await api.post("/products", payload);
        setMessage("Product added successfully");
      }

      closeModal();
      await loadProducts();
      await loadCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${productId}`);
      setMessage("Product deleted successfully");
      await loadProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete product");
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "No category";
  };

  const filteredProducts = products.filter((product) =>
    product.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <AdminSidebar />

      <main style={styles.main}>
        <h1 style={styles.title}>Manage Products</h1>
        <p style={styles.subtitle}>
          Add, update, delete, and monitor store products.
        </p>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p>Total Products</p>
            <h1 style={styles.statNumber}>{products.length}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Local Products</p>
            <h1 style={styles.statNumber}>
              {products.filter((p) => p.source === "LOCAL").length}
            </h1>
          </div>

          <div style={styles.statCard}>
            <p>Discounted</p>
            <h1 style={styles.statNumber}>
              {products.filter((p) => Number(p.discount) > 0).length}
            </h1>
          </div>

          <div style={styles.statCard}>
            <p>Categories</p>
            <h1 style={styles.statNumber}>{categories.length}</h1>
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableTop}>
            <button style={styles.addBtn} onClick={openAddModal}>
              + Add Product
            </button>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Rating</th>
                  <th style={styles.th}>Discount</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={styles.td}>
                      <img
                        src={product.thumbnail_url || product.main_image_url}
                        alt={product.title}
                        style={styles.image}
                      />
                    </td>

                    <td style={styles.td}>
                      <strong>{product.title}</strong>
                      <p style={styles.desc}>
                        {product.description?.slice(0, 65)}...
                      </p>
                    </td>

                    <td style={styles.td}>{getCategoryName(product.category_id)}</td>

                    <td style={styles.td}>
                      <strong style={styles.price}>
                        Rs.{Number(product.price).toLocaleString()}
                      </strong>
                    </td>

                    <td style={styles.td}>⭐ {product.rating || 0}</td>

                    <td style={styles.td}>
                      {Number(product.discount) > 0
                        ? `${product.discount}%`
                        : "-"}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionBox}>
                        <button
                          style={styles.editBtn}
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
                  <p style={styles.modalText}>
                    {editingId
                      ? "Update product information."
                      : "Create a new product for your store."}
                  </p>
                </div>

                <button style={styles.closeBtn} onClick={closeModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} style={styles.formGrid}>
                <input
                  name="title"
                  placeholder="Product title"
                  value={formData.title}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />

                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />

                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  placeholder="Rating"
                  value={formData.rating}
                  onChange={handleChange}
                  style={styles.input}
                />

                <input
                  name="discount"
                  type="number"
                  placeholder="Discount %"
                  value={formData.discount}
                  onChange={handleChange}
                  style={styles.input}
                />

                <input
                  name="deal_score"
                  type="number"
                  placeholder="Deal score"
                  value={formData.deal_score}
                  onChange={handleChange}
                  style={styles.input}
                />

                <div style={styles.uploadBox}>
                  <label style={styles.uploadLabel}>Thumbnail Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "thumbnail_url")}
                    style={styles.input}
                  />
                  {formData.thumbnail_url && (
                    <img
                      src={formData.thumbnail_url}
                      alt="Thumbnail preview"
                      style={styles.previewImage}
                    />
                  )}
                </div>

                <div style={styles.uploadBox}>
                  <label style={styles.uploadLabel}>Main Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "main_image_url")}
                    style={styles.input}
                  />
                  {formData.main_image_url && (
                    <img
                      src={formData.main_image_url}
                      alt="Main preview"
                      style={styles.previewImage}
                    />
                  )}
                </div>

                <textarea
                  name="description"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                />

                {uploadingImage && (
                  <p style={styles.uploadingText}>Uploading image...</p>
                )}

                <div style={styles.modalActions}>
                  <button style={styles.saveBtn} type="submit">
                    {editingId ? "Update Product" : "Add Product"}
                  </button>

                  <button type="button" style={styles.cancelBtn} onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

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
    minWidth: 0,
    overflowX: "hidden"
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
    gap: "15px",
    marginBottom: "20px"
  },
  statCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  statNumber: {
    fontSize: "32px",
    marginTop: "8px"
  },
  tableCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    minWidth: 0,
    overflow: "hidden"
  },
  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer"
  },
  search: {
    width: "320px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  tableWrap: {
    width: "100%",
    overflowX: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto"
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    background: "#f9fafb",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  td: {
    padding: "16px 12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle",
    fontSize: "14px",
    wordBreak: "normal"
  },
  image: {
    width: "58px",
    height: "58px",
    objectFit: "contain",
    background: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  },
  desc: {
    color: "#6b7280",
    marginTop: "5px",
    maxWidth: "210px",
    fontSize: "13px",
    lineHeight: "1.35"
  },
  price: {
    color: "#f97316"
  },
  actionBox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    whiteSpace: "nowrap"
  },
  editBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    minWidth: "65px"
  },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    minWidth: "65px"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "#fff",
    width: "760px",
    maxWidth: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px"
  },
  modalText: {
    color: "#6b7280",
    marginTop: "6px"
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    color: "#6b7280"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  uploadBox: {
    background: "#f9fafb",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb"
  },
  uploadLabel: {
    display: "block",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#374151"
  },
  previewImage: {
    width: "100%",
    height: "140px",
    objectFit: "contain",
    background: "#fff",
    borderRadius: "10px",
    marginTop: "12px",
    border: "1px solid #e5e7eb"
  },
  textarea: {
    gridColumn: "1 / 3",
    minHeight: "90px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  uploadingText: {
    gridColumn: "1 / 3",
    color: "#2563eb",
    fontWeight: "700"
  },
  modalActions: {
    gridColumn: "1 / 3",
    display: "flex",
    gap: "12px"
  },
  saveBtn: {
    flex: 1,
    padding: "13px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700"
  },
  cancelBtn: {
    flex: 1,
    padding: "13px",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700"
  }
};

export default AdminProducts;