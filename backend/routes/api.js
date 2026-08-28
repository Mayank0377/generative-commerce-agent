import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';
import { getCart, clearCart } from '../services/cart.js';

const router = Router();

router.post('/chat', handleChatMessage);

router.get('/cart', (req, res) => {
  res.json(getCart());
});

router.post('/cart/clear', (req, res) => {
  res.json(clearCart());
});

export default router;
