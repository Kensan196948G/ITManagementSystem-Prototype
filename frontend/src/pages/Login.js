import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const {
    login,
    isAuthenticated,
    error: authError,
    logout,
    mfaRequired,
    verifyMfa,
    loading
  } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const navigate = useNavigate();

  // ユーザー名とパスワード用のステート
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 初回レンダリング追跡用
  const isInitialRender = React.useRef(true);
  
  // ログインページに直接アクセスした場合のみログアウト処理を行う
  useEffect(() => {
    // 初回レンダリング時のみログアウト処理を実行
    if (isInitialRender.current) {
      isInitialRender.current = false;
      
      // URLパラメータのチェック
      const queryParams = new URLSearchParams(location.search);
      const keepLoggedIn = queryParams.get('keepLoggedIn') === 'true';
      
      // 直接ログインページにアクセスした場合で、keepLoggedInパラメータがない場合のみログアウト
      if (!keepLoggedIn) {
        console.log('初期アクセス時のログアウト処理を実行');
        logout();
      }
    }
  }, [logout, location]);

  // ログイン後はダッシュボードへリダイレクト
  // ただし、初期レンダリング時はuseEffectでログアウト処理が行われるため問題ない
  if (isAuthenticated) {
    // リダイレクト先を指定（state経由で渡されたパスがあればそちらを優先）
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} />;
  }

  // ログイン処理
  const handleLogin = async () => {
    setError('');
    
    try {
      const result = await login(username, password);
      
      if (result?.mfaRequired) {
        // MFAが必要な場合はここで処理終了
        return;
      }
      
      if (result?.success) {
        navigate('/');
      }
    } catch (e) {
      const { accountLocked, lockUntil, loginAttempts } = useAuth();
      
      if (accountLocked && lockUntil) {
        const minutesLeft = Math.ceil((new Date(lockUntil) - new Date()) / (1000 * 60));
        setError(`アカウントが一時的にロックされています。あと${minutesLeft}分お待ちください。`);
      } else if (loginAttempts >= 3) {
        setError(`ログインに失敗しました。あと${5 - loginAttempts}回失敗するとアカウントがロックされます。`);
      } else {
        setError(e.message || 'ログインに失敗しました');
      }
    }
  };

  // MFA検証処理
  const handleVerifyMfa = async () => {
    setError('');
    
    try {
      const result = await verifyMfa(mfaCode);
      
      if (result?.success) {
        navigate('/');
      }
    } catch (e) {
      setError(e.message || 'MFAコードの検証に失敗しました');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600">ITSM</h1>
          <h2 className="mt-2 text-center text-xl font-bold text-secondary-900">
            ITサービス管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            ISO 20000 / ISO 27001 / ISO 27002 準拠
          </p>
        </div>
        
        {!mfaRequired ? (
          <div className="space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  ユーザー名
                </label>
                <input
                  id="username"
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="ユーザー名"
                  value={username || ''}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="パスワード"
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {(error || authError) && (
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700">{error || authError}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-secondary-700">
                  ログイン状態を保持
                </label>
              </div>

              <div className="text-sm">
                <Link to="/reset-password-request" className="text-primary-600 hover:text-primary-500">
                  パスワードをお忘れですか？
                </Link>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading || (accountLocked && lockUntil && new Date(lockUntil) > new Date())}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null}
                ログイン
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">2段階認証</h3>
              <p className="mt-1 text-sm text-gray-600">
                認証アプリで表示された6桁のコードを入力してください
              </p>
            </div>

            <div className="rounded-md shadow-sm">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>

            {(error || authError) && (
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700">{error || authError}</p>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleVerifyMfa}
                disabled={loading || mfaCode.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null}
                認証
              </button>
            </div>
          </div>
        )}
          
            <div className="mt-6">
              <div className="bg-primary-50 border border-primary-200 rounded-md p-3 text-sm">
                <p className="font-medium text-blue-700 mb-2">⚠️ これはモック環境です ⚠️</p>
                <p className="text-blue-600 text-xs mb-3">この環境は開発・テスト目的で提供されています。実際の顧客データや本番環境ではありません。</p>
                <hr className="border-primary-200 my-2" />
                <p className="font-medium text-primary-700 mb-1">テスト用アカウント</p>
                <ul className="text-primary-600 text-xs space-y-1">
                  <li><span className="font-medium">グローバル管理者:</span> admin / admin</li>
                  <li><span className="font-medium">一般ユーザー:</span> user / user</li>
                  <li><span className="font-medium">ゲスト:</span> guest / guest</li>
                </ul>
              </div>
              <p className="text-center text-xs text-secondary-500 mt-4">
                &copy; 2025 ITサービス管理システム - All rights reserved.
              </p>
            </div>
      </div>
    </div>
  );
};

export default Login;
