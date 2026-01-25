import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected");

        const buyerId = '6974b0bd62872f232fb79b91'; // The active user

        // 1. Fix "Suburban 3BR House" (Rent)
        // Was: Status=Sold, Tenant=null
        await Property.updateOne(
            { _id: '6974d54b5b131cce32b2a67d' },
            { 
                $set: { 
                    status: 'Rented', 
                    tenant: buyerId,
                    listingType: 'Rent',
                    rentedUntil: new Date(Date.now() + 30*24*60*60*1000)
                } 
            }
        );
        console.log("Fixed Suburban 3BR");

        // 2. Fix "Modern Villa with Ocean View" (Sale)
        // Was: Status=Active, Owner=Old
        await Property.updateOne(
            { _id: '6974d55ff5a89187aad60dda' },
            { 
                $set: { 
                    status: 'Sold', 
                    owner: buyerId,
                    listingType: 'Sale',
                    tenant: null
                } 
            }
        );
        console.log("Fixed Modern Villa");

        // 3. Fix "Luxury Downtown Apartment" (Sale)
        // Was: Status=Active, Owner=Old
        await Property.updateOne(
            { _id: '6974d55ff5a89187aad60ddc' },
            { 
                $set: { 
                    status: 'Sold', 
                    owner: buyerId,
                    listingType: 'Sale',
                    tenant: null
                } 
            }
        );
        console.log("Fixed Luxury Apt");

        // 4. Fix "Contemporary Townhouse" (Rent)
        await Property.updateOne(
            { _id: '6974d55ff5a89187aad60de0' },
            { 
                $set: { 
                    status: 'Rented', 
                    tenant: buyerId,
                    listingType: 'Rent',
                    rentedUntil: new Date(Date.now() + 30*24*60*60*1000)
                } 
            }
        );
        console.log("Fixed Townhouse");

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
