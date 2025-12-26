import React, { useState, useEffect } from 'react';

const UserForm = ({ roles, statuses, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    status: 'active',
    phone: '',
    username: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || initialData.full_name || '',
        email: initialData.email || '',
        role: initialData.role || 'staff',
        status: initialData.status || 'active',
        phone: initialData.phone || '',
        username: initialData.username || initialData.email?.split('@')[0] || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (!formData.email.trim() || !formData.email.includes('@')) {
        throw new Error('Valid email is required');
      }

      const result = await onSubmit({
        ...formData,
        full_name: formData.name,
        username: formData.username || formData.email.split('@')[0]
      });

      if (result && result.success) {
        // Success - form will close
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

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Full Name *
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
            fontSize: '0.875rem',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '0.875rem',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {formData.role && (
            <div style={{ fontSize: '0.75rem', color: '#8B7E74', marginTop: '0.25rem' }}>
              {roles.find(r => r.value === formData.role)?.description}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {formData.status && (
            <div style={{ fontSize: '0.75rem', color: '#8B7E74', marginTop: '0.25rem' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: statuses.find(s => s.value === formData.status)?.color,
                marginRight: '4px'
              }} />
              {formData.status === 'active' ? 'User can log in' :
               formData.status === 'inactive' ? 'User cannot log in' :
               'Account suspended'}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '0.875rem',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
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
            opacity: loading ? 0.6 : 1,
            fontSize: '0.875rem'
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
            fontSize: '0.875rem',
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
              {initialData ? 'Update User' : 'Add User'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;