import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const EditPropertyModal = ({ isOpen, onClose, property, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        location: '',
        beds: '',
        baths: '',
        sqft: '',
        status: 'Active',
        listingType: 'Sale',
    });

    useEffect(() => {
        if (property && isOpen) {
            setFormData({
                name: property.name || '',
                price: property.price || '',
                location: property.location || '',
                beds: property.beds || '',
                baths: property.baths || '',
                sqft: property.sqft || '',
                status: property.status || 'Active',
                listingType: property.listingType || 'Sale',
            });
        }
    }, [property, isOpen]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updateData = {
                name: formData.name,
                price: Number(formData.price),
                location: formData.location,
                status: formData.status,
                listingType: formData.listingType,
                specifications: {
                    bedrooms: Number(formData.beds),
                    bathrooms: Number(formData.baths),
                    sqft: Number(formData.sqft),
                }
            };

            const propertyId = property.id || property._id;
            if (!propertyId) {
                setError('Property ID is missing. Cannot update.');
                setLoading(false);
                return;
            }
            const response = await api.put(`/properties/${propertyId}`, updateData);

            if (response.data.success) {
                if (typeof onUpdate === 'function') {
                    onUpdate(response.data.data);
                }
                onClose();
            }
        } catch (err) {
            console.error('Edit Update Error:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update property';
            setError(msg);
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
                    className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Property</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={20} />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Property Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bedrooms
                                </label>
                                <input
                                    type="number"
                                    value={formData.beds}
                                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bathrooms
                                </label>
                                <input
                                    type="number"
                                    value={formData.baths}
                                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Square Feet
                                </label>
                                <input
                                    type="number"
                                    value={formData.sqft}
                                    onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Rented">Rented</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Listing Type
                                </label>
                                <select
                                    value={formData.listingType}
                                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="Sale">For Sale</option>
                                    <option value="Rent">For Rent</option>
                                </select>
                            </div>
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
                                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditPropertyModal;
