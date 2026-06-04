const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewedProducts: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      viewedAt: { type: Date, default: Date.now }
    }
  ],
  searchHistory: [
    {
      query: { type: String },
      searchedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('UserHistory', userHistorySchema);