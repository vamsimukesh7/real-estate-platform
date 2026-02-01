import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initialize appearance from localStorage
    const [appearance, setAppearance] = useState(() => {
        try {
            return localStorage.getItem('theme') || 'light';
        } catch {
            return 'light';
        }
    });

    // Apply dark mode class
    useEffect(() => {
        const root = window.document.documentElement;
        if (appearance === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        } 
        localStorage.setItem('theme', appearance);
    }, [appearance]);

    return (
        <ThemeContext.Provider value={{ appearance, setAppearance }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
