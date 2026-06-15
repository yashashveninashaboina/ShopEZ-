import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  discountPrice: { type: Number, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String, required: true }],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  features: [{ type: String }]
}, {
  timestamps: true
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
