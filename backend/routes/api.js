import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';
import { googleSignIn } from '../controllers/authController.js';
import { getCart, clearCart } from '../services/cart.js';
import { updateOrderStatus, getOrdersBySession } from '../services/orders.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── Auth ───
router.post('/auth/google', googleSignIn);

// ─── Chat (with optional auth for session tracking) ───
router.post('/chat', optionalAuth, handleChatMessage);

// ─── Cart ───
router.get('/cart', optionalAuth, (req, res) => {
  const sessionId = req.user?.email || 'guest';
  res.json(getCart(null, sessionId));
});

router.post('/cart/clear', optionalAuth, (req, res) => {
  const sessionId = req.user?.email || 'guest';
  res.json(clearCart(sessionId));
});

// ─── Orders ───
router.get('/orders', optionalAuth, (req, res) => {
  const sessionId = req.user?.email || 'guest';
  res.json(getOrdersBySession(sessionId));
});

// ─── Razorpay Webhook (simulated) ───
router.post('/razorpay/webhook', (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

  const result = updateOrderStatus(orderId, 'paid');
  if (result.error) return res.status(404).json(result);

  console.log(`[Webhook] Payment confirmed for ${orderId}`);
  res.json({ success: true, message: `Payment confirmed for ${orderId}`, order: result });
});

export default router;
