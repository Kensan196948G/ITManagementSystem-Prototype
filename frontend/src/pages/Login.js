import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loginWithMicrosoft, isAuthenticated, error: authError, logout } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ユーザー名とパスワード用のステート
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Microsoft認証状態
  const [msAuthState, setMsAuthState] = useState('initial'); // 'initial', 'ms_account', 'federation'
  const [federationEmail, setFederationEmail] = useState('');
  const [federationPassword, setFederationPassword] = useState('');

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

  // テストログイン処理
  const handleTestLogin = async () => {
    // デバッグ情報をコンソールに出力
    console.log('テストログイン試行:', username, password);
    
    setLoading(true);
    setError(''); // エラーメッセージをクリア
    
    try {
      const success = await login(username, password);
      console.log('ログイン結果:', success);
      
      if (success) {
        console.log('ログイン成功 - リダイレクト中...');
        navigate('/');
      } else {
        // 認証失敗時のエラーメッセージを表示
        console.log('ログイン失敗');
        setError('ログインに失敗しました。認証情報を確認してください。');
      }
    } catch (e) {
      console.error('ログイン処理中にエラー:', e);
      setError(e.message || 'ログイン中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // Microsoft認証設定
  const msAuthConfig = {
    clientId: process.env.REACT_APP_MS_CLIENT_ID || '12345678-1234-1234-1234-123456789012', // 環境変数から取得、またはテスト用の代替ID
    redirectUri: 'https://localhost:5000/auth/callback', // Azure portalで設定されたリダイレクトURIに合わせる
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_MS_TENANT_ID || 'common'}`, // テナントIDを使用
    scopes: ['openid', 'profile', 'email', 'User.Read']
  };

  // Microsoft認証プロセスの開始
  const handleMicrosoftLoginClick = async () => {
    setMsLoading(true);
    
    try {
      // Microsoft認証URLを構築
      const authUrl = new URL(`${msAuthConfig.authority}/oauth2/v2.0/authorize`);
      authUrl.searchParams.append('client_id', msAuthConfig.clientId);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', msAuthConfig.redirectUri);
      authUrl.searchParams.append('scope', msAuthConfig.scopes.join(' '));
      authUrl.searchParams.append('response_mode', 'query');
      authUrl.searchParams.append('state', btoa(JSON.stringify({ timestamp: new Date().getTime() })));
      
      // 認証URLをコンソールに記録（開発用）
      console.log('Microsoft認証URL:', authUrl.toString());
      
      // 現在のウィンドウで認証ページを開く
      window.location.href = authUrl.toString();
    } catch (err) {
      console.error('Microsoft認証エラー:', err);
      setError('Microsoft認証の準備中にエラーが発生しました');
      setMsLoading(false);
    }
  };

  // Microsoft認証後の処理 (ユーザーが入力したアカウント情報を使用)
  const handleMsAccountVerified = (e) => {
    e.preventDefault();
    // マイクロソフトでの認証が完了したことを確認後、フェデレーション認証に進む
    if (federationEmail && federationEmail.includes('@')) {
      setMsAuthState('federation');
    } else {
      setError('有効なメールアドレスを入力してください');
    }
  };

  // フェデレーション認証の完了処理
  const handleFederationComplete = async (e) => {
    e.preventDefault();
    
    if (!federationPassword) {
      setError('パスワードを入力してください');
      return;
    }
    
    // フェデレーション認証完了後の処理
    setMsLoading(true);
    try {
      // 新しいタブでHENGEOINEの認証ページを開く
      const hengeoneUrl = `https://ap.ssso.hdems.com/portal/mirai-const.co.jp/login/?email=${encodeURIComponent(federationEmail)}`;
      const hengeoneWindow = window.open(hengeoneUrl, '_blank');
      
      // 0.5秒後にモーダルメッセージを表示
      setTimeout(() => {
        alert('HENGEOINEの認証画面が開きました。認証が完了したら、このページに戻ってください。');
      }, 500);
      
      // 認証成功を想定（実際の実装ではコールバックやメッセージイベントを使用）
      const success = await loginWithMicrosoft();
      if (success) {
        navigate('/dashboard');
      } else {
        setError('認証に失敗しました');
        setMsAuthState('initial');
      }
    } catch (err) {
      setError('認証処理中にエラーが発生しました');
      setMsAuthState('initial');
    } finally {
      setMsLoading(false);
    }
  };

  // Microsoft認証のキャンセル
  const handleMsAuthCancel = () => {
    setMsAuthState('initial');
    setFederationEmail('');
    setFederationPassword('');
  };

  // Microsoft認証フォーム
  const renderMicrosoftAuth = () => {
    if (msAuthState === 'ms_account') {
      return (
        <div className="bg-white p-4 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z"></path>
              <path fill="#f35325" d="M1 1h10v10H1z"></path>
              <path fill="#81bc06" d="M12 1h10v10H12z"></path>
              <path fill="#05a6f0" d="M1 12h10v10H1z"></path>
              <path fill="#ffba08" d="M12 12h10v10H12z"></path>
            </svg>
            <h3 className="text-md font-semibold text-gray-800">Microsoftアカウント認証</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Microsoftアカウントでのログインが必要です。portal.office.comでログインした後、ログインに使用したメールアドレスを入力してください。</p>
          
          <form onSubmit={handleMsAccountVerified}>
            <div className="mb-4">
              <input 
                type="email" 
                value={federationEmail}
                onChange={(e) => setFederationEmail(e.target.value)}
                placeholder="Microsoftアカウントのメールアドレス"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleMsAuthCancel}
                className="text-gray-600 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                次へ
              </button>
            </div>
          </form>
        </div>
      );
    } else if (msAuthState === 'federation') {
      return (
        <div className="bg-white p-4 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="mr-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">HENGEOINE</div>
            <h3 className="text-md font-semibold text-gray-800">フェデレーション認証</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{federationEmail}</p>
          <p className="text-xs text-gray-500 mb-4">HENGEOINE（フェデレーション認証）を使用してログインしてください</p>
          
          <form onSubmit={handleFederationComplete}>
            <div className="mb-4">
              <input 
                type="password" 
                value={federationPassword}
                onChange={(e) => setFederationPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setMsAuthState('ms_account')}
                className="text-gray-600 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                HENGEOINEで認証する
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      return (
        <div>
          <button
            type="button"
            onClick={handleMicrosoftLoginClick}
            disabled={msLoading}
            className="w-full flex justify-center items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {msLoading ? (
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
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 23 23"
              >
                <path fill="#f3f3f3" d="M0 0h23v23H0z"></path>
                <path fill="#f35325" d="M1 1h10v10H1z"></path>
                <path fill="#81bc06" d="M12 1h10v10H12z"></path>
                <path fill="#05a6f0" d="M1 12h10v10H1z"></path>
                <path fill="#ffba08" d="M12 12h10v10H12z"></path>
              </svg>
            )}
            <span>Microsoftアカウントでログイン</span>
          </button>
        </div>
      );
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
        
        {/* Microsoft認証セクション */}
        {renderMicrosoftAuth()}
        
        {/* ローカルログインセクション */}
        {msAuthState === 'initial' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-secondary-500">または</span>
              </div>
            </div>
            
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
                  <a href="#forgot-password" className="text-primary-600 hover:text-primary-500">
                    パスワードをお忘れですか？
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleTestLogin}
                  disabled={loading}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
