const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

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
  isFeatured: { type: Boolean, default: false },
  shippingPrice: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  reviews: [reviewSchema],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
