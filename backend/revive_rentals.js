import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const reviveRentals = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find properties that we forced to Rented but might want to see back in the market
        // I will keep 3 rented for the user, and make the rest Active
        const rentals = await Property.find({ listingType: 'Rent' });
        console.log(`Found ${rentals.length} rentals total.`);

        let revived = 0;
        for (let i = 0; i < rentals.length; i++) {
            if (i >= 2) { // Keep the first 2 as Rented for the user's "My Properties" history
                const p = rentals[i];
                await Property.updateOne(
                    { _id: p._id },
                    { 
                        $set: { 
                            status: 'Active',
                            tenant: null,
                            rentedUntil: null
                        } 
                    }
                );
                console.log(`Revived: ${p.name}`);
                revived++;
            }
        }

        console.log(`Revived ${revived} rentals to 'Active' status.`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

reviveRentals();
