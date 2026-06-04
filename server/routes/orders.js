const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

// CREATE ORDER
router.post('/', auth, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      user: req.user.userId
    });
    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET MY ORDERS
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET SINGLE ORDER
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// UPDATE ORDER STATUS (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order status updated!', order });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET ALL ORDERS (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

module.exports = router;