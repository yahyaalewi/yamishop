require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const admin = await User.findOne({ phone: '34165525' });
    if (admin) {
      admin.password = '123456';
      await admin.save();
      console.log('Password reset to: 123456 for phone: 34165525');
    } else {
      console.log('Admin not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
