import TopBar from '../components/layouts/TopBar';
import Sidebar from '../components/layouts/Sidebar';
import { useState, useEffect } from 'react';
import { Bell, Heart, Home, Star, Info, MessageSquare, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Notifications = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/users/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/users/notifications/read');
            // Optimistically update UI
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'Message': return MessageSquare;
            case 'NewListing': return Home;
            case 'PriceAlert': return Tag;
            case 'Booking': return Star; // or Calendar
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'Message': return "bg-blue-100 text-blue-600";
            case 'NewListing': return "bg-green-100 text-green-600";
            case 'PriceAlert': return "bg-yellow-100 text-yellow-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now - date) / 1000; // seconds

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    };

    return (
        <div className="min-h-[133.34vh] bg-gray-50 dark:bg-dark-900 flex transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden transition-colors duration-300 min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center">
                                <Bell className="w-16 h-16 text-gray-200 dark:text-dark-600 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Notifications</h3>
                                <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((notification, index) => {
                                const Icon = getIcon(notification.notificationType);
                                return (
                                    <motion.div
                                        key={notification._id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-6 border-b border-gray-100 dark:border-dark-700 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getColor(notification.notificationType)} dark:bg-opacity-20`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className={`font-semibold ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{notification.message}</p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
