import { useState } from 'react';
import { Search, SlidersHorizontal, Map, ChevronDown, DollarSign, Bed, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const TopBar = ({ showMap, setShowMap, filters, setFilters }) => {
    const { type, priceRange, beds, propertyType } = filters;
    const { user, hasRole, isAdmin } = useAuth();

    // Define all available tabs
    // Define all available tabs
    const adminTabs = ['Sale', 'Rent', 'Sold', 'Blocked', 'Approvals'];
    const sellerTabs = ['Sell', 'Approvals'];
    const buyerTabs = ['Buy', 'Rent'];

    // Filter tabs based on user role
    const getAvailableTabs = () => {
        if (!user) return ['Buy', 'Rent'];

        if (isAdmin()) {
            return adminTabs;
        } else if (hasRole(['Seller'])) {
            return sellerTabs;
        } else if (hasRole(['Buyer'])) {
            return buyerTabs;
        }

        return ['Buy', 'Rent'];
    };

    const tabs = getAvailableTabs();
    const priceRanges = ['Any', '$0-$200k', '$200k-$500k', '$500k-$1M', '$1M+'];
    // const bedOptions = ['Any', '1', '2', '3', '4', '5+']; // Kept for reference
    // const propertyTypes = ['All Types', 'House', 'Apartment', 'Condo', 'Villa', 'Townhouse']; // Kept for reference

    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setActiveDropdown(null);
    };

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const bedOptions = ['Any', '1', '2', '3', '4', '5+'];
    const propertyTypes = ['All Types', 'House', 'Apartment', 'Condo', 'Villa', 'Townhouse'];

    // Helper component for dropdown options
    const DropdownOption = ({ label, isSelected, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${isSelected ? 'text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/10' : 'text-gray-700 dark:text-gray-300'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700 sticky top-0 z-[100] transition-colors duration-300">
            {/* Tabs Section */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-dark-700">
                <div className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFilterChange('type', tab)}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${type === tab
                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-gray-50 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                                }`}
                        >
                            {tab}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            value={filters.searchQuery || ''}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            placeholder="Search by location, property name, or ID..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all duration-200 outline-none text-sm"
                        />
                    </div>

                    {/* Price Filter */}
                    <div className="relative">
                        <button
                            onClick={() => toggleDropdown('price')}
                            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium min-w-[140px] ${activeDropdown === 'price'
                                ? 'border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/30 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200'
                                : 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="flex-1 text-left">{priceRange}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === 'price' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden py-1 z-50"
                            >
                                {priceRanges.map((range) => (
                                    <DropdownOption
                                        key={range}
                                        label={range}
                                        isSelected={priceRange === range}
                                        onClick={() => handleFilterChange('priceRange', range)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Beds Filter */}
                    <div className="relative">
                        <button
                            onClick={() => toggleDropdown('beds')}
                            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium min-w-[120px] ${activeDropdown === 'beds'
                                ? 'border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/30 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200'
                                : 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <Bed className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="flex-1 text-left">{beds} Beds</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${activeDropdown === 'beds' ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === 'beds' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full mt-2 left-0 w-full min-w-[150px] bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden py-1 z-50"
                            >
                                {bedOptions.map((opt) => (
                                    <DropdownOption
                                        key={opt}
                                        label={`${opt} Beds`}
                                        isSelected={beds === opt}
                                        onClick={() => handleFilterChange('beds', opt)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Property Type */}
                    <div className="relative">
                        <button
                            onClick={() => toggleDropdown('type')}
                            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium min-w-[150px] ${activeDropdown === 'type'
                                ? 'border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/30 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200'
                                : 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <span className="flex-1 text-left">{propertyType}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === 'type' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full mt-2 left-0 w-full min-w-[180px] bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 overflow-hidden py-1 z-50"
                            >
                                {propertyTypes.map((type) => (
                                    <DropdownOption
                                        key={type}
                                        label={type}
                                        isSelected={propertyType === type}
                                        onClick={() => handleFilterChange('propertyType', type)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Advanced Filters */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-3.5 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:border-primary-500 dark:hover:bg-primary-900/20 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </motion.button>

                    {/* Map Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowMap(!showMap)}
                        className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium transition-all duration-300 ${showMap
                            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-gray-50 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                            }`}
                    >
                        <Map className="w-5 h-5" />
                        <span className="text-sm">Map View</span>
                    </motion.button>

                    {/* Wallet Balance Badge */}
                    {user && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="hidden xl:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl cursor-default"
                        >
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                <Wallet size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter leading-none mb-0.5">Wallet</span>
                                <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 leading-tight">
                                    ${(user.walletBalance || 0).toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
