// src/pages/Settings.jsx
import React, { useState } from 'react';

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

  // Sync states
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'importing'
  const [syncMessage, setSyncMessage] = useState(null);

  // Sync handlers
  const handleSyncToMainSite = async () => {
    setSyncStatus('syncing');
    setSyncMessage(null);

    try {
      // Get current admin menu items
      const adminItems = JSON.parse(localStorage.getItem('admin_menu_items') || '[]');

      // Convert to main site format
      const mainSiteFormat = adminItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image || 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb',
        popular: item.popular || false,
        rating: 4.5
      }));

      // Save to main site storage
      localStorage.setItem('brewAndCoCart', JSON.stringify(mainSiteFormat));

      // Create backup
      localStorage.setItem('menu_data_backup', JSON.stringify(mainSiteFormat));

      setSyncMessage({
        type: 'success',
        text: `Successfully synchronized ${mainSiteFormat.length} items to main website.`
      });
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: 'Failed to sync: ' + error.message
      });
    } finally {
      setSyncStatus('idle');
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleImportFromMainSite = async () => {
    setSyncStatus('importing');
    setSyncMessage(null);

    try {
      // Get main site data
      const mainSiteItems = JSON.parse(localStorage.getItem('brewAndCoCart') || '[]');

      // Convert to admin format
      const adminFormat = mainSiteItems.map(item => ({
        ...item,
        stock: 50, // Default stock
        createdAt: new Date().toISOString()
      }));

      // Save to admin storage
      localStorage.setItem('admin_menu_items', JSON.stringify(adminFormat));

      setSyncMessage({
        type: 'success',
        text: `Successfully imported ${adminFormat.length} items from main website.`
      });

      // Refresh page after 2 seconds to show updated data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: 'Failed to import: ' + error.message
      });
    } finally {
      setSyncStatus('idle');
    }
  };

  const handleExportJSON = async () => {
    try {
      // Get current admin menu items
      const adminItems = JSON.parse(localStorage.getItem('admin_menu_items') || '[]');

      // Convert to main site format
      const mainSiteFormat = adminItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image || 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb',
        popular: item.popular || false,
        rating: 4.5
      }));

      // Create downloadable file
      const dataStr = JSON.stringify(mainSiteFormat, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brew-co-menu-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);

      setSyncMessage({
        type: 'success',
        text: `File downloaded: ${link.download} (${mainSiteFormat.length} items)`
      });
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: 'Failed to export: ' + error.message
      });
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
    alert('Settings saved successfully!');
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
  };

  const handleExportData = () => {
    const data = {
      menuItems: JSON.parse(localStorage.getItem('admin_menu_items') || '[]'),
      users: JSON.parse(localStorage.getItem('admin_users') || '[]'),
      settings: JSON.parse(localStorage.getItem('admin_settings') || '{}')
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brew-co-data-export.json';
    link.click();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all menu items and users (except admin).')) {
      localStorage.removeItem('admin_menu_items');
      localStorage.removeItem('admin_orders');
      // Keep admin user
      const adminUser = JSON.parse(localStorage.getItem('admin_users') || '[]').find(user => user.role === 'admin');
      localStorage.setItem('admin_users', JSON.stringify(adminUser ? [adminUser] : []));
      alert('Data cleared successfully! Refresh the page.');
    }
  };

  // Get counts for display
  const adminItemCount = JSON.parse(localStorage.getItem('admin_menu_items') || '[]').length;
  const mainSiteCount = JSON.parse(localStorage.getItem('brewAndCoCart') || '[]').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#2A211C', fontSize: '1.875rem' }}>Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Sync with Main Website Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Sync with Main Website</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '0.875rem' }}>Current Status</h3>
            <div style={{
              backgroundColor: '#F8F5F0',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8B7E74' }}>Admin Panel Items:</span>
                <span style={{ fontWeight: '600' }}>{adminItemCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B7E74' }}>Main Website Items:</span>
                <span style={{ fontWeight: '600' }}>{mainSiteCount}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74', fontSize: '0.875rem' }}>Sync Actions</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleSyncToMainSite}
                disabled={syncStatus === 'syncing'}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: syncStatus === 'syncing' ? '#8B7E74' : '#6F4E37',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
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
                    Sync to Main Website
                  </>
                )}
              </button>

              <button
                onClick={handleImportFromMainSite}
                disabled={syncStatus === 'importing'}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: syncStatus === 'importing' ? '#8B7E74' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: syncStatus === 'importing' ? 'not-allowed' : 'pointer',
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
                    Import from Main Website
                  </>
                )}
              </button>

              <button
                onClick={handleExportJSON}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#3B82F6',
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
                <span>💾</span>
                Export as JSON File
              </button>
            </div>
          </div>

          {syncMessage && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              backgroundColor: syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              color: syncMessage.type === 'success' ? '#10B981' : '#EF4444'
            }}>
              {syncMessage.text}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#8B7E74' }}>
            <p><strong>Note:</strong> This will sync menu data with the main Brew & Co website.</p>
            <p>Data is transferred via localStorage - both sites must use the same browser.</p>
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
          <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Business Information</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Store Name</label>
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
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contact Email</label>
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
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number</label>
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
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Address</label>
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
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Business Hours</label>
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
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tax Rate (%)</label>
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
                fontSize: '1rem'
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
            />
            <label htmlFor="enableNotifications" style={{ fontWeight: '500' }}>Enable Notifications</label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="autoSave"
              name="autoSave"
              checked={settings.autoSave}
              onChange={handleChange}
            />
            <label htmlFor="autoSave" style={{ fontWeight: '500' }}>Auto-save Changes</label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSave} style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6F4E37',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Save Settings
            </button>
            <button onClick={handleReset} style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#F8F5F0',
              color: '#333333',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Reset to Defaults
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

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74' }}>Export Data</h3>
          <p style={{ marginBottom: '1rem', color: '#8B7E74', fontSize: '0.875rem' }}>
            Export all menu items and user data as a JSON file.
          </p>
          <button onClick={handleExportData} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Export All Data
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74' }}>Clear Data</h3>
          <p style={{ marginBottom: '1rem', color: '#8B7E74', fontSize: '0.875rem' }}>
            Warning: This will delete all menu items and non-admin users.
          </p>
          <button onClick={handleClearData} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Clear All Data
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem', color: '#8B7E74' }}>System Information</h3>
          <div style={{
            backgroundColor: '#F8F5F0',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#8B7E74' }}>Version:</span>
              <span style={{ fontWeight: '600' }}>1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#8B7E74' }}>Last Updated:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#8B7E74' }}>Admin Menu Items:</span>
              <span>{adminItemCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8B7E74' }}>Main Website Items:</span>
              <span>{mainSiteCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;