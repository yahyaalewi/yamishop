const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameFr: { type: String },
  nameAr: { type: String },
  description: { type: String, required: true },
  descriptionFr: { type: String },
  descriptionAr: { type: String },
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
  isFeatured: { type: Boolean, default: false },
  shippingPrice: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
