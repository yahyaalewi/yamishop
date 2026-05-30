require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const admins = await User.find({ role: 'admin' });
    console.log('Admins found:', admins.length);
    admins.forEach(admin => {
      console.log(`- Name: ${admin.name}, Phone: ${admin.phone}, Role: ${admin.role}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
