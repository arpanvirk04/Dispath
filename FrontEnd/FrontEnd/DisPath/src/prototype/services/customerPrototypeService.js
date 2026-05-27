import api from '../../services/api.js';

/**
 * Service for managing customer prototype operations
 * Provides methods to interact with customer endpoints
 */
class CustomerPrototypeService {

    /**
     * Adds multiple customers to the system
     * @param {Array} customers - Array of customer objects to add
     * @returns {Promise} Promise resolving to the created customers
     */
    async addCustomers(customers) {
        try {
            const response = await api.post('/api/customers/bulk', customers);
            return response.data;
        } catch (error) {
            console.error('Error adding customers:', error);
            throw error;
        }
    }

    /**
     * Creates a single customer
     * @param {Object} customer - Customer object
     * @returns {Promise<Object>} created customer
     */
    async createCustomer(customer) {
        try {
            // Normalize payload to match backend CustomerDTO shape. Ensure latitude/longitude keys exist.
            const payload = this.normalizePayload(customer);
            const response = await api.post('/api/customers', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    /**
     * Retrieves all customers from the system
     * @returns {Promise} Promise resolving to array of all customers
     */
    async getAllCustomers() {
        try {
            const response = await api.get('/api/customers');
            return response.data;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    /**
     * Finds a customer by their unique ID
     * @param {string} id - Customer ID
     * @returns {Promise} Promise resolving to the customer object
     */
    async getCustomerById(id) {
        try {
            const response = await api.get(`/api/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer by ID:', error);
            throw error;
        }
    }

    /**
     * Finds a customer by their email address
     * @param {string} email - Customer email
     * @returns {Promise} Promise resolving to the customer object
     */
    async getCustomerByEmail(email) {
        try {
            const response = await api.get(`/api/customers/email/${email}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer by email:', error);
            throw error;
        }
    }

    /**
     * Searches for customers by name (case-insensitive)
     * @param {string} name - Name or partial name to search for
     * @returns {Promise} Promise resolving to array of matching customers
     */
    async searchCustomersByName(name) {
        try {
            const response = await api.get(`/api/customers/search?name=${encodeURIComponent(name)}`);
            return response.data;
        } catch (error) {
            console.error('Error searching customers by name:', error);
            throw error;
        }
    }

    /**
     * Updates an existing customer
     * @param {string} id - Customer ID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise} Promise resolving to the updated customer
     */
    async updateCustomer(id, customerData) {
        try {
            const response = await api.put(`/api/customers/${id}`, this.normalizePayload(customerData));
            return response.data;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    /**
     * Deletes a customer by ID
     * @param {string} id - Customer ID to delete
     * @returns {Promise} Promise resolving to success response
     */
    async deleteCustomer(id) {
        try {
            const response = await api.delete(`/api/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }

    async getAddressSuggestions(fullAddress) {
        try {
            const response = await api.get(`/api/customers/address-suggestions?query=${encodeURIComponent(fullAddress)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
            throw error;
        }
    }

    /**
     * Validates whether the provided address is an exact match according to backend rules.
     * @param {string} fullAddress
     * @returns {Promise<{ exact: boolean, displayName?: string, latitude?: number, longitude?: number, street?: string, city?: string, state?: string, postalCode?: string, country?: string }>}
     */
    async validateAddress(fullAddress) {
        try {
            const response = await api.get(`/api/customers/validate-address?query=${encodeURIComponent(fullAddress)}`);
            return response.data;
        } catch (error) {
            console.error('Error validating address:', error);
            throw error;
        }
    }

    normalizePayload(customer = {}) {
        return {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            city: customer.city || null,
            state: customer.state || null,
            postalCode: customer.postalCode || null,
            country: customer.country || null,
            latitude: customer.latitude !== undefined ? customer.latitude : null,
            longitude: customer.longitude !== undefined ? customer.longitude : null,
            openingHours: customer.openingHours || null
        };
    }
}

export default new CustomerPrototypeService();
