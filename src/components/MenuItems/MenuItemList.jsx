import React, { useState } from 'react';

const MenuItemList = ({ items, onEdit, onDelete, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(items.map(item => item.category))];

  // Format category labels
  const formatCategory = (category) => {
    const categoryMap = {
      'hot-coffee': 'Hot Coffee',
      'cold-coffee': 'Cold Coffee',
      'tea': 'Tea',
      'pastries': 'Pastries',
      'specials': 'Seasonal Specials'
    };
    return categoryMap[category] || category;
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false;

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'available' && item.is_available !== false) ||
                         (statusFilter === 'unavailable' && item.is_available === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort items by availability and popularity
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Available items first
    if (a.is_available !== b.is_available) {
      return a.is_available ? -1 : 1;
    }
    // Popular items next
    if (a.popular !== b.popular) {
      return a.popular ? -1 : 1;
    }
    // Then by name
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>☕</div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8B7E74'
            }}>
              🔍
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map(cat => (
              <option key={cat} value={cat}>
                {formatCategory(cat)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              minWidth: '140px'
            }}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        color: '#666',
        fontSize: '0.875rem'
      }}>
        <div>
          Showing {filteredItems.length} of {items.length} items
          {searchTerm && (
            <span style={{ marginLeft: '0.5rem' }}>
              • Search: "{searchTerm}"
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>Sort:</span>
          <span style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: 'rgba(111, 78, 55, 0.1)',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            color: '#6F4E37'
          }}>
            Available first
          </span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#F8F5F0',
          borderRadius: '12px',
          color: '#8B7E74'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#2A211C', marginBottom: '0.5rem' }}>No items found</h3>
          <p>Try adjusting your search or filter criteria</p>
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#6F4E37',
                border: '1px solid #6F4E37',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F5F0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74', width: '25%' }}>Item</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74', width: '15%' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74', width: '10%' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74', width: '10%' }}>Rating</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74', width: '15%' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74', width: '25%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map(item => (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid #E5E7EB',
                    opacity: item.is_available === false ? 0.7 : 1,
                    backgroundColor: item.is_available === false ? '#F8F5F0' : 'transparent'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {item.image && (
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236F4E37"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem'
                          }}>
                            <div style={{
                              fontWeight: '600',
                              color: item.is_available === false ? '#8B7E74' : '#2A211C'
                            }}>
                              {item.name}
                            </div>
                            {item.popular && (
                              <span style={{
                                padding: '0.125rem 0.375rem',
                                borderRadius: '4px',
                                fontSize: '0.625rem',
                                fontWeight: '700',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E'
                              }}>
                                POPULAR
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#8B7E74',
                            lineHeight: '1.4',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 'rgba(111, 78, 55, 0.1)',
                        color: '#6F4E37',
                        display: 'inline-block'
                      }}>
                        {formatCategory(item.category)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        fontWeight: '700',
                        color: '#6F4E37',
                        fontSize: '1.125rem'
                      }}>
                        ${parseFloat(item.price).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ color: '#F59E0B' }}>★</span>
                        <span style={{
                          fontWeight: '600',
                          color: '#2A211C',
                          fontSize: '0.875rem'
                        }}>
                          {item.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: item.is_available !== false
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          color: item.is_available !== false
                            ? '#10B981'
                            : '#EF4444',
                          width: 'fit-content'
                        }}>
                          {item.is_available !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => onEdit(item)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3B82F6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <span>✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <span>🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedItems.length > 10 && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'center',
              color: '#8B7E74',
              fontSize: '0.875rem'
            }}>
              Showing {Math.min(10, sortedItems.length)} of {sortedItems.length} items
              <button
                onClick={() => console.log('Load more')}
                style={{
                  marginLeft: '1rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'transparent',
                  color: '#6F4E37',
                  border: '1px solid #6F4E37',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuItemList;