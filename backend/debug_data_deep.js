import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './src/models/Transaction.js';
import User from './src/models/User.js';
import Property from './src/models/Property.js';

dotenv.config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    let log = 'Connected to DB\n';

    // 1. Get Users
    const users = await User.find({});
    log += `\n--- ${users.length} USERS ---\n`;
    users.forEach(u => {
        log += `[User] ${u._id} | ${u.email} | Balance: ${u.walletBalance}\n`;
    });

    // 2. Get Payments
    const transactions = await Transaction.find({});
    log += `\n--- ${transactions.length} TRANSACTIONS ---\n`;
    transactions.forEach(t => {
        log += `[Tx] ${t._id} | User: ${t.user} | Type: ${t.type} | Amount: ${t.amount} | Status: ${t.status} | Ref: ${t.reference}\n`;
    });

    // 3. Get Properties
    const properties = await Property.find({});
    log += `\n--- ${properties.length} PROPERTIES ---\n`;
    properties.forEach(p => {
        const owner = p.owner ? p.owner.toString() : 'null';
        const tenant = p.tenant ? p.tenant.toString() : 'null';
        log += `[Prop] ${p._id} | ${p.name} | Type: ${p.listingType} | Owner: ${owner} | Tenant: ${tenant} | Status: ${p.status}\n`;
    });

    // Write to file
    const fs = await import('fs');
    fs.writeFileSync('debug_log_clean.txt', log, 'utf8');
    console.log('Log written to debug_log_clean.txt');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

debug();
