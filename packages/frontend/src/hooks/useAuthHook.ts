import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import {
  ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// 共通型定義
export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
};

export type Session = {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActiveAt: Date;
};

export type ReportData = {
  type: string;
  period: string;
  generatedAt: string;
  data: {
    title: string;
    summary: string;
    url: string;
  };
};

export const USER_ROLES = {
  GLOBAL_ADMIN: 'グローバル管理者',
  GENERAL_USER: '一般ユーザー',
  GUEST: 'ゲスト',
};

// Apollo Client初期化関数
const createApolloClient = (token: string | null) => {
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

// 認証フック
export const useAuthHook = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject>>(
    createApolloClient(null),
  );

  // ログイン関数
  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      localStorage.removeItem('token');

      const response = await axios.post('/api/auth/login', { username, password }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setCurrentUser({
          id: response.data.user?.id || '',
          username: response.data.user?.username || '',
          name: response.data.user?.name || '',
          email: response.data.user?.email || '',
          role: response.data.user?.role || 'user',
          permissions: response.data.user?.permissions || ['read'],
        });
        setLoginAttempts(0);
        setAccountLocked(false);
        setLockUntil(null);
        return true;
      }
      return false;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message
        || err.message
        || 'ログインに失敗しました。もう一度お試しください';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ログアウト関数
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (err) {
      console.error('ログアウトエラー:', err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setTokenExpiration(null);
      setMfaRequired(false);
    }
  };

  // 権限チェック
  const hasPermission = (permission: string) => currentUser?.permissions?.includes(permission) ?? false;

  return {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!currentUser,
    mfaRequired,
    sessions,
    loginAttempts,
    accountLocked,
    lockUntil,
    apolloClient,
    setCurrentUser,
    setError,
    setLoading,
  };
};
