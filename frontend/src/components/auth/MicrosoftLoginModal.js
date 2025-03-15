import React, { useState, useEffect } from 'react';

const MicrosoftLoginModal = ({ onClose, onLogin }) => {
  const [step, setStep] = useState(1); // ステップ1: メールアドレス入力, ステップ2: パスワード入力, ステップ3: HENGEOINE認証
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [federationDetected, setFederationDetected] = useState(false);
  const [hengeoneWindow, setHengeoneWindow] = useState(null);
  
  // Microsoft認証設定
  const msAuthConfig = {
    clientId: process.env.REACT_APP_MS_CLIENT_ID || '12345678-1234-1234-1234-123456789012', // 環境変数から取得、またはテスト用の代替ID
    redirectUri: 'https://localhost:5000/auth/callback', // グローバル管理者が設定したURL
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_MS_TENANT_ID || 'common'}`, // テナントIDを使用
    scopes: ['openid', 'profile', 'email', 'User.Read']
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('有効なメールアドレスを入力してください。');
      return;
    }
    setError('');
    setStep(2);
  };

  // メールアドレスからドメインを検出してフェデレーション認証が必要かチェック
  useEffect(() => {
    if (email && email.includes('@')) {
      const domain = email.split('@')[1].toLowerCase();
      // mirai-const.co.jpドメインの場合はHENGEOINE認証が必要
      if (domain === 'mirai-const.co.jp') {
        setFederationDetected(true);
      } else {
        setFederationDetected(false);
      }
    }
  }, [email]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('パスワードを入力してください。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (federationDetected) {
        // フェデレーション認証の場合は次のステップに進む
        setStep(3);
        // HENGEOINEの認証URLを開く (強制的に新しいセッションを要求するパラメータを追加)
        const hengeoneUrl = `https://ap.ssso.hdems.com/portal/mirai-const.co.jp/login/?email=${encodeURIComponent(email)}&force_login=true&session=new`;
        // 既存のウィンドウがあれば閉じる
        if (hengeoneWindow && !hengeoneWindow.closed) {
          hengeoneWindow.close();
        }
        // 新しいウィンドウを開く
        const newWindow = window.open(hengeoneUrl, '_blank', 'width=800,height=600');
        setHengeoneWindow(newWindow);
        
        // ユーザーにHENGEOINE認証の指示を表示するためにloadingを解除
        setLoading(false);
      } else {
        // 開発モードフラグ - バックエンドサーバーがない場合は直接認証
        // PKCEコード生成
        const generatePKCECodes = async () => {
          const verifier = window.crypto.getRandomValues(new Uint8Array(32)).reduce((acc, x) =>
            acc + (x & 0x0F).toString(16), '');
          
          const encoder = new TextEncoder();
          const data = encoder.encode(verifier);
          
          const hash = await window.crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hash));
          
          const challenge = btoa(String.fromCharCode(...hashArray))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
          
          return { verifier, challenge };
        };

        // 状態トークン生成（CSRF対策）
        const stateToken = window.crypto.getRandomValues(new Uint8Array(32))
          .reduce((acc, x) => acc + (x & 0x0F).toString(16), '');
        sessionStorage.setItem('msal_state', stateToken);

        try {
          const { verifier, challenge } = await generatePKCECodes();
          sessionStorage.setItem('msal_code_verifier', verifier);

          // 認証URL構築
          const authUrl = new URL(`${msAuthConfig.authority}/oauth2/v2.0/authorize`);
          authUrl.searchParams.append('client_id', msAuthConfig.clientId);
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('redirect_uri', msAuthConfig.redirectUri);
          authUrl.searchParams.append('scope', msAuthConfig.scopes.join(' '));
          authUrl.searchParams.append('response_mode', 'query');
          authUrl.searchParams.append('code_challenge', challenge);
          authUrl.searchParams.append('code_challenge_method', 'S256');
          authUrl.searchParams.append('state', stateToken);
          authUrl.searchParams.append('login_hint', email);
          authUrl.searchParams.append('prompt', 'select_account');
          authUrl.searchParams.append('domain_hint', 'organizations');

          // リダイレクト実行
          window.location.href = authUrl.toString();
        } catch (error) {
          console.error('Authentication setup error:', error);
          setError('認証システムの初期化に失敗しました');
          setLoading(false);
        }
      };
    } catch (err) {
      setError('認証プロセスに失敗しました。もう一度お試しください。');
      console.error('Authentication error:', err);
      setLoading(false);
    }
  };
        
        // 認証URLをコンソールに記録（開発用）
        console.log(`Microsoft認証URL - ${authUrl.toString()}`);
        
        // Microsoft認証ページにリダイレクト（実際のMicrosoft認証を行う）
        window.location.href = authUrl.toString();
      }
    } catch (err) {
      setError('認証に失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  // HENGEOINE認証の完了処理
  const handleHengeoneComplete = () => {
    setLoading(true);
    
    try {
      // HENGEOINE認証成功を想定（実際の実装ではコールバックを使用）
      onLogin();
    } catch (err) {
      setError('HENGEOINE認証中にエラーが発生しました。もう一度お試しください。');
      setLoading(false);
    }
  };

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
          {step === 3 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">HENGEOINE</div>
                <h2 className="text-xl font-semibold">フェデレーション認証</h2>
              </div>
              <img
                src="https://www.hengeoine.co.jp/cms/wp-content/themes/hengeoine/images/common/logo_hengeoine.png"
                alt="HENGEOINE Logo"
                className="h-8 mx-auto my-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150x50?text=HENGEOINE";
                }}
              />
            </>
          ) : (
            <>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                alt="Microsoft Logo"
                className="h-6 mx-auto mb-4"
              />
              {step === 1 ? (
                <h2 className="text-2xl font-semibold">Microsoftでサインイン</h2>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold">パスワードの入力</h2>
                  <p className="text-sm text-gray-600 mt-1">{email}</p>
                  {federationDetected && (
                    <p className="text-xs text-blue-600 mt-1">
                      <span className="bg-blue-100 px-1 py-0.5 rounded-sm">HENGEOINE</span> フェデレーション認証が必要です
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 3 ? (
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              HENGEOINE認証画面が別ウィンドウで開きました。<br />
              認証が完了したら、下のボタンをクリックしてください。
            </p>
            <button
              type="button"
              onClick={handleHengeoneComplete}
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
              認証完了
            </button>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  if (hengeoneWindow && !hengeoneWindow.closed) {
                    hengeoneWindow.focus();
                  } else {
                    // ウィンドウが閉じられていたら再度開く（強制的に新しいセッションを要求）
                    const hengeoneUrl = `https://ap.ssso.hdems.com/portal/mirai-const.co.jp/login/?email=${encodeURIComponent(email)}&force_login=true&session=new`;
                    const newWindow = window.open(hengeoneUrl, '_blank', 'width=800,height=600');
                    setHengeoneWindow(newWindow);
                  }
                }}
                className="text-blue-600 underline text-sm"
              >
                認証画面を再表示
              </button>
            </div>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス、電話番号、Skype"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <a href="#" className="text-blue-600 text-sm">
                  Microsoftアカウントがありませんか？
                </a>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                次へ
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <a href="#" className="text-blue-600 text-sm">
                  パスワードをお忘れですか？
                </a>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-blue-600 px-4 py-2 rounded hover:underline"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center"
              >
                {loading && (
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
                )}
                サインイン
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-500 text-center">
            このサイトには{federationDetected ? 'HENGEOINE' : 'Microsoft'} IDフェデレーションが使用されています。
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
