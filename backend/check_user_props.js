import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Property from './src/models/Property.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const userId = '6974b0bd62872f232fb79b91'; // The main buyer ID we saw in logs

        // Write output to string to save to file
        let output = `Checking properties for user: ${userId}\n`;

        // 1. Transactions
        const txs = await Transaction.find({ user: userId, type: 'Payment', onModel: 'Property' });
        output += `\n--- Found ${txs.length} Payments ---\n`;
        const refIds = [];
        txs.forEach(t => {
            output += `Tx ${t._id}: Amount ${t.amount} -> Ref ${t.reference}\n`;
            if (t.reference) refIds.push(t.reference);
        });

        const uniqueRefs = [...new Set(refIds.map(id => id.toString()))];
        output += `Unique Property References (${uniqueRefs.length}): ${uniqueRefs.join(', ')}\n`;

        // 2. Properties from Tx
        const propsFromTx = await Property.find({ _id: { $in: uniqueRefs } });
        output += `\n--- Found ${propsFromTx.length} Properties from Tx ---\n`;
        propsFromTx.forEach(p => {
             output += `[${p._id}] ${p.name} | Status: ${p.status} | ListingType: ${p.listingType} | Price: ${p.price}\n`;
             output += `    Owner: ${p.owner} | Tenant: ${p.tenant}\n`;
        });

        // 3. Properties from field search
        const propsDirect = await Property.find({ 
            $or: [{ owner: userId }, { tenant: userId }] 
        });
        output += `\n--- Found ${propsDirect.length} Properties Direct Search ---\n`;
        propsDirect.forEach(p => {
            output += `[${p._id}] ${p.name} | Owner match: ${p.owner == userId} | Tenant match: ${p.tenant == userId}\n`;
        });

        const fs = await import('fs');
        fs.writeFileSync('debug_props_clean.txt', output, 'utf8');
        console.log('Done');

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

check();
