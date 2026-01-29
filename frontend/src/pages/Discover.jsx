import { useState, useEffect } from 'react';
import Layout from '../components/layouts/Layout';
import PropertyCard from '../components/PropertyCard';
import api from '../services/api';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const Discover = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const { data } = await api.get('/properties');
                setProperties(data.data || []);
            } catch (error) {
                console.error("Failed to fetch properties", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Simple client-side filtering
    const filteredProperties = properties.filter(property => {
        const matchesSearch =
            property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || property.type === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handlePropertyUpdate = (updatedProperty) => {
        setProperties(prev => prev.map(p =>
            p.id === updatedProperty.id ? { ...p, ...updatedProperty } : p
        ));
    };

    const categories = ['All', 'House', 'Apartment', 'Condo', 'Villa'];

    return (
        <Layout title="Discover Properties">
            {/* Search & Filter Header */}
            <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search properties, locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <button className="px-5 py-3 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                    </button>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                                : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {filteredProperties.map((property, index) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            index={index}
                            onUpdate={handlePropertyUpdate}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No properties found matching your criteria.</p>
                </div>
            )}
        </Layout>
    );
};

export default Discover;
