import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUsers,
  deleteUser,
  updateUserRole
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth endpoints
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Private profile and address endpoints
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route('/addresses/:addressId')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.put('/addresses/:addressId/default', protect, setDefaultAddress);

// Admin-only user endpoints
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

router.put('/:id/role', protect, admin, updateUserRole);

export default router;
