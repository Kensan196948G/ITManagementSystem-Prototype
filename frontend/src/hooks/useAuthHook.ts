import { useState, useCallback, useEffect } from 'react';
import * as msal from '@azure/msal-browser';
import axios, { AxiosError } from 'axios';
import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
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
    GUEST: 'ゲスト'
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
        }
    }));

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
    });
};

// 認証フック
export const useAuthHook = () => {
    const [msalInstance, setMsalInstance] = useState<msal.PublicClientApplication | null>(null);
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
        createApolloClient(null)
    );

    // トークン取得関数 (サイレント)
    const acquireTokenSilent = useCallback(async () => {
        if (!msalInstance) {
            console.error('MSALインスタンスが初期化されていません');
            return null;
        }

        const account = msalInstance.getAllAccounts()[0];
        if (!account) {
            console.warn('認証アカウントが見つかりません');
            return null;
        }

        try {
            const response = await msalInstance.acquireTokenSilent({
                scopes: ['https://graph.microsoft.com/.default'],
                account
            });

            if (response.accessToken) {
                localStorage.setItem('msal_token', response.accessToken);
                const expiryDate = new Date();
                expiryDate.setSeconds(expiryDate.getSeconds() + (response.expiresOn?.getTime() ?? 0) - 300);
                localStorage.setItem('msal_token_expiry', expiryDate.toISOString());
                setTokenExpiration(expiryDate);
                return response.accessToken;
            }
        } catch (err) {
            console.error('サイレントトークン取得エラー:', err);
            throw err;
        }
    }, [msalInstance]);

    // 初期化処理
    useEffect(() => {
        const msalConfig = {
            auth: {
                clientId: '22e5d6e4-805f-4516-af09-ff09c7c224c4',
                authority: 'https://login.microsoftonline.com/a7232f7a-a9e5-4f71-9372-dc8b1c6645ea'
            }
        };
        setMsalInstance(new msal.PublicClientApplication(msalConfig));
    }, []);

    // トークン自動更新
    useEffect(() => {
        if (!tokenExpiration) return;

        const checkTokenExpiration = () => {
            const now = new Date();
            if (tokenExpiration && now >= tokenExpiration) {
                acquireTokenSilent().catch(err => {
                    console.error('トークン自動更新エラー:', err);
                    setError('セッションの更新に失敗しました。再ログインしてください。');
                    logout();
                });
            }
        };

        const interval = setInterval(checkTokenExpiration, 60000);
        return () => clearInterval(interval);
    }, [tokenExpiration, acquireTokenSilent]);

    // ログイン関数
    const login = async (username: string, password: string) => {
        try {
            setError(null);
            setLoading(true);

            localStorage.removeItem('msal_token');
            localStorage.removeItem('msal_token_expiry');
            localStorage.removeItem('token');

            const response = await axios.post('/api/auth/login', { username, password }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                const account = msalInstance?.getAllAccounts()[0];
                if (account) {
                    setCurrentUser({
                        id: account.localAccountId,
                        username: account.username || '',
                        name: account.name || '',
                        email: account.username || '',
                        role: 'user',
                        permissions: ['read']
                    });
                }
                setLoginAttempts(0);
                setAccountLocked(false);
                setLockUntil(null);
                return true;
            }
            return false;
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'ログインに失敗しました。もう一度お試しください';
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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
    const hasPermission = (permission: string) => {
        return currentUser?.permissions?.includes(permission) ?? false;
    };

    return {
        msalInstance,
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
        setLoading
    };
};