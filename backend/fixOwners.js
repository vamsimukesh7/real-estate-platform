import mongoose from 'mongoose';
import Property from './src/models/Property.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixOwners = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('✅ Connected to MongoDB');

    // Find a valid admin or user
    const admin = await User.findOne({ role: 'Admin' }) || await User.findOne({});
    
    if (!admin) {
      console.log('❌ No users found to assign properties to.');
      process.exit(1);
    }

    console.log(`Found user: ${admin.name} (${admin._id})`);

    // Update all properties to have this owner
    const result = await Property.updateMany(
      {}, // filter: all
      { $set: { owner: admin._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} properties to be owned by ${admin.name}.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing properties:', error);
    process.exit(1);
  }
};

fixOwners();
