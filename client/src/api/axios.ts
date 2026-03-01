// client/src/api/axios.ts
import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// This middleware runs BEFORE every request to the backend
API.interceptors.request.use((config) => {
    const user = localStorage.getItem('userInfo');
    if (user) {
        const { token } = JSON.parse(user);
        // We automatically attach the JWT token to the 'Authorization' header
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;