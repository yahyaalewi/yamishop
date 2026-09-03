const jwt = require('jsonwebtoken');

const getProducts = async (req, res) => {
  try {
    let filter = {};
    if (req.query.storeId) {
      filter.storeId = req.query.storeId;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'store_admin' && user.storeId) {
          filter.storeId = user.storeId;
        }
      } catch (e) {
        // ignore token error on public GET
      }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ 
      message: "List of products", 
      data: products 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ 
      message: "Product details",
      data: product 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.user && req.user.role === 'store_admin' && req.user.storeId) {
      productData.storeId = req.user.storeId;
    }
    const product = new Product(productData);
    const createdProduct = await product.save();
    res.status(201).json({ message: "Product created", data: createdProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product updated", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
