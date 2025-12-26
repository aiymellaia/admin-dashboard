import React, { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import { storageService } from '../services/storageService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    popularItems: 0,
    categories: 0,
    totalValue: 0
  });
  const [users, setUsers] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Menu stats
    const menuStats = menuService.getStats();
    setStats(menuStats);

    // Users
    const allUsers = storageService.getUsers();
    setUsers(allUsers);

    // Recent items
    const items = menuService.getAll();
    setRecentItems(items.slice(-3).reverse());
  };

  const generateMockData = () => {
    // Generate mock menu items
    const mockItems = [
      {
        id: storageService.generateId(),
        name: 'Flat White',
        category: 'hot-coffee',
        price: 3.50,
        description: 'Velvety milk, perfectly pulled shots.',
        popular: true,
        stock: 50,
        createdAt: new Date().toISOString()
      },
      {
        id: storageService.generateId(),
        name: 'Cold Brew',
        category: 'cold-coffee',
        price: 4.00,
        description: 'Slow-steeped for smooth clarity.',
        popular: true,
        stock: 30,
        createdAt: new Date().toISOString()
      },
      {
        id: storageService.generateId(),
        name: 'Almond Croissant',
        category: 'pastries',
        price: 2.75,
        description: 'Buttery, flaky, house-made almond filling.',
        popular: true,
        stock: 20,
        createdAt: new Date().toISOString()
      }
    ];

    storageService.saveMenuItems(mockItems);
    loadData();
    setSyncMessage('✅ Demo data generated! Data saved to localStorage.');
    setTimeout(() => setSyncMessage(''), 5000);
  };

  // Функция синхронизации с основным сайтом
  const syncToMainSite = () => {
    setSyncStatus('syncing');

    try {
      // Получаем данные из админ-панели
      const adminItems = JSON.parse(localStorage.getItem('admin_menu_items') || '[]');

      // Конвертируем в формат основного сайта
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

      // Сохраняем для основного сайта
      localStorage.setItem('brewAndCoCart', JSON.stringify(mainSiteFormat));

      setSyncMessage(`✅ Synced ${mainSiteFormat.length} items to main website!`);
      setSyncStatus('success');

    } catch (error) {
      setSyncMessage('❌ Error syncing: ' + error.message);
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncMessage('');
      setSyncStatus('');
    }, 5000);
  };

  const testLocalStorage = () => {
    const currentItems = menuService.getAll();
    const currentCount = currentItems.length;

    const testItem = {
      id: 'test-' + Date.now(),
      name: 'Test Item ' + (currentCount + 1),
      category: 'specials',
      price: 5.99,
      description: 'Test item to demonstrate localStorage persistence',
      popular: false,
      stock: 1,
      createdAt: new Date().toISOString()
    };

    currentItems.push(testItem);
    storageService.saveMenuItems(currentItems);
    loadData();

    setSyncMessage(`✅ Test item added! Total items: ${currentCount + 1}. Refresh page to test persistence.`);
    setTimeout(() => setSyncMessage(''), 5000);
  };

  const clearTestData = () => {
    if (window.confirm('Remove test items? This will keep regular items.')) {
      const currentItems = menuService.getAll();
      const filteredItems = currentItems.filter(item => !item.id.startsWith('test-'));
      storageService.saveMenuItems(filteredItems);
      loadData();
      setSyncMessage('✅ Test items removed!');
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  // Проверяем, есть ли данные в основном сайте
  const checkMainSiteData = () => {
    const mainSiteData = localStorage.getItem('brewAndCoCart');
    return mainSiteData ? JSON.parse(mainSiteData).length : 0;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#2A211C', fontSize: '1.875rem' }}>Dashboard Overview</h1>
        <button onClick={generateMockData} style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#F8F5F0',
          color: '#333333',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Generate Demo Data
        </button>
      </div>

      {/* Data Management Section */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>
          Data Management & Sync
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button onClick={testLocalStorage} style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span>🧪</span>
              Test LocalStorage
            </button>

            <button onClick={clearTestData} style={{
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
            }}>
              <span>🗑️</span>
              Clear Test Data
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button
              onClick={syncToMainSite}
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

            <div style={{
              fontSize: '0.75rem',
              color: '#8B7E74',
              textAlign: 'center'
            }}>
              Main site has: {checkMainSiteData()} items
            </div>
          </div>
        </div>

        {syncMessage && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            backgroundColor: syncMessage.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${syncMessage.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            color: syncMessage.includes('✅') ? '#10B981' : '#EF4444'
          }}>
            {syncMessage}
          </div>
        )}

        <div style={{
          backgroundColor: '#F8F5F0',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span>💾</span>
            <strong>Storage Status</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Menu Items:</span>
              <span style={{ fontWeight: '600' }}>{stats.totalItems}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Storage Key:</span>
              <span style={{ fontFamily: 'monospace' }}>admin_menu_items</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Users:</span>
              <span style={{ fontWeight: '600' }}>{users.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Updated:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
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

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem' }}>Total Menu Items</h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>{stats.totalItems}</div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              backgroundColor: 'rgba(111, 78, 55, 0.1)',
              color: '#6F4E37'
            }}>☕</div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem' }}>Popular Items</h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>{stats.popularItems}</div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B'
            }}>⭐</div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem' }}>Categories</h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>{stats.categories}</div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981'
            }}>🏷️</div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem' }}>Stock Value</h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>${stats.totalValue}</div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6'
            }}>💰</div>
          </div>
        </div>
      </div>

      {/* Recent Items and Users Tables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Menu Items</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#F8F5F0', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#F8F5F0', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#F8F5F0', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>{item.name}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>{item.category}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#2A211C', marginBottom: '1rem', fontSize: '1.25rem' }}>Users ({users.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#F8F5F0', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#F8F5F0', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#F8F5F0', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>{user.name}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>{user.role}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: user.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: user.status === 'active' ? '#10B981' : '#F59E0B'
                    }}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;