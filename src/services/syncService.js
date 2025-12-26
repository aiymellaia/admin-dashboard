// src/services/syncService.js

import { storageService } from './storageService';
import { menuService } from './menuService';
import { apiService } from './apiService';

class SyncService {
  constructor() {
    this.mainSiteKey = 'brewAndCoCart';
    this.syncInterval = null;
    this.lastSyncTime = null;
  }

  // ============ СИНХРОНИЗАЦИЯ С ОСНОВНЫМ САЙТОМ ============

  exportToMainSite() {
    try {
      const adminItems = storageService.getMenuItems();

      // Конвертируем в формат основного сайта
      const mainSiteFormat = adminItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image || 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb',
        popular: item.popular || false,
        rating: item.rating || 4.5,
        is_available: item.is_available !== false
      }));

      // Сохраняем в localStorage основного сайта
      localStorage.setItem(this.mainSiteKey, JSON.stringify(mainSiteFormat));

      // Создаем событие для уведомления основного сайта
      this.dispatchSyncEvent('menuDataExported', {
        count: mainSiteFormat.length,
        timestamp: new Date().toISOString()
      });

      storageService.logSync('export', 'main_site', mainSiteFormat.length);

      return {
        success: true,
        message: `Exported ${mainSiteFormat.length} items to main site`,
        data: mainSiteFormat
      };
    } catch (error) {
      console.error('Export to main site error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  importFromMainSite() {
    try {
      const mainSiteItems = JSON.parse(localStorage.getItem(this.mainSiteKey) || '[]');

      // Конвертируем в формат админ-панели
      const adminFormat = mainSiteItems.map(item => ({
        ...item,
        stock: item.stock || 10,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_available: item.is_available !== false
      }));

      // Сохраняем в админ-панели
      storageService.saveMenuItems(adminFormat);

      storageService.logSync('import', 'main_site', adminFormat.length);

      return {
        success: true,
        message: `Imported ${adminFormat.length} items from main site`,
        data: adminFormat
      };
    } catch (error) {
      console.error('Import from main site error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============ СИНХРОНИЗАЦИЯ С API СЕРВЕРОМ ============

  async syncWithServer() {
    try {
      console.log('🔄 Starting server sync...');

      const localItems = storageService.getMenuItems();
      let serverItems = [];

      // Пробуем получить данные с сервера
      try {
        serverItems = await menuService.getAll();
        console.log(`📡 Received ${serverItems.length} items from server`);
      } catch (serverError) {
        console.warn('⚠️ Server unavailable, using local data only');
        throw new Error('Server connection failed');
      }

      // Логика синхронизации
      const syncResult = this.mergeData(localItems, serverItems);

      // Сохраняем синхронизированные данные
      storageService.saveMenuItems(syncResult.mergedItems);

      // Обновляем данные на сервере, если нужно
      if (syncResult.newItems.length > 0) {
        console.log(`📤 ${syncResult.newItems.length} new items to upload`);
        await this.uploadNewItems(syncResult.newItems);
      }

      if (syncResult.updatedItems.length > 0) {
        console.log(`🔄 ${syncResult.updatedItems.length} items to update`);
        await this.updateItems(syncResult.updatedItems);
      }

      this.lastSyncTime = new Date().toISOString();

      const result = {
        success: true,
        timestamp: this.lastSyncTime,
        stats: {
          total: syncResult.mergedItems.length,
          local: localItems.length,
          server: serverItems.length,
          new: syncResult.newItems.length,
          updated: syncResult.updatedItems.length,
          conflicts: syncResult.conflicts.length
        },
        conflicts: syncResult.conflicts
      };

      storageService.logSync('sync', 'server', result.stats);

      console.log('✅ Server sync completed:', result.stats);
      return result;
    } catch (error) {
      console.error('❌ Server sync failed:', error);

      storageService.logSync('sync', 'server_error', { error: error.message });

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  mergeData(localItems, serverItems) {
    const mergedItems = [...serverItems];
    const newItems = [];
    const updatedItems = [];
    const conflicts = [];

    localItems.forEach(localItem => {
      // Ищем соответствующий элемент на сервере
      const serverIndex = mergedItems.findIndex(serverItem =>
        serverItem.id === localItem.id ||
        serverItem.name === localItem.name
      );

      if (serverIndex === -1) {
        // Новый элемент (есть локально, но нет на сервере)
        newItems.push(localItem);
        mergedItems.push({
          ...localItem,
          sync_status: 'new',
          last_synced: new Date().toISOString()
        });
      } else {
        const serverItem = mergedItems[serverIndex];

        // Проверяем, какой элемент новее
        const localDate = new Date(localItem.updated_at || localItem.created_at || 0);
        const serverDate = new Date(serverItem.updated_at || serverItem.created_at || 0);

        if (localDate > serverDate) {
          // Локальная версия новее
          updatedItems.push({
            old: serverItem,
            new: localItem
          });
          mergedItems[serverIndex] = {
            ...localItem,
            sync_status: 'updated',
            last_synced: new Date().toISOString()
          };
        } else if (localDate < serverDate) {
          // Серверная версия новее - используем её
          mergedItems[serverIndex] = {
            ...serverItem,
            sync_status: 'server_newer',
            last_synced: new Date().toISOString()
          };
        } else {
          // Версии одинаковые, но могут быть различия
          if (JSON.stringify(localItem) !== JSON.stringify(serverItem)) {
            conflicts.push({
              local: localItem,
              server: serverItem
            });
          }
        }
      }
    });

    return {
      mergedItems,
      newItems,
      updatedItems,
      conflicts
    };
  }

  async uploadNewItems(newItems) {
    const results = [];

    for (const item of newItems) {
      try {
        // В реальном приложении здесь будет API вызов
        // const result = await apiService.createProduct(item);
        // results.push({ success: true, item: result });

        console.log(`Would upload: ${item.name}`);
        results.push({ success: true, item });

        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ success: false, item, error: error.message });
      }
    }

    return results;
  }

  async updateItems(updatedItems) {
    const results = [];

    for (const { old, new: updated } of updatedItems) {
      try {
        // В реальном приложении здесь будет API вызов
        // const result = await apiService.updateProduct(updated.id, updated);
        // results.push({ success: true, item: result });

        console.log(`Would update: ${updated.name}`);
        results.push({ success: true, item: updated });

        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ success: false, item: updated, error: error.message });
      }
    }

    return results;
  }

  // ============ АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ============

  startAutoSync(interval = 300000) { // 5 минут по умолчанию
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    console.log(`🔄 Starting auto-sync every ${interval / 1000} seconds`);

    this.syncInterval = setInterval(async () => {
      console.log('⏰ Auto-sync triggered');
      const result = await this.syncWithServer();

      if (result.success) {
        this.dispatchSyncEvent('autoSyncCompleted', result);
      } else {
        this.dispatchSyncEvent('autoSyncFailed', result);
      }
    }, interval);

    // Синхронизация сразу при старте
    setTimeout(() => this.syncWithServer(), 1000);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  // ============ СТАТУС И ИНФОРМАЦИЯ ============

  getSyncStatus() {
    const syncLogs = storageService.getSyncLogs();
    const lastSync = syncLogs.length > 0 ? syncLogs[0] : null;

    return {
      lastSync: this.lastSyncTime,
      lastLog: lastSync,
      autoSyncActive: !!this.syncInterval,
      nextSync: this.syncInterval ? 'Active' : 'Inactive',
      storageStats: storageService.getStorageStats()
    };
  }

  getSyncHistory(limit = 20) {
    const logs = storageService.getSyncLogs();
    return logs.slice(0, limit);
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ============

  dispatchSyncEvent(eventName, detail) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  setupEventListeners() {
    if (typeof window !== 'undefined') {
      // Слушаем события от основного сайта
      window.addEventListener('mainSiteDataUpdated', (event) => {
        console.log('📥 Main site data updated:', event.detail);
        this.importFromMainSite();
      });

      // Слушаем события от админ-панели
      window.addEventListener('adminDataUpdated', (event) => {
        console.log('📤 Admin data updated:', event.detail);
        this.exportToMainSite();
      });

      // Слушаем команды синхронизации
      window.addEventListener('triggerSync', () => {
        this.syncWithServer();
      });

      console.log('🎧 Sync event listeners setup complete');
    }
  }

  // ============ КОНФЛИКТЫ И РАЗРЕШЕНИЯ ============

  resolveConflict(localItem, serverItem, resolution) {
    // resolution: 'local', 'server', 'merge', 'keep_both'

    switch (resolution) {
      case 'local':
        // Используем локальную версию
        return {
          ...localItem,
          conflict_resolved: true,
          resolution: 'local',
          resolved_at: new Date().toISOString()
        };

      case 'server':
        // Используем серверную версию
        return {
          ...serverItem,
          conflict_resolved: true,
          resolution: 'server',
          resolved_at: new Date().toISOString()
        };

      case 'merge':
        // Объединяем обе версии (локальная имеет приоритет)
        return {
          ...serverItem,
          ...localItem,
          conflict_resolved: true,
          resolution: 'merge',
          resolved_at: new Date().toISOString()
        };

      case 'keep_both':
        // Сохраняем обе как отдельные записи
        const localCopy = { ...localItem, id: storageService.generateNumericId() };
        const serverCopy = { ...serverItem };
        return [localCopy, serverCopy];

      default:
        throw new Error(`Unknown resolution: ${resolution}`);
    }
  }

  // ============ ЭКСПОРТ/ИМПОРТ ФАЙЛОВ ============

  exportToFile(format = 'json') {
    try {
      const data = storageService.exportData(format);

      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brew-co-sync-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      return {
        success: true,
        filename: link.download,
        format: format
      };
    } catch (error) {
      console.error('Export to file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target.result;
          let data;

          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            data = this.parseCSV(content);
          } else {
            throw new Error('Unsupported file format');
          }

          const result = storageService.importData(data, 'full');

          resolve({
            success: true,
            filename: file.name,
            items: data.data?.menuItems?.length || 0
          });
        } catch (error) {
          reject({
            success: false,
            error: error.message
          });
        }
      };

      reader.onerror = () => {
        reject({
          success: false,
          error: 'Failed to read file'
        });
      };

      reader.readAsText(file);
    });
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = lines[i].split(',');
      const item = {};

      headers.forEach((header, index) => {
        let value = values[index] || '';
        // Убираем кавычки
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"');
        }

        // Парсим числа
        if (!isNaN(value) && value !== '') {
          value = parseFloat(value);
        }

        // Парсим булевы значения
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        }

        item[header] = value;
      });

      items.push(item);
    }

    return {
      data: { menuItems: items }
    };
  }
}

// Создаем и экспортируем singleton
export const syncService = new SyncService();

// Экспортируем класс для тестирования
export { SyncService };