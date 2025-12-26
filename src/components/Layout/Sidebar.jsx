import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout, admin } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/menu', icon: '☕', label: 'Menu Items' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  const getAdminRoleLabel = (role) => {
    const roles = {
      'admin': 'Administrator',
      'super_admin': 'Super Admin',
      'manager': 'Manager',
      'staff': 'Staff'
    };
    return roles[role] || role;
  };

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: '#2A211C',
      color: '#F8F5F0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6F4E37 0%, #8B6B4D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            B&C
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#FFFFFF'
            }}>
              Brew & Co
            </h2>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              Admin Panel
            </p>
          </div>
        </div>

        {/* Admin Info */}
        {admin && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {admin.username || admin.name}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.7rem'
              }}>
                {getAdminRoleLabel(admin.role)}
              </span>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto'
      }}>
        <div style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: '0.5rem',
          padding: '0 0.5rem'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
                          (item.path !== '/admin' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '0.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#2A211C' : 'rgba(255, 255, 255, 0.8)',
                backgroundColor: isActive ? '#F8F5F0' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? '600' : '500'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
              {isActive && (
                <span style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#6F4E37'
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          <span>🚪</span>
          Logout
        </button>

        <div style={{
          marginTop: '1rem',
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.4)',
          textAlign: 'center'
        }}>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;