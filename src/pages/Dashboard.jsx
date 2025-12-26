import React, { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import { apiService } from '../services/apiService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    popularItems: 0,
    categories: 0,
    totalValue: 0,
    total_orders: 0,
    total_revenue: 0,
    today_orders: 0,
    today_revenue: 0,
    availableProducts: 0
  });
  const [users, setUsers] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    loadDashboardData();
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const status = await apiService.checkHealth();
      setServerStatus(status.ok ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Загружаем статистику
      const statsData = await menuService.getStats();
      setStats(statsData);

      // Загружаем продукты
      const products = await menuService.getAll();
      setRecentItems(products.slice(-5).reverse());

      // Загружаем заказы с сервера
      try {
        const ordersData = await apiService.getOrders({ limit: 5 });
        if (ordersData && ordersData.orders) {
          setRecentOrders(ordersData.orders.slice(0, 5));
        }
      } catch (error) {
        console.log('Using mock orders data');
        setRecentOrders(getMockOrders());
      }

      // Загружаем пользователей
      try {
        const usersData = await apiService.getUsers();
        setUsers(usersData.users || []);
      } catch (error) {
        console.log('Using local users data');
        setUsers(getMockUsers());
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSyncMessage('❌ Error loading data. Using local fallback.');
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = () => {
    return [
      { id: 1, order_number: '#001', customer_name: 'John Doe', total_amount: 12.50, status: 'completed', created_at: new Date().toISOString() },
      { id: 2, order_number: '#002', customer_name: 'Jane Smith', total_amount: 8.75, status: 'pending', created_at: new Date().toISOString() },
      { id: 3, order_number: '#003', customer_name: 'Bob Johnson', total_amount: 15.25, status: 'preparing', created_at: new Date().toISOString() }
    ];
  };

  const getMockUsers = () => {
    return [
      { id: 1, name: 'John Doe', email: 'john@brewandco.com', role: 'manager', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@brewandco.com', role: 'barista', status: 'active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@brewandco.com', role: 'staff', status: 'inactive' },
    ];
  };

  const syncWithServer = async () => {
    setSyncStatus('syncing');
    setSyncMessage('');

    try {
      const result = await menuService.syncWithServer();

      if (result.success) {
        await loadDashboardData();
        setSyncMessage(`✅ ${result.message}`);
        setSyncStatus('success');
      } else {
        setSyncMessage(`❌ ${result.error}`);
        setSyncStatus('error');
      }
    } catch (error) {
      setSyncMessage(`❌ Sync failed: ${error.message}`);
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncMessage('');
      setSyncStatus('');
    }, 5000);
  };

  const refreshData = () => {
    loadDashboardData();
    setSyncMessage('🔄 Data refreshed');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const exportForMainSite = () => {
    try {
      const exportedData = menuService.exportForMainSite();

      // В реальном приложении здесь был бы API вызов
      // Показываем только информацию
      setSyncMessage(`✅ Ready to export ${exportedData.length} items. Copy the data below:`);

      // Для демонстрации показываем в консоли
      console.log('Export data:', exportedData);

      setSyncStatus('success');
    } catch (error) {
      setSyncMessage(`❌ Export failed: ${error.message}`);
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncMessage('');
      setSyncStatus('');
    }, 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#10B981',
      'pending': '#F59E0B',
      'preparing': '#3B82F6',
      'cancelled': '#EF4444',
      'delivered': '#10B981'
    };
    return colors[status] || '#8B7E74';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
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
            Dashboard Overview
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
            <span>Server Status:</span>
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: serverStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: serverStatus === 'online' ? '#10B981' : '#EF4444'
            }}>
              {serverStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
            </span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={syncWithServer}
            disabled={syncStatus === 'syncing'}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: syncStatus === 'syncing' ? '#8B7E74' : '#6F4E37',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
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
                Sync Data
              </>
            )}
          </button>

          <button
            onClick={refreshData}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#F8F5F0',
              color: '#333333',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>↻</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          backgroundColor: syncMessage.includes('✅') ? 'rgba(16, 185, 129, 0.1)' :
                          syncMessage.includes('🔄') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${syncMessage.includes('✅') ? 'rgba(16, 185, 129, 0.2)' :
                    syncMessage.includes('🔄') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: syncMessage.includes('✅') ? '#10B981' :
                syncMessage.includes('🔄') ? '#3B82F6' : '#EF4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{syncMessage.includes('✅') ? '✅' : syncMessage.includes('🔄') ? '🔄' : '❌'}</span>
            <span>{syncMessage}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Revenue */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #10B981'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem', fontWeight: '500' }}>
                Total Revenue
              </h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>
                {formatCurrency(stats.total_revenue)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem' }}>
                +{formatCurrency(stats.today_revenue)} today
              </div>
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
            }}>
              💰
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3B82F6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem', fontWeight: '500' }}>
                Total Orders
              </h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>
                {stats.total_orders}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '0.25rem' }}>
                +{stats.today_orders} today
              </div>
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
            }}>
              📦
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #6F4E37'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem', fontWeight: '500' }}>
                Menu Items
              </h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>
                {stats.totalItems}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6F4E37', marginTop: '0.25rem' }}>
                {stats.availableProducts || 0} available
              </div>
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
            }}>
              ☕
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #F59E0B'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: '#8B7E74', marginBottom: '0.5rem', fontWeight: '500' }}>
                Categories
              </h3>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2A211C' }}>
                {stats.categories}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#F59E0B', marginTop: '0.25rem' }}>
                {stats.popularItems} popular items
              </div>
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
            }}>
              🏷️
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Menu Items */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Recent Orders */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          height: 'fit-content'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ color: '#2A211C', fontSize: '1.25rem', margin: 0 }}>
              Recent Orders
            </h2>
            <span style={{ fontSize: '0.875rem', color: '#8B7E74' }}>
              Last 5 orders
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#8B7E74' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
              <p>No recent orders</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Order</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#8B7E74', fontWeight: '600', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#2A211C' }}>{order.order_number || `#${order.id}`}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8B7E74' }}>
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{order.customer_name || 'N/A'}</td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{formatCurrency(order.total_amount)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status)
                        }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Menu Items */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          height: 'fit-content'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ color: '#2A211C', fontSize: '1.25rem', margin: 0 }}>
              Recent Menu Items
            </h2>
            <span style={{ fontSize: '0.875rem', color: '#8B7E74' }}>
              Last 5 added
            </span>
          </div>

          {recentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#8B7E74' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
              <p>No menu items yet</p>
            </div>
          ) : (
            <div>
              {recentItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #E5E7EB',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb'}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#2A211C', marginBottom: '0.25rem' }}>
                      {item.name}
                      {item.popular && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px'
                        }}>
                          Popular
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#8B7E74' }}>
                      {item.category} • ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: item.is_available !== false ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.is_available !== false ? '#10B981' : '#EF4444'
                    }}>
                      {item.is_available !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Data Management */}
        <div style={{
          background: '#F8F5F0',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ color: '#2A211C', margin: 0 }}>Data Management</h3>

          <button
            onClick={exportForMainSite}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#FFFFFF',
              color: '#6F4E37',
              border: '1px solid #6F4E37',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>📤</span>
            Export to Main Site
          </button>

          <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.5' }}>
            <p>Export your menu items to the main website's format for synchronization.</p>
          </div>
        </div>

        {/* Server Status */}
        <div style={{
          background: '#F0F9FF',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ color: '#2A211C', margin: 0 }}>Server Status</h3>

          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: serverStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${serverStatus === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: serverStatus === 'online' ? '#10B981' : '#EF4444'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#2A211C' }}>
                {serverStatus === 'online' ? 'Server Online' : 'Server Offline'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {serverStatus === 'online' ? 'Connected to backend API' : 'Using local data only'}
              </div>
            </div>
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
  );
};

export default Dashboard;