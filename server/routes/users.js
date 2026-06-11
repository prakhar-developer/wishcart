const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserHistory = require('../models/UserHistory');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadBase64Image } = require('../utils/cloudinary');

// GET PROFILE (Self)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE PROFILE (name, avatar, phone)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, phone } = req.body;

    let avatarUrl = avatar;

    // If avatar is a base64 data URI (user uploaded a new image), upload to Cloudinary
    if (avatar && avatar.startsWith('data:image')) {
      const uploaded = await uploadBase64Image(avatar, {
        folder: 'wishcart/avatars',
        public_id: `user_${req.user.userId}`,
      });
      if (uploaded) {
        avatarUrl = uploaded;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, avatar: avatarUrl, phone },
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

// DELETE ACCOUNT (Self)
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

// GET ALL USERS (Admin Only)
router.get('/admin/list', adminAuth, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      users,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users list', error: error.message });
  }
});

// GET USER DETAILS & ACTIVITY TRACKING (Admin Only)
router.get('/admin/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password').populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user order history
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    // Fetch user product views & search history
    const history = await UserHistory.findOne({ user: userId })
      .populate('viewedProducts.product', 'name category price images');

    res.json({
      user,
      orders,
      history: history || { viewedProducts: [], searchHistory: [] }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

// UPDATE USER ROLE (Admin Only)
router.put('/admin/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user.userId && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot revoke your own admin privileges.' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to ${role} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// DELETE USER ACCOUNT & HISTORY (Admin Only)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Delete User
    await User.findByIdAndDelete(req.params.id);

    // Clean up user related data
    await Order.deleteMany({ user: req.params.id });
    await UserHistory.deleteMany({ user: req.params.id });

    res.json({ message: 'User and all related account details deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;