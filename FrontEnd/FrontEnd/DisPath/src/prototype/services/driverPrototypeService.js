import api from '../../services/api.js';

class DriverPrototypeService {
    async inviteDriver(driver) {
        try {
            const response = await api.post('/api/driver-invites', driver);
            return response.data;
        } catch (error) {
            console.error('Error inviting driver:', error);
            throw error;
        }
    }

    async getInviteByToken(token) {
        try {
            const response = await api.get(`/api/driver-invites/${token}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching driver invite:', error);
            throw error;
        }
    }

    async registerDriver(token, data) {
        try {
            const response = await api.post(`/api/driver-invites/${token}/register`, data);
            return response.data;
        } catch (error) {
            console.error('Error registering driver:', error);
            throw error;
        }
    }

    async getAllDrivers() {
        try {
            const response = await api.get('/api/drivers');
            return response.data;
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    }
}

export default new DriverPrototypeService();
