const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config({ path: './.env' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const adminDetails = {
      name: 'yahya elmami',
      phone: '34165525',
      password: '@Y27076535y',
      role: 'admin'
    };

    let user = await User.findOne({ phone: adminDetails.phone });

    if (user) {
      console.log('User exists, updating to admin and resetting password...');
      user.name = adminDetails.name;
      user.password = adminDetails.password;
      user.role = 'admin';
      await user.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      await User.create(adminDetails);
      console.log('Admin user created successfully.');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
