import fs from 'fs';
import path from 'path';

// Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
  console.log('Loaded .env.local');
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
}, { timestamps: true });

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  // Upsert admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@imaxclean.com' },
    { name: 'Admin User', email: 'admin@imaxclean.com', passwordHash: adminHash, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log('Admin user upserted:', admin.email, '| role:', admin.role);

  // Upsert customer user
  const customerHash = await bcrypt.hash('customer123', 10);
  const customer = await User.findOneAndUpdate(
    { email: 'customer@imaxclean.com' },
    { name: 'Customer Account', email: 'customer@imaxclean.com', passwordHash: customerHash, role: 'customer' },
    { upsert: true, new: true }
  );
  console.log('Customer user upserted:', customer.email, '| role:', customer.role);

  // List all users
  const all = await User.find({}).lean();
  console.log('\nAll users in DB:');
  for (const u of all as any[]) {
    console.log(' -', u.email, '|', u.role);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
