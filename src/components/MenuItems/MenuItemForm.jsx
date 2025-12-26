import React, { useState, useEffect } from 'react';

const MenuItemForm = ({ categories, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'hot-coffee',
    price: '',
    description: '',
    popular: false,
    is_available: true,
    rating: 4.5,
    image: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'hot-coffee',
        price: initialData.price || '',
        description: initialData.description || '',
        popular: initialData.popular || false,
        is_available: initialData.is_available !== false,
        rating: initialData.rating || 4.5,
        image: initialData.image || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              type === 'number' ? parseFloat(value) || value :
              value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Валидация
      if (!formData.name.trim()) {
        throw new Error('Item name is required');
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Valid price is required');
      }

      const result = await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        rating: parseFloat(formData.rating) || 4.5
      });

      if (result && result.success) {
        // Успешно
        return;
      } else if (result && result.error) {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Item Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div>
          <label htmlFor="rating" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Rating (0-5)
          </label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="5"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="image" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Image URL
        </label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="popular"
            name="popular"
            checked={formData.popular}
            onChange={handleChange}
            disabled={loading}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="popular" style={{ fontWeight: '500' }}>
            Mark as Popular
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="is_available"
            name="is_available"
            checked={formData.is_available}
            onChange={handleChange}
            disabled={loading}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="is_available" style={{ fontWeight: '500' }}>
            Available for Order
          </label>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #E5E7EB'
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#F8F5F0',
            color: '#333333',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6F4E37',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span>
              Processing...
            </>
          ) : (
            <>
              {initialData ? 'Update Item' : 'Add Item'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;