import { X, Check, MapPin, Bed, Bath, Maximize, AlertCircle, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const CompareWidget = ({ properties, onRemove, onClear, onAdd }) => {
    if (!properties || properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-800 rounded-3xl border border-dashed border-gray-300 dark:border-dark-600">
                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">⚖️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Start Comparing
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                    Select up to 3 properties to compare their features, prices, and amenities side by side.
                </p>
                <div className="flex gap-2">
                    <div className="w-12 h-16 rounded-lg bg-gray-100 dark:bg-dark-700 animate-pulse delay-75"></div>
                    <div className="w-12 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/20 animate-pulse delay-150"></div>
                    <div className="w-12 h-16 rounded-lg bg-gray-100 dark:bg-dark-700 animate-pulse delay-300"></div>
                </div>
            </div>
        );
    }

    // Comparison fields configuration
    const rows = [
        {
            label: 'Price',
            render: (p) => (
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    ${p.price.toLocaleString()}
                </div>
            )
        },
        {
            label: 'Location',
            render: (p) => (
                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 mt-1 text-gray-400 shrink-0" />
                    <span>{p.location}</span>
                </div>
            )
        },
        {
            label: 'Status',
            render: (p) => (
                <span className={`badge ${p.status === 'For Sale' ? 'badge-success' :
                    p.status === 'For Rent' ? 'badge-info' : 'badge-warning'
                    }`}>
                    {p.status}
                </span>
            )
        },
        {
            label: 'Type',
            render: (p) => p.type || 'Property'
        },
        {
            label: 'Configuration',
            render: (p) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{p.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bath className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{p.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Maximize className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{p.sqft?.toLocaleString()} sqft</span>
                    </div>
                </div>
            )
        },
        {
            label: 'Price per Sqft',
            render: (p) => p.price && p.sqft ? (
                <span className="font-mono text-gray-600 dark:text-gray-400">
                    ${(p.price / p.sqft).toFixed(0)}/sqft
                </span>
            ) : <span className="text-gray-400">-</span>
        },
        {
            label: 'Amenities',
            render: (p) => (
                <div className="flex flex-wrap gap-1.5">
                    {p.features?.slice(0, 4).map((f, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-dark-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {f}
                        </span>
                    )) || <span className="text-gray-400 italic">No features listed</span>}
                    {p.features?.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-400">+{p.features.length - 4} more</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="w-full overflow-hidden">
            {/* Desktop Table View */}
            <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden relative">
                {/* Scrollable Container */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-auto border-collapse">
                        <thead>
                            <tr>
                                {/* Sticky Header Column */}
                                <th className="sticky left-0 z-20 w-48 min-w-[12rem] bg-gray-50/95 dark:bg-dark-900/95 backdrop-blur-sm border-b border-r border-gray-200 dark:border-dark-600 p-6 text-left align-bottom">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        Comparison
                                    </div>
                                    <p className="text-sm text-gray-500 font-normal mt-1 mb-3">
                                        {properties.length} properties selected
                                    </p>
                                    <button
                                        onClick={onClear}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                        Clear All
                                    </button>
                                </th>

                                {/* Property Headers (Always 3 Columns) */}
                                {[0, 1, 2].map((i) => {
                                    const property = properties[i];
                                    return (
                                        <th key={i} className="w-[300px] min-w-[300px] p-4 border-b border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 align-top relative group">
                                            {property ? (
                                                <>
                                                    <button
                                                        onClick={() => onRemove(property.id)}
                                                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/80 hover:bg-red-50 hover:text-red-500 text-gray-400 hover:scale-110 rounded-full transition-all z-10 backdrop-blur-md shadow-sm border border-gray-100 dark:border-dark-600 cursor-pointer"
                                                        title="Remove from comparison"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                    <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 shadow-sm relative">
                                                        <img
                                                            src={property.image}
                                                            alt={property.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                                                    </div>

                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 min-h-[3rem]">
                                                        {property.name}
                                                    </h4>
                                                    <button className="w-full py-2.5 mt-2 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-xl font-semibold text-sm transition-colors">
                                                        View Details
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-900/20 min-h-[300px]">
                                                    <div className="w-16 h-16 rounded-full bg-white dark:bg-dark-800 flex items-center justify-center mb-4 shadow-sm">
                                                        <Plus className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Property</h3>
                                                    <p className="text-sm text-gray-500 mb-4">Select another property to compare</p>
                                                    <button
                                                        onClick={onAdd}
                                                        className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm font-medium hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
                                                    >
                                                        Browse Listings
                                                    </button>
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row.label} className={idx % 2 === 0 ? 'bg-white dark:bg-dark-800' : 'bg-gray-50/50 dark:bg-dark-900/30'}>
                                    <td className="sticky left-0 z-10 w-48 p-4 border-r border-gray-100 dark:border-dark-700 font-semibold text-gray-600 dark:text-gray-400 bg-inherit backdrop-blur-[1px]">
                                        {row.label}
                                    </td>
                                    {[0, 1, 2].map((i) => {
                                        const property = properties[i];
                                        return (
                                            <td key={i} className="p-4 border-r border-gray-100 dark:border-dark-700 last:border-0 align-top text-gray-800 dark:text-gray-200">
                                                {property ? row.render(property) : (
                                                    <div className="h-full min-h-[2rem] flex items-center justify-center">
                                                        <span className="w-8 h-0.5 bg-gray-100 dark:bg-dark-700 rounded-full"></span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompareWidget;
