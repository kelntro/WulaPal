const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet'); // <-- Import the Wallet model

mongoose.connect('mongodb://localhost:27017/wulapal'); // replace with actual URI

(async () => {
  try {
    const existing = await User.findOne({ email: 'admin@wulapal.com' });
    if (existing) {
      console.log('Super admin already exists');
      return mongoose.disconnect();
    }

    const hashed = await bcrypt.hash('Wulapal123', 10);
    const user = await User.create({
      name: 'Super Admin',
      email: 'admin@wulapal.com',
      password: hashed,
      role: 'superadmin',
      isVerified: true,
    });

    // Create wallet for super admin
    await Wallet.create({
      userId: user._id,
      balance: 0,
    });

    console.log('✅ Super admin and wallet created!');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    mongoose.disconnect();
  }
})();
