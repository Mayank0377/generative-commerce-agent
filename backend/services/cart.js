import { loadCatalog } from './catalog.js';

const catalog = loadCatalog();

/**
 * In-memory cart store keyed by session ID.
 * In production, this would be Redis or a database.
 */
const carts = new Map();

/**
 * Get or create a cart for a session.
 */
function getCartForSession(sessionId = 'default') {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, []);
  }
  return carts.get(sessionId);
}

/**
 * Add a product to the cart.
 */
export function addToCart({ productId, quantity = 1 }, sessionId = 'default') {
  const product = catalog.find(p => p.id === productId);
  if (!product) return { error: "Product not found in catalog." };
  if (!product.inStock) return { error: `${product.name} is currently out of stock.` };

  const cart = getCartForSession(sessionId);
  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity, name: product.name, price: product.price, image: product.image });
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return {
    success: true,
    message: `Added ${quantity}x ${product.name} to your cart.`,
    cart: cart.map(item => ({ ...item, subtotal: item.price * item.quantity })),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    total
  };
}

/**
 * Remove a product from the cart.
 */
export function removeFromCart({ productId }, sessionId = 'default') {
  const cart = getCartForSession(sessionId);
  const idx = cart.findIndex(item => item.productId === productId);

  if (idx === -1) return { error: "This product is not in your cart." };

  const removed = cart.splice(idx, 1)[0];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    success: true,
    message: `Removed ${removed.name} from your cart.`,
    cart: cart.map(item => ({ ...item, subtotal: item.price * item.quantity })),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    total
  };
}

/**
 * Get the full cart contents.
 */
export function getCart(args, sessionId = 'default') {
  const cart = getCartForSession(sessionId);

  if (cart.length === 0) {
    return { message: "Your cart is empty.", cart: [], itemCount: 0, total: 0 };
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return {
    cart: cart.map(item => ({ ...item, subtotal: item.price * item.quantity })),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    total
  };
}

/**
 * Clear the entire cart.
 */
export function clearCart(sessionId = 'default') {
  carts.set(sessionId, []);
  return { success: true, message: "Cart cleared." };
}
