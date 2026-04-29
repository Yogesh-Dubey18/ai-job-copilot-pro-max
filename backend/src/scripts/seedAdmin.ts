import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { env } from '../config/env';
import User from '../models/User';

const seedAdmin = async () => {
  await connectDB();

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  const admin = await User.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'admin'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${admin.email}`);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error('Admin seed failed:', error);
  process.exit(1);
});
