import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';
import User from './src/models/User.js';

dotenv.config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Get all Users
    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => {
        console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

    // 2. Get all Properties
    const properties = await Property.find({});
    console.log('\n--- PROPERTIES ---');
    properties.forEach(p => {
        console.log(`ID: ${p._id}, Name: ${p.name}`);
        console.log(`   Status: ${p.status}, Type: ${p.listingType}`);
        console.log(`   Owner: ${p.owner}`);
        console.log(`   Tenant: ${p.tenant}`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

debug();
