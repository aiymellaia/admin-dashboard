import { storageService } from './storageService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MenuApiService {
    constructor() {
        this.token = localStorage.getItem('admin_token');
    }

    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async handleResponse(response) {
        if (!response.ok) {
            if (response.status === 401) {
                // Токен устарел, выходим
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_data');
                window.location.href = '/login';
                throw new Error('Сессия истекла');
            }
            const error = await response.text();
            throw new Error(error || 'Ошибка сервера');
        }
        return response.json();
    }

    // ========== ОСНОВНЫЕ МЕТОДЫ ==========

    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                headers: this.getAuthHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка загрузки продуктов:', error);
            // Fallback на localStorage если API недоступен
            return storageService.getMenuItems();
        }
    }

    async getById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                headers: this.getAuthHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка загрузки продукта:', error);
            // Fallback
            const items = storageService.getMenuItems();
            return items.find(item => item.id === id) || null;
        }
    }

    async create(item) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price),
                    category: item.category,
                    image: item.image || 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb',
                    popular: item.popular || false,
                    rating: item.rating || 4.5,
                    is_available: item.is_available !== false
                })
            });

            const result = await this.handleResponse(response);

            // Также сохраняем локально для синхронизации
            const localItems = storageService.getMenuItems();
            const newItem = {
                ...item,
                id: result.id,
                created_at: new Date().toISOString()
            };
            localItems.push(newItem);
            storageService.saveMenuItems(localItems);

            return result;
        } catch (error) {
            console.error('❌ Ошибка создания продукта:', error);
            // Fallback на localStorage
            const items = storageService.getMenuItems();
            const newItem = {
                ...item,
                id: storageService.generateId(),
                createdAt: new Date().toISOString()
            };
            items.push(newItem);
            storageService.saveMenuItems(items);
            return newItem;
        }
    }

    async update(id, updates) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    name: updates.name,
                    description: updates.description,
                    price: parseFloat(updates.price),
                    category: updates.category,
                    image: updates.image,
                    popular: updates.popular || false,
                    rating: updates.rating || 4.5,
                    is_available: updates.is_available !== false
                })
            });

            const result = await this.handleResponse(response);

            // Обновляем локальную копию
            const items = storageService.getMenuItems();
            const index = items.findIndex(item => item.id == id);
            if (index !== -1) {
                items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
                storageService.saveMenuItems(items);
            }

            return result;
        } catch (error) {
            console.error('❌ Ошибка обновления продукта:', error);
            // Fallback на localStorage
            const items = storageService.getMenuItems();
            const index = items.findIndex(item => item.id === id);

            if (index !== -1) {
                items[index] = {
                    ...items[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                storageService.saveMenuItems(items);
                return items[index];
            }

            return null;
        }
    }

    async delete(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            await this.handleResponse(response);

            // Удаляем из локального хранилища
            const items = storageService.getMenuItems();
            const filteredItems = items.filter(item => item.id !== id);
            storageService.saveMenuItems(filteredItems);

            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления продукта:', error);
            // Fallback на localStorage
            const items = storageService.getMenuItems();
            const filteredItems = items.filter(item => item.id !== id);
            storageService.saveMenuItems(filteredItems);
            return true;
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    async getCategories() {
        try {
            const products = await this.getAll();
            const categories = [...new Set(products.map(item => item.category))];
            return categories;
        } catch (error) {
            console.error('❌ Ошибка получения категорий:', error);
            // Fallback
            const items = storageService.getMenuItems();
            return [...new Set(items.map(item => item.category))];
        }
    }

    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: this.getAuthHeaders()
            });

            const serverStats = await this.handleResponse(response);

            // Дополняем локальной статистикой по продуктам
            const products = await this.getAll();
            const totalItems = products.length;
            const popularItems = products.filter(item => item.popular).length;
            const categories = await this.getCategories();

            return {
                ...serverStats.overview,
                totalItems,
                popularItems,
                categories: categories.length,
                availableProducts: products.filter(p => p.is_available).length
            };
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error);
            // Fallback на локальную статистику
            const items = storageService.getMenuItems();
            const totalItems = items.length;
            const popularItems = items.filter(item => item.popular).length;
            const categories = [...new Set(items.map(item => item.category))];
            const totalValue = items.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0);

            return {
                totalItems,
                popularItems,
                categories: categories.length,
                totalValue: parseFloat(totalValue.toFixed(2)),
                total_orders: 0,
                total_revenue: 0,
                today_orders: 0,
                today_revenue: 0,
                availableProducts: items.filter(p => p.is_available !== false).length
            };
        }
    }

    async syncWithServer() {
        try {
            const serverProducts = await this.getAll();

            // Получаем локальные продукты
            const localProducts = storageService.getMenuItems();

            // Создаем массив для синхронизации
            const allProducts = [...localProducts];

            // Добавляем продукты с сервера, которых нет локально
            serverProducts.forEach(serverProduct => {
                const exists = allProducts.some(localProduct =>
                    localProduct.id === serverProduct.id ||
                    localProduct.name === serverProduct.name
                );

                if (!exists) {
                    allProducts.push({
                        ...serverProduct,
                        synchronized: true
                    });
                }
            });

            // Сохраняем синхронизированный список
            storageService.saveMenuItems(allProducts);

            return {
                success: true,
                message: `Синхронизировано ${allProducts.length} продуктов`,
                count: allProducts.length
            };
        } catch (error) {
            console.error('❌ Ошибка синхронизации:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Экспорт в формат для основного сайта
    exportForMainSite() {
        const items = storageService.getMenuItems();

        return items.map(item => ({
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
    }

    // Загрузка из основного сайта
    importFromMainSite(data) {
        const formattedData = data.map(item => ({
            ...item,
            stock: item.stock || 10,
            created_at: item.created_at || new Date().toISOString()
        }));

        storageService.saveMenuItems(formattedData);
        return formattedData;
    }
}

// Создаем экземпляр и экспортируем
export const menuService = new MenuApiService();

// Также экспортируем старые методы для совместимости
export const menuServiceLegacy = {
    getAll: () => storageService.getMenuItems(),
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
        return [...new Set(items.map(item => item.category))];
    },
    getStats: () => {
        const items = storageService.getMenuItems();
        const totalItems = items.length;
        const popularItems = items.filter(item => item.popular).length;
        const categories = menuServiceLegacy.getCategories().length;
        const totalValue = items.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0);

        return {
            totalItems,
            popularItems,
            categories,
            totalValue: parseFloat(totalValue.toFixed(2))
        };
    }
};