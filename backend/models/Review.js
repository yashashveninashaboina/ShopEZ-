import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to get avg rating and update Product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating before delete (if deleted)
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
