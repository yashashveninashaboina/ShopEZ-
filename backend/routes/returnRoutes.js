import express from 'express';
import {
  createReturnRequest,
  getReturnRequests,
  updateReturnRequest
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All return routes require authentication

router.route('/')
  .post(createReturnRequest)
  .get(admin, getReturnRequests);

router.route('/:id')
  .put(admin, updateReturnRequest);

export default router;
