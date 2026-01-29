import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Sidebar from '../components/layouts/Sidebar';
import TopBar from '../components/layouts/TopBar';
import PropertyCard from '../components/PropertyCard';
import MapWidget from '../components/widgets/MapWidget';
import MessagesWidget from '../components/widgets/MessagesWidget';
import { TrendingUp, Home, DollarSign, Eye, Plus, X, ArrowRightLeft } from 'lucide-react';
import AddPropertyModal from '../components/AddPropertyModal';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const auth = useAuth();
    const user = auth?.user;
    const isAdmin = typeof auth?.isAdmin === 'function' ? auth.isAdmin : () => false;
    const hasRole = typeof auth?.hasRole === 'function' ? auth.hasRole : () => false;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [mapFullscreen, setMapFullscreen] = useState(false);
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [directChatUser, setDirectChatUser] = useState(null);
    const [filters, setFilters] = useState({
        type: 'Buy',
        priceRange: 'Any',
        beds: 'Any',
        propertyType: 'All Types',
        searchQuery: ''
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                // Fetch from API (MongoDB)
                const response = await api.get('/properties');
                if (response.data.data) {
                    setProperties(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch properties', error);
                // API error handling can be improved here
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handlePropertyUpdate = (updatedProperty) => {
        if (updatedProperty.deleted) {
            setProperties(prev => prev.filter(p => (p.id || p._id) !== updatedProperty.id));
        } else {
            setProperties(prev => prev.map(p =>
                (p.id || p._id) === (updatedProperty.id || updatedProperty._id) ? { ...p, ...updatedProperty } : p
            ));
        }
    };

    const removeFromCompare = (id) => {
        // Function removed
    };

    // Filter properties when filters or properties change
    useEffect(() => {
        let result = properties;

        // Filter by Type (Tabs)
        if (filters.type === 'Buy' || filters.type === 'Sell' || filters.type === 'Sale') {
            // Buy/Sell/Sale all show properties for SALE (NOT sold)
            // AND NOT blocked
            result = result.filter(p =>
                !p.blocked && (
                    (p.listingType === 'Sale' && p.status !== 'Sold') ||
                    (p.status === 'For Sale') ||
                    (p.status === 'Active' && p.listingType === 'Sale') ||
                    (p.status === 'Pending' && p.listingType === 'Sale')
                )
            );
        } else if (filters.type === 'Rent') {
            // Show properties for RENT (NOT already rented)
            // AND NOT blocked
            result = result.filter(p =>
                !p.blocked && (
                    (p.listingType === 'Rent' && p.status !== 'Rented') ||
                    (p.status === 'For Rent') ||
                    (p.status === 'Pending' && p.listingType === 'Rent')
                )
            );
        } else if (filters.type === 'Sold') {
            // Admin only - Show sold and rented properties
            // AND NOT blocked
            result = result.filter(p =>
                !p.blocked && (
                    p.status === 'Sold' ||
                    p.status === 'Rented'
                )
            );
        } else if (filters.type === 'Blocked') {
            // Admin only - Show blocked properties
            result = result.filter(p => p.blocked);
        } else if (filters.type === 'Approvals') {
            // Admin sees all, Seller/Agent only sees their own pending items
            result = result.filter(p => {
                const isPending = p.status === 'Pending';
                if (!isPending) return false;
                if (isAdmin()) return true;

                const userId = user?._id?.toString() || user?.id?.toString();
                const ownerId = (p.owner?._id || p.owner)?.toString();
                const agentId = (p.agent?._id || p.agent)?.toString();

                return userId && (userId === ownerId || userId === agentId);
            });
        }

        // Filter by Beds
        if (filters.beds !== 'Any') {
            const minBeds = parseInt(filters.beds);
            result = result.filter(p => p.beds >= minBeds || p.specifications?.bedrooms >= minBeds);
        }

        // Filter by Property Type
        if (filters.propertyType !== 'All Types') {
            result = result.filter(p => {
                const propertyType = p.type || p.propertyType;
                return propertyType === filters.propertyType ||
                    (propertyType === 'House' && filters.propertyType === 'Villa') ||
                    (propertyType === 'Villa' && filters.propertyType === 'House');
            });
        }

        // Filter by Price (Simple implementation for demo)
        if (filters.priceRange !== 'Any') {
            if (filters.priceRange === '$0-$200k') result = result.filter(p => p.price <= 200000);
            else if (filters.priceRange === '$200k-$500k') result = result.filter(p => p.price > 200000 && p.price <= 500000);
            else if (filters.priceRange === '$500k-$1M') result = result.filter(p => p.price > 500000 && p.price <= 1000000);
            else if (filters.priceRange === '$1M+') result = result.filter(p => p.price > 1000000);
        }

        // Filter by Search Query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.location.toLowerCase().includes(query) ||
                (p.id && p.id.toString().toLowerCase().includes(query))
            );
        }

        setFilteredProperties(result);
    }, [filters, properties]);

    const handleAddProperty = async (newProperty) => {
        try {
            const response = await api.post('/properties', newProperty);
            if (response.data.success) {
                setProperties(prev => [response.data.data, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add property', error); // Optionally handle error (toast notification)
        }
    };

    const handleMessage = (user) => {
        setDirectChatUser(user);
        // Ensure map is hidden so messages widget is prominent if in split view
        // Or if in small screen. 
        // For now, let's just ensure if map is showing, messages might be hidden or small.
        // Actually, if map is showing, MessagesWidget is in right column (step 336).
        // If map is NOT showing, MessagesWidget is in the bottom section (step 350).
        // Let's scroll to messages widget roughly?
        // Or just set the state. The widget will pick it up.
        // If map is hidden, we might want to scroll down.
        if (!showMap) {
            // Optional: scroll to messages
            const msgElement = document.getElementById('messages-widget');
            msgElement?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Calculate dynamic stats based on actual data
    const stats = useMemo(() => {
        const totalProperties = properties.length;
        const activeProperties = properties.filter(p => p.status === 'Active' || p.status === 'For Sale' || p.status === 'For Rent' || p.listingType === 'Sale' || p.listingType === 'Rent').length;
        const soldProperties = properties.filter(p => p.status === 'Sold' || p.status === 'Rented').length;

        // Calculate total revenue from sold properties (rough estimate)
        const totalRevenue = properties
            .filter(p => p.status === 'Sold')
            .reduce((sum, p) => sum + (p.price || 0), 0);

        // Calculate total views
        const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);

        // Calculate growth rate (percentage of sold vs active)
        const growthRate = activeProperties > 0
            ? ((soldProperties / activeProperties) * 100).toFixed(1)
            : 0;

        return [
            {
                icon: Home,
                label: 'Total Properties',
                value: totalProperties.toLocaleString(),
                change: '+12.5%',
                color: 'from-blue-500 to-cyan-500',
            },
            {
                icon: DollarSign,
                label: 'Total Revenue',
                value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
                change: '+18.2%',
                color: 'from-green-500 to-emerald-500',
            },
            {
                icon: Eye,
                label: 'Property Views',
                value: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(),
                change: '+25.8%',
                color: 'from-purple-500 to-pink-500',
            },
            {
                icon: TrendingUp,
                label: 'Growth Rate',
                value: `${growthRate}%`,
                change: '+5.2%',
                color: 'from-orange-500 to-red-500',
            },
        ];
    }, [properties]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            {/* Main Content */}
            <div
                className={`transition-[margin] duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-[240px]'
                    }`}
            >
                {/* Top Bar */}
                <TopBar showMap={showMap} setShowMap={setShowMap} filters={filters} setFilters={setFilters} />

                {/* Dashboard Content */}
                <div className="p-6">
                    {/* Stats Cards - Only visible to Admin */}
                    {isAdmin() && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="card p-6 hover-lift bg-white dark:bg-dark-800 border-gray-100 dark:border-dark-700"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="badge badge-success">{stat.change}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {stat.value}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Properties Grid */}
                        <div className={showMap ? 'lg:col-span-2' : 'lg:col-span-3'}>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {filters.type === 'Approvals' ? 'Approvals Needed' :
                                        filters.type === 'Blocked' ? 'Blocked Properties' :
                                            filters.type === 'Sold' ? 'Sold Properties' :
                                                filters.type === 'Rent' ? 'Rentals' :
                                                    'Featured Properties'}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {filteredProperties.length} of {properties.length} properties
                                    </span>
                                    {/* Show Add Listing button only to Sellers and Admins */}
                                    {hasRole(['Seller', 'Admin']) && (
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 font-medium text-sm"
                                        >
                                            <Plus size={16} />
                                            Add Listing
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div
                                className={`grid gap-4 items-start ${showMap
                                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    }`}
                            >
                                <AnimatePresence mode="popLayout">
                                    {filters.type === 'Blocked' && filteredProperties.length === 0 ? (
                                        <div className="col-span-full text-center py-16">
                                            <div className="max-w-md mx-auto">
                                                <div className="text-6xl mb-4">🛡️</div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                    No Blocked Properties
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                    There are currently no blocked properties. Blocked properties will appear here.
                                                </p>
                                            </div>
                                        </div>
                                    ) : filters.type === 'Sold' && filteredProperties.length === 0 ? (
                                        <div className="col-span-full text-center py-16">
                                            <div className="max-w-md mx-auto">
                                                <div className="text-6xl mb-4">✅</div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                    Sold Properties
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                    This section shows all properties that have been successfully sold or rented.
                                                </p>
                                            </div>
                                        </div>
                                    ) : filteredProperties.length > 0 ? (
                                        filteredProperties.map((property, index) => (
                                            <PropertyCard
                                                key={property.id}
                                                property={property}
                                                index={index}
                                                onUpdate={handlePropertyUpdate}
                                                onMessage={handleMessage}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-16">
                                            <div className="text-6xl mb-4">🏠</div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                No properties found
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Try adjusting your filters or search criteria
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right Sidebar Widgets */}
                        {showMap && (
                            <div className="space-y-6">
                                {/* Map Widget */}
                                <div className="h-[500px]">
                                    <MapWidget
                                        properties={filteredProperties}
                                        fullscreen={mapFullscreen}
                                        setFullscreen={setMapFullscreen}
                                    />
                                </div>

                                {/* Messages Widget */}
                                <div className="h-[600px]" id="messages-widget">
                                    <MessagesWidget activeChatUser={directChatUser} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Messages Widget (Full Width when map is hidden) */}
                    {!showMap && (
                        <div className="mt-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1 h-[600px]" id="messages-widget">
                                    <MessagesWidget activeChatUser={directChatUser} />
                                </div>
                                <div className="lg:col-span-2 h-[600px]">
                                    <MapWidget
                                        properties={filteredProperties}
                                        fullscreen={mapFullscreen}
                                        setFullscreen={setMapFullscreen}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <AddPropertyModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddProperty}
            />
        </div>
    );
};

export default Dashboard;
