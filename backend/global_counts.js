import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const globalCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const all = await Property.find({});
        
        console.log(`Total Properties: ${all.length}`);
        
        const counts = {};
        all.forEach(p => {
            counts[p.status] = (counts[p.status] || 0) + 1;
        });
        
        console.log('Global Status Counts:', counts);

        const rentedProps = all.filter(p => p.status === 'Rented');
        console.log(`\nProperties with status 'Rented' (${rentedProps.length}):`);
        rentedProps.forEach(p => console.log(`- ${p.name} (${p._id}) | Tenant: ${p.tenant}`));

        const soldProps = all.filter(p => p.status === 'Sold');
        console.log(`\nProperties with status 'Sold' (${soldProps.length}):`);
        soldProps.forEach(p => console.log(`- ${p.name} (${p._id}) | Owner: ${p.owner}`));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

globalCounts();
