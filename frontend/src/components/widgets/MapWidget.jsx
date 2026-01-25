import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWidget = ({ properties, fullscreen, setFullscreen }) => {
    // Default center (can be adjusted)
    const [center, setCenter] = useState([40.7128, -74.0060]); // New York by default

    // Generate coordinates for properties that don't have them
    // In a real app, these would come from the database
    const markers = properties.slice(0, 10).map((prop, idx) => {
        // Spread properties apart slightly so they don't overlap perfectly
        // Base coordinate + small random offset
        const lat = 40.7128 + (Math.random() - 0.5) * 0.1;
        const lng = -74.0060 + (Math.random() - 0.5) * 0.1;

        return {
            ...prop,
            position: [lat, lng]
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden flex flex-col ${fullscreen ? 'fixed inset-4 z-50' : 'h-full min-h-[400px]'
                }`}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between bg-gradient-to-r from-primary-50 to-purple-50 dark:from-dark-800 dark:to-dark-700">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Property Map</h3>
                </div>
                <button
                    onClick={() => setFullscreen(!fullscreen)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                >
                    {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={fullscreen} // Only scroll zoom when full screen
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {markers.map((marker) => (
                        <Marker key={marker._id || marker.id} position={marker.position}>
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h4 className="font-bold text-sm mb-1">{marker.name}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{marker.location}</p>
                                    <p className="font-bold text-primary-600">
                                        ${marker.price.toLocaleString()}
                                    </p>
                                    <span className={`badge ${marker.status === 'Sale' ? 'badge-success' : 'badge-info'
                                        } mt-2 text-[10px]`}>
                                        {marker.status}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {!fullscreen && (
                    <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-500 pointer-events-none">
                        Use fullscreen for best experience
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MapWidget;
