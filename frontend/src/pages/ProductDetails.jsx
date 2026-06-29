import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { FiTrash2 } from "react-icons/fi";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [message, setMessage] = useState("");

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
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
      window.dispatchEvent(new Event("cartUpdated"));

      setMessage("Product added to cart");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add cart");
    }
  };

  const checkoutDirectly = async (addressId) => {
  if (!addressId) {
    setMessage("Please select a shipping address");
    return;
  }

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
    console.log(error.response?.data);
    setMessage(error.response?.data?.message || "Failed to place order");
  }
};
const placeOrder = async () => {
  try {
    const response = await api.get("/addresses");

    setSavedAddresses(response.data);
    setShowAddressModal(true);

    if (response.data.length > 0) {
      const defaultAddress =
        response.data.find((address) => address.is_default) || response.data[0];

      setSelectedAddressId(defaultAddress.id);
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

const saveNewAddress = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post("/addresses", addressForm);

    const newAddress = response.data.address || response.data;

    const addressResponse = await api.get("/addresses");
    setSavedAddresses(addressResponse.data);

    setSelectedAddressId(newAddress.id);

    setAddressForm({
      full_name: "",
      phone: "",
      country: "Japan",
      city: "",
      postal_code: "",
      street_address: "",
      is_default: true
    });

    await checkoutDirectly(newAddress.id);

  } catch (error) {
    setMessage(error.response?.data?.message || "Failed to save address");
  }
};
  if (!product) {
    return <h2 style={{ padding: "40px" }}>Loading product...</h2>;
  }

  const deleteAddress = async (addressId) => {
  try {
    await api.delete(`/addresses/${addressId}`);

    const response = await api.get("/addresses");
    setSavedAddresses(response.data);

    if (selectedAddressId === addressId) {
      if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].id);
      } else {
        setSelectedAddressId(null);
      }
    }

    setMessage("Address deleted successfully.");
  } catch (error) {
    setMessage(error.response?.data?.message || "Failed to delete address.");
  }
};

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

      <h2 style={styles.modalTitle}>Shipping Address</h2>

      <p style={styles.modalSubtitle}>
        Select an existing address or add a new one.
      </p>

      {/* EXISTING SAVED ADDRESSES */}

     {savedAddresses.length > 0 && (
  <div style={styles.savedAddressBox}>
    <h3>Select Shipping Address</h3>

    {savedAddresses.map((address) => (
      <div
  key={address.id}
  style={{
    ...styles.addressOption,
    border:
      selectedAddressId === address.id
        ? "2px solid #2563eb"
        : "1px solid #e5e7eb",
    background:
      selectedAddressId === address.id
        ? "#eff6ff"
        : "#ffffff",
  }}
  onClick={() => setSelectedAddressId(address.id)}
>
        <div style={styles.addressLeft}>
          <input
            type="radio"
            name="address"
            checked={selectedAddressId === address.id}
            onChange={() => setSelectedAddressId(address.id)}
          />

          <div>
            <strong>{address.full_name}</strong>
            <br />
            {address.phone}
            <br />
            {address.street_address}, {address.city}, {address.postal_code}
          </div>
        </div>

        <button
          type="button"
          style={styles.deleteBtn}
          onClick={() => deleteAddress(address.id)}
          title="Delete Address"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    ))}
  </div>
)}

      {/* ADD NEW ADDRESS */}
      <h3 style={styles.addAddressTitle}>Add New Address</h3>
      <form onSubmit={saveNewAddress} style={styles.addressForm}>
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

       <div style={styles.buttonRow}>
          <button type="submit" style={styles.saveBtn}>
            Save New Address 
          </button>

          <button
            type="button"
            style={styles.finalOrderBtn}
            onClick={() => checkoutDirectly(selectedAddressId)}
          >
            Order Selected Address
          </button>
        </div>
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

  addressLeft: {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  flex: 1
},

addressOption: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ffffff",
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  marginTop: "10px"
},

deleteBtn: {
  width: "40px",
  height: "40px",
  border: "none",
  borderRadius: "50%",
  background: "#fee2e2",
  color: "#dc2626",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.2s ease"
},

buttonRow: {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
  marginTop: "18px"
},

  finalOrderBox: {
  marginTop: "22px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "18px"
},

finalOrderBtn: {
  width: "100%",
  padding: "16px",
  background: "#10b981",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px"
},
  addAddressTitle: {
  marginBottom: "12px",
  color: "#111827"
},
  container: {
    maxWidth: "1200px",
    margin: "0 auto"
  },

  savedAddressBox: {
   background: "#f9fafb",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  marginBottom: "20px",
  maxHeight: "230px",
  overflowY: "auto"
},

addressOption: {
  display: "flex",
  gap: "10px",
  background: "#ffffff",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  marginTop: "10px",
  cursor: "pointer",
  lineHeight: "1.6"
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
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "20px"
},

modal: {
  width: "1100px",
  maxWidth: "95%",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "24px",
  position: "relative",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
},

addressForm: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px"
},

textarea: {
  gridColumn: "1 / -1",
  padding: "13px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  minHeight: "70px",
  resize: "vertical"
},


saveBtn: {
  width: "100%",
  padding: "16px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px"
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

  input: {
    padding: "13px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  },


  
};

export default ProductDetails;