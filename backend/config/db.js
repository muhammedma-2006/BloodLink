const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodlink';

  try {
    // Attempt connecting to the configured MongoDB URI (local or cloud)
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fall back smoothly if no standalone mongod
    });
    console.log(`[BloodLink DB] Connected to MongoDB at: ${uri}`);
  } catch (error) {
    console.warn(`[BloodLink DB] Could not connect to external MongoDB (${error.message}).`);
    console.log('[BloodLink DB] Initializing self-contained in-memory MongoDB server...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'bloodlink',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[BloodLink DB] In-memory MongoDB running at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[BloodLink DB] Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
