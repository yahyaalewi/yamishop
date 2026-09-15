const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
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

    // For each store, find the store admin and send notification email
    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      const store = await Store.findById(storeId).populate('adminUser');
      if (!store) continue;

      let adminEmail = store.email || store.adminUser?.email;
      let adminName = store.adminUser?.name || store.name;

      if (!adminEmail) {
        const storeAdminUser = await User.findOne({ storeId: store._id, role: 'store_admin' });
        if (storeAdminUser?.email) {
          adminEmail = storeAdminUser.email;
          adminName = storeAdminUser.name;
        }
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
          adminName
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
        return orderObj;
      });
      return res.json({ data: filteredOrders });
    }

    const orders = await Order.find({}).populate('user', 'id name phone').sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderToConfirmed = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isConfirmed) {
      console.log(`[STOCK UPDATE] Starting confirmation for order ${order._id}`);
      
      for (const item of order.orderItems) {
        const productId = item.product;
        const quantityToReduce = Number(item.quantity) || 0;

        if (productId && quantityToReduce > 0) {
          console.log(`[STOCK UPDATE] Processing product ID: ${productId}, Quantity: ${quantityToReduce}`);
          
          const product = await Product.findById(productId);
          if (product) {
            const oldStock = product.stock || 0;
            product.stock = Math.max(0, oldStock - quantityToReduce);
            await product.save();
            console.log(`[STOCK UPDATE] Product "${product.name}" stock: ${oldStock} -> ${product.stock}`);
          } else {
            console.log(`[STOCK UPDATE] ERROR: Product not found for ID: ${productId}`);
          }
        } else {
          console.log(`[STOCK UPDATE] Missing productId or quantity: prodId=${productId}, qty=${quantityToReduce}`);
        }
      }

      order.isConfirmed = true;
      order.confirmedAt = Date.now();
      const updatedOrder = await order.save();
      console.log(`[STOCK UPDATE] Order ${order._id} confirmed and saved.`);
      res.json(updatedOrder);
    } else {
      console.log(`[STOCK UPDATE] Order ${order._id} was already confirmed. Skipping stock update.`);
      res.json(order);
    }
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const path = require('path');

const pdfTranslations = {
  fr: {
    invoice: 'Facture de commande',
    orderNum: 'Commande #:',
    date: 'Date:',
    billTo: 'Facturer à:',
    product: 'Produit',
    quantity: 'Qté',
    unitPrice: 'Prix Unit.',
    total: 'Total',
    subtotal: 'Sous-total:',
    shipping: 'Livraison:',
    grandTotal: 'Total:',
    thanks: 'Merci pour votre confiance chez Yamishop!',
    priceLabel: 'MRU'
  },
  ar: {
    invoice: 'فاتورة الطلب',
    orderNum: 'رقم الطلب',
    date: 'التاريخ',
    billTo: 'فاتورة إلى',
    product: 'المنتج',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    shipping: 'التوصيل',
    grandTotal: 'الإجمالي الكلي',
    thanks: 'شكراً لثقتكم في يامي شوب!',
    priceLabel: 'أوقية'
  }
};

const getOrderInvoice = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const reshaper = require('arabic-reshaper');
    const bidiFactory = require('bidi-js');
    const bidi = bidiFactory();
    const fs = require('fs');

    // Diagnostic Mode - MOVED BEFORE PROTECT CHECKS
    const fontPath = path.join(__dirname, '../assets/fonts/Almarai-Regular.ttf');
    if (req.query.check_font === 'true') {
      return res.json({
        system: 'Yamishop',
        exists: fs.existsSync(fontPath),
        path: fontPath,
        dir: __dirname,
        files: fs.existsSync(path.join(__dirname, '../assets/fonts')) ? fs.readdirSync(path.join(__dirname, '../assets/fonts')) : 'dir missing'
      });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name phone email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user?._id?.toString() && !req.user?.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!order.isConfirmed) {
      return res.status(400).json({ message: 'Order must be confirmed to generate invoice' });
    }

    const lang = 'fr';
    const t = pdfTranslations[lang];
    const isRtl = false;

    // Function to handle bilingual text (shaping/reordering Arabic if present)
    const reshapeText = (text) => {
      if (!text) return text;
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      if (!hasArabic) return text;
      try {
        const reshaped = reshaper.reshape(text);
        const levels = bidi.getEmbeddingLevels(reshaped, 0); // LTR paragraph base
        return bidi.getReorderedString(reshaped, levels);
      } catch (err) {
        return text;
      }
    };

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Use Almarai as universal font to support both French and Arabic
    const mainFont = fs.existsSync(fontPath) ? 'Almarai' : 'Helvetica';
    const boldFont = fs.existsSync(fontPath) ? 'Almarai' : 'Helvetica-Bold';
    
    if (fs.existsSync(fontPath)) {
      doc.registerFont('Almarai', fontPath);
      doc.font('Almarai');
    } else {
      doc.font('Helvetica');
    }

    const orderIdStr = order._id.toString();
    const shortId = orderIdStr.substring(orderIdStr.length - 6).toUpperCase();
    
    const downloadName = (lang === 'ar' ? 'facture' : 'invoice') + `-${shortId}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Color Palette
    const primaryColor = '#E05A47'; // Terracotta Brand Color
    const darkColor = '#1E293B';    // Charcoal Dark
    const grayText = '#64748B';     // Muted Gray
    const lightBg = '#F8FAFC';      // Soft Card Light BG
    const borderGray = '#E2E8F0';   // Light Border
    const successColor = '#10B981'; // Green status

    const pageStart = 40;
    const pageEnd = 555;
    const pageWidth = 515;

    const displayDate = order.confirmedAt || order.createdAt;
    const formattedDate = new Date(displayDate).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // 1. TOP BRAND ACCENT BAR
    doc.rect(0, 0, 595, 10).fill(primaryColor);

    // 2. HEADER: LOGO & INVOICE META
    let currentY = 30;

    // Brand Title
    doc
      .fillColor(primaryColor)
      .font(boldFont)
      .fontSize(24)
      .text('YAMISHOP', pageStart, currentY, { width: 300 });

    doc
      .fillColor(grayText)
      .font(mainFont)
      .fontSize(8)
      .text('Votre E-Commerce de Référence en Mauritanie', pageStart, currentY + 28, { width: 300 });

    // Invoice Title & Ref Badge (Right Aligned)
    doc
      .fillColor(darkColor)
      .font(boldFont)
      .fontSize(18)
      .text('FACTURE', pageStart, currentY, { align: 'right', width: pageWidth });

    doc
      .fillColor(primaryColor)
      .font(boldFont)
      .fontSize(10)
      .text(`N° FACT-${shortId}`, pageStart, currentY + 22, { align: 'right', width: pageWidth });

    doc
      .fillColor(grayText)
      .font(mainFont)
      .fontSize(9)
      .text(`Date: ${formattedDate}`, pageStart, currentY + 36, { align: 'right', width: pageWidth });

    // Separator line
    currentY += 55;
    doc.moveTo(pageStart, currentY).lineTo(pageEnd, currentY).strokeColor(borderGray).lineWidth(1).stroke();

    // 3. CUSTOMER & SHIPPING CARDS (Side by side)
    currentY += 15;
    const cardWidth = 248;
    const cardHeight = 85;

    // Card 1: Client Info
    doc
      .rect(pageStart, currentY, cardWidth, cardHeight)
      .fillAndStroke(lightBg, borderGray);
    doc.rect(pageStart, currentY, 4, cardHeight).fill(primaryColor); // Accent left bar

    doc
      .fillColor(darkColor)
      .font(boldFont)
      .fontSize(9)
      .text('CLIENT & FACTURATION', pageStart + 12, currentY + 10);

    doc
      .fillColor(darkColor)
      .font(boldFont)
      .fontSize(10)
      .text(reshapeText(order.user?.name || 'Client'), pageStart + 12, currentY + 26);

    doc
      .fillColor(grayText)
      .font(mainFont)
      .fontSize(9)
      .text(`Tél: ${order.user?.phone || 'N/A'}`, pageStart + 12, currentY + 42)
      .text(order.user?.email ? `Email: ${order.user.email}` : 'Paiement à la livraison', pageStart + 12, currentY + 56);

    // Card 2: Shipping Destination
    const card2X = pageStart + cardWidth + 19;
    doc
      .rect(card2X, currentY, cardWidth, cardHeight)
      .fillAndStroke(lightBg, borderGray);
    doc.rect(card2X, currentY, 4, cardHeight).fill(darkColor); // Accent left bar

    doc
      .fillColor(darkColor)
      .font(boldFont)
      .fontSize(9)
      .text('LIVRAISON & DESTINATION', card2X + 12, currentY + 10);

    const addressLine1 = (order.shippingAddress?.street || 'Adresse non spécifiée');
    const addressLine2 = [order.shippingAddress?.district, order.shippingAddress?.city, 'Mauritanie'].filter(Boolean).join(', ');

    doc
      .fillColor(darkColor)
      .font(mainFont)
      .fontSize(9)
      .text(reshapeText(addressLine1), card2X + 12, currentY + 26, { width: cardWidth - 20 })
      .text(reshapeText(addressLine2), card2X + 12, currentY + 42, { width: cardWidth - 20 });

    if (order.shippingAddress?.notes) {
      doc
        .fillColor(primaryColor)
        .fontSize(8)
        .text(reshapeText(`Note: ${order.shippingAddress.notes}`), card2X + 12, currentY + 58, { width: cardWidth - 20 });
    }

    // 4. TABLE ITEMS
    currentY += cardHeight + 20;

    const colCodeX = pageStart;
    const colNameX = pageStart + 10;
    const colQtyX = pageStart + 290;
    const colPriceX = pageStart + 360;
    const colTotalX = pageStart + 440;

    // Header Row Background
    doc.rect(pageStart, currentY, pageWidth, 24).fill(darkColor);

    doc
      .fillColor('#FFFFFF')
      .font(boldFont)
      .fontSize(9)
      .text('ARTICLE / DESCRIPTION', colNameX, currentY + 7, { width: 270 })
      .text('QTÉ', colQtyX, currentY + 7, { width: 60, align: 'center' })
      .text('PRIX UNIT.', colPriceX, currentY + 7, { width: 75, align: 'right' })
      .text('TOTAL', colTotalX, currentY + 7, { width: 75, align: 'right' });

    currentY += 24;

    // Table Data Rows
    doc.font(mainFont).fontSize(9);
    
    order.orderItems.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      doc.rect(pageStart, currentY, pageWidth, 28).fill(rowBg);

      // Item Name & Options
      let variantDetails = [];
      if (item.color) variantDetails.push(`Couleur: ${item.color}`);
      if (item.size) variantDetails.push(`Taille: ${item.size}`);
      const variantStr = variantDetails.length > 0 ? ` (${variantDetails.join(' | ')})` : '';

      const fullItemText = `${item.name}${variantStr}`;
      const qty = item.qty || item.quantity || 1;
      const unitPrice = item.price || 0;
      const rowTotal = qty * unitPrice;

      doc
        .fillColor(darkColor)
        .text(reshapeText(fullItemText), colNameX, currentY + 8, { width: 270, height: 18, ellipsis: true })
        .text(qty.toString(), colQtyX, currentY + 8, { width: 60, align: 'center' })
        .text(`${unitPrice.toLocaleString('fr-FR')} MRU`, colPriceX, currentY + 8, { width: 75, align: 'right' })
        .font(boldFont)
        .text(`${rowTotal.toLocaleString('fr-FR')} MRU`, colTotalX, currentY + 8, { width: 75, align: 'right' })
        .font(mainFont);

      // Bottom border line for row
      doc.moveTo(pageStart, currentY + 28).lineTo(pageEnd, currentY + 28).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

      currentY += 28;
    });

    // 5. SUMMARY & TOTALS BOX
    currentY += 15;

    const deliveryCost = order.shippingPrice || 0;
    const grandTotal = order.totalPrice || 0;
    const subtotal = grandTotal - deliveryCost;

    const summaryBoxX = pageStart + 260;
    const summaryBoxWidth = 255;

    // Subtotal
    doc
      .fillColor(grayText)
      .font(mainFont)
      .fontSize(9)
      .text('Sous-total produits :', summaryBoxX, currentY, { width: 130, align: 'right' })
      .fillColor(darkColor)
      .font(boldFont)
      .text(`${subtotal.toLocaleString('fr-FR')} MRU`, summaryBoxX + 135, currentY, { width: 120, align: 'right' });

    currentY += 16;

    // Shipping Fee
    doc
      .fillColor(grayText)
      .font(mainFont)
      .fontSize(9)
      .text('Frais de livraison :', summaryBoxX, currentY, { width: 130, align: 'right' })
      .fillColor(darkColor)
      .font(boldFont)
      .text(`${deliveryCost.toLocaleString('fr-FR')} MRU`, summaryBoxX + 135, currentY, { width: 120, align: 'right' });

    currentY += 22;

    // Grand Total Banner (Terracotta Box)
    doc.rect(summaryBoxX, currentY, summaryBoxWidth, 32).fill(primaryColor);

    doc
      .fillColor('#FFFFFF')
      .font(boldFont)
      .fontSize(10)
      .text('TOTAL À PAYER :', summaryBoxX + 12, currentY + 10, { width: 120 })
      .fontSize(12)
      .text(`${grandTotal.toLocaleString('fr-FR')} MRU`, summaryBoxX + 125, currentY + 9, { width: 120, align: 'right' });

    // Payment Status Pill (Left side of Summary)
    const statusY = currentY - 30;
    doc
      .rect(pageStart, statusY, 200, 48)
      .fillAndStroke('#ECFDF5', '#A7F3D0'); // Soft green card

    doc
      .fillColor(successColor)
      .font(boldFont)
      .fontSize(9)
      .text('STATUT DE COMMANDE', pageStart + 12, statusY + 10);

    doc
      .fillColor('#065F46')
      .font(mainFont)
      .fontSize(9)
      .text('✓ Confirmée — Paiement à la livraison', pageStart + 12, statusY + 26);

    // 6. FOOTER TRUST & CONTACT
    const footerY = 740;

    doc.moveTo(pageStart, footerY).lineTo(pageEnd, footerY).strokeColor(borderGray).lineWidth(1).stroke();

    doc
      .fillColor(darkColor)
      .font(boldFont)
      .fontSize(9)
      .text('Merci pour votre confiance chez YamiShop !', pageStart, footerY + 12, { align: 'center', width: pageWidth });

    doc.end();
  } catch (error) {
    console.error('Invoice error details:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Erreur lors de la génération de la facture', 
        error: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack 
      });
    }
  }
};

const addOrderReview = async (req, res) => {
  try {
    const { productId, rating } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!order.isConfirmed) {
      return res.status(400).json({ message: 'Order must be confirmed to leave a review' });
    }

    // Find the item
    const item = order.orderItems.find(x => x.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found in this order' });
    }

    if (item.rating) {
      return res.status(400).json({ message: 'Product already reviewed in this order' });
    }

    item.rating = Number(rating);
    await order.save();

    res.status(200).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToConfirmed,
  deleteOrder,
  getMyOrders,
  getOrders,
  getOrderInvoice,
  addOrderReview
};
