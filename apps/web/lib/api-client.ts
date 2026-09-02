import axios from 'axios';

// Default config for the axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    // In a real application, you might get the token from a secure store, cookie, or local storage.
    // For this example, we assume it's in localStorage if we're in the browser.
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401, handle refresh token logic
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          if (typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

              localStorage.setItem('access_token', newAccessToken);
              localStorage.setItem('refresh_token', newRefreshToken);

              // Update the Authorization header and retry the request
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return apiClient(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('Failed to refresh token, logging out...', refreshError);
        }
      }

      // If we get here, it means refresh failed, there was no refresh token,
      // or the retried request failed with 401 again
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
