import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice stock images slug'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product already in cart, increment quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // Product not in cart, add new item
      cart.items.push({ product: productId, quantity: qty, saveForLater: false });
    }

    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice stock images slug'
    });
    
    res.status(201).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity or saveForLater status
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity, saveForLater } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity !== undefined) {
      item.quantity = Number(quantity);
    }
    
    if (saveForLater !== undefined) {
      item.saveForLater = saveForLater;
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice stock images slug'
    });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice stock images slug'
    });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart items (usually non-saved items after order)
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      // Keep only items that are flagged as saveForLater
      cart.items = cart.items.filter(item => item.saveForLater);
      await cart.save();
    }
    
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice stock images slug'
    });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
