import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthはAuthProvider内で使用する必要があります');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state - always clear on page reload
    const initializeAuth = async () => {
      console.log('[AuthContext] Starting auth initialization - clearing auth on reload');
      
      // Always clear auth data on page reload/refresh
      authService.clearAuthData();
      sessionStorage.clear();
      
      // Set user as unauthenticated
      setUser(null);
      setIsLoading(false);
      setIsInitialized(true);
      
      console.log('[AuthContext] Auth cleared - user needs to login');
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    console.log('[AuthContext] Login attempt for username:', username);
    try {
      setIsLoading(true);
      await authService.login({ username, password });
      // Get user from localStorage after successful login
      const user = authService.getCurrentUser();
      console.log('[AuthContext] Login successful, setting user:', user?.username);
      setUser(user);
      // Set session flag to indicate valid login
      sessionStorage.setItem('authSession', 'active');
    } catch (error) {
      console.log('[AuthContext] Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logout called, clearing auth data');
    authService.clearAuthData();
    sessionStorage.removeItem('authSession');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    console.log('[AuthContext] Refresh token attempt');
    try {
      await authService.refreshToken();
      console.log('[AuthContext] Token refresh successful');
    } catch (error) {
      console.log('[AuthContext] Token refresh failed, logging out:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  // Only consider authenticated if we have a verified user and not loading
  const isAuthenticated = !!user && !isLoading;
  
  // Debug logging for authentication state
  React.useEffect(() => {
    console.log('[AuthContext] Auth state changed - user:', !!user, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  }, [user, isLoading, isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallback = <div>アクセス権限がありません</div>,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login will be handled by the router
    return null;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      user.permissions?.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Hook to check specific permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
  };
};