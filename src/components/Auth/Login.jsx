import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Проверяем статус сервера при загрузке
  useEffect(() => {
    checkServerStatus();

    // Загружаем сохраненные данные
    const savedUsername = localStorage.getItem('remembered_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const checkServerStatus = async () => {
    try {
      const status = await apiService.checkHealth();
      setServerStatus(status.ok ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Сохраняем username если выбрано "Запомнить меня"
      if (rememberMe) {
        localStorage.setItem('remembered_username', username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      const result = await login(username, password);

      if (result.success) {
        // Перенаправляем на защищенную страницу
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername('admin');
    setPassword('admin123');

    // Автоматически отправляем форму через 100ms
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true });
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(event);
    }, 100);
  };

  const handleForgotPassword = () => {
    setError('Password reset feature is not implemented yet. Please contact your administrator.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #6F4E37 0%, #2A211C 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)'
      }} />

      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6F4E37 0%, #8B6B4D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            B&C
          </div>
          <h1 style={{ color: '#2A211C', fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            Brew & Co Admin
          </h1>
          <p style={{ color: '#8B7E74', marginBottom: '0.25rem' }}>
            Management Dashboard
          </p>

          {/* Server Status Indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: serverStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' :
                          serverStatus === 'checking' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: serverStatus === 'online' ? '#10B981' :
                  serverStatus === 'checking' ? '#F59E0B' : '#EF4444'
          }}>
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: serverStatus === 'online' ? '#10B981' :
                             serverStatus === 'checking' ? '#F59E0B' : '#EF4444',
              animation: serverStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
            }} />
            {serverStatus === 'online' ? 'Server Online' :
             serverStatus === 'checking' ? 'Checking...' : 'Server Offline'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.125rem' }}>⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: '0',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              color: '#4B5563'
            }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: loading ? '#F9FAFB' : 'white',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                fontSize: '1rem'
              }}>
                👤
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              color: '#4B5563'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: loading ? '#F9FAFB' : 'white',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                fontSize: '1rem'
              }}>
                🔒
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#4B5563'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#6F4E37',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'underline',
                padding: '0'
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || serverStatus === 'checking'}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: loading || serverStatus === 'checking' ? '#9CA3AF' : '#6F4E37',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: loading || serverStatus === 'checking' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!loading && serverStatus !== 'checking') {
                e.target.style.backgroundColor = '#5A3E2A';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && serverStatus !== 'checking') {
                e.target.style.backgroundColor = '#6F4E37';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</span>
                Signing in...
              </>
            ) : serverStatus === 'checking' ? (
              'Checking server...'
            ) : (
              'Sign In'
            )}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: '#F8F5F0',
              color: '#6F4E37',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#F1ECE5';
                e.target.style.borderColor = '#6F4E37';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#F8F5F0';
                e.target.style.borderColor = '#E5E7EB';
              }
            }}
          >
            <span>🚀</span>
            Use Demo Account
          </button>

          {/* Server Status Message */}
          {serverStatus === 'offline' && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#92400E',
              textAlign: 'center'
            }}>
              <p><strong>⚠️ Server is offline</strong></p>
              <p>You can still login to use cached data. Some features may be limited.</p>
            </div>
          )}

          {/* Demo Credentials */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(111, 78, 55, 0.05)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#8B7E74',
            border: '1px dashed rgba(111, 78, 55, 0.2)'
          }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Demo Credentials:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Username</div>
                <div style={{ fontFamily: 'monospace', fontWeight: '600' }}>admin</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Password</div>
                <div style={{ fontFamily: 'monospace', fontWeight: '600' }}>admin123</div>
              </div>
            </div>
          </div>
        </form>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9CA3AF'
        }}>
          <p>© {new Date().getFullYear()} Brew & Co Admin Panel v1.0.0</p>
          <p>For authorized personnel only.</p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          input:focus {
            outline: none;
            border-color: #6F4E37 !important;
            box-shadow: 0 0 0 3px rgba(111, 78, 55, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default Login;