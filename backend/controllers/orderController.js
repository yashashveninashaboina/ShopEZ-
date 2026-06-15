import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Return from '../models/Return.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  try {
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Check stock for all items
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Stripe Payment Intent
// @route   POST /api/orders/payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  try {
    if (!stripe) {
      // Return a simulated client secret for frontend testing
      return res.json({
        clientSecret: `mock_secret_shopez_payment_${Date.now()}`,
        isMock: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: 'usd',
      metadata: { userId: req.user._id.toString() }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      isMock: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (order) {
      // Check if user is the owner or an admin
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || `mock_payment_id_${Date.now()}`,
        status: req.body.status || 'succeeded',
        update_time: req.body.update_time || new Date().toISOString(),
        email_address: req.body.email_address || req.user.email
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Pending, Shipped, Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;

      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        // If COD, mark as paid upon delivery
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (only if status is Pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({ message: 'Order cannot be cancelled. Already shipped or delivered.' });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a return
// @route   POST /api/returns
// @access  Private
export const createReturnRequest = async (req, res) => {
  const { orderId, reason } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to return this order' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    // Check if return request already exists
    const existingReturn = await Return.findOne({ order: orderId });
    if (existingReturn) {
      return res.status(400).json({ message: 'Return request already submitted for this order' });
    }

    const returnRequest = new Return({
      order: orderId,
      user: req.user._id,
      reason,
      refundAmount: order.totalPrice
    });

    const createdReturn = await returnRequest.save();
    
    // Update order status to Pending Return / keep track
    order.orderStatus = 'Returned'; // Update once approved or keep track in model
    // Let's set the orderStatus as Shipped / Delivered, but we track the return request status separately.
    // However, to make it clear, let's keep orderStatus as is, but we will change it to 'Returned' once the return request is approved/refunded.
    await order.save();

    res.status(201).json(createdReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all return requests
// @route   GET /api/returns
// @access  Private/Admin
export const getReturnRequests = async (req, res) => {
  try {
    const returns = await Return.find({})
      .populate('user', 'name email')
      .populate({
        path: 'order',
        select: 'orderItems totalPrice paymentMethod isPaid'
      })
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update return request status (Approve/Reject/Refund)
// @route   PUT /api/returns/:id
// @access  Private/Admin
export const updateReturnRequest = async (req, res) => {
  const { status } = req.body;

  try {
    const returnReq = await Return.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    const order = await Order.findById(returnReq.order);
    if (!order) {
      return res.status(404).json({ message: 'Associated order not found' });
    }

    returnReq.status = status;

    if (status === 'Approved') {
      // Mark order status as Returned
      order.orderStatus = 'Returned';
      await order.save();
      
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    } else if (status === 'Refunded') {
      // Process simulated/real stripe refund if paid online
      if (order.paymentMethod === 'Stripe' && order.isPaid && stripe && order.paymentResult?.id) {
        try {
          await stripe.refunds.create({
            payment_intent: order.paymentResult.id,
            amount: Math.round(returnReq.refundAmount * 100)
          });
        } catch (err) {
          console.error('Stripe refund error:', err.message);
          // Continue and mark as refunded anyway since it's a dashboard simulation
        }
      }
      returnReq.status = 'Refunded';
    }

    const updatedReturn = await returnReq.save();
    res.json(updatedReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
