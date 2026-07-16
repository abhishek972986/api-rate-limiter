const mongoose = require('mongoose');

/**
 * Database connection setup
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rate-limiter');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create TTL index on RateLimitUsage if connecting for the first time
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (!collections.find(coll => coll.name === 'ratelimitusages')) {
      console.log('Creating TTL index for rate limit usage tracking');
      const RateLimitUsage = require('../models/RateLimitUsage');
      await RateLimitUsage.createIndexes();
    }
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;