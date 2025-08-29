import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// User roles definition
const USER_ROLES = {
  GLOBAL_ADMIN: 'Global Administrator',
  GENERAL_USER: 'General User',
  GUEST: 'Guest',
};

// Create authentication context
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          // Set a mock user for development
          const mockUser = {
            id: 'dev-user-001',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: USER_ROLES.GENERAL_USER,
            permissions: ['read', 'write', 'create_ticket'],
            avatar: null,
            department: 'IT Operations',
            lastLogin: new Date().toISOString()
          };
          setCurrentUser(mockUser);
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Mock login for development
      if (username && password) {
        const user = {
          id: `user-${Date.now()}`,
          name: username.includes('@') ? username.split('@')[0] : username,
          email: username.includes('@') ? username : `${username}@company.com`,
          role: USER_ROLES.GENERAL_USER,
          permissions: ['read', 'write', 'create_ticket'],
          avatar: null,
          department: 'IT Operations',
          lastLogin: new Date().toISOString()
        };

        const token = `mock-token-${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setLoginAttempts(0);
        setAccountLocked(false);
        setLockUntil(null);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setMfaRequired(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Permission check function
  const hasPermission = (permission) => {
    return currentUser?.permissions?.includes(permission) || false;
  };

  // MFA verification function
  const verifyMfa = async (code) => {
    try {
      setError(null);
      setLoading(true);
      
      // Mock MFA verification
      if (code && code.length === 6) {
        setMfaRequired(false);
        return { success: true };
      }
      
      return { success: false };
    } catch (err) {
      const errorMessage = err.message || 'MFA verification failed';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user sessions
  const fetchSessions = async () => {
    // Mock sessions data
    const mockSessions = [
      {
        id: 'session-1',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        lastActive: new Date().toISOString(),
        current: true
      }
    ];
    setSessions(mockSessions);
    return mockSessions;
  };

  // Revoke session
  const revokeSession = async (sessionId) => {
    try {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      return true;
    } catch (error) {
      console.error('Failed to revoke session:', error);
      return false;
    }
  };

  // Report subscription (mock)
  const subscribeToReports = async (reportTypes, frequency) => {
    console.log('Subscribed to reports:', { reportTypes, frequency });
    return true;
  };

  // Report generation (mock)
  const generateReport = async (reportType, period, format) => {
    console.log('Generating report:', { reportType, period, format });
    return { success: true, downloadUrl: '#' };
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!currentUser,
    USER_ROLES,
    subscribeToReports,
    generateReport,
    mfaRequired,
    verifyMfa,
    sessions,
    fetchSessions,
    revokeSession,
    loginAttempts,
    accountLocked,
    lockUntil,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;