// Load environment variables from .env file
require('dotenv').config();

const mongoose = require('mongoose');

// Access the connection string from environment variables
const mongoUrl = process.env.MONGO_URL;

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
