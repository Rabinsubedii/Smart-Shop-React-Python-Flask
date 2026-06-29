import { useEffect, useState } from "react";
import api from "../api/axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders");

        if (isMounted) {
          setOrders(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load orders");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return styles.delivered;

      case "Shipped":
        return styles.shipped;

      case "Processing":
        return styles.processing;

      case "Cancelled":
        return styles.cancelled;

      default:
        return styles.pending;
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading your orders...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Orders</h1>

        <p style={styles.subtitle}>
          Track your recent purchases.
        </p>

        {message && (
          <p style={styles.message}>
            {message}
          </p>
        )}

        {orders.length === 0 ? (
          <div style={styles.emptyCard}>
            <h2>No Orders Yet</h2>

            <p>
              Your purchased products will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={styles.orderCard}
              >
                <div style={styles.header}>
                  <div>
                    <h3>
                      Order #{order.id}
                    </h3>

                    <p style={styles.date}>
                      {new Date(
                        order.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      ...getStatusStyle(order.status)
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div style={styles.summary}>
                  <div>
                    <span>Total</span>

                    <strong>
                      Rs.
                      {Number(
                        order.total_amount
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>

                    <strong>
                      {order.payment_method ||
                        "Cash on Delivery"}
                    </strong>
                  </div>
                </div>

                {order.items &&
                  order.items.length > 0 && (
                    <>
                      <h4 style={styles.productTitle}>
                        Products
                      </h4>

                      <div style={styles.productList}>
                        {order.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              style={styles.product}
                            >
                              <img
                                src={
                                  item.product_image
                                }
                                alt={
                                  item.product_title
                                }
                                style={styles.image}
                              />

                              <div
                                style={{
                                  flex: 1
                                }}
                              >
                                <strong>
                                  {
                                    item.product_title
                                  }
                                </strong>

                                <p
                                  style={
                                    styles.qty
                                  }
                                >
                                  Qty:
                                  {
                                    item.quantity
                                  }
                                </p>
                              </div>

                              <strong>
                                Rs.
                                {Number(
                                  item.subtotal
                                ).toLocaleString()}
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight:
      "calc(100vh - 70px)",
    padding: "40px"
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto"
  },

  title: {
    fontSize: "36px",
    marginBottom: "8px",
    color: "#111827"
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: "25px"
  },

  loading: {
    padding: "80px",
    textAlign: "center",
    fontSize: "20px"
  },

  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px"
  },

  emptyCard: {
    background: "#ffffff",
    padding: "60px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow:
      "0 5px 15px rgba(0,0,0,.08)"
  },

  orderList: {
    display: "grid",
    gap: "20px"
  },

  orderCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow:
      "0 5px 15px rgba(0,0,0,.08)"
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  date: {
    color: "#6b7280",
    marginTop: "5px"
  },

  badge: {
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "700"
  },

  pending: {
    background: "#fff7ed",
    color: "#f97316"
  },

  processing: {
    background: "#eff6ff",
    color: "#2563eb"
  },

  shipped: {
    background: "#ecfeff",
    color: "#0891b2"
  },

  delivered: {
    background: "#ecfdf5",
    color: "#16a34a"
  },

  cancelled: {
    background: "#fef2f2",
    color: "#dc2626"
  },

  summary: {
    display: "flex",
    justifyContent:
      "space-between",
    padding: "18px",
    background: "#f9fafb",
    borderRadius: "12px",
    marginBottom: "20px"
  },

  productTitle: {
    marginBottom: "15px",
    color: "#111827"
  },

  productList: {
    display: "grid",
    gap: "15px"
  },

  product: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px"
  },

  image: {
    width: "70px",
    height: "70px",
    objectFit: "contain",
    background: "#f9fafb",
    borderRadius: "8px"
  },

  qty: {
    marginTop: "5px",
    color: "#6b7280"
  }
};

export default Orders;