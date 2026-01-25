import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const fixRentals = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Find "Sold" properties with suspicious low price (likely rentals)
    // Assuming sales are usually > $50,000 and rentals are < $50,000
    const properties = await Property.find({
      status: 'Sold',
      price: { $lt: 50000 }
    });

    console.log(`Found ${properties.length} likely incorrectly marked rentals.`);

    let fixedCount = 0;

    for (const property of properties) {
        console.log(`Fixing ${property.name} ($${property.price})`);

        // Convert to Rental
        property.listingType = 'Rent';
        property.status = 'Rented';
        
        // Move owner to tenant if tenant is empty
        if (property.owner && !property.tenant) {
            property.tenant = property.owner;
            // property.owner = /* Keep original owner? Or set to system? */ 
            // Usually the original owner should be the landlord.
            // But in our simplified buy flow, we transferred ownership.
            // For a rental, the "owner" should remain the original seller.
            // Who was the original seller? We might have lost that info if we overwrote 'owner'.
            // But for now, let's just ensure it's marked as Rented so the UI looks right.
            // The 'User' viewing it will see it in 'Rented' tab if they are the 'tenant'.
        }

        // Ensure rentedUntil is set
        if (!property.rentedUntil) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            property.rentedUntil = endDate;
        }

        await property.save();
        fixedCount++;
    }

    console.log(`Fix complete. Updated ${fixedCount} properties.`);
    process.exit();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixRentals();
