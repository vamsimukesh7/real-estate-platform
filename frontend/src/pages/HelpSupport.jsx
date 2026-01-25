import TopBar from '../components/layouts/TopBar';
import Sidebar from '../components/layouts/Sidebar';
import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';

const HelpSupport = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Help & Support</h1>
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-soft border border-gray-100 dark:border-dark-700 min-h-[400px] flex flex-col items-center justify-center text-center transition-colors duration-300">
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-full mb-6">
                            <span className="text-4xl">📞</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                            If you have any issues or questions, our support team is here to help you 24/7.
                        </p>

                        <div className="space-y-4 w-full max-w-md">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600 hover:border-primary-100 dark:hover:border-primary-500/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <Mail size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Support</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">support@realestate.com</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-700/50 border border-gray-100 dark:border-dark-600 hover:border-primary-100 dark:hover:border-primary-500/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <Phone size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone Support</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">+1 234 567 890</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
