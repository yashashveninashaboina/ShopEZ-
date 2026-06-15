import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected', 'Refunded'],
    default: 'Pending'
  },
  refundAmount: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const Return = mongoose.model('Return', returnSchema);
export default Return;
