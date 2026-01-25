import { useState, useEffect } from 'react';
import Layout from '../components/layouts/Layout';
import PropertyCard from '../components/PropertyCard';
import api from '../services/api';
import { Heart } from 'lucide-react';

const Wishlist = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedProperties = async () => {
        try {
            const { data } = await api.get('/users/saved-properties');
            setProperties(data.data || []);
        } catch (error) {
            console.error("Failed to fetch saved properties", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedProperties();
    }, []);

    // Callback to remove property from list if unsaved
    const handleUpdate = () => {
        fetchSavedProperties();
    };

    return (
        <Layout title="My Wishlist">
            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((property, index) => (
                        <PropertyCard
                            key={property.id || property._id}
                            property={property}
                            index={index}
                            onUpdate={handleUpdate} // Refresh list if status changes (e.g. unsave)
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-dark-800 rounded-3xl border border-dashed border-gray-200 dark:border-dark-700">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                        Save properties you like to track them and view them here later.
                    </p>
                </div>
            )}
        </Layout>
    );
};

export default Wishlist;
