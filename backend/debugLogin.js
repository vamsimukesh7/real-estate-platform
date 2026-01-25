import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const email = 'buyer_final_1@test.com';
        let user = await User.findOne({ email });
        
        if (user) {
            console.log('Found user:', user.email);
            console.log('Current status - Active:', user.active, 'Locked:', user.lockUntil, 'Attempts:', user.loginAttempts);
            
            user.password = 'password123';
            user.active = true;
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            
            await user.save();
            console.log('Updated user. Verifying password hash...');
            
            const updatedUser = await User.findOne({ email }).select('+password');
            const isMatch = await bcrypt.compare('password123', updatedUser.password);
            console.log('Double check match:', isMatch);
            console.log('Hash starts with:', updatedUser.password.substring(0, 10));
        } else {
            console.log('User not found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fix();
