const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');

// GET PROFILE
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE PROFILE (name, avatar)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, avatar, phone },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile updated!', user });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CHANGE PASSWORD
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ADD ADDRESS
router.post('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ message: 'Address added!', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DELETE ADDRESS
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.addresses = user.addresses.filter(
      a => a._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json({ message: 'Address deleted!', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// SET DEFAULT ADDRESS
router.put('/addresses/:addressId/default', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.addresses.forEach(a => {
      a.isDefault = a._id.toString() === req.params.addressId;
    });
    await user.save();
    res.json({ message: 'Default address updated!', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DELETE ACCOUNT
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;