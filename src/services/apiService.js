const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiService = {
    // ========== АУТЕНТИФИКАЦИЯ ==========
    async adminLogin(username, password) {
        try {
            console.log('🔄 Sending login request to:', `${API_BASE_URL}/admin/login`);

            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('📥 Response status:', response.status);

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Login failed:', data);
                throw new Error(data.error || data.message || 'Login failed');
            }

            console.log('✅ Login successful:', data);
            return data;
        } catch (error) {
            console.error('❌ Admin login error:', error);
            throw error;
        }
    },

    // ========== ПОЛУЧЕНИЕ И СОХРАНЕНИЕ ТОКЕНА ==========
    setToken(token) {
        if (token) {
            localStorage.setItem('admin_token', token);
        }
    },

    getToken() {
        return localStorage.getItem('admin_token');
    },

    clearToken() {
        localStorage.removeItem('admin_token');
    },

    // ========== ПОЛУЧЕНИЕ ЗАГОЛОВКОВ С АВТОРИЗАЦИЕЙ ==========
    getAuthHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    // ========== ОБРАБОТКА ОТВЕТОВ ==========
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            // Если токен невалидный, очищаем его
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/login';
            }

            throw new Error(data.error || data.message || 'Request failed');
        }

        return data;
    },

    // ========== ЗАКАЗЫ ==========
    async getOrders(params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/orders?${queryParams}`, {
                headers: this.getAuthHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get orders error:', error);
            throw error;
        }
    },

    async getOrderDetails(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/details`, {
                headers: this.getAuthHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get order details error:', error);
            throw error;
        }
    },

    async updateOrderStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    },

    // ========== ПРОДУКТЫ ==========
    async getProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                headers: this.getAuthHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    },

    async createProduct(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(productData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    },

    async updateProduct(id, productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(productData)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    },

    // ========== ПОЛЬЗОВАТЕЛИ ==========
    async getUsers() {
        try {
            // Если в вашем API есть endpoint для пользователей
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: this.getAuthHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.log('Users endpoint not available, using fallback');
            // Fallback на localStorage
            const localUsers = JSON.parse(localStorage.getItem('admin_users') || '[]');
            return { users: localUsers };
        }
    },

    // ========== СТАТИСТИКА ==========
    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: this.getAuthHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get stats error:', error);
            // Возвращаем пустую статистику при ошибке
            return {
                overview: {
                    total_orders: 0,
                    total_revenue: 0,
                    today_orders: 0,
                    today_revenue: 0
                }
            };
        }
    },

    // ========== ПРОВЕРКА СЕРВЕРА ==========
    async checkHealth() {
        try {
            console.log('🔍 Checking server health at:', `${API_BASE_URL}/health`);
            const response = await fetch(`${API_BASE_URL}/health`, {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 5000 // Добавляем timeout
            });

            if (!response.ok) {
                console.warn('⚠️ Server responded but not OK:', response.status);
                const data = await response.json().catch(() => ({}));
                return {
                    ok: false,
                    status: response.status,
                    message: data.message || 'Server error'
                };
            }

            const data = await response.json();
            console.log('✅ Server is healthy:', data);
            return {
                ok: true,
                status: response.status,
                ...data
            };
        } catch (error) {
            console.error('❌ Server health check failed:', error.message);
            return {
                ok: false,
                message: error.message || 'Cannot connect to server'
            };
        }
    },

    // ========== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ==========
    async checkAuthStatus() {
        try {
            const token = this.getToken();
            if (!token) {
                return { authenticated: false };
            }

            // В вашем API может быть endpoint для проверки токена
            // Пока просто проверяем наличие токена
            return { authenticated: true };
        } catch (error) {
            return { authenticated: false, error: error.message };
        }
    },

    // Дебаг информация
    debugInfo() {
        return {
            apiUrl: API_BASE_URL,
            tokenExists: !!this.getToken(),
            tokenLength: this.getToken()?.length || 0,
            localStorageKeys: Object.keys(localStorage)
        };
    }
};

// Добавляем поддержку timeout для fetch
if (!window.fetchWithTimeout) {
    window.fetchWithTimeout = function(url, options = {}) {
        const { timeout = 8000, ...fetchOptions } = options;

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);

            fetch(url, fetchOptions)
                .then(response => {
                    clearTimeout(timer);
                    resolve(response);
                })
                .catch(err => {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    };
}