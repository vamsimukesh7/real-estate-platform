import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

const testWishlist = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await api.post('/users/login', { 
            email: 'user@realestate.com', 
            password: 'password123' 
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('2. Fetching properties...');
        const propsRes = await api.get('/properties', { headers });
        if (!propsRes.data.data || propsRes.data.data.length === 0) {
            console.log('❌ No properties found to save.');
            return;
        }

        const propId = propsRes.data.data[0].id;
        console.log(`Checking property ID: ${propId}`);

        console.log('3. Saving (toggling) property...');
        await api.post(`/properties/${propId}/save`, {}, { headers });
        console.log('✅ Property saved/toggled.');

        console.log('4. Fetching Wishlist...');
        const wishlistRes = await api.get('/users/saved-properties', { headers });
        const wishlist = wishlistRes.data.data;

        // Check if property is in wishlist
        const found = wishlist.find(p => p.id === propId || p._id === propId);

        if (found) {
            console.log('✅ Success! Property IS in wishlist.');
            if (found.isSaved) {
                 console.log('✅ Verification: isSaved flag is TRUE.');
            } else {
                 console.log('⚠️ Warning: Property found but isSaved flag is missing/false.');
            }
        } else {
            console.log('ℹ️ Property not found in wishlist. It might have been untoggled (removed).');
            console.log('Trying to save again to confirm addition...');
            await api.post(`/properties/${propId}/save`, {}, { headers });
            const wishlistRes2 = await api.get('/users/saved-properties', { headers });
            const found2 = wishlistRes2.data.data.find(p => p.id === propId || p._id === propId);
            if (found2) {
                 console.log('✅ Success! Property added to wishlist on second attempt.');
            } else {
                 console.log('❌ Failed. Wishlist logic is broken.');
            }
        }
        process.exit(0);

    } catch (e) {
        console.error('❌ Error during test:', e.message);
        if (e.response) {
             console.error('Response status:', e.response.status);
             console.error('Response data:', e.response.data);
        }
        process.exit(1);
    }
};

testWishlist();
