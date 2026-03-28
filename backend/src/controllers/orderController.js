const Order = require('../models/Order');
const Product = require('../models/Product');

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

const PDFDocument = require('pdfkit');
const ArabicReshaper = require('arabic-reshaper');
const bidiFactory = require('bidi-js');
const bidi = bidiFactory();
const reshaper = new ArabicReshaper();
const path = require('path');

const pdfTranslations = {
  fr: {
    invoice: 'Facture de commande',
    orderNum: 'Commande #:',
    date: 'Date:',
    billTo: 'Facturer à:',
    product: 'Produit',
    quantity: 'Qté',
    unitPrice: 'Prix Unitaire',
    total: 'Total',
    subtotal: 'Sous-total:',
    shipping: 'Livraison:',
    grandTotal: 'Total:',
    thanks: 'Merci pour votre confiance chez Yamishop!',
    priceLabel: 'MRU',
    invoiceFile: 'facture'
  },
  ar: {
    invoice: 'فاتورة طلب',
    orderNum: 'رقم الطلب:',
    date: 'التاريخ:',
    billTo: 'فاتورة إلى:',
    product: 'المنتج',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي:',
    shipping: 'التوصيل:',
    grandTotal: 'الإجمالي الكلي:',
    thanks: 'شكراً لثقتكم في يامي شوب!',
    priceLabel: 'أوقية',
    invoiceFile: 'فاتورة'
  }
};

const reshapeText = (text, lang) => {
  if (lang !== 'ar' || !text) return text;
  try {
    const reshaped = reshaper.reshape(text);
    return bidi.getVisual(reshaped);
  } catch (err) {
    console.error('Arabic reshaping error:', err);
    return text;
  }
};

const getOrderInvoice = async (req, res) => {
  try {
    const lang = req.query.lang === 'ar' ? 'ar' : 'fr';
    const t = pdfTranslations[lang];
    const isRtl = lang === 'ar';

    const order = await Order.findById(req.params.id).populate('user', 'name phone email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!order.isConfirmed) {
      return res.status(400).json({ message: 'Order must be confirmed to generate invoice' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Font setup
    if (isRtl) {
      const fontPath = path.join(__dirname, '../assets/fonts/Almarai-Regular.ttf');
      doc.registerFont('Almarai', fontPath);
      doc.font('Almarai');
    } else {
      doc.font('Helvetica');
    }

    const downloadName = (lang === 'ar' ? 'facture' : t.invoiceFile) + `-${order._id.substring(order._id.length - 6).toUpperCase()}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    const titleX = isRtl ? 400 : 50;
    const metaX = isRtl ? 50 : 200;
    const alignMain = isRtl ? 'right' : 'left';
    const alignMeta = isRtl ? 'left' : 'right';

    doc
      .fillColor('#444444')
      .fontSize(25)
      .text('YAMISHOP', titleX, 45, { align: alignMain })
      .fontSize(10)
      .text(reshapeText(t.invoice, lang), metaX, 50, { align: alignMeta })
      .text(`${reshapeText(t.orderNum, lang)} ${order._id.substring(order._id.length-6).toUpperCase()}`, metaX, 65, { align: alignMeta })
      .text(`${reshapeText(t.date, lang)} ${new Date(order.confirmedAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR')}`, metaX, 80, { align: alignMeta })
      .moveDown();

    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Customer Info
    const customerY = 115;
    doc
      .fontSize(12)
      .text(reshapeText(t.billTo, lang), titleX, customerY, { align: alignMain })
      .fontSize(10)
      .text(reshapeText(order.user.name || '', lang), titleX, customerY + 15, { align: alignMain })
      .text(order.user.phone || '', titleX, customerY + 30, { align: alignMain })
      .text(reshapeText(order.shippingAddress?.city || '', lang), titleX, customerY + 45, { align: alignMain })
      .text(reshapeText(order.shippingAddress?.street || '', lang), titleX, customerY + 60, { align: alignMain });

    // Table
    const tableTop = 210;
    const col1 = isRtl ? 350 : 50;
    const col2 = isRtl ? 260 : 300;
    const col3 = isRtl ? 150 : 390;
    const col4 = isRtl ? 50 : 480;
    const colWidth = 90;

    doc
      .font(isRtl ? 'Almarai' : 'Helvetica-Bold')
      .fontSize(10)
      .text(reshapeText(t.product, lang), col1, tableTop, { align: alignMain })
      .text(reshapeText(t.quantity, lang), col2, tableTop, { width: colWidth, align: 'center' })
      .text(reshapeText(t.unitPrice, lang), col3, tableTop, { width: colWidth, align: 'center' })
      .text(reshapeText(t.total, lang), col4, tableTop, { width: colWidth, align: alignMeta });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    doc.font(isRtl ? 'Almarai' : 'Helvetica');
    let i = 0;
    order.orderItems.forEach((item) => {
      const y = tableTop + 30 + i * 25;
      const itemName = `${item.name}${item.size ? ' (' + item.size + ')' : ''}${item.color ? ' - ' + item.color : ''}`;
      
      doc
        .text(reshapeText(itemName, lang), col1, y, { align: alignMain, width: 250 })
        .text(item.quantity.toString(), col2, y, { width: colWidth, align: 'center' })
        .text(`${item.price} ${reshapeText(t.priceLabel, lang)}`, col3, y, { width: colWidth, align: 'center' })
        .text(`${(item.quantity * item.price)} ${reshapeText(t.priceLabel, lang)}`, col4, y, { width: colWidth, align: alignMeta });
      i++;
    });

    const summaryY = tableTop + 40 + i * 25;
    doc.moveTo(50, summaryY).lineTo(550, summaryY).stroke();

    const deliveryCost = order.shippingPrice || 150;
    const productsCost = order.totalPrice - deliveryCost;

    const labelX = isRtl ? 150 : 350;
    const valX = isRtl ? 50 : 450;
    const labelAlign = isRtl ? 'right' : 'right';

    doc
      .fontSize(10)
      .text(reshapeText(t.subtotal, lang), labelX, summaryY + 10, { width: 100, align: labelAlign })
      .text(`${productsCost} ${reshapeText(t.priceLabel, lang)}`, valX, summaryY + 10, { width: 100, align: alignMeta })
      
      .text(reshapeText(t.shipping, lang), labelX, summaryY + 25, { width: 100, align: labelAlign })
      .text(`${deliveryCost} ${reshapeText(t.priceLabel, lang)}`, valX, summaryY + 25, { width: 100, align: alignMeta })

      .fontSize(12)
      .font(isRtl ? 'Almarai' : 'Helvetica-Bold')
      .text(reshapeText(t.grandTotal, lang), labelX, summaryY + 45, { width: 100, align: labelAlign })
      .text(`${order.totalPrice} ${reshapeText(t.priceLabel, lang)}`, valX, summaryY + 45, { width: 100, align: alignMeta });

    doc
      .fontSize(10)
      .font(isRtl ? 'Almarai' : 'Helvetica-Oblique')
      .text(reshapeText(t.thanks, lang), 50, 750, { align: 'center', width: 500 });

    doc.end();
  } catch (error) {
    console.error('Invoice error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
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
  getOrderInvoice
};
