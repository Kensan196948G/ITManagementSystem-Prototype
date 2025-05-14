import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as msal from '@azure/msal-browser';
import axios from 'axios';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
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
  sessions: any[];
  fetchSessions: () => Promise<any[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  loginAttempts: number;
  accountLocked: boolean;
  lockUntil: Date | null;
  apolloClient: ApolloClient<any>;
};

// Apollo Client初期化関数
const createApolloClient = (token) => {
  const httpLink = createHttpLink({
    uri: '/graphql',
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      }
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

// 認証コンテキストの作成
const AuthContext = createContext < AuthContextType | undefined > (undefined);

// 開発用のモックユーザーロール
const USER_ROLES = {
  GLOBAL_ADMIN: 'グローバル管理者',
  GENERAL_USER: '一般ユーザー',
  GUEST: 'ゲスト'
};

// 開発用のモックユーザーデータ（ESLint警告を抑制）
// eslint-disable-next-line
const MOCK_USERS = {
  'admin': {
    id: '1',
    first_name: '太郎',
    last_name: '山田',
    email: 'taro.yamada@example.com',
    role: USER_ROLES.GLOBAL_ADMIN,
    department: 'IT部門',
    permissions: ['admin', 'read', 'write', 'api_management'],
    avatar: 'https://i.pravatar.cc/150?img=1'
  }
};

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  // MSALインスタンスの初期化
  const [msalInstance, setMsalInstance] = useState(() => {
    const msalConfig = {
      auth: {
        clientId: '22e5d6e4-805f-4516-af09-ff09c7c224c4',
        authority: 'https://login.microsoftonline.com/a7232f7a-a9e5-4f71-9372-dc8b1c6645ea'
      }
    };
    return new msal.PublicClientApplication(msalConfig);
  });

  // トークン取得関数 (サイレント)
  const acquireTokenSilent = useCallback(async () => {
    try {
      if (!msalInstance) {
        console.error('MSALインスタンスが初期化されていません');
        return null;
      }

      const account = msalInstance.getAllAccounts()[0];
      if (!account) {
        console.warn('認証アカウントが見つかりません');
        return null;
      }

      const response = await msalInstance.acquireTokenSilent({
        scopes: ['https://graph.microsoft.com/.default'],
        account: account
      });

      if (response.accessToken) {
        // トークンを保存
        localStorage.setItem('msal_token', response.accessToken);
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + response.expiresIn - 300); // 5分前に更新
        localStorage.setItem('msal_token_expiry', expiryDate.toISOString());
        setTokenExpiration(expiryDate);

        console.log('トークン取得成功:', {
          expiresIn: response.expiresIn,
          scopes: response.scopes
        });

        return response.accessToken;
      }
    } catch (err) {
      console.error('サイレントトークン取得エラー:', {
        errorCode: err.errorCode,
        message: err.message,
        stack: err.stack
      });
      throw err;
    }
  }, [msalInstance]);

  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);

  // 開発モード: ユーザー認証状態の確認
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // MSALインスタンスの初期化
        const msalConfig = {
          auth: {
            clientId: '22e5d6e4-805f-4516-af09-ff09c7c224c4', // config.jsonのClientId
            authority: 'https://login.microsoftonline.com/a7232f7a-a9e5-4f71-9372-dc8b1c6645ea' // config.jsonのTenantId
          }
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);
        setMsalInstance(msalInstance);

        // 既存のトークンをチェック
        const token = localStorage.getItem('msal_token');
        const tokenExpiry = localStorage.getItem('msal_token_expiry');

        if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
          // 有効なトークンがある場合
          const account = msalInstance.getAllAccounts()[0];
          if (account) {
            setCurrentUser({
              id: account.localAccountId,
              name: account.name,
              email: account.username,
              role: USER_ROLES.GENERAL_USER,
              permissions: ['read', 'write']
            });
            console.log('既存の有効なトークンを使用');
          }
        } else {
          // トークンがないか期限切れの場合、新しいトークンを取得
          try {
            const token = await acquireTokenSilent();
            if (token) {
              const account = msalInstance.getAllAccounts()[0];
              if (account) {
                setCurrentUser({
                  id: account.localAccountId,
                  name: account.name,
                  email: account.username,
                  role: USER_ROLES.GENERAL_USER,
                  permissions: ['read', 'write']
                });
                console.log('新しいトークンを取得');
              }
            }
          } catch (tokenError) {
            console.error('トークン取得エラー:', {
              message: tokenError.message,
              stack: tokenError.stack
            });
            setError('認証トークンの取得に失敗しました');
          }
        }
      } catch (err) {
        console.error('認証チェックエラー:', {
          message: err.message,
          stack: err.stack
        });
        setError('認証チェック中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    // 認証状態チェックを即時実行（開発モードではすぐに認証完了状態にする）
    checkAuthStatus();
  }, [acquireTokenSilent]);

  // レポート購読設定関数
  const subscribeToReports = async (reportTypes = [], frequency = 'weekly') => {
    try {
      setError(null);

      // APIコールをシミュレート
      console.log(`レポート購読設定: タイプ=${reportTypes.join(',')}, 頻度=${frequency}`);

      // 成功メッセージをコンソールに表示
      console.log('レポート購読設定が保存されました');
      return true;
    } catch (err) {
      console.error('レポート購読エラー:', err);
      setError('レポート購読設定の保存に失敗しました。');
      return false;
    }
  };

  // レポート生成関数
  const generateReport = async (reportType, period, format = 'html') => {
    try {
      setError(null);
      setLoading(true);

      // APIコールをシミュレート
      console.log(`レポート生成: タイプ=${reportType}, 期間=${period}, 形式=${format}`);

      // 非同期操作をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1500));

      // レポートデータのモック作成
      const reportData = {
        type: reportType,
        period: period,
        generatedAt: new Date().toISOString(),
        data: {
          title: `${reportType}レポート (${period})`,
          summary: 'これはシミュレートされたレポートデータです。',
          url: `/reports/${reportType}_${period}.${format}`
        }
      };

      console.log('レポート生成完了:', reportData);
      setLoading(false);
      return reportData;
    } catch (err) {
      console.error('レポート生成エラー:', err);
      setError('レポート生成中にエラーが発生しました。');
      setLoading(false);
      return null;
    }
  };

  // 通常ログイン関数
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // 既存のトークンを全てクリア
      localStorage.removeItem('msal_token');
      localStorage.removeItem('msal_token_expiry');
      localStorage.removeItem('token');

      // 最小限のヘッダーでリクエスト
      const response = await axios.post('/api/auth/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setCurrentUser({ username });
        setLoginAttempts(0);
        setAccountLocked(false);
        setLockUntil(null);
        return true;
      }
    } catch (error) {
      if (process.env.REACT_APP_ENV === 'development') {
        console.error('ログイン失敗:', {
          status: error.response?.status || '応答なし',
          message: error.message,
          details: error.response?.data || '詳細情報なし'
        });
      }

      // ユーザー向けの統一されたエラーメッセージ
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'ログインに失敗しました。もう一度お試しください';

      if (error.response?.status === 401) {
        setError(errorMessage);
      } else if (error.response?.status === 403) {
        setError('アカウントがロックされています。後ほど再度お試しください。');
      } else {
        setError(errorMessage);
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /*
  // 本番用ログイン関数 (コメントアウト)
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // アカウントがロックされている場合
      if (accountLocked && lockUntil && new Date(lockUntil) > new Date()) {
        const minutesLeft = Math.ceil((new Date(lockUntil) - new Date()) / (1000 * 60));
        throw new Error(`アカウントが一時的にロックされています。あと${minutesLeft}分お待ちください。`);
      }

      // APIにログインリクエストを送信
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ログイン失敗時の処理
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // 3回失敗で警告、5回失敗でロック
        if (newAttempts >= 3 && newAttempts < 5) {
          setError(`ログインに失敗しました。あと${5 - newAttempts}回失敗するとアカウントがロックされます。`);
        } else if (newAttempts >= 5) {
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + 30); // 30分間ロック
          setAccountLocked(true);
          setLockUntil(lockTime);
          setError(`アカウントが一時的にロックされています。あと30分お待ちください。`);
        }

        throw new Error(data.message || 'ログインに失敗しました');
      }

      // ログイン成功時はカウンターをリセット
      setLoginAttempts(0);
      setAccountLocked(false);
      setLockUntil(null);

      if (data.mfa_required) {
        // MFAが必要な場合
        setMfaRequired(true);
        return { mfaRequired: true };
      }

      // トークンを保存
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // ユーザー情報を取得
      await fetchUserData();
      
      return { success: true };
    } catch (err) {
      console.error('ログインエラー:', err);
      setError(err.message || 'ログインに失敗しました。');
      return false;
    } finally {
      setLoading(false);
    }
  };
  */


  // トークン自動更新用のエフェクト
  useEffect(() => {
    if (!tokenExpiration) return;

    const checkTokenExpiration = () => {
      const now = new Date();
      if (now >= tokenExpiration) {
        acquireTokenSilent().catch(err => {
          console.error('トークン自動更新エラー:', err);
          setError('セッションの更新に失敗しました。再ログインしてください。');
          logout();
        });
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000); // 1分ごとにチェック
    return () => clearInterval(interval);
  }, [tokenExpiration, acquireTokenSilent]);

  // ログアウト関数
  const logout = async () => {
    try {
      // バックエンドにログアウトリクエストを送信
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
    } catch (err) {
      console.error('ログアウトエラー:', err);
    }

    // ローカルストレージをクリア
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    setTokenExpiration(null);
    setMfaRequired(false);
    console.log('ログアウトしました');
  };

  // 権限チェック関数
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  // MFA検証関数
  const verifyMfa = async (code) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'MFA検証に失敗しました');
      }

      // トークンを保存
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // ユーザー情報を取得
      await fetchUserData();
      setMfaRequired(false);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ユーザーデータ取得関数
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ユーザー情報の取得に失敗しました');
      }

      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      console.error('ユーザーデータ取得エラー:', err);
      throw err;
    }
  };

  // アクティブセッション取得
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'セッション情報の取得に失敗しました');
      }

      setSessions(data.sessions);
      return data.sessions;
    } catch (err) {
      console.error('セッション取得エラー:', err);
      throw err;
    }
  };

  // セッション取り消し
  const revokeSession = async (sessionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'セッションの取り消しに失敗しました');
      }

      // セッションリストを更新
      await fetchSessions();
      return true;
    } catch (err) {
      console.error('セッション取り消しエラー:', err);
      throw err;
    }
  };

  // Apollo Clientインスタンス
  const [apolloClient, setApolloClient] = useState(() => createApolloClient(null));

  // トークン変更時にApollo Clientを更新
  useEffect(() => {
    const token = localStorage.getItem('msal_token');
    setApolloClient(createApolloClient(token));
  }, [currentUser]);

  // 提供する値
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
    apolloClient
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
