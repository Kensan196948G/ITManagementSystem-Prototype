import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MicrosoftAuth() {
  const navigate = useNavigate();
  const { loginWithMicrosoft } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Microsoft認証設定
  const msAuthConfig = {
    clientId: process.env.REACT_APP_MS_CLIENT_ID,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    authority: process.env.REACT_APP_MS_AUTHORITY,
    scopes: ['openid', 'profile', 'email', 'User.Read'],
  };

  // コンポーネントマウント時にMicrosoft認証を開始
  useEffect(() => {
    const startAuth = async () => {
      try {
        // Microsoft認証URLを構築
        const authUrl = new URL(`${msAuthConfig.authority}/oauth2/v2.0/authorize`);
        authUrl.searchParams.append('client_id', msAuthConfig.clientId);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', msAuthConfig.redirectUri);
        authUrl.searchParams.append('scope', msAuthConfig.scopes.join(' '));
        authUrl.searchParams.append('response_mode', 'query');
        authUrl.searchParams.append('state', btoa(JSON.stringify({ timestamp: new Date().getTime() })));

        // 本番環境では実際の認証フローを実行
        window.location.href = authUrl.toString();
      } catch (err) {
        console.error('認証エラー:', err);
        setError('認証処理中にエラーが発生しました。もう一度お試しください。');
        setLoading(false);
      }
    };

    startAuth();
  }, [loginWithMicrosoft, navigate, msAuthConfig]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <div>
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-12 w-12 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Microsoft認証処理中...</h2>
            <p className="text-gray-600">しばらくお待ちください</p>
          </div>
        ) : (
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              ログインページに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MicrosoftAuth;
