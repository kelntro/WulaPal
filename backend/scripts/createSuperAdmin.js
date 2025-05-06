const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/wulapal'); // replace with actual URI

(async () => {
  const existing = await User.findOne({ email: 'admin@wulapal.com' });
  if (existing) return console.log('Super admin already exists');

  const hashed = await bcrypt.hash('Wulapal123', 10);
  await User.create({
    name: 'Super Admin',
    email: 'admin@wulapal.com',
    password: hashed,
    role: 'superadmin',
    isVerified: true,
  });

  console.log('✅ Super admin created!');
  mongoose.disconnect();
})();