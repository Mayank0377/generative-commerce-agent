import { loadCatalog } from '../services/catalog.js';
import { createPaymentLink } from '../services/payment.js';
import { addToCart, removeFromCart, getCart } from '../services/cart.js';
import { createOrder, getOrdersBySession } from '../services/orders.js';
import razorpay from '../config/razorpay.js';

const catalog = loadCatalog();

/**
 * Tool handler implementations that the AI can invoke.
 * Each function corresponds to a tool defined in definitions.js.
 * All handlers receive (args, sessionId) — sessionId is injected by chatController.
 */
const toolHandlers = {
  searchCatalog: ({ query }) => {
    if (!query) return { products: catalog };
    const q = query.toLowerCase();
    const products = catalog.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    return { products };
  },

  generatePaymentLink: async ({ productId }, sessionId) => {
    if (sessionId === 'guest') {
      return { error: "Please sign in with Google first to generate a payment link." };
    }
    const product = catalog.find(p => p.id === productId);
    if (!product) return { error: "Product not found in catalog." };
    if (!product.inStock) return { error: "Product is out of stock." };

    return createPaymentLink(product);
  },

  addToCart: ({ productId, quantity }, sessionId) => {
    return addToCart({ productId, quantity: quantity || 1 }, sessionId);
  },

  removeFromCart: ({ productId }, sessionId) => {
    return removeFromCart({ productId }, sessionId);
  },

  getCart: (args, sessionId) => {
    return getCart(args, sessionId);
  },

  generateCartCheckout: async (args, sessionId) => {
    if (sessionId === 'guest') {
      return { error: "Please sign in with Google first to checkout." };
    }
    const cartData = getCart(null, sessionId);
    if (!cartData.cart || cartData.cart.length === 0) {
      return { error: "Your cart is empty. Add some products first!" };
    }

    const description = cartData.cart.map(item => 
      `${item.quantity}x ${item.name}`
    ).join(', ');

    try {
      const paymentLinkReq = {
        amount: cartData.total * 100, // Amount in paise
        currency: "INR",
        accept_partial: false,
        description: `Cart checkout: ${description}`,
        customer: {
          name: "Valued Customer",
          email: sessionId !== 'guest' ? sessionId : "customer@example.com",
          contact: "+919876543210"
        },
        notify: { sms: false, email: false },
        reminder_enable: false,
        notes: {
          type: "cart_checkout",
          items: JSON.stringify(cartData.cart.map(i => ({ id: i.productId, qty: i.quantity })))
        }
      };

      const link = await razorpay.paymentLink.create(paymentLinkReq);

      // Create an order record
      const order = createOrder({
        sessionId,
        items: cartData.cart,
        total: cartData.total,
        paymentLinkId: link.id,
      });

      return {
        success: true,
        paymentLink: link.short_url,
        total: cartData.total,
        itemCount: cartData.itemCount,
        items: cartData.cart,
        orderId: order.orderId,
        message: `Checkout link generated for ${cartData.itemCount} item(s) totalling ₹${cartData.total.toLocaleString('en-IN')}. Your order ID is ${order.orderId}.`
      };
    } catch (error) {
      console.error("[Cart Checkout] Razorpay Error:", error);

      // Fallback for Razorpay test mode rate limit
      if (error?.statusCode === 429) {
        console.log("[Cart Checkout] Mocking link due to rate limit.");
        const mockLinkId = `mock_plink_${Date.now()}`;
        const order = createOrder({
          sessionId,
          items: cartData.cart,
          total: cartData.total,
          paymentLinkId: mockLinkId,
        });

        return {
          success: true,
          paymentLink: `https://rzp.io/i/${mockLinkId}`,
          total: cartData.total,
          itemCount: cartData.itemCount,
          items: cartData.cart,
          orderId: order.orderId,
          message: `(Mock) Checkout link generated for ${cartData.itemCount} item(s) totalling ₹${cartData.total.toLocaleString('en-IN')}. Your order ID is ${order.orderId}.`
        };
      }

      return { error: "Failed to generate checkout link. Please try again." };
    }
  },

  compareProducts: ({ productIds }) => {
    if (!productIds || productIds.length < 2) {
      return { error: "Please provide at least 2 product IDs to compare." };
    }
    
    const products = productIds.map(id => catalog.find(p => p.id === id)).filter(Boolean);
    
    if (products.length < 2) {
      return { error: "Could not find enough products to compare. Check the IDs." };
    }

    // Build a structured comparison
    const allSpecKeys = [...new Set(products.flatMap(p => Object.keys(p.specs || {})))];
    
    return {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        inStock: p.inStock,
        image: p.image,
        description: p.description,
        highlights: p.highlights,
        specs: p.specs
      })),
      comparisonFields: allSpecKeys,
      message: `Comparing ${products.map(p => p.name).join(' vs ')}.`
    };
  },

  checkOrderStatus: (args, sessionId) => {
    const result = getOrdersBySession(sessionId);
    if (result.count === 0) {
      return { message: "You don't have any orders yet. Add items to your cart and checkout to place an order!" };
    }
    return result;
  }
};

export default toolHandlers;
