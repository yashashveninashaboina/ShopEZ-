import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  createProductReview,
  getProductReviews
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
