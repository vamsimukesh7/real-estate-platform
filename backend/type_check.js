import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const typeCheck = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const rentals = await Property.find({ listingType: 'Rent' });
    
    const stats = {};
    rentals.forEach(p => {
        stats[p.propertyType] = (stats[p.propertyType] || 0) + 1;
    });
    console.log('Rental Property Types:', stats);
    
    rentals.forEach(p => {
        console.log(`- ${p.name} | Type: ${p.propertyType} | Status: ${p.status}`);
    });
    
    process.exit();
};
typeCheck();
