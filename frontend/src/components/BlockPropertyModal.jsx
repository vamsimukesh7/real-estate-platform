import { useState } from 'react';
import { X, Shield, ShieldOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const BlockPropertyModal = ({ isOpen, onClose, property, onBlock }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isBlocked = property?.blocked;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const propertyId = property.id || property._id;
            const endpoint = isBlocked ? 'unblock' : 'block';
            const response = await api.put(`/properties/${propertyId}/${endpoint}`, {
                reason: reason || 'Incorrect or suspicious information'
            });

            if (response.data.success) {
                onBlock(response.data.data);
                onClose();
                setReason('');
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isBlocked ? 'unblock' : 'block'} property`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                        <div className="flex items-center gap-3">
                            {isBlocked ? (
                                <ShieldOff className="w-6 h-6 text-green-500" />
                            ) : (
                                <Shield className="w-6 h-6 text-red-500" />
                            )}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isBlocked ? 'Unblock' : 'Block'} Property
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={20} />
                                {error}
                            </div>
                        )}

                        {isBlocked ? (
                            <div className="space-y-3">
                                <p className="text-gray-600 dark:text-gray-400">
                                    This property is currently blocked. Unblocking it will make it visible to all users again.
                                </p>
                                {property.blockReason && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                            Block Reason:
                                        </p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            {property.blockReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Blocking this property will hide it from all non-admin users. Please provide a reason:
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reason for blocking
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="E.g., Incorrect pricing, misleading information, fake images..."
                                        className="input w-full h-24 resize-none"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong className="text-gray-900 dark:text-white">Property:</strong> {property?.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <strong className="text-gray-900 dark:text-white">Location:</strong> {property?.location}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 btn bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 btn flex items-center justify-center gap-2 ${isBlocked
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                            >
                                {isBlocked ? <ShieldOff size={18} /> : <Shield size={18} />}
                                {loading ? 'Processing...' : isBlocked ? 'Unblock Property' : 'Block Property'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BlockPropertyModal;
