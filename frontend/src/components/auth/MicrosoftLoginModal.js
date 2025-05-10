import React, { useState } from 'react';
import axios from 'axios';

const MicrosoftLoginModal = ({ onClose, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // クライアントクレデンシャル認証実行
  const handleClientCredentialAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/client_credential`
      );

      if (response.data.status === 'success') {
        // 認証成功 - 親コンポーネントに通知
        onLogin({
          token: response.data.access_token,
          expiresIn: response.data.expires_in
        });
      } else {
        setError(response.data.message || '認証に失敗しました');
      }
    } catch (err) {
      setError('認証サービスに接続できませんでした');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  // シンプルな認証ボタンのみを表示
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative p-8 bg-white w-full max-w-md m-auto rounded-lg shadow-lg">
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="text-center mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft Logo"
            className="h-6 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold">Microsoftでサインイン</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={handleClientCredentialAuth}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center mx-auto"
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            サインイン
          </button>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-500 text-center">
            このサイトにはMicrosoft IDフェデレーションが使用されています。
            <br />
            <a href="#" className="text-blue-600">
              プライバシーとCookie
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MicrosoftLoginModal;
