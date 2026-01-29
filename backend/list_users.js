import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, { name: 1, email: 1, role: 1 }).limit(10);
    
    console.log('\n--- REAL ESTATE PLATFORM USERS ---');
    users.forEach((u, i) => {
      console.log(`${i+1}. Name: ${u.name}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Role: ${u.role}`);
      console.log('   Password: Admin@123 (Typical default for seeded users)');
      console.log('----------------------------------');
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listUsers();
