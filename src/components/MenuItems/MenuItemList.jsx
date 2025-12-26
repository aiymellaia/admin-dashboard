import React, { useState } from 'react';

const MenuItemList = ({ items, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(items.map(item => item.category))];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#8B7E74' }}>
          <p>No menu items found</p>
          <p>Try a different search or filter</p>
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F5F0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Category</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Price</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Popular</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: '#2A211C' }}>{item.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#8B7E74', marginTop: '0.25rem' }}>
                      {item.description}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: 'rgba(111, 78, 55, 0.1)',
                      color: '#6F4E37'
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#6F4E37' }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: item.stock > 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: item.stock > 10 ? '#10B981' : '#F59E0B'
                    }}>
                      {item.stock || 0} in stock
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.popular ? (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        color: '#F59E0B'
                      }}>
                        Popular
                      </span>
                    ) : (
                      <span style={{ color: '#8B7E74', fontSize: '0.875rem' }}>No</span>
                    )}
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
                          fontWeight: '600'
                        }}
                      >
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
                          fontWeight: '600'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MenuItemList;