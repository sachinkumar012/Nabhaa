import axios from 'axios';

const adminApi = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api', // Using VITE_API_URL matching frontend naming
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the auth token
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default adminApi;
