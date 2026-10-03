const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Global cache for Mongoose connection across serverless invocations.
 * In serverless environments like Vercel, caching the connection object
 * across function invocations avoids exhausting database connection pools.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodlink';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'bloodlink',
      serverSelectionTimeoutMS: 5000,
    };

    mongoose.set('strictQuery', false);

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log(`[BloodLink DB] Connected to MongoDB (db: bloodlink)`);
        return m;
      })
      .catch(async (error) => {
        // In local development (when not running in Vercel serverless), if external MongoDB fails,
        // fall back smoothly to in-memory MongoDB
        if (!process.env.VERCEL) {
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
            const memoryConn = await mongoose.connect(memoryUri);
            console.log(`[BloodLink DB] In-memory MongoDB running at: ${memoryUri}`);
            return memoryConn;
          } catch (memErr) {
            console.error('[BloodLink DB] Failed to start in-memory MongoDB:', memErr.message);
            throw memErr;
          }
        }
        console.error(`[BloodLink DB] MongoDB connection error: ${error.message}`);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

const disconnectDB = async () => {
  if (cached && cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB };

