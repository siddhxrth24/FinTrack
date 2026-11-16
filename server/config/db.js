const mongoose = require('mongoose');

module.exports = async () => {
  try {
    const conn = await require('mongoose').connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('MongoDB connection failed – proceeding without DB (demo mode).');
  }
}; {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
