import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Property from './src/models/Property.js';

dotenv.config();

const compare = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const buyerId = '6974b0bd62872f232fb79b91';
        let log = '';

        // 1. What Buyer sees in "My Properties" (Based on Transactions)
        const txs = await Transaction.find({ user: buyerId, type: 'Payment', status: 'Completed', onModel: 'Property' });
        const buyerTxPropIds = [...new Set(txs.map(t => t.reference.toString()))];
        log += `Buyer Transactions: ${buyerTxPropIds.length} properties\n`;

        // 2. What Dashboard "Sold" filter shows (Admin view)
        // Dashboard code: p.status === 'Sold' || p.status === 'Rented'
        const soldOrRented = await Property.find({ 
            status: { $in: ['Sold', 'Rented'] },
            blocked: { $ne: true }
        });
        log += `Dashboard "Sold/Rented" Count: ${soldOrRented.length}\n`;
        
        log += '\n--- Buyer Property List (from Transactions) ---\n';
        for (let id of buyerTxPropIds) {
            const p = await Property.findById(id);
            if (p) {
                log += `[${p._id}] ${p.name} | Status: ${p.status} | Listing: ${p.listingType}\n`;
            } else {
                log += `[${id}] NOT FOUND IN DB\n`;
            }
        }

        log += '\n--- Dashboard "Sold/Rented" List ---\n';
        soldOrRented.forEach(p => {
             log += `[${p._id}] ${p.name} | Status: ${p.status} | Listing: ${p.listingType} | Owner: ${p.owner} | Tenant: ${p.tenant}\n`;
        });

        const fs = await import('fs');
        fs.writeFileSync('compare_counts_clean.txt', log, 'utf8');
        console.log('Done');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

compare();
