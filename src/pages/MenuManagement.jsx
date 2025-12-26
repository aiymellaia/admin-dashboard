import React, { useState, useEffect } from 'react';
import MenuItemList from '../components/MenuItems/MenuItemList';
import MenuItemForm from '../components/MenuItems/MenuItemForm';
import { menuService } from '../services/menuService';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadItems();
    loadStats();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await menuService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreate = async (itemData) => {
    try {
      const result = await menuService.create(itemData);

      if (result) {
        await loadItems();
        await loadStats();
        setShowForm(false);
        return { success: true, message: 'Item created successfully!' };
      }

      return { success: false, error: 'Failed to create item' };
    } catch (error) {
      console.error('Error creating item:', error);
      return {
        success: false,
        error: error.message || 'Failed to create item. Please try again.'
      };
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const result = await menuService.update(id, updates);

      if (result) {
        await loadItems();
        await loadStats();
        setEditingItem(null);
        return { success: true, message: 'Item updated successfully!' };
      }

      return { success: false, error: 'Failed to update item' };
    } catch (error) {
      console.error('Error updating item:', error);
      return {
        success: false,
        error: error.message || 'Failed to update item. Please try again.'
      };
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const result = await menuService.delete(id);

        if (result) {
          await loadItems();
          await loadStats();
          return { success: true, message: 'Item deleted successfully!' };
        }

        return { success: false, error: 'Failed to delete item' };
      } catch (error) {
        console.error('Error deleting item:', error);
        return {
          success: false,
          error: error.message || 'Failed to delete item. Please try again.'
        };
      }
    }
    return { success: false, error: 'Deletion cancelled' };
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const categories = [
    { value: 'hot-coffee', label: 'Hot Coffee' },
    { value: 'cold-coffee', label: 'Cold Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'pastries', label: 'Pastries' },
    { value: 'specials', label: 'Seasonal Specials' }
  ];

  const syncWithServer = async () => {
    try {
      setLoading(true);
      const result = await menuService.syncWithServer();

      if (result.success) {
        await loadItems();
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: 'Sync failed' };
    } finally {
      setLoading(false);
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
          <h1 style={{ color: '#2A211C', fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            Menu Management
          </h1>
          {stats && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span>Total: {stats.totalItems || items.length} items</span>
              <span>•</span>
              <span>{stats.categories || categories.length} categories</span>
              <span>•</span>
              <span>{stats.availableProducts || items.filter(i => i.is_available !== false).length} available</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => syncWithServer()}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4A5568',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🔄</span>
            Sync
          </button>

          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6F4E37',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>+</span>
            Add New Item
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ color: '#2A211C', margin: 0 }}>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <MenuItemForm
              categories={categories}
              initialData={editingItem}
              onSubmit={editingItem ?
                (data) => handleUpdate(editingItem.id, data) :
                handleCreate
              }
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>☕</div>
            <p>Loading menu items...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#F8F5F0',
          borderRadius: '12px',
          color: '#666'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#2A211C', marginBottom: '0.5rem' }}>No menu items found</h3>
          <p style={{ marginBottom: '1.5rem' }}>Add your first menu item to get started</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6F4E37',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Add First Item
          </button>
        </div>
      ) : (
        <MenuItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}
    </div>
  );
};

export default MenuManagement;