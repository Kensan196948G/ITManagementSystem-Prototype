import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // 開発モード: ユーザー認証状態の確認
  useEffect(() => {
    const checkAuthStatus = async () => {
      // 開発モードフラグ - バックエンドが動作しない環境でのテスト用
      const DEV_MODE = true;
      
      // 通常の認証チェック
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (token && userRole) {
        try {
          if (MOCK_USERS[userRole]) {
            // モックユーザーデータをセット
            setCurrentUser(MOCK_USERS[userRole]);
          }
        } catch (err) {
          console.error('認証エラー:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          setCurrentUser(null);
        }
      } else if (DEV_MODE) {
        // 開発モードでユーザー情報がない場合は、デフォルトユーザーを設定
        const defaultUser = {
          id: 'dev-user',
          first_name: '開発',
          last_name: 'ユーザー',
          email: 'dev@example.com',
          role: USER_ROLES.GENERAL_USER,
          department: '開発部門',
          permissions: ['read', 'write', 'api_access']
        };
        console.log('開発モード: デフォルトユーザーを設定', defaultUser);
        setCurrentUser(defaultUser);
      }
      
      setLoading(false);
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
      
      // ログイン試行をコンソールに出力（デバッグ用）
      console.log(`ログイン試行: username=${username}, password=${password}`);
      
      // 入力チェック
      if (!username || !password) {
        console.error('入力エラー: ユーザー名またはパスワードが入力されていません');
        throw new Error('ユーザー名とパスワードを入力してください');
      }
      
      // テスト用アカウントの検証
      let userRole = null;
      
      // 厳密な比較で検証
      if (username === 'admin' && password === 'admin') {
        console.log('管理者アカウントでのログイン成功');
        userRole = 'admin'; // グローバル管理者
      } else if (username === 'user' && password === 'user') {
        console.log('一般ユーザーアカウントでのログイン成功');
        userRole = 'user'; // 一般ユーザー
      } else if (username === 'guest' && password === 'guest') {
        console.log('ゲストアカウントでのログイン成功');
        userRole = 'guest'; // ゲスト
      } else {
        console.error(`ログイン認証失敗: ユーザー ${username} は認証されませんでした`);
        throw new Error('ユーザー名またはパスワードが正しくありません');
      }
      
      // モックトークンとユーザー情報を設定
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', userRole);
      
      // ユーザー情報を設定
      console.log(`ユーザー情報設定: ${userRole}`, MOCK_USERS[userRole]);
      setCurrentUser(MOCK_USERS[userRole]);
      
      console.log(`ログイン成功: ${username} (${userRole}) - トークン: ${token}`);
      return true;
    } catch (err) {
      console.error('ログインエラー:', err);
      setError(err.message || 'ログインに失敗しました。');
      return false;
    }
  };

  // ログアウト関数
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    console.log('ログアウトしました');
  };

  // 権限チェック関数
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
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
    USER_ROLES, // ロール定数をエクスポート
    subscribeToReports, // レポート購読設定
    generateReport // レポート生成
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// カスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};
