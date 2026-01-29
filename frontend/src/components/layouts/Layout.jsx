import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = ({ children, title }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="min-h-screen bg-transparent flex transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div className={`flex-1 flex flex-col transition-[margin] duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-[240px]'} min-h-screen`}>
                <div className="p-6 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
