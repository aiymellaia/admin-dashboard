// src/services/storageService.js

class StorageService {
  constructor() {
    // Keys for localStorage
    this.keys = {
      MENU_ITEMS: 'admin_menu_items',
      USERS: 'admin_users',
      ORDERS: 'admin_orders',
      SETTINGS: 'admin_settings',
      BACKUP: 'database_backup',
      SYNC_LOG: 'sync_log',
      SESSION: 'admin_session'
    };

    // Default data structures
    this.defaults = {
      menuItems: [],
      users: this.getDefaultUsers(),
      orders: [],
      settings: this.getDefaultSettings()
    };
  }

  // ============ MENU ITEMS ============
  getMenuItems() {
    try {
      const items = localStorage.getItem(this.keys.MENU_ITEMS);
      return items ? JSON.parse(items) : this.defaults.menuItems;
    } catch (error) {
      console.error('Error reading menu items:', error);
      return this.defaults.menuItems;
    }
  }

  saveMenuItems(items) {
    try {
      localStorage.setItem(this.keys.MENU_ITEMS, JSON.stringify(items));
      this.logSync('menu_items', 'saved', items.length);
      return true;
    } catch (error) {
      console.error('Error saving menu items:', error);
      return false;
    }
  }

  // ============ USERS ============
  getUsers() {
    try {
      const users = localStorage.getItem(this.keys.USERS);
      if (users) return JSON.parse(users);

      // Create default users if none exist
      const defaultUsers = this.getDefaultUsers();
      this.saveUsers(defaultUsers);
      return defaultUsers;
    } catch (error) {
      console.error('Error reading users:', error);
      return this.getDefaultUsers();
    }
  }

  getDefaultUsers() {
    return [
      {
        id: 1,
        name: 'Admin User',
        username: 'admin',
        email: 'admin@brewandco.com',
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
        phone: '+1 (555) 123-4567',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Manager',
        username: 'manager',
        email: 'manager@brewandco.com',
        full_name: 'Store Manager',
        role: 'manager',
        status: 'active',
        phone: '+1 (555) 234-5678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Lead Barista',
        username: 'barista',
        email: 'barista@brewandco.com',
        full_name: 'Lead Barista',
        role: 'barista',
        status: 'active',
        phone: '+1 (555) 345-6789',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  saveUsers(users) {
    try {
      localStorage.setItem(this.keys.USERS, JSON.stringify(users));
      this.logSync('users', 'saved', users.length);
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  }

  // ============ ORDERS ============
  getOrders() {
    try {
      const orders = localStorage.getItem(this.keys.ORDERS);
      return orders ? JSON.parse(orders) : this.defaults.orders;
    } catch (error) {
      console.error('Error reading orders:', error);
      return this.defaults.orders;
    }
  }

  saveOrders(orders) {
    try {
      localStorage.setItem(this.keys.ORDERS, JSON.stringify(orders));
      this.logSync('orders', 'saved', orders.length);
      return true;
    } catch (error) {
      console.error('Error saving orders:', error);
      return false;
    }
  }

  // ============ SETTINGS ============
  getSettings() {
    try {
      const settings = localStorage.getItem(this.keys.SETTINGS);
      if (settings) return JSON.parse(settings);

      const defaultSettings = this.getDefaultSettings();
      this.saveSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error reading settings:', error);
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      storeName: 'Brew & Co',
      email: 'hello@brewandco.com',
      phone: '+1 (555) 123-4567',
      address: '12 Brew Street, Downtown',
      businessHours: '8:00 - 20:00',
      taxRate: 8.5,
      enableNotifications: true,
      autoSave: true,
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY'
    };
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
      this.logSync('settings', 'saved');
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // ============ BACKUP ============
  createBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          menuItems: this.getMenuItems(),
          users: this.getUsers(),
          orders: this.getOrders(),
          settings: this.getSettings()
        },
        stats: {
          menuItemsCount: this.getMenuItems().length,
          usersCount: this.getUsers().length,
          ordersCount: this.getOrders().length
        }
      };

      localStorage.setItem(this.keys.BACKUP, JSON.stringify(backup));
      this.logSync('backup', 'created', backup.stats);
      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  getBackup() {
    try {
      const backup = localStorage.getItem(this.keys.BACKUP);
      return backup ? JSON.parse(backup) : null;
    } catch (error) {
      console.error('Error reading backup:', error);
      return null;
    }
  }

  restoreFromBackup() {
    try {
      const backup = this.getBackup();
      if (!backup) {
        throw new Error('No backup found');
      }

      if (backup.data.menuItems) {
        this.saveMenuItems(backup.data.menuItems);
      }

      if (backup.data.users) {
        this.saveUsers(backup.data.users);
      }

      if (backup.data.orders) {
        this.saveOrders(backup.data.orders);
      }

      if (backup.data.settings) {
        this.saveSettings(backup.data.settings);
      }

      this.logSync('backup', 'restored', backup.stats);
      return backup;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  // ============ SESSION ============
  saveSession(sessionData) {
    try {
      localStorage.setItem(this.keys.SESSION, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  getSession() {
    try {
      const session = localStorage.getItem(this.keys.SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem(this.keys.SESSION);
  }

  // ============ GENERIC METHODS ============
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateNumericId() {
    return Date.now();
  }

  // ============ UTILITY METHODS ============
  getStorageStats() {
    const menuItems = this.getMenuItems();
    const users = this.getUsers();
    const orders = this.getOrders();
    const settings = this.getSettings();
    const backup = this.getBackup();

    return {
      menuItems: {
        count: menuItems.length,
        available: menuItems.filter(item => item.is_available !== false).length,
        popular: menuItems.filter(item => item.popular).length
      },
      users: {
        count: users.length,
        active: users.filter(user => user.status === 'active').length,
        admins: users.filter(user => user.role === 'admin').length
      },
      orders: {
        count: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        completed: orders.filter(order => order.status === 'completed').length
      },
      settings: settings,
      hasBackup: !!backup,
      backupDate: backup?.timestamp,
      totalStorage: this.calculateStorageSize()
    };
  }

  calculateStorageSize() {
    let total = 0;
    for (let key in this.keys) {
      const item = localStorage.getItem(this.keys[key]);
      if (item) {
        total += item.length * 2; // Each character is 2 bytes
      }
    }
    return this.formatBytes(total);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearAllData() {
    try {
      // Keep session and settings
      const session = this.getSession();
      const settings = this.getSettings();

      // Clear all data
      localStorage.removeItem(this.keys.MENU_ITEMS);
      localStorage.removeItem(this.keys.USERS);
      localStorage.removeItem(this.keys.ORDERS);
      localStorage.removeItem(this.keys.BACKUP);
      localStorage.removeItem(this.keys.SYNC_LOG);

      // Restore session and settings
      if (session) this.saveSession(session);
      if (settings) this.saveSettings(settings);

      this.logSync('all', 'cleared');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // ============ SYNC LOGGING ============
  logSync(type, action, data = null) {
    try {
      const logs = this.getSyncLogs();
      const logEntry = {
        id: this.generateId(),
        type,
        action,
        timestamp: new Date().toISOString(),
        data: data,
        userAgent: navigator.userAgent
      };

      logs.unshift(logEntry); // Add to beginning

      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.pop();
      }

      localStorage.setItem(this.keys.SYNC_LOG, JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging sync:', error);
    }
  }

  getSyncLogs() {
    try {
      const logs = localStorage.getItem(this.keys.SYNC_LOG);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error reading sync logs:', error);
      return [];
    }
  }

  // ============ EXPORT/IMPORT ============
  exportData(format = 'json') {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        system: 'Brew & Co Admin Panel',
        data: {
          menuItems: this.getMenuItems(),
          users: this.getUsers(),
          orders: this.getOrders(),
          settings: this.getSettings()
        }
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        // Simple CSV conversion for menu items
        const menuItems = data.data.menuItems;
        if (menuItems.length === 0) return '';

        const headers = Object.keys(menuItems[0]).join(',');
        const rows = menuItems.map(item =>
          Object.values(item).map(val =>
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
          ).join(',')
        ).join('\n');

        return headers + '\n' + rows;
      }

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  importData(data, type = 'full') {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;

      if (type === 'menuItems' && parsed.menuItems) {
        this.saveMenuItems(parsed.menuItems);
      } else if (type === 'users' && parsed.users) {
        this.saveUsers(parsed.users);
      } else if (type === 'full' && parsed.data) {
        if (parsed.data.menuItems) this.saveMenuItems(parsed.data.menuItems);
        if (parsed.data.users) this.saveUsers(parsed.data.users);
        if (parsed.data.orders) this.saveOrders(parsed.data.orders);
        if (parsed.data.settings) this.saveSettings(parsed.data.settings);
      }

      this.logSync('import', type, { items: parsed.data?.menuItems?.length || 0 });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // ============ HEALTH CHECK ============
  checkHealth() {
    const stats = this.getStorageStats();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      storage: {
        used: this.calculateStorageSize(),
        menuItems: stats.menuItems.count,
        users: stats.users.count,
        orders: stats.orders.count
      },
      lastBackup: stats.backupDate,
      syncLogs: this.getSyncLogs().length
    };
  }
}

// Create and export singleton instance
export const storageService = new StorageService();

// Also export class for testing
export { StorageService };