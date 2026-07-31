const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Mode', image: '/images/categories/fashion.png' },
  { name: 'Électronique', image: '/images/categories/electronics.png' },
  { name: 'Maison', image: '/images/categories/home.png' },
  { name: 'Beauté', image: '/images/categories/beauty.png' },
  { name: 'Accessoires', image: '/images/categories/accessories.png' },
  { name: 'Chaussures', image: '/images/categories/shoes.png' },
  { name: 'Parfum', image: '/images/categories/perfume.png' },
];

// Get all categories (seed defaults if empty)
exports.getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ createdAt: 1 });
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find().sort({ createdAt: 1 });
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà.' });
    }

    const category = new Category({
      name: name.trim(),
      image: image || ''
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }

    if (name && name.trim()) {
      category.name = name.trim();
    }
    if (image !== undefined) {
      category.image = image;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }

    await category.deleteOne();
    res.json({ message: 'Catégorie supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

