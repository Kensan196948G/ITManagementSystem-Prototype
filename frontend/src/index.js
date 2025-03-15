import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 開発モード: 認証状態を設定
if (process.env.NODE_ENV === 'development') {
  // ローカルストレージに認証情報を設定
  localStorage.setItem('token', 'dev-token-123');
  localStorage.setItem('userRole', 'msuser');
  localStorage.setItem('msUserInfo', JSON.stringify({
    displayName: '山田 太郎', // 表示名
    userPrincipalName: 'taro.yamada@contoso.com',
    accountType: 'Microsoft Entra ID'
  }));
  console.log('開発モード: 認証状態を設定しました');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// パフォーマンスを測定する場合はこの関数を呼び出す
reportWebVitals();
