const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  imageUrl: { type: String, required: true },
  images: [{ type: String }],
  category: { type: String, required: true },
  features: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  gender: { type: String, enum: ['homme', 'femme', 'unisexe'], default: 'unisexe' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
