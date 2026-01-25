import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const forceFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const buyerId = '6974b0bd62872f232fb79b91';

        const rentalIds = [
            '6974d54b5b131cce32b2a679', // Cozy Studio
            '6974d54b5b131cce32b2a67b', // Penthouse
            '6974d54b5b131cce32b2a67d', // Suburban
            '6974d54b5b131cce32b2a67f', // Loft
            '6974d54b5b131cce32b2a681', // Beachside
            '6974d55ff5a89187aad60de0'  // Townhouse
        ];

        console.log("Forcing RENTALS...");
        for (const id of rentalIds) {
            const res = await Property.updateOne(
                { _id: id },
                { 
                    $set: {
                        status: 'Rented',
                        listingType: 'Rent',
                        tenant: buyerId,
                        rentedUntil: new Date(Date.now() + 99*24*60*60*1000) // 99 days
                    }
                }
            );
            console.log(`Updated ${id}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
        }

        const saleIds = [
            '6974d55ff5a89187aad60dda', // Villa
            '6974d55ff5a89187aad60ddc'  // Lux Apt
        ];

        console.log("\nForcing SALES...");
        for (const id of saleIds) {
            const res = await Property.updateOne(
                { _id: id },
                { 
                    $set: {
                        status: 'Sold',
                        listingType: 'Sale',
                        owner: buyerId,
                        tenant: null
                    }
                }
            );
            console.log(`Updated ${id}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

forceFix();
