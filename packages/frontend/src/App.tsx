import React, { useState, useEffect, Fragment } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // バックエンドのテストAPIを呼び出す
    fetch('/api/status')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setStatus(`Status: ${data.status}`);
      })
      .catch((error) => {
        console.error('Error fetching status:', error);
        setStatus(`Error: ${error.message}`);
      });
  }, []); // 空の依存配列は、コンポーネントのマウント時に一度だけ実行されることを意味します。

  return (
    <>
      <header className="App-header">
        IT Management System WebUI
      </header>
      <main>
        Backend Status:
        {' '}
        {status}
      </main>
    </>
  );
}

export default App;
