import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: ""
  });

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

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        if (isMounted) {
          setCategories(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load categories");
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      image_url: ""
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);

    setFormData({
      name: category.name || "",
      description: category.description || "",
      image_url: category.image_url || ""
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

  const handleImageUpload = async (e) => {
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
        image_url: response.data.image_url
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
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        setMessage("Category updated successfully");
      } else {
        await api.post("/categories", formData);
        setMessage("Category added successfully");
      }

      closeModal();
      await loadCategories();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          (editingId ? "Failed to update category" : "Failed to add category")
      );
    }
  };

  const handleDelete = async (categoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${categoryId}`);
      setMessage("Category deleted successfully");
      await loadCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div style={styles.page}>
      <AdminSidebar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Manage Categories</h1>
            <p style={styles.subtitle}>
              Add, update, and delete product categories.
            </p>
          </div>

          <button style={styles.addBtn} onClick={openAddModal}>
            + Add Category
          </button>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p>Total Categories</p>
            <h1 style={styles.statNumber}>{categories.length}</h1>
          </div>

          <div style={styles.statCard}>
            <p>With Images</p>
            <h1 style={styles.statNumber}>
              {categories.filter((c) => c.image_url).length}
            </h1>
          </div>

          <div style={styles.statCard}>
            <p>Without Images</p>
            <h1 style={styles.statNumber}>
              {categories.filter((c) => !c.image_url).length}
            </h1>
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2>Category List</h2>

            <span style={styles.countBadge}>
              {categories.length} Categories
            </span>
          </div>

          {categories.length === 0 ? (
            <div style={styles.emptyBox}>No categories found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td style={styles.td}>#{category.id}</td>

                    <td style={styles.td}>
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          style={styles.image}
                        />
                      ) : (
                        <span style={styles.noImage}>No Image</span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <strong>{category.name}</strong>
                    </td>

                    <td style={styles.td}>
                      {category.description || "-"}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionBox}>
                        <button
                          style={styles.editBtn}
                          onClick={() => openEditModal(category)}
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(category.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
                  <p style={styles.modalText}>
                    {editingId
                      ? "Update existing category information."
                      : "Create a new category for your store."}
                  </p>
                </div>

                <button style={styles.closeBtn} onClick={closeModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Category name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />

                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Category description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                />

                <label style={styles.label}>Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={styles.input}
                />

                {uploadingImage && (
                  <p style={styles.uploadingText}>Uploading image...</p>
                )}

                {formData.image_url && (
                  <div style={styles.previewBox}>
                    <img
                      src={formData.image_url}
                      alt="Category preview"
                      style={styles.previewImage}
                    />
                  </div>
                )}

                <div style={styles.modalActions}>
                  <button type="submit" style={styles.saveBtn}>
                    {editingId ? "Update Category" : "Add Category"}
                  </button>

                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={closeModal}
                  >
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
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
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
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "25px"
  },
  statCard: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  statNumber: {
    fontSize: "32px",
    marginTop: "8px"
  },
  tableCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    overflowX: "auto"
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  countBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 12px",
    borderRadius: "20px",
    fontWeight: "700"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px"
  },
  th: {
    textAlign: "left",
    padding: "14px",
    background: "#f9fafb",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb"
  },
  td: {
    padding: "15px 14px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle"
  },
  image: {
    width: "65px",
    height: "65px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb"
  },
  noImage: {
    color: "#9ca3af",
    fontSize: "13px"
  },
  actionBox: {
    display: "flex",
    gap: "10px",
    whiteSpace: "nowrap"
  },
  editBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },
  emptyBox: {
    background: "#f9fafb",
    padding: "35px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#6b7280"
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
    width: "620px",
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
  label: {
    display: "block",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "8px",
    marginTop: "16px"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  textarea: {
    width: "100%",
    minHeight: "95px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  uploadingText: {
    color: "#2563eb",
    fontWeight: "700",
    marginTop: "12px"
  },
  previewBox: {
    marginTop: "14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "12px",
    textAlign: "center"
  },
  previewImage: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    background: "#ffffff",
    borderRadius: "10px"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px"
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

export default AdminCategories;