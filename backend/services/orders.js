/**
 * In-memory order store.
 * In production, this would be a database.
 */
const orders = new Map();
let orderCounter = 1000;

/**
 * Create a new order after checkout.
 */
export function createOrder({ sessionId, items, total, paymentLinkId }) {
  const orderId = `ORD-${++orderCounter}`;
  const order = {
    orderId,
    sessionId,
    items,
    total,
    paymentLinkId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.set(orderId, order);
  console.log(`[Orders] Created order ${orderId} for session ${sessionId}`);
  return order;
}

/**
 * Update order status (e.g., pending → paid → processing → shipped).
 */
export function updateOrderStatus(orderId, status) {
  const order = orders.get(orderId);
  if (!order) return { error: `Order ${orderId} not found.` };

  order.status = status;
  order.updatedAt = new Date().toISOString();
  orders.set(orderId, order);
  console.log(`[Orders] Updated ${orderId} → ${status}`);
  return order;
}

/**
 * Get all orders for a session/user.
 */
export function getOrdersBySession(sessionId) {
  const userOrders = [];
  for (const order of orders.values()) {
    if (order.sessionId === sessionId) {
      userOrders.push(order);
    }
  }
  return {
    orders: userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    count: userOrders.length,
  };
}

/**
 * Get a single order by ID.
 */
export function getOrderById(orderId) {
  return orders.get(orderId) || null;
}
