import { useEffect, useState } from "react";
import api from "../api/axios";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

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

    const loadCart = async () => {
      try {
        const response = await api.get("/cart");

        if (isMounted) {
          setCartItems(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load cart");
        }
      }
    };

    loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateQuantity = async (cartId, quantity) => {
    if (quantity <= 0) return;

    try {
      await api.put(`/cart/${cartId}`, { quantity });

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_id === cartId
            ? {
                ...item,
                quantity,
                subtotal: Number(item.product.price) * quantity
              }
            : item
        )
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeItem = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cart_id !== cartId)
      );

      setMessage("Item removed from cart");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove item");
    }
  };

  const checkoutCart = async (addressId) => {
    try {
      await api.post("/cart/checkout", {
        address_id: addressId
      });

      setCartItems([]);
      setShowAddressForm(false);
      setMessage("Order placed successfully with Cash on Delivery");
    } catch (error) {
      setMessage(error.response?.data?.message || "Checkout failed");
    }
  };

  const proceedToCheckout = async () => {
    try {
      const response = await api.get("/addresses");
      const addresses = response.data;

      if (addresses.length > 0) {
        const defaultAddress =
          addresses.find((address) => address.is_default) || addresses[0];

        await checkoutCart(defaultAddress.id);
      } else {
        setShowAddressForm(true);
        setMessage("Please add your shipping address first");
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

  const saveAddressAndCheckout = async (e) => {
    e.preventDefault();

    try {
      await api.post("/addresses", addressForm);

      const addressResponse = await api.get("/addresses");
      const addresses = addressResponse.data;

      const defaultAddress =
        addresses.find((address) => address.is_default) ||
        addresses[addresses.length - 1];

      if (defaultAddress) {
        await checkoutCart(defaultAddress.id);
      }

      setAddressForm({
        full_name: "",
        phone: "",
        country: "Japan",
        city: "",
        postal_code: "",
        street_address: "",
        is_default: true
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save address");
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + Number(item.subtotal),
    0
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Shopping Cart</h1>

        {message && <p style={styles.message}>{message}</p>}

        {cartItems.length === 0 ? (
          <div style={styles.emptyBox}>Your cart is empty.</div>
        ) : (
          <div style={styles.layout}>
            <div style={styles.cartList}>
              {cartItems.map((item) => (
                <div style={styles.cartCard} key={item.cart_id}>
                  <img
                    src={item.product.thumbnail_url}
                    alt={item.product.title}
                    style={styles.image}
                  />

                  <div style={styles.info}>
                    <h3 style={styles.productTitle}>{item.product.title}</h3>

                    <p style={styles.price}>
                      Rs.{Number(item.product.price).toLocaleString()}
                    </p>

                    <div style={styles.qtyBox}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item.cart_id, item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <span style={styles.qty}>{item.quantity}</span>

                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item.cart_id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={styles.right}>
                    <strong style={styles.subtotal}>
                      Rs.{Number(item.subtotal).toLocaleString()}
                    </strong>

                    <button
                      style={styles.removeBtn}
                      onClick={() => removeItem(item.cart_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>

              <div style={styles.summaryRow}>
                <span>Total Items</span>
                <strong>{cartItems.length}</strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Total Amount</span>
                <strong style={styles.total}>
                  Rs.{totalAmount.toLocaleString()}
                </strong>
              </div>

              <div style={styles.paymentBox}>
                <p>💵 Payment Method</p>
                <strong>Cash on Delivery</strong>
              </div>

              <button style={styles.checkoutBtn} onClick={proceedToCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {showAddressForm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalBox}>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setShowAddressForm(false)}
              >
                ×
              </button>

              <h2 style={styles.addressTitle}>Add Shipping Address</h2>
              <p style={styles.modalSubtitle}>
                Please add your shipping address before checkout.
              </p>

              <form onSubmit={saveAddressAndCheckout} style={styles.addressForm}>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={addressForm.full_name}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={addressForm.phone}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  style={styles.input}
                  required
                />

                <input
                  type="text"
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
                  Save Address & Checkout
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
    padding: "40px 0",
    background: "#f5f5f5",
    minHeight: "calc(100vh - 70px)"
  },
    container: {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "0 30px"
},
  title: {
    fontSize: "34px",
    marginBottom: "25px",
    color: "#111827"
  },
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "25px",
    alignItems: "start"
  },
  cartList: {
    display: "grid",
    gap: "18px"
  },
  cartCard: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    display: "grid",
    gridTemplateColumns: "120px 1fr 160px",
    gap: "18px",
    alignItems: "center"
  },
  image: {
    width: "120px",
    height: "120px",
    objectFit: "contain",
    background: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  },
  productTitle: {
    fontSize: "18px",
    marginBottom: "8px",
    color: "#111827"
  },
  price: {
    color: "#f97316",
    fontWeight: "700",
    marginBottom: "12px"
  },
  qtyBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  qtyBtn: {
    width: "32px",
    height: "32px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700"
  },
  qty: {
    minWidth: "25px",
    textAlign: "center",
    fontWeight: "700"
  },
  right: {
    textAlign: "right"
  },
  subtotal: {
    display: "block",
    color: "#111827",
    marginBottom: "14px"
  },
  removeBtn: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "9px 12px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  summary: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    position: "sticky",
    top: "90px"
  },
  summaryTitle: {
    fontSize: "22px",
    marginBottom: "18px",
    color: "#111827"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "14px",
    color: "#374151"
  },
  total: {
    color: "#f97316"
  },
  paymentBox: {
    background: "#f9fafb",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    margin: "18px 0",
    lineHeight: "1.7"
  },
  checkoutBtn: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700"
  },
  emptyBox: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modalBox: {
    width: "650px",
    maxWidth: "95%",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
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
  addressTitle: {
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
    gap: "15px"
  },
  input: {
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px"
  },
  textarea: {
    gridColumn: "1 / 3",
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
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

export default Cart;