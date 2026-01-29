import { Heart, MapPin, Bed, Bath, Maximize, TrendingUp, Edit2, Shield, ShieldOff, Scale, MessageCircle, DollarSign, Eye, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate import
import { useAuth } from '../contexts/AuthContext';
import EditPropertyModal from './EditPropertyModal';
import BlockPropertyModal from './BlockPropertyModal';
import PurchaseConfirmationModal from './PurchaseConfirmationModal';
import api from '../services/api';

const PropertyCard = ({ property, index, onUpdate, onToggleCompare, isCompared, onMessage }) => {
    const auth = useAuth();
    const user = auth?.user;
    const isAdmin = typeof auth?.isAdmin === 'function' ? auth.isAdmin : () => false;
    const refreshUser = typeof auth?.refreshUser === 'function' ? auth.refreshUser : () => { };

    const [isSaved, setIsSaved] = useState(property?.isSaved || false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [details, setDetails] = useState(null);
    const navigate = useNavigate(); // Added navigate

    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            const propertyId = property.id || property._id;
            await api.post(`/properties/${propertyId}/save`);
            const nextSavedState = !isSaved;
            setIsSaved(nextSavedState);
            if (onUpdate) onUpdate({ ...property, isSaved: nextSavedState });
        } catch (error) {
            console.error('Failed to toggle save', error);
        }
    };

    const handleCardClick = async () => {
        const nextState = !isExpanded;
        setIsExpanded(nextState);

        if (nextState && !details) {
            try {
                setLoadingDetails(true);
                const propertyId = property.id || property._id;
                const response = await api.get(`/properties/${propertyId}`);
                if (response.data.success) {
                    setDetails(response.data.data);
                    // Update views in parent if possible
                    if (onUpdate) {
                        onUpdate({ ...property, views: response.data.data.views });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch property details', error);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    // Helper to check if two IDs match correctly
    const compareIds = (id1, id2) => {
        if (!id1 || !id2) return false;
        const s1 = (typeof id1 === 'string' ? id1 : (id1._id || id1.id || id1)).toString();
        const s2 = (typeof id2 === 'string' ? id2 : (id2._id || id2.id || id2)).toString();
        return s1 === s2;
    };

    const isPropertyOwner = user && property.owner && compareIds(user._id || user.id, property.owner);
    const isPropertyAgent = user && property.agent && compareIds(user._id || user.id, property.agent);
    const isPendingForSeller = property.status === 'Pending' && (isAdmin() || isPropertyOwner || isPropertyAgent);
    const isPendingForBuyer = property.status === 'Pending' && user && compareIds(user._id || user.id, property.pendingBuyer);
    const managementVisible = isAdmin() || isPropertyOwner || isPropertyAgent;

    const handleDelete = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

        try {
            const propertyId = property.id || property._id;
            const response = await api.delete(`/properties/${propertyId}`);
            if (response.data.success) {
                alert('Property deleted successfully!');
                if (onUpdate) onUpdate({ id: propertyId, deleted: true });
            }
        } catch (error) {
            console.error('Failed to delete property', error);
            alert(error.response?.data?.message || 'Failed to delete property');
        }
    };

    const handleApprove = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!window.confirm('Are you sure you want to approve this purchase? Funds will be transferred to your account.')) return;

        try {
            const propertyId = property.id || property._id;
            const response = await api.post(`/properties/${propertyId}/approve`);
            if (response.data.success) {
                alert('Purchase approved successfully! Funds have been transferred to your wallet.');
                if (onUpdate) onUpdate(response.data.data);
                refreshUser(); // Update seller balance
            }
        } catch (error) {
            console.error('Failed to approve purchase', error);
            alert(error.response?.data?.message || 'Failed to approve purchase');
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card group overflow-hidden hover-lift cursor-pointer relative flex flex-col ${property.blocked ? 'opacity-75 grayscale-[0.5]' : ''} ${isExpanded ? 'ring-2 ring-primary-500 shadow-2xl' : ''}`}
                onClick={handleCardClick}
            >
                {/* Status Overlays */}
                {property.blocked && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-900/10 backdrop-blur-[2px] pointer-events-none">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 transform -rotate-12 border-2 border-white">
                            <Shield className="w-5 h-5" />
                            BLOCKED BY ADMIN
                        </div>
                    </div>
                )}

                {property.status === 'Pending' && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-orange-900/10 backdrop-blur-[1px] pointer-events-none">
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 transform rotate-3 border-2 border-white">
                            PENDING APPROVAL
                        </div>
                    </div>
                )}

                {/* Image Section */}
                <div className="relative overflow-hidden rounded-t-xl h-44">
                    <img
                        src={property.image}
                        alt={property.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-100 dark:bg-dark-800"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Management Actions Overlay (Admin, Owner, Agent) */}
                    {/* Management Actions Overlay (Admin, Owner, Agent) */}
                    {managementVisible && (
                        <div
                            className="absolute top-4 right-16 flex gap-2 z-[70]"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditModalOpen(true);
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 active:scale-90 transition-all cursor-pointer pointer-events-auto"
                                title="Edit Property"
                            >
                                <Edit2 className="w-5 h-5 pointer-events-none" />
                            </button>

                            {isAdmin() && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsBlockModalOpen(true);
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all cursor-pointer pointer-events-auto ${property.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                    title={property.blocked ? "Unblock Property" : "Block Property"}
                                >
                                    {property.blocked ? <ShieldOff className="w-5 h-5 pointer-events-none" /> : <Shield className="w-5 h-5 pointer-events-none" />}
                                </button>
                            )}

                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Explicit click handler delete');
                                    if (!window.confirm('Are you sure you want to delete this property?')) return;
                                    try {
                                        const pid = property.id || property._id;
                                        await api.delete(`/properties/${pid}`);
                                        if (onUpdate) onUpdate({ id: pid, deleted: true });
                                        alert('Property deleted!');
                                    } catch (err) {
                                        alert('Error deleting: ' + (err.response?.data?.message || err.message));
                                    }
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-110 active:scale-90 transition-all cursor-pointer pointer-events-auto"
                                title="Delete Property"
                            >
                                <Trash2 className="w-5 h-5 pointer-events-none" />
                            </button>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 z-[70] hover:scale-110 active:scale-90 cursor-pointer pointer-events-auto ${isSaved
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-white'
                            }`}
                    >
                        <Heart className={`w-5 h-5 pointer-events-none ${isSaved ? 'fill-current' : ''}`} />
                    </button>


                    {/* Badge */}
                    {property.badge && (
                        <div className="absolute top-4 left-4">
                            <span className={`badge ${property.badge === 'Featured' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                                property.badge === 'New' ? 'badge-info' :
                                    property.badge === 'Pending Approval' ? 'bg-orange-500 text-white' :
                                        'badge-success'
                                } shadow-lg`}>
                                {property.badge}
                            </span>
                        </div>
                    )}

                    {/* Message Button inside Image container */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onMessage) onMessage(property.owner || property.agent || { _id: 'placeholder', name: 'Agent', avatar: null });
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute top-16 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg bg-white/90 dark:bg-dark-800/90 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-dark-700 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 active:scale-90 z-[70] cursor-pointer pointer-events-auto"
                        title="Message Owner"
                    >
                        <MessageCircle className="w-5 h-5 pointer-events-none" />
                    </button>

                    {/* Quick Stats on Hover */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-gray-900">+12%</p>
                            </div>
                            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <p className="text-xs text-gray-600">ROI</p>
                                <p className="text-xs font-semibold text-gray-900">8.5%</p>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Content Section */}
                <div className="p-4 flex flex-col gap-3">
                    {/* Price & Views */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-xl font-bold text-gradient mb-1">
                                ${property.price.toLocaleString()}
                            </h3>
                            <p className="text-sm text-gray-500">${property.sqft > 0 ? (property.price / property.sqft).toFixed(0) : 0}/sqft</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-900/20">
                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{property.listingType || 'Sale'}</span>
                        </div>
                    </div>

                    {/* Property Name */}
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-base line-clamp-1">
                        {property.name}
                    </h4>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-xs line-clamp-1">{property.location}</span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Bed className="w-4 h-4" />
                            <span className="text-sm font-medium">{property.beds}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Bath className="w-4 h-4" />
                            <span className="text-sm font-medium">{property.baths}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Maximize className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{property.sqft} sqft</span>
                        </div>
                    </div>

                    {/* Main Content Area (Only shows when expanded) */}
                    <div>

                        {/* Expanded Details */}
                        {isExpanded && (loadingDetails ? (
                            <div className="mt-4 py-4 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {details?.description || 'No description available for this property.'}
                                        </p>
                                    </div>

                                    {details?.features?.length > 0 && (
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {details.features.map((feature, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded-md text-xs text-gray-600 dark:text-gray-400">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {details?.amenities?.length > 0 && (
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amenities</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {details.amenities.map((amenity, i) => (
                                                    <span key={i} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded-md text-xs border border-primary-100 dark:border-primary-900/20">
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Block Reason (Visible for Admin) */}
                        {isAdmin() && property.blocked && property.blockReason && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Reason for block:</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{property.blockReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Metadata */}
                    <div className="mt-1 pt-2 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <Eye size={11} className="text-primary-500" />
                            <span>{(details?.views || property.views || 0).toLocaleString()} views</span>
                        </div>
                    </div>



                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                        {/* Map Button (Visible to everyone) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const query = encodeURIComponent(property.location);
                                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px] cursor-pointer pointer-events-auto"
                            title="Locate on Maps"
                        >
                            <MapPin size={12} className="text-primary-500 pointer-events-none" />
                            Locate
                        </button>

                        {/* Buy/Approve Buttons based on role and status */}
                        {property.status === 'Active' && !property.blocked && user?.role === 'Buyer' && !isPropertyOwner && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPurchaseModalOpen(true);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={`flex-[2] py-3 text-white rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer pointer-events-auto ${property.listingType === 'Rent'
                                    ? 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-700'
                                    : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700'
                                    }`}
                            >
                                <DollarSign size={16} className="pointer-events-none" />
                                {property.listingType === 'Rent' ? 'Rent Now' : 'Buy Property'}
                            </button>
                        )}

                        {/* Approve Button for Seller */}
                        {isPendingForSeller && (
                            <button
                                onClick={(e) => handleApprove(e)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="flex-[2] py-2 bg-green-600 text-white rounded-lg font-bold shadow-md shadow-green-600/20 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px] cursor-pointer pointer-events-auto z-[70]"
                            >
                                <Shield className="w-3 h-3 pointer-events-none" />
                                Approve
                            </button>
                        )}

                        {/* Pending Status for Buyer */}
                        {isPendingForBuyer && (
                            <div className="flex-[2] py-3 bg-orange-100 text-orange-700 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border border-orange-200 cursor-default">
                                <TrendingUp className="w-4 h-4 animate-pulse" />
                                Pending Seller Approval
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
            {/* Admin Modals */}
            <EditPropertyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                property={property}
                onUpdate={onUpdate}
            />
            <BlockPropertyModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                property={property}
                onBlock={onUpdate}
            />
            <PurchaseConfirmationModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                property={property}
                onPurchaseSuccess={(response) => {
                    if (onUpdate && response.data) onUpdate(response.data);
                    refreshUser(); // Update balance
                }}
            />
        </>
    );
};

export default PropertyCard;
