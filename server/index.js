const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/coupons', require('./routes/coupon'));
app.use('/api/history', require('./routes/history'));
app.use('/api/users', require('./routes/users')); 

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'WishCart API is running! 🎀' });
});

// Connect to MongoDB
const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected to Atlas!');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

connectToMongo()
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => console.error('❌ Server startup error:', err));