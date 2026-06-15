import express from 'express';
import { getWishlist, toggleWishlistProduct } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All wishlist routes require authentication

router.route('/')
  .get(getWishlist);

router.route('/toggle')
  .post(toggleWishlistProduct);

export default router;
