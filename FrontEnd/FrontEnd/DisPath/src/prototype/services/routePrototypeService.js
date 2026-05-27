import api from '../../services/api.js';

/**
 * Service for managing route prototype operations
 * Provides methods to interact with route endpoints and order assignment
 */
class RoutePrototypeService {

    /**
     * Creates a new route in the system
     * @param {Object} route - Route object to create
     * @returns {Promise} Promise resolving to the created route
     */
    async createRoute(route) {
        try {
            const payload = {
                name: route.name,
                date: route.date,
                kilometers: route.kilometers ?? null,
                orderIds: route.orderIds || []
            };
            const response = await api.post('/api/routes', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating route:', error);
            throw error;
        }
    }

    /**
     * Retrieves all routes from the system
     * @returns {Promise} Promise resolving to array of all routes
     */
    async getAllRoutes() {
        try {
            const response = await api.get('/api/routes');
            return response.data;
        } catch (error) {
            console.error('Error fetching routes:', error);
            throw error;
        }
    }

    /**
     * Finds a route by its unique ID
     * @param {string} id - Route ID
     * @returns {Promise} Promise resolving to the route object
     */
    async getRouteById(id) {
        try {
            const response = await api.get(`/api/routes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching route by ID:', error);
            throw error;
        }
    }

    /**
     * Adds a single customer to an existing route
     * @param {string} routeId - Route ID
     * @param {string} customerId - Customer ID to add
     * @returns {Promise} Promise resolving to success response
     */
    async addOrderToRoute(routeId, orderId) {
        try {
            const response = await api.post(`/api/routes/${routeId}/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error adding order to route:', error);
            throw error;
        }
    }

    async addMultipleOrdersToRoute(routeId, orderIds) {
        try {
            const response = await api.post(`/api/routes/${routeId}/orders/batch`, {
                orderIds
            });
            return response.data;
        } catch (error) {
            console.error('Error adding multiple orders to route:', error);
            throw error;
        }
    }

    async removeOrderFromRoute(routeId, orderId) {
        try {
            const response = await api.delete(`/api/routes/${routeId}/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error removing order from route:', error);
            throw error;
        }
    }

    async getDrivers() {
        try {
            const response = await api.get('/api/routes/drivers');
            return response.data;
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    }

    async assignDriverToRoute(routeId, driverId) {
        try {
            const response = await api.put(`/api/routes/${routeId}/driver`, { driverId });
            return response.data;
        } catch (error) {
            console.error('Error assigning driver to route:', error);
            throw error;
        }
    }

    /**
     * Updates an existing route
     * @param {string} id - Route ID
     * @param {Object} route - Updated route data
     * @returns {Promise} Promise resolving to the updated route
     */
    async updateRoute(id, route) {
        try {
            const response = await api.put(`/api/routes/${id}`, route);
            return response.data;
        } catch (error) {
            console.error('Error updating route:', error);
            throw error;
        }
    }

    /**
     * Deletes a route by its ID
     * @param {string} id - Route ID to delete
     * @returns {Promise} Promise resolving to success response
     */
    async deleteRoute(id) {
        try {
            const response = await api.delete(`/api/routes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting route:', error);
            throw error;
        }
    }

    /**
     * Optimizes the stop order for a given route using the backend's ORS integration.
     * @param {string} routeId - Route ID to optimize
     * @returns {Promise} Promise resolving to RouteOptimizationSummaryDTO
     */
    async optimizeRoute(routeId) {
        try {
            const response = await api.post(`/api/routes/${routeId}/optimize`);
            return response.data;
        } catch (error) {
            console.error('Error optimizing route:', error);
            throw error;
        }
    }
}

export default new RoutePrototypeService();
