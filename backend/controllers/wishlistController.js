import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name price discountPrice stock images slug rating'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle item in wishlist (add if not exists, remove if exists)
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlistProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);

    if (index > -1) {
      // Remove from wishlist
      wishlist.products.splice(index, 1);
    } else {
      // Add to wishlist
      wishlist.products.push(productId);
    }

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name price discountPrice stock images slug rating'
    });

    res.json(populatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
