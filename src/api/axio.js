import axios from 'axios';
import { logout } from '../utils/auth';

const api = axios.create({
    baseURL: 'https://myshelf-backend.onrender.com/',
});

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

       
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('🔁 Attempting token refresh...');

            try {
                const refreshToken = localStorage.getItem('refresh');
                if (!refreshToken) {
                   
                    throw new Error('No refresh token');
                }

                const refreshInstance = axios.create();
                const res = await refreshInstance.post('https://myshelf-backend.onrender.com/api/token/refresh/', {
                    refresh: refreshToken,
                });

                

                const newAccess = res.data.access;
                if (!newAccess) throw new Error('No access token in response');

                localStorage.setItem('access', newAccess);
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (refreshError) {
               
                logout()
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


export default api;
