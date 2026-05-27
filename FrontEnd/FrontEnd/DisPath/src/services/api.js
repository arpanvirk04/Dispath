import axios from "axios";

//creating axios instance
const api = axios.create({
    // Use API gateway in front of microservices. Gateway runs on 8082 and proxies /api/* to correct services.
    baseURL: 'http://localhost:8082',
    headers: {
        'Content-Type': 'application/json'
    },
    // Disable credentials for now to avoid CORS credential issues during local dev.
    // Enable if you intentionally need cookies and update server CORS to allow credentials.
    withCredentials: false
});

// Request interceptor
api.interceptors.request.use(config => {
    // Add Authorization header for authenticated endpoints
    const token = localStorage.getItem('token');
    if (token && !config.url.startsWith('/auth/')) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Add user ID to headers if available
    const userId = localStorage.getItem('userId');
    if (userId) {
        config.headers['X-User-ID'] = userId;
    }

    return config;
}, error => {
    return Promise.reject(error);
});

export default api;