const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongo.uri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (error) => {
    logger.error(`MongoDB runtime error: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

module.exports = { connectDB, disconnectDB };
