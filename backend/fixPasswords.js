import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));

    for (const u of users) {
        u.password = 'password123';
        u.loginAttempts = 0;
        u.lockUntil = undefined;
        await u.save();
        console.log(`Reset password for ${u.email} to: password123`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
