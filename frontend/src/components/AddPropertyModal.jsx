import { useState } from 'react';
import { X, Upload, DollarSign, MapPin, Home, Bed, Bath, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddPropertyModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        location: '',
        type: 'House',
        beds: '',
        baths: '',
        sqft: '',
        status: 'For Sale',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80' // Default image
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: Date.now(), // Simple ID generation
            tags: ['New Listing'],
            badge: 'New'
        });
        onClose();
        // Reset form
        setFormData({
            name: '',
            price: '',
            location: '',
            type: 'House',
            beds: '',
            baths: '',
            sqft: '',
            status: 'For Sale',
            image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-dark-700"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between sticky top-0 bg-white dark:bg-dark-800 z-10">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">List Your Property</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Title</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Modern Villa with Pool"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="City, State"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                                        >
                                            <option>House</option>
                                            <option>Apartment</option>
                                            <option>Condo</option>
                                            <option>Villa</option>
                                            <option>Townhouse</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="For Sale">For Sale</option>
                                            <option value="For Rent">For Rent</option>
                                            <option value="Sold">Sold</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beds</label>
                                        <div className="relative">
                                            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="number"
                                                placeholder="1"
                                                value={formData.beds}
                                                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Baths</label>
                                        <div className="relative">
                                            <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="number"
                                                placeholder="1"
                                                value={formData.baths}
                                                onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                                    >
                                        Add Property
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddPropertyModal;
