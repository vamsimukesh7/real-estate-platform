import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});

    const notifications = [
      {
        notificationType: 'System',
        title: 'Welcome to RealEstate Pro!',
        message: 'Thanks for joining our platform. Complete your profile to get started.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) 
      },
      {
        notificationType: 'NewListing',
        title: 'New Properties in your area',
        message: '3 new properties have been listed in your preferred location.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
      },
      {
        notificationType: 'PriceAlert',
        title: 'Price Drop Alert',
        message: 'A property on your watchlist has dropped price by $10,000.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    ];

    for (const user of users) {
        // Mongoose validation might be strict if permissions or other fields are invalid in the DB from previous seeds
        // We will try to update only the notifications field directly using updateOne
        // This avoids validating the entire document if other parts (like permissions enum?) are broken
        
        await User.updateOne(
            { _id: user._id },
            { $set: { notifications: notifications } }
        );
    }

    console.log(`✅ Seeded notifications for ${users.length} users.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
