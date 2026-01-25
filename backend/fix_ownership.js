import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import Property from './src/models/Property.js';

dotenv.config();

const fixOwnership = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Aggressive Fix based on Transactions
    const transactions = await Transaction.find({
      type: 'Payment',
      onModel: 'Property',
      status: 'Completed'
    });

    console.log(`Processing ${transactions.length} transactions...`);

    for (const tx of transactions) {
      try {
        if (!tx.reference) {
            console.log(`Skipping tx ${tx._id} with no ref`);
            continue;
        }

        const property = await Property.findById(tx.reference);
        if (!property) {
             console.log(`Property not found for tx ${tx._id} (Ref: ${tx.reference})`);
             continue;
        }

        const buyerId = tx.user;
        let isRent = false;

        // Heuristic: If listed as Rent OR Price < 15,000 -> Treat as Rental
        if (property.listingType === 'Rent' || (property.price && property.price < 15000)) {
            isRent = true;
        }

        if (isRent) {
            // Fix as Rental
            // Using updateOne to avoid schema validation issues causing crash
            console.log(`[Fix-Rent-Direct] Property ${tx.reference} -> Tenant: ${buyerId}`);
            
            let rentedUntil = property.rentedUntil;
            if (!rentedUntil) {
                rentedUntil = new Date();
                rentedUntil.setDate(rentedUntil.getDate() + 30);
            }

            await Property.updateOne(
                { _id: tx.reference },
                { 
                    $set: { 
                        tenant: buyerId,
                        status: 'Rented',
                        listingType: 'Rent',
                        rentedUntil: rentedUntil
                    }
                }
            );
            fixedCount++;

        } else {
            // Fix as Sale
            console.log(`[Fix-Sale-Direct] Property ${tx.reference} -> Owner: ${buyerId}`);
            await Property.updateOne(
                { _id: tx.reference },
                { 
                    $set: { 
                        owner: buyerId,
                        status: 'Sold',
                        listingType: 'Sale',
                        tenant: null // Unset tenant
                    }
                }
            );
            fixedCount++;
        }
      } catch (err) {
        console.error(`Error processing tx ${tx._id}:`, err.message);
      }
    }

    console.log(`Ownership fix complete. Updated ${fixedCount} properties.`);
    process.exit();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixOwnership();
