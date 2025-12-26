// src/services/menuService.js
import { storageService } from './storageService';

export const menuService = {
  getAll: () => {
    return storageService.getMenuItems();
  },

  getById: (id) => {
    const items = storageService.getMenuItems();
    return items.find(item => item.id === id);
  },

  create: (item) => {
    const items = storageService.getMenuItems();
    const newItem = {
      ...item,
      id: storageService.generateId(),
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    storageService.saveMenuItems(items);
    return newItem;
  },

  update: (id, updates) => {
    const items = storageService.getMenuItems();
    const index = items.findIndex(item => item.id === id);

    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
      storageService.saveMenuItems(items);
      return items[index];
    }

    return null;
  },

  delete: (id) => {
    const items = storageService.getMenuItems();
    const filteredItems = items.filter(item => item.id !== id);
    storageService.saveMenuItems(filteredItems);
    return true;
  },

  getCategories: () => {
    const items = storageService.getMenuItems();
    const categories = [...new Set(items.map(item => item.category))];
    return categories;
  },

  getStats: () => {
    const items = storageService.getMenuItems();
    const totalItems = items.length;
    const popularItems = items.filter(item => item.popular).length;
    const categories = menuService.getCategories().length;
    const totalValue = items.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0);

    return {
      totalItems,
      popularItems,
      categories,
      totalValue: parseFloat(totalValue.toFixed(2))
    };
  }
};