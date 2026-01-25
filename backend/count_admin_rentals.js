import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const countRentals = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Admin check logic
    const adminRentals = await Property.find({
        blocked: { $ne: true },
        $or: [
            { listingType: 'Rent', status: { $ne: 'Rented' } },
            { status: 'For Rent' }
        ]
    });
    
    console.log(`Admin sees ${adminRentals.length} available rentals.`);
    
    process.exit();
};
countRentals();
