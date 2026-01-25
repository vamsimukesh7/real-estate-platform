import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = ({ children, title }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="min-h-[133.34vh] bg-gray-50 dark:bg-dark-900 flex transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
                {/* Generic TopBar or make it optional? Let's assume pages might want to control TopBar. 
                    But typically Layout enforces Header. 
                    However, TopBar requires props like 'setFilters'. 
                    If Layout is generic, it might be hard to pass specific props. 
                    For now, let's render children directly in the main area. */}
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
