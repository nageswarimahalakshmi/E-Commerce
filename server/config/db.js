const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/commerce');
    console.log(`\x1b[32m%s\x1b[0m`, `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `Error connecting to MongoDB: ${error.message}`);
    console.log(`\n\x1b[33m%s\x1b[0m`, `💡 Double Check:`);
    console.log(`1. Ensure your MongoDB Atlas connection string is correctly defined in 'server/.env' under MONGO_URI.`);
    console.log(`2. If you are using a local MongoDB instance, verify that the service is started (e.g., run 'mongod' or check system services).`);
    console.log(`3. Check your network connection and Atlas IP Access List (allow access from anywhere 0.0.0.0/0 for testing).\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
