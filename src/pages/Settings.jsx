import React, { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import { apiService } from '../services/apiService';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Brew & Co',
    email: 'hello@brewandco.com',
    phone: '+1 (555) 123-4567',
    address: '12 Brew Street, Downtown',
    businessHours: '8:00 - 20:00',
    taxRate: 8.5,
    enableNotifications: true,
    autoSave: true
  });

  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncMessage, setSyncMessage] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    adminItems: 0,
    serverItems: 0,
    serverOrders: 0,
    serverUsers: 0
  });

  useEffect(() => {
    loadData();
    checkServerStatus();
  }, []);

  const loadData = async () => {
    try {
      // Load admin items count
      const adminItems = menuService.getAll();
      setStats(prev => ({ ...prev, adminItems: adminItems.length || 0 }));

      // Load server stats if available
      if (serverStatus === 'online') {
        try {
          const serverProducts = await menuService.getAll();
          const serverStats = await apiService.getStats();
          const serverUsers = await apiService.getUsers();

          setStats(prev => ({
            ...prev,
            serverItems: serverProducts.length,
            serverOrders: serverStats.overview?.total_orders || 0,
            serverUsers: serverUsers.length || 0
          }));
        } catch (error) {
          console.log('Could not load server stats:', error);
        }
      }

      // Load saved settings
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const status = await apiService.checkHealth();
      setServerStatus(status.ok ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  // Sync handlers
  const handleSyncToServer = async () => {
    setSyncStatus('syncing');
    setSyncMessage(null);

    try {
      const result = await menuService.syncWithServer();

      if (result.success) {
        await loadData();
        setSyncMessage({
          type: 'success',
          text: `✅ ${result.message}`
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: `❌ ${result.error}`
        });
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: `❌ Sync failed: ${error.message}`
      });
    } finally {
      setSyncStatus('idle');
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleImportFromServer = async () => {
    setSyncStatus('importing');
    setSyncMessage(null);

    try {
      const serverProducts = await menuService.getAll();

      setSyncMessage({
        type: 'success',
        text: `✅ Imported ${serverProducts.length} items from server`
      });

      // Refresh after 1 second
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: `❌ Import failed: ${error.message}`
      });
    } finally {
      setSyncStatus('idle');
    }
  };

  const handleExportJSON = async () => {
    try {
      const adminItems = await menuService.getAll();

      const exportData = {
        version: '1.0',
        export_date: new Date().toISOString(),
        items: adminItems,
        settings: settings,
        server_status: serverStatus
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brew-co-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      setSyncMessage({
        type: 'success',
        text: `✅ Backup exported: ${link.download} (${adminItems.length} items)`
      });

      setTimeout(() => setSyncMessage(null), 5000);
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: `❌ Export failed: ${error.message}`
      });
    }
  };

  // Database operations
  const handleBackupDatabase = async () => {
    setLoading(true);
    setSyncMessage(null);

    try {
      // Get all data
      const products = await menuService.getAll();
      const statsData = await apiService.getStats();
      const users = await apiService.getUsers();

      const backupData = {
        timestamp: new Date().toISOString(),
        products: products,
        stats: statsData,
        users: users,
        settings: settings
      };

      // Save to localStorage as backup
      localStorage.setItem('database_backup', JSON.stringify(backupData));

      setSyncMessage({
        type: 'success',
        text: `✅ Database backup created (${products.length} products, ${users.length || 0} users)`
      });
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: `❌ Backup failed: ${error.message}`
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleRestoreDatabase = () => {
    const backup = localStorage.getItem('database_backup');
    if (!backup) {
      setSyncMessage({
        type: 'error',
        text: '❌ No backup found'
      });
      return;
    }

    if (window.confirm('Restore from backup? This will replace current data.')) {
      try {
        const backupData = JSON.parse(backup);

        // In a real app, you would send this to the API
        // For now, just show the backup data
        console.log('Backup data:', backupData);

        setSyncMessage({
          type: 'success',
          text: `✅ Backup data loaded (${backupData.products?.length || 0} items)`
        });
      } catch (error) {
        setSyncMessage({
          type: 'error',
          text: `❌ Restore failed: ${error.message}`
        });
      }
    }
  };

  // Original handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    setSyncMessage({
      type: 'success',
      text: '✅ Settings saved successfully!'
    });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      storeName: 'Brew & Co',
      email: 'hello@brewandco.com',
      phone: '+1 (555) 123-4567',
      address: '12 Brew Street, Downtown',
      businessHours: '8:00 - 20:00',
      taxRate: 8.5,
      enableNotifications: true,
      autoSave: true
    };
    setSettings(defaultSettings);
    localStorage.setItem('admin_settings', JSON.stringify(defaultSettings));

    setSyncMessage({
      type: 'success',
      text: '✅ Settings reset to defaults'
    });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleClearLocalData = () => {
    if (window.confirm('Clear all local data? This will only affect localStorage.')) {
      localStorage.removeItem('admin_menu_items');
      localStorage.removeItem('admin_orders');
      localStorage.removeItem('menu_data_backup');

      // Keep settings and users
      const adminUser = JSON.parse(localStorage.getItem('admin_users') || '[]').find(user => user.role === 'admin');
      localStorage.setItem('admin_users', JSON.stringify(adminUser ? [adminUser] : []));

      setSyncMessage({
        type: 'success',
        text: '✅ Local data cleared. Please refresh the page.'
      });

      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const status = await apiService.checkHealth();

      if (status.ok) {
        setSyncMessage({
          type: 'success',
          text: `✅ Connection successful! Server is online. ${status.service || ''}`
        });
        setServerStatus('online');
      } else {
        setSyncMessage({
          type: 'error',
          text: `❌ Server responded but with error: ${status.message}`
        });
        setServerStatus('offline');
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: '❌ Connection failed. Server is offline or unreachable.'
      });
      setServerStatus('offline');
    } finally {
      setLoading(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ color: '#2A211C', fontSize: '1.875rem', marginBottom: '0.25rem' }}>
            Settings & Configuration
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
            <span>Server Status:</span>
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: serverStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' :
                            serverStatus === 'checking' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: serverStatus === 'online' ? '#10B981' :
                    serverStatus === 'checking' ? '#F59E0B' : '#EF4444'
            }}>
              {serverStatus === 'online' ? '🟢 Online' :
               serverStatus === 'checking' ? '🟡 Checking...' : '🔴 Offline'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleTestConnection}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {syncMessage && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          backgroundColor: syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: syncMessage.type === 'success' ? '#10B981' : '#EF4444'
        }}>
          {syncMessage.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Database Sync Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Database Operations</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '0.875rem' }}>Current Status</h3>
            <div style={{
              backgroundColor: '#F8F5F0',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>Local Items:</span>
                <span style={{ fontWeight: '600' }}>{stats.adminItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>Server Items:</span>
                <span style={{ fontWeight: '600' }}>{stats.serverItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>Server Orders:</span>
                <span style={{ fontWeight: '600' }}>{stats.serverOrders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B7E74' }}>Server Users:</span>
                <span style={{ fontWeight: '600' }}>{stats.serverUsers}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '0.875rem' }}>Sync Actions</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleSyncToServer}
                disabled={syncStatus === 'syncing' || serverStatus === 'offline'}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: syncStatus === 'syncing' ? '#8B7E74' :
                                 serverStatus === 'offline' ? '#CBD5E1' : '#6F4E37',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: syncStatus === 'syncing' || serverStatus === 'offline' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</span>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Sync to Server
                  </>
                )}
              </button>

              <button
                onClick={handleImportFromServer}
                disabled={syncStatus === 'importing' || serverStatus === 'offline'}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: syncStatus === 'importing' ? '#8B7E74' :
                                 serverStatus === 'offline' ? '#CBD5E1' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: syncStatus === 'importing' || serverStatus === 'offline' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {syncStatus === 'importing' ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</span>
                    Importing...
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    Import from Server
                  </>
                )}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={handleBackupDatabase}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: loading ? '#8B7E74' : '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>💾</span>
                  Backup
                </button>

                <button
                  onClick={handleRestoreDatabase}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>🔄</span>
                  Restore
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#8B7E74' }}>
            <p><strong>Note:</strong> Sync operations require the server to be online.</p>
            {serverStatus === 'offline' && (
              <p style={{ color: '#EF4444' }}>⚠️ Server is offline. Some functions are disabled.</p>
            )}
          </div>

          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>

        {/* Business Information Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Business Settings</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Store Name
            </label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Contact Email
            </label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Business Address
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows="2"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Business Hours
            </label>
            <input
              type="text"
              name="businessHours"
              value={settings.businessHours}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Tax Rate (%)
            </label>
            <input
              type="number"
              name="taxRate"
              value={settings.taxRate}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="100"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="enableNotifications"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="enableNotifications" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Enable Notifications
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="autoSave"
              name="autoSave"
              checked={settings.autoSave}
              onChange={handleChange}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="autoSave" style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              Auto-save Changes
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSave} style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6F4E37',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Save Settings
            </button>
            <button onClick={handleReset} style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#F8F5F0',
              color: '#333333',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginTop: '1.5rem'
      }}>
        <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Data Management</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Export Section */}
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '1rem' }}>Export Data</h3>
            <p style={{ marginBottom: '1rem', color: '#8B7E74', fontSize: '0.875rem' }}>
              Export all data as a JSON file for backup or transfer.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleExportJSON}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <span>📤</span>
                Export JSON Backup
              </button>

              <div style={{ fontSize: '0.75rem', color: '#8B7E74' }}>
                <p>Includes: Menu items, settings, and system status</p>
              </div>
            </div>
          </div>

          {/* Local Data Management */}
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '1rem' }}>Local Storage</h3>
            <p style={{ marginBottom: '1rem', color: '#8B7E74', fontSize: '0.875rem' }}>
              Manage data stored in your browser's localStorage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleClearLocalData}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <span>🗑️</span>
                Clear Local Data
              </button>

              <div style={{ fontSize: '0.75rem', color: '#8B7E74' }}>
                <p>Warning: This will delete all local menu items and orders.</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '1rem' }}>System Information</h3>

            <div style={{
              backgroundColor: '#F8F5F0',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>Version:</span>
                <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>1.0.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>API Status:</span>
                <span style={{
                  fontWeight: '600',
                  color: serverStatus === 'online' ? '#10B981' : '#EF4444'
                }}>
                  {serverStatus === 'online' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>Local Items:</span>
                <span style={{ fontWeight: '600' }}>{stats.adminItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B7E74' }}>Last Backup:</span>
                <span style={{ fontSize: '0.75rem' }}>
                  {localStorage.getItem('database_backup') ? 'Available' : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;