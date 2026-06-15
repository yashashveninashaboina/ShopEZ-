import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get Admin Dashboard aggregate statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalProducts = await Product.countDocuments({});

    // Calculate total sales from paid orders
    const salesAggregate = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    // Out of stock count
    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    // Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly Sales stats (last 6 months)
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Format monthly sales to be chronological for frontend charts
    const formattedMonthlySales = monthlySales.reverse();

    // Category distribution of sales
    const categorySales = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          sales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          quantity: { $sum: '$orderItems.quantity' }
        }
      }
    ]);

    res.json({
      summary: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalSales: Math.round(totalSales * 100) / 100,
        outOfStockCount
      },
      recentOrders,
      monthlySales: formattedMonthlySales,
      categorySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
