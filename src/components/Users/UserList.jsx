import React, { useState } from 'react';

const UserList = ({ users, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get unique roles and statuses
  const roles = ['all', ...new Set(users.map(user => user.role))];
  const statuses = ['all', ...new Set(users.map(user => user.status))];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#EF4444';
      case 'manager': return '#3B82F6';
      case 'barista': return '#10B981';
      default: return '#8B7E74';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'suspended': return '#EF4444';
      default: return '#8B7E74';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search users..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {role === 'all' ? 'All Roles' : role}
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
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#8B7E74' }}>
          <p>No users found</p>
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#8B7E74' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#2A211C' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '1rem', color: '#8B7E74' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `rgba(${getRoleColor(user.role).replace('#', '')}, 0.1)`,
                      color: getRoleColor(user.role)
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `rgba(${getStatusColor(user.status).replace('#', '')}, 0.1)`,
                      color: getStatusColor(user.status)
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => onEdit(user)}
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
                        onClick={() => onDelete(user.id)}
                        disabled={user.role === 'admin'}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: user.role === 'admin' ? '#F8F5F0' : 'rgba(239, 68, 68, 0.1)',
                          color: user.role === 'admin' ? '#8B7E74' : '#EF4444',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {user.role === 'admin' ? 'Protected' : 'Delete'}
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

export default UserList;