const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// ─── Super Admin: Get all stores ────────────────────────────────────────────
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Get single store ──────────────────────────────────────────
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Create store + store admin account ────────────────────────
exports.createStore = async (req, res) => {
  try {
    const {
      name, logo, description, address, phone, email, status,
      adminName, adminEmail, adminPhone, adminPassword
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom de la boutique est requis.' });
    }

    // Check for duplicate store name
    const existing = await Store.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Une boutique avec ce nom existe déjà.' });
    }

    // Create the store first
    const store = new Store({
      name: name.trim(),
      logo: logo || '',
      description: description || '',
      address: address || '',
      phone: phone || '',
      email: email || '',
      status: status || 'active',
    });
    const savedStore = await store.save();

    // Create the store admin account if credentials provided
    let adminUser = null;
    if (adminName && (adminEmail || adminPhone) && adminPassword) {
      // Check for duplicate phone/email
      if (adminPhone) {
        const existingPhone = await User.findOne({ phone: adminPhone });
        if (existingPhone) {
          await Store.findByIdAndDelete(savedStore._id);
          return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé.' });
        }
      }
      if (adminEmail) {
        const existingEmail = await User.findOne({ email: adminEmail });
        if (existingEmail) {
          await Store.findByIdAndDelete(savedStore._id);
          return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }
      }

      adminUser = new User({
        name: adminName.trim(),
        email: adminEmail || undefined,
        phone: adminPhone || `store_${savedStore._id}`,
        password: adminPassword,
        role: 'store_admin',
        storeId: savedStore._id,
      });
      await adminUser.save();

      // Link admin to store
      savedStore.adminUser = adminUser._id;
      await savedStore.save();
    }

    res.status(201).json({
      store: savedStore,
      adminUser: adminUser ? { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Update store ───────────────────────────────────────────────
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });

    const { name, logo, description, address, phone, email, status } = req.body;

    if (name && name.trim()) store.name = name.trim();
    if (logo !== undefined) store.logo = logo;
    if (description !== undefined) store.description = description;
    if (address !== undefined) store.address = address;
    if (phone !== undefined) store.phone = phone;
    if (email !== undefined) store.email = email;
    if (status && ['active', 'inactive'].includes(status)) store.status = status;

    const updatedStore = await store.save();
    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Delete store ───────────────────────────────────────────────
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });

    // Remove the linked store admin user
    if (store.adminUser) {
      await User.findByIdAndDelete(store.adminUser);
    }

    await store.deleteOne();
    res.json({ message: 'Boutique supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Toggle store status ───────────────────────────────────────
exports.toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });

    store.status = store.status === 'active' ? 'inactive' : 'active';
    const updatedStore = await store.save();
    res.json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Get store stats ────────────────────────────────────────────
exports.getStoreStats = async (req, res) => {
  try {
    const storeId = req.params.id;

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });

    // Products count
    const totalProducts = await Product.countDocuments({ storeId });

    // Orders containing at least one product from this store
    const storeProductIds = await Product.find({ storeId }).distinct('_id');
    const storeOrders = await Order.find({ 'orderItems.product': { $in: storeProductIds } });

    const totalOrders = storeOrders.length;
    const pendingOrders = storeOrders.filter(o => !o.isConfirmed && !o.isDelivered).length;
    const deliveredOrders = storeOrders.filter(o => o.isDelivered).length;

    // Revenue = sum of order items that belong to this store
    let revenue = 0;
    const productIdStrings = storeProductIds.map(id => id.toString());
    for (const order of storeOrders) {
      for (const item of order.orderItems) {
        if (item.product && productIdStrings.includes(item.product.toString())) {
          revenue += item.price * item.quantity;
        }
      }
    }

    // Unique customers
    const uniqueCustomerIds = [...new Set(storeOrders.map(o => o.user?.toString()).filter(Boolean))];
    const totalCustomers = uniqueCustomerIds.length;

    // Top-selling products (by quantity sold)
    const salesMap = {};
    for (const order of storeOrders) {
      for (const item of order.orderItems) {
        if (item.product && productIdStrings.includes(item.product.toString())) {
          const pid = item.product.toString();
          salesMap[pid] = (salesMap[pid] || 0) + item.quantity;
        }
      }
    }
    const topProductIds = Object.entries(salesMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);
    const topProducts = await Product.find({ _id: { $in: topProductIds } }).select('name imageUrl price');

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenue,
      totalCustomers,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Super Admin: Reset store admin password ─────────────────────────────────
exports.resetStoreAdminPassword = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });
    if (!store.adminUser) return res.status(404).json({ message: 'Aucun administrateur lié à cette boutique.' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await User.findById(store.adminUser);
    if (!user) return res.status(404).json({ message: 'Administrateur de boutique non trouvé.' });

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it
    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Public: Get active stores ───────────────────────────────────────────────
exports.getPublicStores = async (req, res) => {
  try {
    const stores = await Store.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Store Admin: Get own store profile ──────────────────────────────────────
exports.getMyStore = async (req, res) => {
  try {
    if (!req.user.storeId) {
      return res.status(404).json({ message: 'Aucune boutique associée à ce compte.' });
    }
    const store = await Store.findById(req.user.storeId);
    if (!store) return res.status(404).json({ message: 'Boutique non trouvée.' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

