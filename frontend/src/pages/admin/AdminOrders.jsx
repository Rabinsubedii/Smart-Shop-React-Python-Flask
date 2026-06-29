import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const response = await api.get("/admin/orders");

        if (isMounted) {
          setOrders(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.response?.data?.message || "Failed to load orders");
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setMessage("");

      await new Promise((resolve) => setTimeout(resolve, 1200));

      await api.put(`/admin/orders/${orderId}/status`, { status });

      await loadOrders();

      setMessage("Order status updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const viewOrder = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load order details");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const getOrderId = (order) => order.order_id || order.id;

  const getCustomerName = (order) =>
    order.customer_name || order.customer || "Unknown Customer";

  const getCustomerEmail = (order) =>
    order.customer_email || order.email || "No email";

  const filteredOrders = orders.filter((order) => {
    const customer = getCustomerName(order).toLowerCase();
    const email = getCustomerEmail(order).toLowerCase();
    const orderId = String(getOrderId(order));

    return (
      customer.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      orderId.includes(search)
    );
  });

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  const getStatusStyle = (status) => {
    if (status === "Processing") {
      return { ...styles.statusBadge, ...styles.processing };
    }

    if (status === "Shipped") {
      return { ...styles.statusBadge, ...styles.shipped };
    }

    if (status === "Delivered") {
      return { ...styles.statusBadge, ...styles.delivered };
    }

    if (status === "Cancelled") {
      return { ...styles.statusBadge, ...styles.cancelled };
    }

    return { ...styles.statusBadge, ...styles.pending };
  };

  return (
    <div style={styles.page}>
      <AdminSidebar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Manage Orders</h1>
            <p style={styles.subtitle}>
              View customer orders and update delivery status.
            </p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p>Total Orders</p>
            <h1>{orders.length}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Pending</p>
            <h1>{pendingCount}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Shipped</p>
            <h1>{shippedCount}</h1>
          </div>

          <div style={styles.statCard}>
            <p>Delivered</p>
            <h1>{deliveredCount}</h1>
          </div>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.tableCard}>
          <div style={styles.tableTop}>
            <h2 style={styles.tableTitle}>Order List</h2>

            <input
              type="text"
              placeholder="Search by customer, email, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.search}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div style={styles.emptyBox}>No orders found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Update Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const orderId = getOrderId(order);
                  const isUpdating = updatingOrderId === orderId;

                  return (
                    <tr key={orderId}>
                      <td style={styles.td}>
                        <strong>#{orderId}</strong>
                      </td>

                      <td style={styles.td}>
                        <strong>{getCustomerName(order)}</strong>
                        <br />
                        <small style={styles.email}>
                          {getCustomerEmail(order)}
                        </small>
                      </td>

                      <td style={styles.td}>
                        <strong style={styles.amount}>
                          Rs.{Number(order.total_amount).toLocaleString()}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.paymentBadge}>
                          {order.payment_method || "Cash on Delivery"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span style={getStatusStyle(order.status)}>
                          {order.status}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.updateBox}>
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              updateStatus(orderId, e.target.value)
                            }
                            style={styles.select}
                          >
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>

                          {isUpdating && (
                            <span style={styles.loadingText}>
                              Updating...
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => viewOrder(orderId)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {showModal && selectedOrder && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>
                    Order #{selectedOrder.id}
                  </h2>
                  <p style={styles.modalSubtitle}>
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>

                <button style={styles.closeBtn} onClick={closeModal}>
                  ×
                </button>
              </div>

              <div style={styles.modalGrid}>
                <div style={styles.infoCard}>
                  <h3>Customer Information</h3>
                  <p>
                    <strong>{selectedOrder.customer?.full_name}</strong>
                  </p>
                  <p>{selectedOrder.customer?.email}</p>
                </div>

                <div style={styles.infoCard}>
                  <h3>Payment Information</h3>
                  <p>{selectedOrder.payment_method}</p>
                  <p>Status: {selectedOrder.payment_status}</p>
                </div>

                <div style={styles.infoCard}>
                  <h3>Shipping Address</h3>

                  {selectedOrder.shipping_address ? (
                    <>
                      <p>
                        <strong>
                          {selectedOrder.shipping_address.full_name}
                        </strong>
                      </p>
                      <p>{selectedOrder.shipping_address.phone}</p>
                      <p>
                        {selectedOrder.shipping_address.street_address},{" "}
                        {selectedOrder.shipping_address.city}
                      </p>
                      <p>
                        {selectedOrder.shipping_address.postal_code},{" "}
                        {selectedOrder.shipping_address.country}
                      </p>
                    </>
                  ) : (
                    <p>No shipping address found.</p>
                  )}
                </div>

                <div style={styles.infoCard}>
                  <h3>Order Summary</h3>
                  <p>
                    Status:{" "}
                    <span style={getStatusStyle(selectedOrder.status)}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <h2 style={styles.totalText}>
                    Rs.{Number(selectedOrder.total_amount).toLocaleString()}
                  </h2>
                </div>
              </div>

              <h3 style={styles.itemsTitle}>Ordered Products</h3>

              <div style={styles.itemsList}>
                {selectedOrder.items?.map((item, index) => (
                  <div style={styles.itemRow} key={index}>
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      style={styles.productImage}
                    />

                    <div>
                      <strong>{item.product_title}</strong>
                      <p style={styles.itemText}>
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div style={styles.itemPrice}>
                      <p>Rs.{Number(item.price).toLocaleString()}</p>
                      <strong>
                        Subtotal: Rs.
                        {Number(item.subtotal).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
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
    background: "#f5f5f5"
  },
  main: {
    padding: "40px",
    minWidth: 0
  },
  header: {
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px"
  },
  statCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  message: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  tableCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    overflowX: "auto"
  },
  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  tableTitle: {
    fontSize: "24px",
    color: "#111827"
  },
  search: {
    width: "360px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px"
  },
  th: {
    textAlign: "left",
    padding: "14px",
    background: "#f9fafb",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb"
  },
  td: {
    padding: "16px 14px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "middle"
  },
  email: {
    color: "#6b7280"
  },
  amount: {
    color: "#f97316"
  },
  paymentBadge: {
    background: "#f9fafb",
    color: "#374151",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    border: "1px solid #e5e7eb",
    fontSize: "13px"
  },
  statusBadge: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "13px"
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
  updateBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  select: {
    padding: "9px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none"
  },
  loadingText: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "700"
  },
  viewBtn: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
    padding: "9px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700"
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
    width: "850px",
    maxWidth: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px"
  },
  modalTitle: {
    fontSize: "28px",
    color: "#111827"
  },
  modalSubtitle: {
    color: "#6b7280",
    marginTop: "5px"
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "32px",
    cursor: "pointer",
    color: "#6b7280"
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px"
  },
  infoCard: {
    background: "#f9fafb",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    lineHeight: "1.7"
  },
  totalText: {
    marginTop: "15px",
    color: "#f97316"
  },
  itemsTitle: {
    marginBottom: "14px"
  },
  itemsList: {
    display: "grid",
    gap: "14px"
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 180px",
    gap: "16px",
    alignItems: "center",
    background: "#f9fafb",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb"
  },
  productImage: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    background: "#ffffff",
    borderRadius: "10px"
  },
  itemText: {
    color: "#6b7280",
    marginTop: "5px"
  },
  itemPrice: {
    textAlign: "right",
    color: "#111827"
  }
};

export default AdminOrders;