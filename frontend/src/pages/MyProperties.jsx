import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Clock, Key, ShieldCheck, Tag, Info } from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyProperties = () => {
    const { user, refreshUser } = useAuth();
    const [data, setData] = useState({
        owned: [], rented: [], pending: [], // Buyer keys
        active: [], sold: [] // Seller keys
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // Default to pending as it's most important
    const navigate = useNavigate();

    const isBuyer = user?.role === 'Buyer';

    // Redirect Admin and Seller away from this page
    useEffect(() => {
        if (user && !isBuyer) {
            navigate('/');
        }
    }, [user, isBuyer, navigate]);

    useEffect(() => {
        if (!isBuyer || !user) return;

        const fetchMyProperties = async () => {
            try {
                const res = await api.get('/properties/my-properties');
                if (res.data.success) {
                    setData(res.data.data);

                    // Auto-select tab if current is empty
                    const stats = res.data.data;
                    if (stats.pending.length > 0) setActiveTab('pending');
                    else if (stats.rented.length > 0) setActiveTab('rented');
                    else if (stats.owned.length > 0) setActiveTab('owned');
                }
            } catch (error) {
                console.error('Failed to fetch properties', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProperties();
    }, [user, isBuyer]);

    const handleUpdate = (updatedProperty) => {
        setData(prev => {
            const newData = { ...prev };

            // Remove from current lists if status changed
            Object.keys(newData).forEach(key => {
                if (Array.isArray(newData[key])) {
                    newData[key] = newData[key].filter(p => p.id !== updatedProperty.id);
                }
            });

            // Add back to the correct category based on new status/type
            if (isBuyer && !updatedProperty.deleted) {
                if (updatedProperty.status === 'Pending') newData.pending.push(updatedProperty);
                else if (updatedProperty.listingType === 'Rent') newData.rented.push(updatedProperty);
                else newData.owned.push(updatedProperty);
            }

            return newData;
        });
    };

    const tabs = [
        { id: 'pending', label: 'Pending Requests', icon: ShieldCheck, count: data.pending?.length || 0 },
        { id: 'owned', label: 'Owned Properties', icon: Key, count: data.owned?.length || 0 },
        { id: 'rented', label: 'Active Rentals', icon: Clock, count: data.rented?.length || 0 },
    ];

    const currentList = data[activeTab] || [];

    if (!isBuyer) return null;

    return (
        <div className="space-y-8 p-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Portfolio</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track your property ownership and active requests.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-dark-700 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 font-medium text-sm transition-colors relative whitespace-nowrap ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Icon size={18} />
                                {tab.label}
                                <span className={`py-0.5 px-2 rounded-full text-xs transition-colors ${isActive ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40' : 'bg-gray-100 text-gray-600 dark:bg-dark-700'
                                    }`}>
                                    {tab.count}
                                </span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="activeTabProp" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Info Message for Pending */}
            {activeTab === 'pending' && currentList.length > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-2xl flex items-start gap-4 text-orange-800 dark:text-orange-300">
                    <Info className="shrink-0 mt-0.5" />
                    <p className="text-sm">
                        These properties are waiting for the seller's approval. You can message the owner to speed up the process.
                    </p>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading your portfolio...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    <AnimatePresence mode="popLayout">
                        {currentList.length > 0 ? (
                            currentList.map((property, idx) => (
                                <motion.div
                                    key={property.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative group"
                                >
                                    <PropertyCard property={property} index={idx} onUpdate={handleUpdate} />

                                    {/* Overlay Labels based on Tab */}
                                    {activeTab === 'owned' && (
                                        <div className="absolute top-4 left-4 z-20">
                                            <div className="bg-green-600 text-white shadow-lg px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/20">
                                                <Key size={14} /> OWNER
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'rented' && (
                                        <div className="absolute top-4 left-4 z-20">
                                            <div className="bg-indigo-600 text-white shadow-lg px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/20">
                                                <Clock size={14} /> TENANT
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'pending' && (
                                        <div className="absolute top-4 left-4 z-20">
                                            <div className="bg-orange-500 text-white shadow-lg px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/20">
                                                <Clock size={14} className="animate-pulse" /> PENDING
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center bg-gray-50 dark:bg-dark-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-700"
                            >
                                <div className="w-20 h-20 bg-white dark:bg-dark-700 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-500">
                                    <Home size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No properties here</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                                    We couldn't find any properties in the "{tabs.find(t => t.id === activeTab)?.label}" category.
                                </p>
                                <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30">
                                    Browse Marketplace
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <div className="text-center text-[10px] text-gray-400 mt-12 uppercase tracking-widest font-bold opacity-50">
                Secure RealEstate Portfolio Management v1.2
            </div>
        </div>
    );
};

export default MyProperties;
