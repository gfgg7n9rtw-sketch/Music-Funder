require('dotenv').config();
const { connectDB } = require('./db');

const initDatabase = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await connectDB();
    console.log('🎉 MongoDB connection successful!');
    console.log('📝 Collections will be created automatically when first document is inserted.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
