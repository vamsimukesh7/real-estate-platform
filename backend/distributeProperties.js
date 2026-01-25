import mongoose from 'mongoose';
import Property from './src/models/Property.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const distributeProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('✅ Connected to MongoDB');

    // 1. Create realistic dummy sellers
    const sellers = [
      {
        name: 'Sarah The Realtor',
        email: 'sarah@realestate.com',
        password: 'password123',
        role: 'Seller',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        businessName: 'Sarah Homes'
      },
      {
        name: 'Michael Chen',
        email: 'michael@realestate.com',
        password: 'password123',
        role: 'Seller',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        businessName: 'Chen Properties'
      },
      {
        name: 'Jessica Davis',
        email: 'jessica@realestate.com',
        password: 'password123',
        role: 'Seller',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        businessName: 'Davis Estates'
      }
    ];

    const ownerIds = [];

    console.log('Creating/Finding sellers...');
    for (const seller of sellers) {
      let user = await User.findOne({ email: seller.email });
      if (!user) {
        user = await User.create(seller);
        console.log(`Created user: ${user.name}`);
      } else {
        console.log(`Found user: ${user.name}`);
      }
      ownerIds.push(user._id);
    }

    // Also include the admin as an owner for some
    const admin = await User.findOne({ role: 'Admin' });
    if (admin) ownerIds.push(admin._id);

    // 2. Distribute properties
    const properties = await Property.find({});
    
    console.log(`Distributing ${properties.length} properties among ${ownerIds.length} owners...`);

    let count = 0;
    for (const property of properties) {
      // Pick a random owner
      const randomOwnerId = ownerIds[Math.floor(Math.random() * ownerIds.length)];
      
      property.owner = randomOwnerId;
      // Also update agent to be the same person for simplicity in this demo, 
      // or keep it different if we want to differentiate. 
      // Let's set agent to the same person to ensure "Message Agent" and "Message Owner" go to a valid person.
      property.agent = randomOwnerId; 
      
      await property.save();
      count++;
    }

    console.log('✅ Successfully distributed properties!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

distributeProperties();
