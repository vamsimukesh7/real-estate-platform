import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.js';

dotenv.config();

const testUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const propertyId = '6974a57fed4f6b33d5452ac7'; // The other Downtown Loft
    const updateData = {
        name: 'Downtown Loft',
        price: 450000,
        location: '777 State Street',
        status: 'Active',
        listingType: 'Sale',
        specifications: {
            bedrooms: 1,
            bathrooms: 1,
            sqft: 950
        }
    };

    console.log('Attempting update with runValidators: true...');
    try {
        const prop = await Property.findByIdAndUpdate(propertyId, updateData, {
            new: true,
            runValidators: true
        });
        console.log('Update successful:', prop.name);
    } catch (err) {
        console.error('Update FAILED with validators:', err.message);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`- Error in ${key}: ${err.errors[key].message}`);
            });
        }
    }

    process.exit();
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
};

testUpdate();
