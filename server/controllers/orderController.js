const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalAmount, shippingAddress } = req.body;
        const order = new Order({
            user: req.user.id,
            products,
            totalAmount,
            shippingAddress
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => { // Manager only
    try {
        const orders = await Order.find().populate('user', 'fullName phoneNumber').populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => { // Manager only
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
