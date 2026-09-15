const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendStoreAdminOrderNotification } = require('../config/emailService');

const notifyStoreAdmins = async (order, clientUser) => {
  try {
    if (!order || !order.orderItems || order.orderItems.length === 0) return;

    const productIds = order.orderItems.map(item => item.product).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });

    // Group items by storeId
    const itemsByStore = {};
    for (const item of order.orderItems) {
      const prod = products.find(p => p._id.toString() === item.product?.toString());
      const storeId = prod?.storeId ? prod.storeId.toString() : null;
      if (storeId) {
        if (!itemsByStore[storeId]) itemsByStore[storeId] = [];
        itemsByStore[storeId].push({
          name: item.name || prod.name,
          qty: item.quantity || item.qty || 1,
          price: item.price || prod.price,
          image: item.image || prod.imageUrl,
          color: item.color,
          size: item.size
        });
      }
    }

    // For each store, find the store admin and send notification email with auto-login token
    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      const store = await Store.findById(storeId).populate('adminUser');
      if (!store) continue;

      let storeAdminUser = store.adminUser;
      if (!storeAdminUser) {
        storeAdminUser = await User.findOne({ storeId: store._id, role: 'store_admin' });
      }

      let adminEmail = store.email || storeAdminUser?.email;
      let adminName = storeAdminUser?.name || store.name;
      let autoLoginToken = null;

      if (storeAdminUser && process.env.JWT_SECRET) {
        autoLoginToken = jwt.sign({ id: storeAdminUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      }

      if (adminEmail) {
        await sendStoreAdminOrderNotification({
          toEmail: adminEmail,
          storeName: store.name,
          order: {
            ...(order.toObject ? order.toObject() : order),
            user: clientUser
          },
          storeItems,
          adminName,
          autoLoginToken
        });
      } else {
        console.warn(`[ORDER EMAIL NOTIF] Aucun email trouvé pour la boutique "${store.name}" (${store._id})`);
      }
    }
  } catch (err) {
    console.error('[ORDER EMAIL NOTIF] Erreur lors de la notification des boutiques:', err);
  }
};

const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice // Add it here
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.id,
        quantity: x.qty, // Map qty to quantity as per Order model
        color: x.color,
        size: x.size,
        _id: undefined
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      shippingPrice: shippingPrice || 150,
      totalPrice,
    });

    const createdOrder = await order.save();
    console.log('Order created:', createdOrder._id);

    // Envoi des notifications par mail aux administrateurs des boutiques concernées (en arrière-plan)
    notifyStoreAdmins(createdOrder, req.user).catch(err => {
      console.error('[ORDER EMAIL NOTIF] Background task error:', err);
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Add order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name phone'
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    if (req.user && req.user.role === 'store_admin' && req.user.storeId) {
      const storeProductIds = await Product.find({ storeId: req.user.storeId }).distinct('_id');
      const orders = await Order.find({ 'orderItems.product': { $in: storeProductIds } })
        .populate('user', 'id name phone')
        .sort({ createdAt: -1 });

      const storeProductStrIds = storeProductIds.map(id => id.toString());
      const filteredOrders = orders.map(order => {
        const orderObj = order.toObject();
        orderObj.orderItems = orderObj.orderItems.filter(item => 
          item.product && storeProductStrIds.includes(item.product.toString())
        );
        orderObj.totalPrice = orderObj.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return orderObj;
      });

      return res.json({ data: filteredOrders });
    }

    const orders = await Order.find({})
      .populate('user', 'id name phone')
      .sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isConfirmed = req.body.isConfirmed ?? order.isConfirmed;
      order.isDelivered = req.body.isDelivered ?? order.isDelivered;
      order.isCancelled = req.body.isCancelled ?? order.isCancelled;

      if (req.body.isDelivered && !order.deliveredAt) {
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating } = req.body;
    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (!order.isConfirmed) {
      return res.status(400).json({ message: 'La commande doit être confirmée pour laisser un avis' });
    }

    const item = order.orderItems.find(i => (i.product ? i.product.toString() : i.id) === productId);
    if (!item) return res.status(404).json({ message: 'Produit non trouvé dans cette commande' });

    if (item.rating) return res.status(400).json({ message: 'Vous avez déjà noté ce produit pour cette commande' });

    item.rating = Number(rating);
    await order.save();

    const product = await Product.findById(productId);
    if (product) {
      const allOrdersWithProduct = await Order.find({ 'orderItems.product': productId, 'orderItems.rating': { $exists: true } });
      let totalRating = 0;
      let count = 0;
      allOrdersWithProduct.forEach(o => {
        o.orderItems.forEach(i => {
          if (i.product && i.product.toString() === productId && i.rating) {
            totalRating += i.rating;
            count++;
          }
        });
      });
      product.rating = count > 0 ? Number((totalRating / count).toFixed(1)) : Number(rating);
      product.numReviews = count;
      await product.save();
    }

    res.json({ message: 'Avis enregistré avec succès', rating: item.rating });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const PDFDocument = require('pdfkit');

const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name phone email');
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'store_admin') {
      return res.status(403).json({ message: 'Accès non autorisé à cette facture' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=facture-${order._id.toString().substring(order._id.toString().length-6).toUpperCase()}.pdf`);
    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 100).fill('#0F172A');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('YamiShop', 40, 35);
    doc.fontSize(10).font('Helvetica').text('Nouakchott, Mauritanie', 40, 65);
    doc.text('Contact: +222 34165525 | support@yamishop.store', 40, 78);

    doc.fontSize(20).font('Helvetica-Bold').text('FACTURE', doc.page.width - 200, 35, { align: 'right', width: 160 });
    doc.fontSize(10).font('Helvetica').text(`N°: #${order._id.toString().substring(order._id.toString().length-6).toUpperCase()}`, doc.page.width - 200, 65, { align: 'right', width: 160 });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, doc.page.width - 200, 78, { align: 'right', width: 160 });

    doc.moveDown(4);
    doc.fillColor('#1E293B').fontSize(12).font('Helvetica-Bold').text('FACTURÉ À :', 40, 125);
    doc.font('Helvetica').fontSize(10).fillColor('#334155');
    doc.text(`Nom : ${order.shippingAddress.name || order.user.name}`, 40, 142);
    doc.text(`Téléphone : ${order.shippingAddress.phone || order.user.phone}`, 40, 156);
    doc.text(`Adresse : ${order.shippingAddress.street}, ${order.shippingAddress.district || ''}`, 40, 170);
    doc.text(`Ville : ${order.shippingAddress.city || 'Nouakchott'}, Mauritanie`, 40, 184);

    const tableTop = 220;
    doc.rect(40, tableTop, doc.page.width - 80, 24).fill('#F1F5F9');
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
    doc.text('ARTICLE', 50, tableTop + 7);
    doc.text('P.U (MRU)', 320, tableTop + 7, { width: 60, align: 'right' });
    doc.text('QTÉ', 390, tableTop + 7, { width: 40, align: 'center' });
    doc.text('TOTAL (MRU)', 440, tableTop + 7, { width: 75, align: 'right' });

    let currentY = tableTop + 30;
    doc.font('Helvetica').fontSize(9).fillColor('#1E293B');

    order.orderItems.forEach((item, index) => {
      const itemTotal = item.price * (item.quantity || item.qty || 1);
      if (index % 2 === 1) {
        doc.rect(40, currentY - 4, doc.page.width - 80, 20).fill('#F8FAFC');
        doc.fillColor('#1E293B');
      }
      let title = item.name;
      if (item.color) title += ` (${item.color})`;
      if (item.size) title += ` [Taille: ${item.size}]`;

      doc.text(title, 50, currentY, { width: 260, ellipsis: true });
      doc.text(item.price.toLocaleString(), 320, currentY, { width: 60, align: 'right' });
      doc.text((item.quantity || item.qty || 1).toString(), 390, currentY, { width: 40, align: 'center' });
      doc.text(itemTotal.toLocaleString(), 440, currentY, { width: 75, align: 'right' });
      currentY += 22;
    });

    currentY += 10;
    doc.rect(40, currentY, doc.page.width - 80, 1).fill('#E2E8F0');
    currentY += 15;

    const subtotal = order.orderItems.reduce((acc, i) => acc + i.price * (i.quantity || i.qty || 1), 0);
    const shipping = order.shippingPrice || 0;
    const total = order.totalPrice;

    doc.font('Helvetica').fontSize(9).fillColor('#64748B');
    doc.text('Sous-total :', 320, currentY, { width: 100, align: 'right' });
    doc.fillColor('#1E293B').text(`${subtotal.toLocaleString()} MRU`, 430, currentY, { width: 85, align: 'right' });

    currentY += 16;
    doc.fillColor('#64748B').text('Frais de livraison :', 320, currentY, { width: 100, align: 'right' });
    doc.fillColor('#1E293B').text(`${shipping.toLocaleString()} MRU`, 430, currentY, { width: 85, align: 'right' });

    currentY += 20;
    doc.rect(320, currentY - 4, doc.page.width - 360, 28).fill('#E2725B');
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold');
    doc.text('TOTAL :', 330, currentY + 4);
    doc.text(`${total.toLocaleString()} MRU`, 430, currentY + 4, { width: 85, align: 'right' });

    const bottomY = doc.page.height - 70;
    doc.rect(40, bottomY, doc.page.width - 80, 1).fill('#E2E8F0');
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(
      'YamiShop - Paiement à la livraison | Merci pour votre confiance !',
      40, bottomY + 12, { align: 'center', width: doc.page.width - 80 }
    );

    doc.end();
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la facture', error: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  addReview,
  generateInvoice
};
