import axios from 'axios';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: 'https://library-management-backend-8mrt.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach the JWT token from localStorage to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle global errors like 401 Unauthorized
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        // Ideally dispatch a logout event or clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
    return Promise.reject(error);
});

export default apiClient;
