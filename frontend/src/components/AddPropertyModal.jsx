import { useState } from 'react';
import { X, Upload, DollarSign, MapPin, Home, Bed, Bath, Square, FileText, CheckCircle2 } from 'lucide-react';
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
        image: '',
        description: '',
        features: '',
        amenities: ''
    });
    const [imageFile, setImageFile] = useState(null); // File object
    const [previewUrl, setPreviewUrl] = useState('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create FormData
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) {
            data.append('image', imageFile);
        }

        onAdd(data); // Pass FormData to parent
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
            image: '',
            description: '',
            features: '',
            amenities: ''
        });
        setImageFile(null);
        setPreviewUrl('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80');
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                    >
                        {/* Modal container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-gray-100 dark:border-dark-700 overflow-hidden flex flex-col relative"
                        >
                            {/* Fixed Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-dark-700 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                        <Home size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">List New Property</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Reach potential buyers instantly</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Form Body */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                {/* Section 1: Basic Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400">
                                        <FileText size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Basic Information</h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Property Title *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Modern Villa with Private Pool"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Price ($) *</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Location *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="City, State"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Specifications */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400">
                                        <Square size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Specifications</h3>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1 text-xs">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option>House</option>
                                                <option>Apartment</option>
                                                <option>Condo</option>
                                                <option>Villa</option>
                                                <option>Townhouse</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1 text-xs">For</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="For Sale">For Sale</option>
                                                <option value="For Rent">For Rent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1 text-xs">Beds</label>
                                            <div className="relative">
                                                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.beds}
                                                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1 text-xs">Baths</label>
                                            <div className="relative">
                                                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.baths}
                                                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Media */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400">
                                        <Upload size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Property Media</h3>
                                    </div>

                                    <div className="p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-600 bg-gray-50/30 dark:bg-dark-700/30 flex flex-col md:flex-row items-center gap-6">
                                        <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-dark-700 shadow-xl flex-shrink-0">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 font-semibold mb-2">
                                                <Upload size={18} />
                                                <span>Change Image</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Recommended: 1200x800px. Supports JPG, PNG, WEBP.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Additional Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400">
                                        <CheckCircle2 size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Additional Details (Optional)</h3>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Detail Description</label>
                                            <textarea
                                                placeholder="Describe what makes this property special..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Features (comma separated)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Garden, Rooftop, Smart Home"
                                                    value={formData.features}
                                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Amenities (comma separated)</label>
                                                <input
                                                    type="text"
                                                    placeholder="WiFi, Parking, 24/7 Security"
                                                    value={formData.amenities}
                                                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Fixed Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 flex-shrink-0 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-dark-700 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-[2] px-6 py-4 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={20} />
                                    Publish Property
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddPropertyModal;
