import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Показываем загрузку при проверке аутентификации
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F8F5F0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: 'pulse 1.5s infinite'
          }}>
            ☕
          </div>
          <p style={{ color: '#666' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/" element={<Navigate to="/admin" />} />

          {/* Catch-all 404 route */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              backgroundColor: '#F8F5F0',
              flexDirection: 'column',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
              <h1 style={{ color: '#2A211C', marginBottom: '0.5rem' }}>Page Not Found</h1>
              <p style={{ color: '#8B7E74', marginBottom: '1.5rem' }}>
                The page you're looking for doesn't exist.
              </p>
              <a href="/admin" style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6F4E37',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600'
              }}>
                Go to Dashboard
              </a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;