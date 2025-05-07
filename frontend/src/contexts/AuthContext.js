import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as msal from '@azure/msal-browser';

// 認証コンテキストの作成
const AuthContext = createContext();

// 開発用のモックユーザーロール
const USER_ROLES = {
  GLOBAL_ADMIN: 'グローバル管理者',
  GENERAL_USER: '一般ユーザー',
  GUEST: 'ゲスト'
};

// 開発用のモックユーザーデータ
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
  },
  'user': {
    id: '2',
    first_name: '一郎',
    last_name: '鈴木',
    email: 'ichiro.suzuki@example.com',
    role: USER_ROLES.GENERAL_USER,
    department: 'IT部門',
    permissions: ['read', 'write'],
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  'guest': {
    id: '3',
    first_name: '次郎',
    last_name: '佐藤',
    email: 'jiro.sato@example.com',
    role: USER_ROLES.GUEST,
    department: '営業部',
    permissions: ['read'],
    avatar: 'https://i.pravatar.cc/150?img=3'
  }
};

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msalInstance, setMsalInstance] = useState(null);
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
          }
        } else {
          // トークンがないか期限切れの場合、新しいトークンを取得
          await acquireTokenSilent();
        }
      } catch (err) {
        console.error('認証チェックエラー:', err);
        setError('認証チェック中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    // 認証状態チェックを即時実行（開発モードではすぐに認証完了状態にする）
    checkAuthStatus();
  }, []);

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
    }
  };

  // トークン取得関数 (サイレント)
  const acquireTokenSilent = useCallback(async () => {
    try {
      if (!msalInstance) return;

      const account = msalInstance.getAllAccounts()[0];
      if (!account) {
        throw new Error('認証アカウントが見つかりません');
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

        // ユーザー情報を設定
        const account = msalInstance.getAllAccounts()[0];
        setCurrentUser({
          id: account.localAccountId,
          name: account.name,
          email: account.username,
          role: USER_ROLES.GENERAL_USER,
          permissions: ['read', 'write']
        });

        return response.accessToken;
      }
    } catch (err) {
      console.error('サイレントトークン取得エラー:', err);
      throw err;
    }
  }, [msalInstance]);

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
    lockUntil
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// カスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};
