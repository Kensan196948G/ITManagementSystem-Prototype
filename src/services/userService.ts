import { apiClient } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  avatar?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  phone?: string;
  password: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  module: string;
}

export interface UserFilters {
  role?: string;
  department?: string;
  isActive?: boolean;
  search?: string;
}

export const userService = {
  // Get all users with optional filters
  async getUsers(filters?: UserFilters, page = 1, limit = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get('/users', params);
  },

  // Get user by ID
  async getUser(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`);
  },

  // Create new user
  async createUser(user: CreateUserRequest): Promise<User> {
    return apiClient.post('/users', user);
  },

  // Update user
  async updateUser(id: string, user: UpdateUserRequest): Promise<User> {
    return apiClient.put(`/users/${id}`, user);
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },

  // Activate user
  async activateUser(id: string): Promise<User> {
    return apiClient.patch(`/users/${id}/activate`);
  },

  // Deactivate user
  async deactivateUser(id: string): Promise<User> {
    return apiClient.patch(`/users/${id}/deactivate`);
  },

  // Reset user password
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    return apiClient.patch(`/users/${id}/reset-password`);
  },

  // Update user password
  async updatePassword(id: string, newPassword: string, forceChange = false): Promise<void> {
    return apiClient.patch(`/users/${id}/password`, { 
      password: newPassword,
      forceChange 
    });
  },

  // Upload user avatar
  async uploadAvatar(id: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`/api/users/${id}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
    
    return response.json();
  },

  // Delete user avatar
  async deleteAvatar(id: string): Promise<User> {
    return apiClient.delete(`/users/${id}/avatar`);
  },

  // Get all roles
  async getRoles(): Promise<Role[]> {
    return apiClient.get('/roles');
  },

  // Get role by ID
  async getRole(id: string): Promise<Role> {
    return apiClient.get(`/roles/${id}`);
  },

  // Create new role
  async createRole(role: {
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
  }): Promise<Role> {
    return apiClient.post('/roles', role);
  },

  // Update role
  async updateRole(id: string, role: {
    name?: string;
    displayName?: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    return apiClient.put(`/roles/${id}`, role);
  },

  // Delete role
  async deleteRole(id: string): Promise<void> {
    return apiClient.delete(`/roles/${id}`);
  },

  // Get all permissions
  async getPermissions(): Promise<Permission[]> {
    return apiClient.get('/permissions');
  },

  // Get permissions by module
  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return apiClient.get(`/permissions/module/${module}`);
  },

  // Assign role to user
  async assignRole(userId: string, roleId: string): Promise<User> {
    return apiClient.patch(`/users/${userId}/role`, { roleId });
  },

  // Update user permissions
  async updatePermissions(userId: string, permissions: string[]): Promise<User> {
    return apiClient.patch(`/users/${userId}/permissions`, { permissions });
  },

  // Get user activity log
  async getUserActivity(userId: string, page = 1, limit = 10): Promise<{
    activities: Array<{
      id: string;
      action: string;
      resource: string;
      resourceId?: string;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    return apiClient.get(`/users/${userId}/activity`, { page, limit });
  },

  // Get user statistics
  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
    recentLogins: number;
  }> {
    return apiClient.get('/users/statistics');
  },

  // Bulk import users
  async bulkImport(file: File): Promise<{
    success: number;
    failed: number;
    errors: Array<{
      row: number;
      errors: string[];
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/users/bulk-import', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to import users');
    }
    
    return response.json();
  },

  // Export users
  async exportUsers(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await fetch(`/api/users/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export users');
    }
    
    return response.blob();
  },

  // Send invitation email
  async sendInvitation(email: string, roleId: string): Promise<void> {
    return apiClient.post('/users/invite', { email, roleId });
  },

  // Get user sessions
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
    isActive: boolean;
  }>> {
    return apiClient.get(`/users/${userId}/sessions`);
  },

  // Terminate user session
  async terminateSession(userId: string, sessionId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}/sessions/${sessionId}`);
  },

  // Terminate all user sessions
  async terminateAllSessions(userId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}/sessions`);
  },
};