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
      
      // 開発モードで、かつMSユーザー情報がある場合はモックデータを設定
      const msUserInfo = localStorage.getItem('msUserInfo');
      if (DEV_MODE && msUserInfo) {
        try {
          const userInfo = JSON.parse(msUserInfo);
          
          // Microsoft ADユーザーのモックデータを作成
          const mockMsUser = {
            id: 'ms-dev-user',
            first_name: userInfo.displayName?.split(' ')[0] || '太郎',
            last_name: userInfo.displayName?.split(' ')[1] || '山田',
            email: userInfo.userPrincipalName || 'dev@example.com',
            role: USER_ROLES.GENERAL_USER,
            department: '開発部門',
            permissions: ['read', 'write', 'api_access'],
            microsoftInfo: userInfo
          };
          
          console.log('開発モード: Microsoftユーザー情報をセット', mockMsUser);
          setCurrentUser(mockMsUser);
          setLoading(false);
          return;
        } catch (err) {
          console.error('開発モードユーザー設定エラー:', err);
        }
      }
      
      // 通常の認証チェック（開発モードでない場合、またはMSユーザー情報がない場合）
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (token && userRole) {
        try {
          if (MOCK_USERS[userRole]) {
            // モックユーザーデータをセット
            setCurrentUser(MOCK_USERS[userRole]);
          } else if (userRole === 'msuser') {
            // MSユーザーだが詳細情報がない場合
            const mockMsUser = {
              id: 'ms-user-default',
              first_name: '太郎',
              last_name: '山田',
              email: 'taro.yamada@example.com',
              role: USER_ROLES.GENERAL_USER,
              permissions: ['read', 'write'],
              microsoftInfo: {
                displayName: '山田 太郎',
                userPrincipalName: 'taro.yamada@example.com',
                accountType: 'Microsoft Entra ID'
              }
            };
            setCurrentUser(mockMsUser);
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
          permissions: ['read', 'write', 'api_access'],
          microsoftInfo: {
            displayName: '開発 ユーザー',
            userPrincipalName: 'dev@example.com',
            accountType: 'Development'
          }
        };
        console.log('開発モード: デフォルトユーザーを設定', defaultUser);
        setCurrentUser(defaultUser);
      }
      
      setLoading(false);
    };

    // 認証状態チェックを即時実行（開発モードではすぐに認証完了状態にする）
    checkAuthStatus();
  }, []);

  // Microsoft認証処理関数
  const loginWithMicrosoft = async (msUserData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Microsoft Graph API からのレスポンスを扱う場合
      if (msUserData && msUserData.account) {
        console.log('Microsoft認証成功 - 実際のユーザーデータ:', msUserData);
        
        // Microsoft ADからのユーザー情報を処理
        const msUser = {
          id: msUserData.account.homeAccountId || 'ms-user',
          first_name: msUserData.account.name ? msUserData.account.name.split(' ')[0] : '名前なし',
          last_name: msUserData.account.name ? msUserData.account.name.split(' ')[1] || '' : '',
          email: msUserData.account.username || 'unknown@example.com',
          // MSユーザーのロールは固定または別途APIから取得する
          role: USER_ROLES.GENERAL_USER,
          department: msUserData.account.department || '未設定',
          permissions: ['read', 'write'],
          avatar: null,
          // Microsoft独自の情報を保存
          microsoftInfo: {
            displayName: msUserData.account.name || 'Microsoft User',
            userPrincipalName: msUserData.account.username,
            tenantId: msUserData.account.homeAccountId?.split('.')[1] || '',
            accountType: msUserData.account.environment || 'Azure AD',
            // その他のMicrosoft固有情報
          }
        };
        
        // トークン保存
        const token = msUserData.accessToken || ('ms-token-' + Math.random().toString(36).substring(2));
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', 'msuser');  // Microsoftユーザーのマーカー
        localStorage.setItem('msUserInfo', JSON.stringify({
          displayName: msUser.microsoftInfo.displayName,
          userPrincipalName: msUser.microsoftInfo.userPrincipalName,
          accountType: msUser.microsoftInfo.accountType
        }));
        
        setCurrentUser(msUser);
        setLoading(false);
        return true;
      } else {
        console.log('Microsoft認証をモックモードで実行中...');
        
        // モック認証: Microsoft認証情報がない場合
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒遅延で認証を模擬
        
        // Microsoft ADユーザーを模擬
        // ログイン時のメールアドレスから名前生成（実際の環境ではGraph APIから取得）
        const loginEmail = 'microsoft.login@contoso.com'; // 実際の環境では認証時に使用したメールアドレス
        const nameParts = loginEmail.split('@')[0].split('.');
        const firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[0] : '';
        
        // メールアドレスから推測したフルネーム（姓名）
        const fullName = lastName && firstName 
          ? `${lastName} ${firstName}` 
          : firstName;
          
        const mockMsUser = {
          id: 'ms-user-123',
          first_name: firstName,
          last_name: lastName,
          email: loginEmail,
          role: USER_ROLES.GENERAL_USER,
          department: '自動取得部署',
          permissions: ['read', 'write'],
          avatar: null,
          // Microsoft独自の情報
          microsoftInfo: {
            // 実際のMicrosoft Entra IDから取得される情報（ここではメールからの推測）
            displayName: fullName,      // 表示名（Microsoft Graph APIのdisplayName）
            userPrincipalName: loginEmail, // UPN（ログインに使用されたメールアドレス）
            tenantId: 'a7232f7a-a9e5-4f71-9372-dc8b1c6645ea',
            accountType: 'Microsoft Entra ID',
          }
        };
        
        const token = 'mock-ms-token-' + Math.random().toString(36).substring(2);
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', 'msuser');
        localStorage.setItem('msUserInfo', JSON.stringify({
          displayName: mockMsUser.microsoftInfo.displayName,
          userPrincipalName: mockMsUser.microsoftInfo.userPrincipalName,
          accountType: mockMsUser.microsoftInfo.accountType
        }));
        
        setCurrentUser(mockMsUser);
        setLoading(false);
        
        console.log('Microsoft認証成功（モックモード）');
        return true;
      }
    } catch (err) {
      console.error('Microsoft認証エラー:', err);
      setError('Microsoft認証に失敗しました。再度お試しください。');
      setLoading(false);
      return false;
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
    loginWithMicrosoft,
    logout,
    hasPermission,
    isAuthenticated: !!currentUser,
    USER_ROLES // ロール定数をエクスポート
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// カスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};
