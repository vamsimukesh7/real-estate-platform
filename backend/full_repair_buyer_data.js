import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Property from './src/models/Property.js';

dotenv.config();

const fullRepair = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const buyerId = '6974b0bd62872f232fb79b91';

        // Find all successful payments for this user
        const txs = await Transaction.find({ user: buyerId, type: 'Payment', status: 'Completed', onModel: 'Property' });
        const propIds = [...new Set(txs.map(t => t.reference.toString()))];

        console.log(`Repairing ${propIds.length} properties for buyer ${buyerId}...`);

        for (const id of propIds) {
            const p = await Property.findById(id);
            if (!p) continue;

            const isRent = p.listingType === 'Rent' || p.price < 50000;
            
            if (isRent) {
                await Property.updateOne(
                    { _id: id },
                    { 
                        $set: { 
                            status: 'Rented',
                            tenant: buyerId,
                            rentedUntil: new Date(Date.now() + 30*24*60*60*1000)
                        } 
                    }
                );
                console.log(`[Rented] Fixed: ${p.name}`);
            } else {
                await Property.updateOne(
                    { _id: id },
                    { 
                        $set: { 
                            status: 'Sold',
                            owner: buyerId,
                            tenant: null
                        } 
                    }
                );
                console.log(`[Sold] Fixed: ${p.name}`);
            }
        }

        console.log("Full repair complete.");
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

fullRepair();
