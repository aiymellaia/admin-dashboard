// src/services/storageService.js
export const storageService = {
  // Menu Items
  getMenuItems: () => {
    const items = localStorage.getItem('admin_menu_items');
    return items ? JSON.parse(items) : [];
  },

  saveMenuItems: (items) => {
    localStorage.setItem('admin_menu_items', JSON.stringify(items));
  },

  // Users
  getUsers: () => {
    const users = localStorage.getItem('admin_users');
    if (users) return JSON.parse(users);

    // Default users if none exist
    const defaultUsers = [
      { id: 1, name: 'John Doe', email: 'john@brewandco.com', role: 'manager', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@brewandco.com', role: 'barista', status: 'active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@brewandco.com', role: 'staff', status: 'inactive' },
    ];
    storageService.saveUsers(defaultUsers);
    return defaultUsers;
  },

  saveUsers: (users) => {
    localStorage.setItem('admin_users', JSON.stringify(users));
  },

  // Orders (for statistics)
  getOrders: () => {
    const orders = localStorage.getItem('admin_orders');
    return orders ? JSON.parse(orders) : [];
  },

  saveOrders: (orders) => {
    localStorage.setItem('admin_orders', JSON.stringify(orders));
  },

  // Generate ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};