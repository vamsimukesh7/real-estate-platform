import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const txStats = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const txs = await Transaction.find({ type: 'Payment', status: 'Completed' });
    console.log(`Total Completed Payments: ${txs.length}`);
    
    const userMap = {};
    txs.forEach(t => {
        userMap[t.user] = (userMap[t.user] || 0) + 1;
    });
    
    console.log('Payments per User:', userMap);
    process.exit();
};
txStats();
