require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const PORT = process.env.PORT || 5000;

async function runMigrations() {
  // Add default gender to all existing products that don't have the field, or have null/empty
  const result = await Product.updateMany(
    { $or: [{ gender: { $exists: false } }, { gender: null }, { gender: '' }] },
    { $set: { gender: 'unisexe' } }
  );
  if (result.modifiedCount > 0) {
    console.log(`✅ Migration: Added gender field to ${result.modifiedCount} existing products`);
  } else {
    console.log('✅ Migration: All products already have gender field');
  }
}

connectDB().then(async () => {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to DB", err);
  process.exit(1);
});
