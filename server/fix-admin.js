const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Check if User model exists

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

const fixAdmin = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOneAndUpdate(
      { email: 'admin@wishcart.com' },
      { role: 'admin' },
      { new: true }
    );

    if (admin) {
      console.log('🚀 Admin role fixed for:', admin.email);
    } else {
      console.log('❌ admin@wishcart.com not found. Creating a new admin user...');
      // If we need to create it, we should use the same password hasher
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@wishcart.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('🚀 Created new admin user: admin@wishcart.com / admin123');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
    process.exit(1);
  }
};

fixAdmin();
