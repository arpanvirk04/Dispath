import api from '../../services/api.js';

/**
 * Service for managing order prototype operations
 * Provides methods to interact with order endpoints
 */
class OrderPrototypeService {
    /**
     * Create a new order
     * @param {Object} orderDto - Order DTO matching backend shape
     * @returns {Promise<Object>} created order
     */
    async createOrder(orderDto) {
        try {
            const response = await api.post('/api/orders', orderDto);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Fetch orders (optionally filter by customerId)
     * @param {string} [customerId]
     */
    async getOrders(customerId) {
        try {
            const url = customerId ? `/api/orders?customerId=${encodeURIComponent(customerId)}` : '/api/orders';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
}

export default new OrderPrototypeService();
