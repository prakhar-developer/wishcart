const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// ADD REVIEW
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    // Check if already reviewed
    const existing = await Review.findOne({
      user: req.user.userId,
      product: req.params.productId
    });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user.userId,
      product: req.params.productId,
      rating,
      comment,
      images
    });

    // Update product rating
    const reviews = await Review.find({ product: req.params.productId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.params.productId, {
      ratings: avgRating,
      numReviews: reviews.length
    });

    res.status(201).json({ message: 'Review added successfully!', review });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET REVIEWS FOR A PRODUCT
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// DELETE REVIEW
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

module.exports = router;