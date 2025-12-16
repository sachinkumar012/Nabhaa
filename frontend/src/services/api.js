import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Point to Backend
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
