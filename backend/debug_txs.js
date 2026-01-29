import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const checkTxs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const buyerId = '6974b0bd62872f232fb79b91';
        const txs = await Transaction.find({ user: buyerId, type: 'Payment', status: 'Completed' });
        console.log(`Total Payment Txs: ${txs.length}`);
        txs.forEach(t => {
            console.log(`Tx: ${t._id}, onModel: ${t.onModel}, ref: ${t.reference}`);
        });
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkTxs();
