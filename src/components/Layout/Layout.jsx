import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{
        width: '250px',
        backgroundColor: '#2A211C',
        color: '#E8DFCA',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ color: '#D4AF37', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Brew & Co</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Admin Panel</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <NavLink to="/admin" style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: '#E8DFCA',
            textDecoration: 'none',
            backgroundColor: isActive ? '#6F4E37' : 'transparent',
            borderRight: isActive ? '4px solid #D4AF37' : 'none'
          })}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/menu" style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: '#E8DFCA',
            textDecoration: 'none',
            backgroundColor: isActive ? '#6F4E37' : 'transparent',
            borderRight: isActive ? '4px solid #D4AF37' : 'none'
          })}>
            Menu Items
          </NavLink>

          <NavLink to="/admin/users" style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: '#E8DFCA',
            textDecoration: 'none',
            backgroundColor: isActive ? '#6F4E37' : 'transparent',
            borderRight: isActive ? '4px solid #D4AF37' : 'none'
          })}>
            Users
          </NavLink>

          <NavLink to="/admin/settings" style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: '#E8DFCA',
            textDecoration: 'none',
            backgroundColor: isActive ? '#6F4E37' : 'transparent',
            borderRight: isActive ? '4px solid #D4AF37' : 'none'
          })}>
            Settings
          </NavLink>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button onClick={logout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;