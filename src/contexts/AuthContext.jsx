// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // Predefined admin credentials
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    if (username === adminUsername && password === adminPassword) {
      const userData = {
        id: 1,
        username: adminUsername,
        role: 'admin',
        name: 'Administrator'
      };

      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_user');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};