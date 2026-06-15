import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  // Force mock mode if explicitly configured
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    (global as any).useMockDb = true;
    console.log('Mock database mode active (configured via env)');
    return null;
  }

  // No URI means no Atlas — use mock
  if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/imaxclean') {
    (global as any).useMockDb = true;
    console.warn('No MONGODB_URI set. Using mock database.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10s — enough for Atlas cold start
      socketTimeoutMS: 30000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('Connected to MongoDB Atlas successfully');
      (global as any).useMockDb = false;
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection failed. Activating mock database fallback.', err.message);
      cached.promise = null; // allow retry on next request
      (global as any).useMockDb = true;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    (global as any).useMockDb = true;
  }

  return cached.conn;
}

// Helper to determine if we are in mock mode
export function isMockDb(): boolean {
  return !!(global as any).useMockDb;
}
