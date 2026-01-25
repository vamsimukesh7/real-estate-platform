import mongoose from 'mongoose';
import Property from './src/models/Property.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProperties = []; // Data has been seeded to the database

const seedProperties = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('✅ Connected to MongoDB');

    // Find the admin user to use as owner
    const admin = await User.findOne({ email: 'admin@realestate.com' });
    
    if (!admin) {
      console.log('⚠️  Admin user not found. Please run createAdmin.js first!');
      process.exit(1);
    }

    // Check if properties already exist
    const existingCount = await Property.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing properties.`);
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      // For automation, we'll just add more
      console.log('Adding new properties...');
    }

    // Add owner to each property
    const propertiesWithOwner = sampleProperties.map(property => ({
      ...property,
      owner: admin._id.toString()
    }));

    // Insert properties
    const insertedProperties = await Property.insertMany(propertiesWithOwner);

    console.log('\n🎉 Properties added successfully!');
    console.log('=====================================');
    console.log(`Total properties added: ${insertedProperties.length}`);
    console.log('\nProperty Summary:');
    insertedProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name}`);
      console.log(`   - Type: ${prop.propertyType}`);
      console.log(`   - Price: $${prop.price.toLocaleString()}`);
      console.log(`   - Location: ${prop.location.city}, ${prop.location.state}`);
      console.log(`   - Status: ${prop.status}`);
      console.log('');
    });
    console.log('=====================================');
    console.log('✅ Database seeded successfully!');
    console.log('✅ Refresh your dashboard to see the properties!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding properties:', error.message);
    process.exit(1);
  }
};

seedProperties();
