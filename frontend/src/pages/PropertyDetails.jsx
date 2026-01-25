import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import {
    MapPin, Bed, Bath, Maximize, Calendar, Share2, Heart, Phone,
    Mail, Star, TrendingUp, Home, Car, Trees, Wifi, Dumbbell,
    Shield, ChevronLeft, ChevronRight, Video, Image as ImageIcon
} from 'lucide-react';
import Sidebar from '../components/layouts/Sidebar';

const PropertyDetails = () => {
    const { id } = useParams();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await api.get(`/properties/${id}`);
                if (response.data.success) {
                    setProperty(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch property details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-xl text-gray-600">Property not found</p>
            </div>
        );
    }

    // Map features to icons (helper for dynamic data)
    const getFeatureIcon = (featureName) => {
        const lowerName = featureName.toLowerCase();
        if (lowerName.includes('smart')) return Home;
        if (lowerName.includes('garage') || lowerName.includes('parking')) return Car;
        if (lowerName.includes('garden') || lowerName.includes('yard')) return Trees;
        if (lowerName.includes('wifi') || lowerName.includes('internet')) return Wifi;
        if (lowerName.includes('gym') || lowerName.includes('fitness')) return Dumbbell;
        if (lowerName.includes('security')) return Shield;
        if (lowerName.includes('pool')) return Star;
        if (lowerName.includes('view')) return Image;
        return Star; // Default
    };

    // Construct images array (backend might return one or array)
    const images = property.images && property.images.length > 0
        ? property.images.map(img => img.url)
        : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80']; // Fallback

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
                {/* Image Gallery */}
                <div className="relative h-[500px] bg-black group">
                    <img
                        src={property.images[currentImageIndex]}
                        alt={property.name}
                        className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {property.images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Top Actions */}
                    <div className="absolute top-6 right-6 flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <ImageIcon className="w-5 h-5 text-gray-900" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <Video className="w-5 h-5 text-gray-900" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <Share2 className="w-5 h-5 text-gray-900" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSaved(!isSaved)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-8"
                            >
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.name}</h1>
                                <div className="flex items-center gap-2 text-gray-600 mb-6">
                                    <MapPin className="w-5 h-5 text-primary-500" />
                                    <span>{property.location}</span>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div>
                                        <h2 className="text-4xl font-bold text-gradient mb-1">
                                            ${property.price.toLocaleString()}
                                        </h2>
                                        <p className="text-sm text-gray-500">${(property.price / property.sqft).toFixed(0)}/sqft</p>
                                    </div>
                                    <div className="flex items-center gap-2 badge badge-success text-base">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+8.2% value increase</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Key Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card p-8"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Key Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Bed className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                                        <p className="text-sm text-gray-600">Bedrooms</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Bath className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                                        <p className="text-sm text-gray-600">Bathrooms</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Maximize className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{property.sqft}</p>
                                        <p className="text-sm text-gray-600">Sq Ft</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Calendar className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{property.yearBuilt}</p>
                                        <p className="text-sm text-gray-600">Year Built</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card p-8"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{property.description}</p>
                            </motion.div>

                            {/* Amenities */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card p-8"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Amenities & Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {property.features.map((feature, index) => {
                                        const Icon = feature.icon;
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                                                <Icon className="w-5 h-5 text-primary-600" />
                                                <span className="text-gray-700 font-medium">{feature.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Agent Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card p-6 sticky top-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Agent</h3>

                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                        SJ
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{property.agent.name}</h4>
                                        <p className="text-sm text-gray-600">{property.agent.role}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium text-gray-900">{property.agent.rating}</span>
                                            <span className="text-sm text-gray-500">({property.agent.deals} deals)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button className="btn btn-primary w-full">
                                        <Phone className="w-5 h-5" />
                                        Call Agent
                                    </button>
                                    <button className="btn btn-outline w-full">
                                        <Mail className="w-5 h-5" />
                                        Send Message
                                    </button>
                                    <button className="btn btn-secondary w-full">
                                        <Calendar className="w-5 h-5" />
                                        Schedule Tour
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium text-gray-900">{property.agent.phone}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium text-gray-900 truncate ml-2">{property.agent.email}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
