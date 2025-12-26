import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverStatus, setServerStatus] = useState('checking');

    useEffect(() => {
        checkAuth();
        checkServerStatus();
    }, []);

    const checkServerStatus = async () => {
        try {
            const status = await apiService.checkHealth();
            setServerStatus(status.ok ? 'online' : 'offline');
            return status.ok;
        } catch (error) {
            setServerStatus('offline');
            return false;
        }
    };

    const checkAuth = async () => {
        try {
            const session = storageService.getSession();
            const token = localStorage.getItem('admin_token');

            if (session && token) {
                // Проверяем статус аутентификации
                const authStatus = await apiService.checkAuthStatus();

                if (authStatus.authenticated) {
                    setAdmin(session);
                    setIsAuthenticated(true);
                } else {
                    // Токен невалидный, очищаем
                    logout();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            console.log('🔐 Attempting login with:', { username });

            const result = await apiService.adminLogin(username, password);

            if (result.success && result.token && result.admin) {
                // Сохраняем токен
                apiService.setToken(result.token);

                // Сохраняем данные администратора
                const adminData = {
                    id: result.admin.id,
                    username: result.admin.username,
                    email: result.admin.email,
                    role: result.admin.role,
                    name: result.admin.name || result.admin.username
                };

                storageService.saveSession(adminData);

                setAdmin(adminData);
                setIsAuthenticated(true);
                setServerStatus('online');

                return { success: true, admin: adminData };
            } else {
                return {
                    success: false,
                    error: result.error || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Connection error'
            };
        }
    };

    const logout = () => {
        apiService.clearToken();
        storageService.clearSession();
        setIsAuthenticated(false);
        setAdmin(null);
    };

    const value = {
        isAuthenticated,
        admin,
        loading,
        serverStatus,
        login,
        logout,
        checkServerStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};