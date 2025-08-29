import React, {
  createContext, useState, useContext, useEffect, useCallback, ReactNode,
} from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as msal from '@azure/msal-browser';

import {
  ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 型定義
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
};

type Session = {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  current: boolean;
};

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isAuthenticated: boolean;
  USER_ROLES: typeof USER_ROLES;
  subscribeToReports: (reportTypes: string[], frequency: string) => Promise<boolean>;
  generateReport: (reportType: string, period: string, format: string) => Promise<any>;
  mfaRequired: boolean;
  verifyMfa: (code: string) => Promise<{ success: boolean }>;
  sessions: Session[];
  fetchSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  loginAttempts: number;
  accountLocked: boolean;
  lockUntil: Date | null;
  apolloClient: ApolloClient<NormalizedCacheObject>;
};

type AuthProviderProps = {
  children: ReactNode;
};

// Apollo Client初期化関数
const createApolloClient = (token: string | null): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({
    uri: '/graphql',
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ユーザーロール定義
const USER_ROLES = {
  GLOBAL_ADMIN: 'グローバル管理者',
  GENERAL_USER: '一般ユーザー',
  GUEST: 'ゲスト',
} as const;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [msalInstance, setMsalInstance] = useState<msal.PublicClientApplication | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(null);
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [accountLocked, setAccountLocked] = useState<boolean>(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>(() => createApolloClient(null));

  // トークン取得関数 (サイレント)
  const acquireTokenSilent = useCallback(async (): Promise<string | null> => {
    try {
      if (!msalInstance) {
        console.error('MSALインスタンスが初期化されていません');
        return null;
      }

      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        console.warn('認証アカウントが見つかりません');
        return null;
      }

      const response = await msalInstance.acquireTokenSilent({
        scopes: ['https://graph.microsoft.com/.default'],
        account: accounts[0],
      });

      if (response.accessToken) {
        localStorage.setItem('msal_token', response.accessToken);
        const expiryDate = new Date();
        if (!response.expiresOn) {
          throw new Error('認証レスポンスに有効期限が含まれていません');
        }
        const expiresIn = (response.expiresOn.getTime() - Date.now()) / 1000;
        expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn - 300);
        localStorage.setItem('msal_token_expiry', expiryDate.toISOString());
        setTokenExpiration(expiryDate);

        return response.accessToken;
      }
      return null;
    } catch (err) {
      console.error('サイレントトークン取得エラー:', err);
      throw err;
    }
  }, [msalInstance]);

  // 開発モード: ユーザー認証状態の確認
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const msalConfig: msal.Configuration = {
          auth: {
            clientId: '22e5d6e4-805f-4516-af09-ff09c7c224c4',
            authority: 'https://login.microsoftonline.com/a7232f7a-a9e5-4f71-9372-dc8b1c6645ea',
          },
        };

        const instance = new msal.PublicClientApplication(msalConfig);
        setMsalInstance(instance);

        const token = localStorage.getItem('msal_token');
        const tokenExpiry = localStorage.getItem('msal_token_expiry');

        if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            setCurrentUser({
              id: accounts[0].localAccountId,
              name: accounts[0].name || '',
              email: accounts[0].username || '',
              role: USER_ROLES.GENERAL_USER,
              permissions: ['read', 'write'],
            });
          }
        } else {
          try {
            const newToken = await acquireTokenSilent();
            if (newToken) {
              const accounts = instance.getAllAccounts();
              if (accounts.length > 0) {
                setCurrentUser({
                  id: accounts[0].localAccountId,
                  name: accounts[0].name || '',
                  email: accounts[0].username || '',
                  role: USER_ROLES.GENERAL_USER,
                  permissions: ['read', 'write'],
                });
              }
            }
          } catch (tokenError) {
            console.error('トークン取得エラー:', tokenError);
            setError('認証トークンの取得に失敗しました');
          }
        }
      } catch (err) {
        console.error('認証チェックエラー:', err);
        setError('認証チェック中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [acquireTokenSilent]);

  // 通常ログイン関数
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      localStorage.removeItem('msal_token');
      localStorage.removeItem('msal_token_expiry');
      localStorage.removeItem('token');

      const response = await axios.post('/api/auth/login', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setCurrentUser({
          id: 'dev-user',
          name: '開発ユーザー',
          email: username,
          role: USER_ROLES.GENERAL_USER,
          permissions: ['read', 'write'],
        });
        setLoginAttempts(0);
        setAccountLocked(false);
        setLockUntil(null);
        return true;
      }
      return false;
    } catch (error) {
      const err = error as AxiosError;
      const errorMessage = (err as AxiosError<{ message?: string }>).response?.data?.message
        || (err as Error).message
        || 'ログインに失敗しました。もう一度お試しください';

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ログアウト関数
  const logout = async (): Promise<void> => {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (err) {
      console.error('ログアウトエラー:', err);
    }

    localStorage.removeItem('token');
    setCurrentUser(null);
    setTokenExpiration(null);
    setMfaRequired(false);
  };

  // 権限チェック関数
  const hasPermission = (permission: string): boolean => currentUser?.permissions.includes(permission) || false;

  // MFA検証関数
  const verifyMfa = async (code: string): Promise<{ success: boolean }> => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/api/auth/mfa/verify', { code });

      localStorage.setItem('token', response.data.access_token);
      await fetchUserData();
      setMfaRequired(false);

      return { success: true };
    } catch (err) {
      const errorMessage = (err as AxiosError<{ message?: string }>).response?.data?.message || 'MFA検証に失敗しました';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ユーザーデータ取得関数
  const fetchUserData = async (): Promise<User> => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const userData = response.data.user;
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      console.error('ユーザーデータ取得エラー:', err);
      throw err;
    }
  };

  // トークン自動更新用のエフェクト
  useEffect(() => {
    if (!tokenExpiration) return;

    const checkTokenExpiration = () => {
      if (new Date() >= tokenExpiration) {
        acquireTokenSilent().catch((err) => {
          console.error('トークン自動更新エラー:', err);
          setError('セッションの更新に失敗しました。再ログインしてください。');
          logout();
        });
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [tokenExpiration, acquireTokenSilent]);

  // トークン変更時にApollo Clientを更新
  useEffect(() => {
    const token = localStorage.getItem('msal_token');
    setApolloClient(createApolloClient(token));
  }, [currentUser]);

  // 提供する値
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!currentUser,
    USER_ROLES,
    subscribeToReports: async () => true,
    generateReport: async () => ({}),
    mfaRequired,
    verifyMfa,
    sessions,
    fetchSessions: async () => [],
    revokeSession: async () => true,
    loginAttempts,
    accountLocked,
    lockUntil,
    apolloClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
