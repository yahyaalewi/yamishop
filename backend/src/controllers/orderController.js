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
  }
};

const getOrderInvoice = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
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

    const filename = `facture-${order._id.substring(order._id.length - 6).toUpperCase()}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc
      .fillColor('#444444')
      .fontSize(25)
      .text('YAMISHOP', 50, 45, { align: 'left' })
      .fontSize(10)
      .text('Facture de commande', 200, 50, { align: 'right' })
      .text(`Commande #: ${order._id.substring(order._id.length - 6).toUpperCase()}`, 200, 65, { align: 'right' })
      .text(`Date: ${new Date(order.confirmedAt || order.createdAt).toLocaleDateString()}`, 200, 80, { align: 'right' })
      .moveDown();

    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Customer Info
    doc
      .fontSize(12)
      .text('Facturer à:', 50, 115)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(order.user.name || '', 50, 130)
      .font('Helvetica')
      .text(order.user.phone || '', 50, 145)
      .text(order.shippingAddress?.street || '', 50, 160)
      .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''}`, 50, 175);

    // Table Header
    const tableTop = 210;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Produit', 50, tableTop)
      .text('Quantité', 280, tableTop, { width: 90, align: 'right' })
      .text('Prix Unit.', 370, tableTop, { width: 90, align: 'right' })
      .text('Total', 460, tableTop, { width: 90, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Body
    let i = 0;
    order.orderItems.forEach((item) => {
      const y = tableTop + 30 + i * 25;
      doc
        .font('Helvetica')
        .text(`${item.name}${item.size ? ' (' + item.size + ')' : ''}${item.color ? ' - ' + item.color : ''}`, 50, y, { width: 220 })
        .text(item.quantity.toString(), 280, y, { width: 90, align: 'right' })
        .text(`${item.price} MRU`, 370, y, { width: 90, align: 'right' })
        .text(`${(item.quantity * item.price)} MRU`, 460, y, { width: 90, align: 'right' });
      i++;
    });

    const subtotalY = tableTop + 30 + i * 25 + 20;
    doc.moveTo(350, subtotalY).lineTo(550, subtotalY).stroke();

    const deliveryCost = order.shippingPrice || 150;
    const productsCost = order.totalPrice - deliveryCost;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Prix Produits:', 370, subtotalY + 10, { width: 90, align: 'right' })
      .text(`${productsCost} MRU`, 460, subtotalY + 10, { width: 90, align: 'right' })
      
      .text('Livraison:', 370, subtotalY + 25, { width: 90, align: 'right' })
      .text(`${deliveryCost} MRU`, 460, subtotalY + 25, { width: 90, align: 'right' })

      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total:', 370, subtotalY + 45, { width: 90, align: 'right' })
      .text(`${order.totalPrice} MRU`, 460, subtotalY + 45, { width: 90, align: 'right' });

    doc
      .fontSize(10)
      .font('Helvetica-Oblique')
      .text('Merci pour votre confiance chez Yamishop!', 50, 700, { align: 'center', width: 500 });

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
