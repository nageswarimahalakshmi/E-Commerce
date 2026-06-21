const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be greater than or equal to 0']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  stockCount: {
    type: Number,
    required: [true, 'Please add stock count'],
    min: [0, 'Stock cannot be negative'],
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
