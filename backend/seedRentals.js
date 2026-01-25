import mongoose from 'mongoose';
import Property from './src/models/Property.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const rentalProperties = []; // Data has been seeded to the database

const seedRentals = async () => {
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

    // Add owner to each property
    const propertiesWithOwner = rentalProperties.map(property => ({
      ...property,
      owner: admin._id.toString()
    }));

    // Insert properties
    const insertedProperties = await Property.insertMany(propertiesWithOwner);

    console.log('\n🎉 Rental properties added successfully!');
    console.log('=====================================');
    console.log(`Total rentals added: ${insertedProperties.length}`);
    console.log('\nRental Property Summary:');
    insertedProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.name}`);
      console.log(`   - Type: ${prop.propertyType}`);
      console.log(`   - Rent: $${prop.price.toLocaleString()}/month`);
      console.log(`   - Location: ${prop.location.city}, ${prop.location.state}`);
      console.log(`   - Bedrooms: ${prop.specifications.bedrooms}`);
      console.log('');
    });
    console.log('=====================================');
    console.log('✅ Rental properties seeded successfully!');
    console.log('✅ Check the "Rent" tab on your dashboard!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding rentals:', error.message);
    process.exit(1);
  }
};

seedRentals();
