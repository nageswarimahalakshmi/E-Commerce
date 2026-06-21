const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create a new order & update product stocks
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  try {
    const resolvedItems = [];
    let totalPrice = 0;

    // Verify products and inventory levels
    for (const item of items) {
      const dbProduct = await Product.findById(item.product);

      if (!dbProduct) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }

      if (dbProduct.stockCount < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${dbProduct.name}. Available: ${dbProduct.stockCount}, requested: ${item.quantity}`
        });
      }

      // Decrement stock
      dbProduct.stockCount -= item.quantity;
      await dbProduct.save();

      // Accumulate item info and total price
      resolvedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: dbProduct.price // Save the current price
      });

      totalPrice += dbProduct.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      items: resolvedItems,
      shippingAddress,
      totalPrice
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;

  if (!['Pending', 'Processing', 'Shipped', 'Delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status type' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
