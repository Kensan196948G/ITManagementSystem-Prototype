import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store token
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      
      // Get user profile after login
      try {
        const userResponse = await apiClient.get<User>('/auth/me');
        localStorage.setItem('user', JSON.stringify(userResponse));
      } catch (error) {
        console.error('Failed to get user profile:', error);
      }
    }
    
    return response;
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Don't force redirect here - let React Router handle it
    // window.location.href = '/login';
  },

  // Clear all auth data (utility method)
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken'); // Clear refresh token if exists
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    // Both token and user must exist
    if (!token || !user) {
      return false;
    }
    
    // Basic token format validation (JWT should have 3 parts)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }
    
    return true;
  },

  // Refresh token
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response.token;
  },

  // Get user profile
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', userData);
  },

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
  },
};