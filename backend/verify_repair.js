import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Property from './src/models/Property.js';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const buyerId = '6974b0bd62872f232fb79b91';

        const txs = await Transaction.find({ user: buyerId, type: 'Payment', status: 'Completed', onModel: 'Property' });
        console.log(`Found ${txs.length} transactions for user ${buyerId}`);

        const properties = await Property.find({ 
            $or: [
                { owner: buyerId },
                { tenant: buyerId }
            ]
        });

        console.log(`User owns or rents ${properties.length} properties:`);
        properties.forEach(p => {
            console.log(`- ${p.name} (Status: ${p.status}, ListingType: ${p.listingType}, Price: ${p.price})`);
            if (p.owner && p.owner.toString() === buyerId) console.log(`  -> Owned by user`);
            if (p.tenant && p.tenant.toString() === buyerId) console.log(`  -> Rented by user`);
        });

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verify();
