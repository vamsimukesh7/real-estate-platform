import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const listAllRentals = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const rentals = await Property.find({ listingType: 'Rent' });
        console.log(`Total Rentals in DB: ${rentals.length}`);
        
        let log = `Total Rentals in DB: ${rentals.length}\n\n`;
        rentals.forEach(p => {
            log += `ID: ${p._id} | Name: ${p.name} | Status: ${p.status} | Blocked: ${p.blocked}\n`;
        });

        const fs = await import('fs');
        fs.writeFileSync('all_rentals_debug.txt', log, 'utf8');
        console.log('Done');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

listAllRentals();
