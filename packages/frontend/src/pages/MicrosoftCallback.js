import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MicrosoftCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithMicrosoft } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState('microsoft'); // 'microsoft' または 'hengeoine'

  // Microsoft認証設定
  const msAuthConfig = {
    clientId: process.env.REACT_APP_MS_CLIENT_ID || '12345678-1234-1234-1234-123456789012', // 環境変数から取得、またはテスト用の代替ID
    redirectUri: 'https://localhost:5000/auth/callback', // グローバル管理者が設定したURL
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_MS_TENANT_ID || 'common'}`, // テナントIDを使用
    scopes: ['openid', 'profile', 'email', 'User.Read'],
  };

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // URLクエリパラメータから認証情報を取得
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const error = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');
        const sessionState = queryParams.get('session_state');

        // エラーパラメータの確認
        if (error) {
          console.error('認証エラー:', errorDescription || error);

          // エラーメッセージを表示
          setError(`認証エラー: ${errorDescription || error}`);
          setLoading(false);
          return;
        }

        // 認証コードがない場合
        if (!code) {
          throw new Error('認証コードが取得できませんでした。');
        }

        // 開発用: コンソールに認証コードの存在を記録
        console.log('認証コードを受信しました');
        console.log('セッション状態:', sessionState);

        // 実際の環境では、この認証コードを使ってトークンを取得し、
        // Microsoft Graph APIでユーザー情報を取得します

        // 実際のログイン情報に近い模擬ユーザー情報を生成
        // 注: 実環境では認証コードを使ってトークンを取得し、
        //    そのトークンでGraph APIからこれらの情報を取得します

        // 実際のリクエスト情報から得られるユーザー情報（モック）
        const email = queryParams.get('login_hint') || 'taro.yamada@contoso.com';
        const state = queryParams.get('state') || '';

        // セッション情報からユーザーIDを生成
        const userId = sessionState
          ? sessionState.substring(0, 8)
          : code.substring(0, 8);

        // 実際のMicrosoft Entra IDから返ってくるユーザー情報に近いデータを構築
        const mockUserData = {
          account: {
            // Graph APIから返されるユーザー表示名（Microsoft Entra IDに登録された名前）
            name: '山田 太郎', // Microsoft Entra IDに登録されている実際の表示名
            // 認証に使用したメールアドレス（UPN）
            username: email,
            // アカウント識別子
            homeAccountId: `${userId}.a7232f7a-a9e5-4f71-9372-dc8b1c6645ea`,
            // アカウント環境（組織名など）
            environment: 'Microsoft Entra ID',
            tenantId: 'a7232f7a-a9e5-4f71-9372-dc8b1c6645ea',
          },
          // 開発環境用のアクセストークン
          accessToken: `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.${code.substring(0, 10)}`,
        };

        console.log('認証ユーザー情報:', {
          displayName: mockUserData.account.name,
          userPrincipalName: mockUserData.account.username,
          environment: mockUserData.account.environment,
        });

        // 認証処理（模擬データを渡す）
        const success = await loginWithMicrosoft(mockUserData);

        if (success) {
          // 認証成功
          navigate('/dashboard');
        } else {
          throw new Error('認証に失敗しました');
        }
      } catch (err) {
        console.error('認証エラー:', err);
        setError(err.message || '認証処理中にエラーが発生しました');
        setLoading(false);
      }
    };

    handleAuth();
  }, [loginWithMicrosoft, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-secondary-700">
          {authType === 'hengeoine' ? 'HENGEOINE認証' : 'Microsoft認証'}
          処理中...
        </h2>
        <p className="mt-2 text-secondary-500">しばらくお待ちください</p>

        {authType === 'hengeoine' && (
          <div className="mt-4 max-w-md text-center">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded-sm">HENGEOINE</span>
              <p className="text-sm text-blue-800 mt-1">
                フェデレーション認証からのコールバックを処理しています
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-md">
          <div className="flex items-center mb-2">
            {authType === 'hengeoine' ? (
              <>
                <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded-sm mr-2">HENGEOINE</span>
                <p className="font-bold">フェデレーション認証エラー</p>
              </>
            ) : (
              <p className="font-bold">Microsoft認証エラー</p>
            )}
          </div>
          <p>{error}</p>
          <p className="text-xs mt-2 text-red-600">
            {authType === 'hengeoine'
              ? 'HENGEOINE認証サーバーからの応答に問題がありました。'
              : 'Microsoft認証サーバーからの応答に問題がありました。'}
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          ログインページに戻る
        </button>
      </div>
    );
  }

  return null;
}

export default MicrosoftCallback;
