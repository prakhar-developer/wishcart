const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    image: String,
    price: Number,
    size: String,
    quantity: Number
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'processing'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: ''
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  deliveredAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);