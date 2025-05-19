import React, { useState, useEffect } from 'react';
import './index.css'; // Tailwind CSSのスタイルを読み込み
import HelloWorld from './components/HelloWorld'; // サンプルコンポーネントをインポート

function App() {
  const [status, setStatus] = useState<string>('Loading...'); // 修正ポイント: 型注釈を追加し型エラーを防止

  useEffect(() => {
    // バックエンドのテストAPIを呼び出す
    fetch('/api/status')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: { status: string }) => { // 修正ポイント: dataの型注釈を追加
        setStatus(`Status: ${data.status}`);
      })
      .catch((error: Error) => { // 修正ポイント: errorの型注釈を追加
        console.error('Error fetching status:', error);
        setStatus(`Error: ${error.message}`);
      });
  }, []); // 空の依存配列は、コンポーネントのマウント時に一度だけ実行されることを意味します。

  return (
    <>
      <header className="bg-blue-600 text-white text-center p-4 text-xl font-bold">
        IT Management System WebUI
      </header>
      <main className="p-4">
        <section className="mb-6">
          Backend Status:
          {status}
        </section>
        <section>
          {/* サンプルコンポーネント表示 */}
          <HelloWorld name="ITSM User" />
        </section>
      </main>
    </>
  );
}

export default App;
