import mongoose from 'mongoose';
import Property from './src/models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

const updateProperties = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
    console.log('✅ Connected to MongoDB');

    // Find all properties without listingType field
    const properties = await Property.find({});
    
    console.log(`\nFound ${properties.length} total properties`);
    
    let updated = 0;
    
    for (const property of properties) {
      // If property doesn't have listingType, set it based on status or price
      if (!property.listingType) {
        // Low price (<5000) usually means rent
        if (property.price < 5000) {
          property.listingType = 'Rent';
        } else {
          // Higher price means sale
          property.listingType = 'Sale';
        }
        
        // Ensure status is Active if not Sold
        if (property.status !== 'Sold' && property.status !== 'Active') {
          property.status = 'Active';
        }
        
        await property.save();
        updated++;
        console.log(`✅ Updated: ${property.name} - listingType: ${property.listingType}, status: ${property.status}`);
      } else {
        console.log(`⏭️  Skipped: ${property.name} - Already has listingType: ${property.listingType}`);
      }
    }
    
    console.log(`\n🎉 Update complete! Updated ${updated} properties.`);
    console.log('✅ Refresh your dashboard to see the changes!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating properties:', error.message);
    process.exit(1);
  }
};

updateProperties();
