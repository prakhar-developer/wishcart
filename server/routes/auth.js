const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { OAuth2Client } = require('google-auth-library');
const { sendOtpEmail, sendLoginAlertEmail } = require('../utils/email');
const { uploadImageFromUrl } = require('../utils/cloudinary');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

// GOOGLE AUTH
router.post('/google', async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const payload = await verifyGoogleToken(googleToken);
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNew = false;

    // Upload Google profile picture to Cloudinary for permanent storage
    let cloudinaryAvatarUrl = null;
    if (picture) {
      cloudinaryAvatarUrl = await uploadImageFromUrl(picture, {
        folder: 'wishcart/avatars',
        public_id: `google_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      });
    }

    if (!user) {
      isNew = true;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await User.create({
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: cloudinaryAvatarUrl || picture || '',
        role: 'user'
      });
    } else {
      let updated = false;
      // Always update avatar from Google if we got a Cloudinary URL
      if (cloudinaryAvatarUrl && user.avatar !== cloudinaryAvatarUrl) {
        user.avatar = cloudinaryAvatarUrl;
        updated = true;
      } else if (picture && !user.avatar) {
        user.avatar = picture;
        updated = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send email alert for login asynchronously
    sendLoginAlertEmail(user.email, user.name).catch(e => console.error('Login email alert failed:', e));

    res.json({
      message: isNew ? 'Account created successfully with Google!' : 'Login successful with Google!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});

// SEND OTP (For registration or passwordless login)
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/update in database
    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({ email: email.toLowerCase(), otp });

    // Send OTP email
    await sendOtpEmail(email.toLowerCase(), otp);

    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send verification code', error: error.message });
  }
});

// VERIFY OTP (Useful during registration flow to check code before signup)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Delete the verified OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// LOGIN WITH OTP (Passwordless Login)
router.post('/login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Delete verified OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      const name = email.split('@')[0];

      user = await User.create({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendLoginAlertEmail(user.email, user.name).catch(e => console.error('Login email alert failed:', e));

    res.json({
      message: isNewUser ? 'Account created successfully!' : 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'OTP login failed', error: error.message });
  }
});

// SIGNUP (Standard password signup)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendLoginAlertEmail(user.email, user.name).catch(e => console.error('Login email alert failed:', e));

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// LOGIN (Standard password login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendLoginAlertEmail(user.email, user.name).catch(e => console.error('Login email alert failed:', e));

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

module.exports = router;