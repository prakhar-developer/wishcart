const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    default: 0
  },
gender: {
    type: String,
    enum: ['men', 'women', 'accessories', 'male', 'female', 'unisex'],
    default: 'women'
  },
  category: {
    type: String,
    enum: [
      'tops', 'jeans', 'hoodies', 'dresses', 'shoes',
      'bags', 'bracelets', 'jewellery', 'sunglasses',
      'home-decor', 'accessories'
    ],
    required: true
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11']
  }],
  colors: [String],
  images: [String],
  stock: {
    type: Number,
    default: 0
  },
  ratings: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);