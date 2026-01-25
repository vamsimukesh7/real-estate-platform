import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const mismatchCheck = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const all = await Property.find({ status: { $in: ['Sold', 'Rented'] } });
    
    all.forEach(p => {
        console.log(`[${p.status}] ${p.name} | Type: ${p.listingType}`);
    });
    
    process.exit();
};
mismatchCheck();
