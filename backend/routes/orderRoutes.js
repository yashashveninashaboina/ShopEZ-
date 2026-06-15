import express from 'express';
import {
  addOrderItems,
  createPaymentIntent,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes require authentication

router.route('/')
  .post(addOrderItems)
  .get(admin, getOrders);

router.post('/payment-intent', createPaymentIntent);
router.get('/myorders', getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
