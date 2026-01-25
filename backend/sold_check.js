import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const soldCheck = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const sold = await Property.find({ status: 'Sold' });
    console.log(`Sold Count: ${sold.length}`);
    sold.forEach(p => console.log(`- ${p.name} | Blocked: ${p.blocked}`));
    
    const rented = await Property.find({ status: 'Rented' });
    console.log(`\nRented Count: ${rented.length}`);
    rented.forEach(p => console.log(`- ${p.name} | Blocked: ${p.blocked}`));
    
    process.exit();
};
soldCheck();
