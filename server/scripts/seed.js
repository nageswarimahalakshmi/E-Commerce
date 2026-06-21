const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load env vars
dotenv.config();

const sampleProducts = [
  {
    name: "Aethera Wireless Headphones",
    price: 199.99,
    description: "Premium noise-canceling wireless headphones with high-fidelity spatial audio, active noise cancellation, and 40-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
    category: "Audio",
    stockCount: 15
  },
  {
    name: "Chronos Smartwatch Series 5",
    price: 299.99,
    description: "Sleek biometric tracker with AMOLED display, integrated GPS, sleep coaching, and real-time oxygen saturation monitoring.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    category: "Wearables",
    stockCount: 20
  },
  {
    name: "Apex Mechanical Keyboard",
    price: 149.99,
    description: "Hot-swappable mechanical keyboard featuring linear red switches, double-shot PBT keycaps, and customizable dynamic RGB lighting.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60",
    category: "Accessories",
    stockCount: 10
  },
  {
    name: "Vortex Gaming Mouse",
    price: 79.99,
    description: "Ultra-lightweight gaming mouse with a 26K DPI optical sensor, tactile optical mouse switches, and lag-free wireless response.",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60",
    category: "Accessories",
    stockCount: 25
  },
  {
    name: "Nebula 4K Projector",
    price: 899.99,
    description: "Smart home theater projector supporting HDR10+, 2200 ANSI Lumens, auto-focus, and Android TV integration with Dolby sound.",
    image: "https://images.unsplash.com/photo-1601944129054-ee21271f4c99?w=800&auto=format&fit=crop&q=60",
    category: "Home Theater",
    stockCount: 5
  },
  {
    name: "Solaris Powerbank 20K",
    price: 49.99,
    description: "High-capacity 20,000mAh external battery pack with 45W USB-C Power Delivery and built-in emergency solar panels.",
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&auto=format&fit=crop&q=60",
    category: "Accessories",
    stockCount: 30
  },
  {
    name: "Zephyr Air Purifier",
    price: 249.99,
    description: "True HEPA filtration smart air purifier capturing 99.97% of dust and allergens with silent sleep mode and particle sensor.",
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=60",
    category: "Home Appliances",
    stockCount: 8
  },
  {
    name: "Pip the Cozy Penguin Plush",
    price: 24.99,
    description: "An ultra-soft, huggable penguin plush dressed in a tiny knitted winter scarf. Made with premium, hypoallergenic materials.",
    image: "https://images.unsplash.com/photo-1577338072193-4fe9ec77c4bb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fFBpcCUyMHRoZSUyMENvenklMjBQZW5ndWluJTIwUGx1c2glMjBBbiUyMHVsdHJhLXNvZnQlMkMlMjBodWdnYWJsZSUyMHBlbmd1aW4lMjBwbHVzaCUyMGRyZXNzZWQlMjBpbiUyMGElMjB0aW55JTIwa25pdHRlZCUyMHdpbnRlciUyMHNjYXJmLiUyME1hZGUlMjB3aXRoJTIwcHJlbWl1bSUyQyUyMGh5cG9hbGxlcmdlbmljJTIwbWF0ZXJpYWxzLnxlbnwwfHwwfHx8MA%3D%3D",
    category: "Soft Toys",
    stockCount: 15
  },
  {
    name: "Barnaby the Classic Teddy Bear",
    price: 29.99,
    description: "A timeless, velvet-soft brown teddy bear featuring hand-stitched detailing and a satin bow collar.",
    image: "https://images.unsplash.com/photo-1748399998178-b95d91df385a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8QSUyMHRpbWVsZXNzJTJDJTIwdmVsdmV0LXNvZnQlMjBicm93biUyMHRlZGR5JTIwYmVhciUyMGZlYXR1cmluZyUyMGhhbmQtc3RpdGNoZWQlMjBkZXRhaWxpbmclMjBhbmQlMjBhJTIwc2F0aW4lMjBib3clMjBjb2xsYXIufGVufDB8fDB8fHww",
    category: "Soft Toys",
    stockCount: 12
  },
  {
    name: "Labubu — The Mischief Elf",
    price: 54.99,
    description: "The iconic Labubu collectible plush — a wildly popular designer art toy featuring pointed ears, a cheeky grin, and premium fabric finish. A must-have for collectors.",
    image: "https://images.unsplash.com/photo-1748014144916-53ee9f8eb0d4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Soft Toys",
    stockCount: 8
  }
];

const seedData = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/commerce');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing Users, Products, and Orders.');

    // Seed Products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${createdProducts.length} Products successfully!`);

    // Seed Users
    // Default Admin User
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Default Regular Customer User
    await User.create({
      username: 'john_doe',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Seeded Users successfully!');
    console.log('\n\x1b[32m%s\x1b[0m', '🎉 Seeding Complete!');
    console.log(`Regular User: user@example.com / password123`);
    console.log(`Admin User:   admin@example.com / password123`);

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
