import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, DollarSign, Home, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';

const PurchaseConfirmationModal = ({ isOpen, onClose, property, onPurchaseSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const propertyId = property.id || property._id;
            const res = await api.post(`/properties/${propertyId}/buy`);

            if (onPurchaseSuccess) {
                onPurchaseSuccess(res.data);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-dark-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-700"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-bold">
                                    {property.listingType === 'Rent' ? 'Rental Request' : 'Purchase Request'}
                                </h3>
                            </div>
                            <p className="text-indigo-100 opacity-90">
                                {property.listingType === 'Rent'
                                    ? 'Send a rental request to the owner. Funds will only be deducted upon approval.'
                                    : 'Send a purchase request to the owner. Funds will only be deducted upon approval.'}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            {/* ... existing image logic ... */}
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-700">
                                <img
                                    src={property.image}
                                    className="w-24 h-24 rounded-xl object-cover shadow-sm"
                                    alt={property.name}
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{property.name}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                        <Home size={16} />
                                        <span className="text-sm font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                            {property.listingType === 'Rent' ? 'For Rent' : 'For Sale'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">
                                        {property.listingType === 'Rent' ? 'Rental Price:' : 'Property Price:'}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">${property.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Transaction Fee:</span>
                                    <span className="font-bold text-green-600">FREE</span>
                                </div>
                                <div className="pt-3 border-t border-gray-100 dark:border-dark-700 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount:</span>
                                    <span className="text-2xl font-black text-indigo-600">${property.price.toLocaleString()}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 flex gap-3 text-red-700 dark:text-red-400">
                                    <AlertTriangle size={20} className="shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleConfirm}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <DollarSign size={20} />
                                            {property.listingType === 'Rent' ? 'Send Rental Request' : 'Send Purchase Request'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Footer text */}
                        <div className="px-8 pb-8 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                Protected by RealEstate Pro Escrow System
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PurchaseConfirmationModal;
