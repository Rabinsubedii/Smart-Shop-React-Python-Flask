import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [message, setMessage] = useState("");

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    country: "Japan",
    city: "",
    postal_code: "",
    street_address: "",
    is_default: true
  });

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);

        if (isMounted) {
          setProduct(response.data);
          setMainImage(
            response.data.main_image_url ||
              response.data.thumbnail_url ||
              response.data.images?.[0] ||
              ""
          );
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load product");
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const addToWishlist = async () => {
    try {
      await api.post("/wishlist", {
        product_id: product.id
      });

      setMessage("Product added to wishlist");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add wishlist");
    }
  };

  const addToCart = async () => {
    try {
      await api.post("/cart", {
        product_id: product.id,
        quantity: 1
      });

      setMessage("Product added to cart");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add cart");
    }
  };

  const checkoutDirectly = async (addressId) => {
    try {
      await api.post("/orders", {
        address_id: addressId,
        payment_method: "Cash on Delivery",
        items: [
          {
            product_id: product.id,
            quantity: 1
          }
        ]
      });

      setShowAddressModal(false);
      setMessage("Order placed successfully with Cash on Delivery");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to place order");
    }
  };

  const placeOrder = async () => {
    try {
      const response = await api.get("/addresses");
      const addresses = response.data;

      if (addresses.length > 0) {
        const defaultAddress =
          addresses.find((address) => address.is_default) || addresses[0];

        await checkoutDirectly(defaultAddress.id);
      } else {
        setShowAddressModal(true);
        setMessage("Please add shipping address first");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Please login first");
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    });
  };

  const saveAddressAndOrder = async (e) => {
    e.preventDefault();

    try {
      await api.post("/addresses", addressForm);

      const response = await api.get("/addresses");
      const addresses = response.data;

      const defaultAddress =
        addresses.find((address) => address.is_default) ||
        addresses[addresses.length - 1];

      if (defaultAddress) {
        await checkoutDirectly(defaultAddress.id);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save address");
    }
  };

  if (!product) {
    return <h2 style={{ padding: "40px" }}>Loading product...</h2>;
  }

  const galleryImages = [
    product.main_image_url,
    product.thumbnail_url,
    ...(product.images || [])
  ].filter(Boolean);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.card}>
          <div>
            <div style={styles.mainImageBox}>
              <img src={mainImage} alt={product.title} style={styles.mainImage} />
            </div>

            {galleryImages.length > 0 && (
              <div style={styles.gallery}>
                {galleryImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Product"
                    style={{
                      ...styles.galleryImage,
                      border:
                        mainImage === image
                          ? "2px solid #2563eb"
                          : "1px solid #e5e7eb"
                    }}
                    onClick={() => setMainImage(image)}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={styles.info}>
            <span style={styles.badge}>SmartShop Product</span>

            <h1 style={styles.title}>{product.title}</h1>

            <div style={styles.rating}>
              ⭐ {product.rating || 0}
              <span style={styles.ratingText}> customer rating</span>
            </div>

            <h2 style={styles.price}>
              Rs.{Number(product.price).toLocaleString()}
            </h2>

            {Number(product.discount) > 0 && (
              <p style={styles.discount}>{product.discount}% OFF</p>
            )}

            <p style={styles.description}>{product.description}</p>

            <div style={styles.paymentBox}>
              <strong>Payment Method</strong>
              <p>Cash on Delivery available</p>
            </div>

            <div style={styles.buttons}>
              <button style={styles.wishlistBtn} onClick={addToWishlist}>
                Add to Wishlist
              </button>

              <button style={styles.cartBtn} onClick={addToCart}>
                Add to Cart
              </button>

              <button style={styles.orderBtn} onClick={placeOrder}>
                Place Order
              </button>
            </div>
          </div>
        </div>

        {showAddressModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setShowAddressModal(false)}
              >
                ×
              </button>

              <h2 style={styles.modalTitle}>Add Shipping Address</h2>
              <p style={styles.modalSubtitle}>
                Please add your address before placing order.
              </p>

              <form onSubmit={saveAddressAndOrder} style={styles.addressForm}>
                <input
                  name="full_name"
                  placeholder="Full Name"
                  value={addressForm.full_name}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={addressForm.phone}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  name="country"
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  name="city"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  name="postal_code"
                  placeholder="Postal Code"
                  value={addressForm.postal_code}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <textarea
                  name="street_address"
                  placeholder="Street Address"
                  value={addressForm.street_address}
                  onChange={handleAddressChange}
                  style={styles.textarea}
                  required
                />

                <button type="submit" style={styles.saveBtn}>
                  Save Address & Place Order
                </button>
              </form>
            </div>
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
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  card: {
    background: "#ffffff",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "45px"
  },
  mainImageBox: {
    height: "460px",
    background: "#f9fafb",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "25px"
  },
  gallery: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap"
  },
  galleryImage: {
    width: "90px",
    height: "90px",
    objectFit: "contain",
    background: "#ffffff",
    padding: "8px",
    borderRadius: "10px",
    cursor: "pointer"
  },
  info: {
    display: "flex",
    flexDirection: "column"
  },
  badge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    width: "fit-content",
    marginBottom: "18px"
  },
  title: {
    fontSize: "36px",
    color: "#111827",
    lineHeight: "1.25",
    marginBottom: "15px"
  },
  rating: {
    color: "#fbbf24",
    fontSize: "18px",
    marginBottom: "16px"
  },
  ratingText: {
    color: "#6b7280",
    marginLeft: "6px"
  },
  price: {
    fontSize: "38px",
    color: "#f97316",
    marginBottom: "8px"
  },
  discount: {
    color: "#ef4444",
    fontWeight: "700",
    marginBottom: "18px"
  },
  description: {
    color: "#4b5563",
    lineHeight: "1.8",
    fontSize: "16px",
    marginBottom: "24px"
  },
  paymentBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "24px",
    lineHeight: "1.7"
  },
  buttons: {
    display: "flex",
    gap: "12px"
  },
  wishlistBtn: {
    flex: 1,
    padding: "13px",
    border: "1px solid #2563eb",
    color: "#2563eb",
    background: "#ffffff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
  },
  cartBtn: {
    flex: 1,
    padding: "13px",
    border: "1px solid #f97316",
    color: "#f97316",
    background: "#fff7ed",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
  },
  orderBtn: {
    flex: 1,
    padding: "13px",
    border: "none",
    color: "#ffffff",
    background: "#2563eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
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
    width: "650px",
    maxWidth: "95%",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    position: "relative",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
  },
  closeBtn: {
    position: "absolute",
    top: "14px",
    right: "18px",
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    color: "#6b7280"
  },
  modalTitle: {
    fontSize: "26px",
    marginBottom: "8px"
  },
  modalSubtitle: {
    color: "#6b7280",
    marginBottom: "20px"
  },
  addressForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px"
  },
  input: {
    padding: "13px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  },
  textarea: {
    gridColumn: "1 / 3",
    padding: "13px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    minHeight: "90px"
  },
  saveBtn: {
    gridColumn: "1 / 3",
    padding: "14px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
  }
};

export default ProductDetails;