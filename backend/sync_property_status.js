import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Property from './src/models/Property.js';

dotenv.config();

const syncStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find all unique properties that have a completed payment
        const txs = await Transaction.find({ type: 'Payment', status: 'Completed', onModel: 'Property' });
        const paidRefs = [...new Set(txs.map(t => t.reference.toString()))];
        
        console.log(`Found ${paidRefs.length} properties that have been paid for.`);

        let updated = 0;
        for (const propId of paidRefs) {
            const p = await Property.findById(propId);
            if (!p) continue;

            const isRent = p.listingType === 'Rent' || p.price < 50000;
            const newStatus = isRent ? 'Rented' : 'Sold';

            if (p.status !== newStatus) {
                await Property.updateOne(
                    { _id: propId },
                    { $set: { status: newStatus } }
                );
                console.log(`Updated [${p.name}] status to ${newStatus}`);
                updated++;
            }
        }

        console.log(`Sync complete. Updated ${updated} properties.`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

syncStatus();
