import TopBar from '../components/layouts/TopBar';
import Sidebar from '../components/layouts/Sidebar';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Moon, Save, X, Eye, EyeOff, Sun, Loader2 } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
    const { user, refreshUser } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // UI States
    const [editingProfile, setEditingProfile] = useState(false);
    const [changingSecurity, setChangingSecurity] = useState(false);
    const [customizingAppearance, setCustomizingAppearance] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    // Initialize appearance from localStorage
    const { appearance, setAppearance } = useTheme();

    // UseTheme handles the dark class application globally now

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleProfileSave = async () => {
        setLoading(true);
        try {
            await api.put('/auth/profile', profileData);
            await refreshUser();
            setEditingProfile(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error('Failed to update profile', error);
            alert(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySave = async () => {
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/update-password', {
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            setChangingSecurity(false);
            setPasswordData({ current: '', new: '', confirm: '' });
            alert("Password updated successfully!");
        } catch (error) {
            console.error('Failed to update password', error);
            alert(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-soft border border-gray-100 dark:border-dark-700 transition-colors duration-300">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>

                        <div className="space-y-6">
                            {/* Profile Information Section */}
                            <div className="rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600 overflow-hidden transition-all duration-300">
                                <div className="flex items-start gap-4 p-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Profile Information</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {editingProfile ? "Update your details below." : (
                                                <>
                                                    <span className="block font-medium text-gray-900 dark:text-gray-200">{profileData.name}</span>
                                                    <span className="block text-gray-500 dark:text-gray-400">{profileData.email}</span>
                                                </>
                                            )}
                                        </p>

                                        {editingProfile && (
                                            <div className="mt-4 grid gap-4 max-w-md animate-in fade-in slide-in-from-top-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                                    <textarea
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        rows="3"
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none resize-none"
                                                        placeholder="Brief bio..."
                                                    />
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={handleProfileSave}
                                                        disabled={loading}
                                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingProfile(false)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors text-sm font-medium"
                                                    >
                                                        <X size={16} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!editingProfile && (
                                        <button
                                            onClick={() => setEditingProfile(true)}
                                            className="ml-auto btn btn-sm btn-outline-primary"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600 overflow-hidden transition-all duration-300">
                                <div className="flex items-start gap-4 p-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                        <Lock size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Change your password and enable two-factor authentication.
                                        </p>

                                        {changingSecurity && (
                                            <div className="mt-4 grid gap-4 max-w-md animate-in fade-in slide-in-from-top-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.current}
                                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.confirm}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={handleSecuritySave}
                                                        disabled={loading}
                                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        Update Password
                                                    </button>
                                                    <button
                                                        onClick={() => setChangingSecurity(false)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors text-sm font-medium"
                                                    >
                                                        <X size={16} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!changingSecurity && (
                                        <button
                                            onClick={() => setChangingSecurity(true)}
                                            className="ml-auto btn btn-sm btn-outline-primary"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Appearance Section */}
                            <div className="rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600 overflow-hidden transition-all duration-300">
                                <div className="flex items-start gap-4 p-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                                        <Moon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Customize the look and feel of the dashboard.
                                        </p>

                                        {customizingAppearance && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => setAppearance('light')}
                                                        className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${appearance === 'light' ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 bg-white dark:bg-dark-700 dark:text-gray-200'}`}
                                                    >
                                                        <Sun size={24} />
                                                        <span className="font-medium">Light Mode</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setAppearance('dark')}
                                                        className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${appearance === 'dark' ? 'border-primary-500 bg-gray-800 text-white' : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 bg-white dark:bg-dark-700 dark:text-gray-200'}`}
                                                    >
                                                        <Moon size={24} />
                                                        <span className="font-medium">Dark Mode</span>
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 mt-4 justify-end">
                                                    <button
                                                        onClick={() => setCustomizingAppearance(false)}
                                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!customizingAppearance && (
                                        <button
                                            onClick={() => setCustomizingAppearance(true)}
                                            className="ml-auto btn btn-sm btn-outline-primary"
                                        >
                                            Customize
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
