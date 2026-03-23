require('dotenv').config({ path: './.env' });
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const promoteUser = async () => {
  try {
    const phone = process.argv[2];
    if (!phone) {
      console.error('❌ Please provide a phone number: node promoteToAdmin.js <phone>');
      process.exit(1);
    }

    await connectDB();
    const user = await User.findOne({ phone });

    if (!user) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`✅ Success! User ${user.name} (${user.phone}) has been promoted to ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

promoteUser();
