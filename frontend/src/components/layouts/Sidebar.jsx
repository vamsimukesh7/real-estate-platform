import { useState, useEffect } from 'react';
import {
    Home,
    Compass,
    MessageSquare,
    Wallet,
    BarChart3,
    Bell,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
    User,
    Heart,
    Key
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Fetch unread counts
    const fetchUnreadCounts = async () => {
        if (!user) return;
        try {
            // Get unread messages
            const msgRes = await api.get('/messages/unread-count');
            setUnreadMessages(msgRes?.data?.count || 0);

            // Get notifications and filter unread
            const notifRes = await api.get('/users/notifications');
            const notifications = Array.isArray(notifRes?.data?.data) ? notifRes.data.data : [];
            const unreadNotifs = notifications.filter(n => !n.read).length;
            setUnreadNotifications(unreadNotifs);
        } catch (error) {
            console.error('Failed to fetch unread counts', error);
            // Don't crash sidebar, just log
        }
    };

    // Update актив item when location changes
    useEffect(() => {
        setActiveItem(getActiveItem());
        fetchUnreadCounts();
    }, [location.pathname, user]);

    // Set up polling for new messages every 30 seconds
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(fetchUnreadCounts, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const getActiveItem = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path === '/discover') return 'Discover';
        if (path === '/wishlist') return 'Wishlist';
        if (path === '/my-properties') return 'My Properties';
        if (path === '/inbox') return 'Inbox';
        if (path === '/wallet') return 'My Wallet';
        if (path === '/analytics') return 'Analytics';
        if (path === '/notifications') return 'Notifications';
        if (path === '/settings') return 'Settings';
        if (path === '/help') return 'Help & Support';
        return 'Dashboard';
    };

    const [activeItem, setActiveItem] = useState(getActiveItem());

    const menuItems = [
        { icon: Home, label: 'Dashboard', badge: null, path: '/' },
        { icon: Compass, label: 'Discover', badge: null, path: '/discover' },
        { icon: Heart, label: 'Wishlist', badge: null, path: '/wishlist' },
        ...(user?.role === 'Buyer' ? [{ icon: Key, label: 'My Properties', badge: null, path: '/my-properties' }] : []),
        { icon: MessageSquare, label: 'Inbox', badge: unreadMessages > 0 ? unreadMessages : null, path: '/inbox' },
        { icon: Wallet, label: 'My Wallet', badge: null, path: '/wallet' },
        ...(user?.role === 'Admin' ? [{ icon: BarChart3, label: 'Analytics', badge: null, path: '/analytics' }] : []),
        { icon: Bell, label: 'Notifications', badge: unreadNotifications > 0 ? unreadNotifications : null, path: '/notifications' },
        { icon: Settings, label: 'Settings', badge: null, path: '/settings' },
        { icon: HelpCircle, label: 'Help & Support', badge: null, path: '/help' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path, label) => {
        setActiveItem(label);
        navigate(path);
    }

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0, width: collapsed ? 64 : 240 }}
            transition={{ duration: 0.3, ease: 'linear' }}
            style={{ willChange: 'width, transform' }}
            className="fixed left-0 top-0 h-screen bg-dark-900 border-r border-white/5 text-white shadow-2xl z-[110] transition-all duration-300"
        >
            {/* Toggle Button - Adjusted position and z-index */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-4 top-10 bg-primary-600 text-white rounded-full p-2 shadow-xl hover:bg-primary-500 hover:scale-110 active:scale-95 transition-all duration-200 z-[120] border-2 border-dark-900"
            >
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            </button>

            <div className="h-full flex flex-col p-4 custom-scrollbar overflow-y-auto overflow-x-hidden">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10 mt-6"
                >
                    {user ? (
                        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group`}>
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-primary-400/50 transition-all">
                                    <span className="text-xl font-black text-white">{user.name?.charAt(0) || 'U'}</span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900 shadow-sm"></div>
                            </div>
                            {!collapsed && (
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <h3 className="font-bold text-sm text-white truncate">{user.name || 'User'}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{user.role || 'Member'}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => navigate('/login')}
                            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-2xl bg-primary-600/10 border border-primary-500/20 text-primary-400 hover:bg-primary-600/20 transition-all duration-300 cursor-pointer group`}
                        >
                            <div className="w-11 h-11 rounded-full bg-primary-900/50 flex items-center justify-center ring-2 ring-primary-500/30 group-hover:ring-primary-500 transition-all">
                                <User className="w-6 h-6" />
                            </div>
                            {!collapsed && (
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-sm">Sign In</h3>
                                    <p className="text-[10px] uppercase font-bold text-primary-300/60 tracking-tighter">Join the community</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.label;

                        return (
                            <motion.button
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleNavigation(item.path, item.label)}
                                className={`sidebar-item w-full text-left group gap-3 px-3 py-2.5 ${isActive ? 'active' : ''}`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
                                {!collapsed && (
                                    <>
                                        <span className={`flex-1 truncate ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
                                            {item.label}
                                        </span>
                                        {item.badge && (
                                            <span className="ml-auto bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Logout */}
                {user && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={handleLogout}
                        className="sidebar-item w-full text-left mt-auto border-t border-white/10 pt-4"
                    >
                        <LogOut className="w-5 h-5 text-red-400" />
                        {!collapsed && <span className="flex-1 text-gray-300">Logout</span>}
                    </motion.button>
                )}

                {/* Brand */}
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 pt-4 border-t border-white/10"
                    >
                        <p className="text-xs text-gray-500 text-center">RealEstate Pro v1.0</p>
                    </motion.div>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;
