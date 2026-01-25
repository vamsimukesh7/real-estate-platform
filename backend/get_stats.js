import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const stats = await Property.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log(JSON.stringify(stats, null, 2));
    process.exit();
};
run();
