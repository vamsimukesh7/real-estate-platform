import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Updated to use /auth/me endpoint
                const { data } = await api.get('/auth/me');
                setUser(data.data);
            } catch (error) {
                console.error('Auth verification failed', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            // Updated to use /auth/login endpoint
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data.data);
            return { success: true, data: data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            // Updated to use /auth/register endpoint
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('token', data.token);
            setUser(data.data);
            return { success: true, data: data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    // Role checking utilities
    const hasRole = (roles) => {
        if (!user) return false;
        if (typeof roles === 'string') roles = [roles];
        return roles.includes(user.role);
    };

    // Permission checking utilities
    const hasPermission = (permissions) => {
        if (!user) return false;
        if (user.role === 'Admin') return true; // Admin has all permissions
        if (!user.permissions) return false;

        if (typeof permissions === 'string') permissions = [permissions];
        return permissions.some(permission => user.permissions.includes(permission));
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    // Check if user is Admin
    const isAdmin = () => {
        return user?.role === 'Admin';
    };

    // Check if user is Agent
    const isAgent = () => {
        return user?.role === 'Agent';
    };

    // Check if user is basic User
    const isUser = () => {
        return user?.role === 'User';
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            hasRole,
            hasPermission,
            isAuthenticated,
            isAdmin,
            isAgent,
            isUser,
            refreshUser: checkUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
