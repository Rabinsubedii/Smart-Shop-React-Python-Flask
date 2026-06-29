import { useEffect, useState } from "react";
import api from "../api/axios";
import { HiOutlineTrash } from "react-icons/hi";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
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

    const loadCart = async () => {
      try {
        const response = await api.get("/cart");
        if (isMounted) setCartItems(response.data);
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
      window.dispatchEvent(new Event("cartUpdated"));
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cart_id !== cartId)
      );

      setMessage("Item removed from cart");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove item");
    }
  };

  const checkoutCart = async (addressId) => {
    if (!addressId) {
      setMessage("Please select a shipping address");
      return;
    }

    try {
      await api.post("/cart/checkout", {
        address_id: addressId
      });
      window.dispatchEvent(new Event("cartUpdated"));

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

      setSavedAddresses(addresses);
      setShowAddressForm(true);

      if (addresses.length > 0) {
        const defaultAddress =
          addresses.find((address) => address.is_default) || addresses[0];

        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Please login first");
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);

      const response = await api.get("/addresses");
      setSavedAddresses(response.data);

      if (selectedAddressId === addressId) {
        setSelectedAddressId(
          response.data.length > 0 ? response.data[0].id : null
        );
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete address");
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

      await checkoutCart(newAddress.id);
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
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setShowAddressForm(false)}
              >
                ×
              </button>

              <h2 style={styles.modalTitle}>Shipping Address</h2>

              <p style={styles.modalSubtitle}>
                Select an existing address or add a new one.
              </p>

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
                            : "#ffffff"
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
                          {address.street_address}, {address.city},{" "}
                          {address.postal_code}
                        </div>
                      </div>

                      <button
                        type="button"
                        style={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(address.id);
                        }}
                        title="Delete Address"
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={styles.addAddressTitle}>Add New Address</h3>

              <form onSubmit={saveAddressAndCheckout} style={styles.addressForm}>
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
                    Save Address & Checkout
                  </button>

                  <button
                    type="button"
                    style={styles.finalOrderBtn}
                    onClick={() => checkoutCart(selectedAddressId)}
                  >
                    Checkout Selected Address
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

  info: {
    minWidth: 0
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

  overlay: {
    position: "fixed",
    inset: 0,
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
    marginBottom: "8px",
    color: "#111827"
  },

  modalSubtitle: {
    color: "#6b7280",
    marginBottom: "20px"
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "10px",
    lineHeight: "1.6"
  },

  addressLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    flex: 1
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
    justifyContent: "center"
  },

  addAddressTitle: {
    marginBottom: "12px",
    color: "#111827"
  },

  addressForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px"
  },

  input: {
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px"
  },

  textarea: {
    gridColumn: "1 / -1",
    padding: "13px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    minHeight: "70px",
    resize: "vertical"
  },

  buttonRow: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginTop: "18px"
  },

  saveBtn: {
    width: "100%",
    padding: "16px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700"
  },

  finalOrderBtn: {
    width: "100%",
    padding: "16px",
    background: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700"
  }
};

export default Cart;