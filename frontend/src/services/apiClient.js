import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create a configured axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds timeout for slow networks
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure automatic retries for failed requests
axiosRetry(apiClient, { 
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // time interval between retries: 1s, 2s, 3s
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

// Request interceptor to add auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add token reading from localStorage here if needed, but App uses standard axios in most places.
    // We are creating this for resilient requests moving forward.
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
       console.warn('Network offline, returning cached or rejecting');
       // In a full PWA with workbox, the service worker handles actual caching.
       // Here we just let it fail gracefully after retries
    }
    return Promise.reject(error);
  }
);

export default apiClient;
