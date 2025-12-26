// src/services/syncService.js
export const syncService = {
  // Экспорт данных в формат основного сайта
  exportToMainSite: () => {
    const adminItems = JSON.parse(localStorage.getItem('admin_menu_items') || '[]');

    const mainSiteFormat = adminItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image || 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb',
      popular: item.popular || false,
      rating: item.rating || 4.5
    }));

    return mainSiteFormat;
  },

  // Импорт данных из основного сайта
  importFromMainSite: () => {
    const mainSiteItems = JSON.parse(localStorage.getItem('brewAndCoCart') || '[]');

    const adminFormat = mainSiteItems.map(item => ({
      ...item,
      stock: item.stock || 10,
      createdAt: item.createdAt || new Date().toISOString()
    }));

    localStorage.setItem('admin_menu_items', JSON.stringify(adminFormat));
    return adminFormat;
  },

  // Синхронизация в реальном времени (если оба сайта открыты)
  syncWithMainSite: () => {
    const adminItems = JSON.parse(localStorage.getItem('admin_menu_items') || '[]');
    localStorage.setItem('brewAndCoCart', JSON.stringify(adminItems));

    // Можно добавить событие для уведомления основного сайта
    window.dispatchEvent(new CustomEvent('menuDataUpdated', {
      detail: { items: adminItems }
    }));
  }
};