import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/audit/logs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('APIレスポンス:', data); // デバッグ用
        
        // レスポンス構造の検証
        if (Array.isArray(data)) {
          setLogs(data);
        } else if (data && Array.isArray(data.data)) {
          setLogs(data.data);
        } else {
          console.error('予期しないレスポンス構造:', data);
          setLogs([]);
        }
      } catch (error) {
        console.error('監査ログ取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 180px)', padding: '16px' }}>
        {/* ログ一覧 */}
        <div style={{ width: '50%', paddingRight: '8px' }}>
          <h1>監査ログ</h1>
          {isLoading ? (
            <p>読み込み中...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>ログID</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>ユーザー</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr 
                      key={log.id || log._id}
                      onClick={() => setSelectedLog(log)}
                      style={{ cursor: 'pointer', backgroundColor: selectedLog?.id === log.id ? '#f0f0f0' : '' }}
                    >
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{log.id || log._id}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{log.user || log.username}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{log.operationType || log.action}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '8px', textAlign: 'center' }}>
                      {isLoading ? '読み込み中...' : '表示する監査ログがありません'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ログ詳細 */}
        <div style={{ width: '50%', paddingLeft: '8px' }}>
          <h2>詳細情報</h2>
          {selectedLog ? (
            <div>
              <p><strong>ユーザー:</strong> {selectedLog.user || selectedLog.username}</p>
              <p><strong>操作:</strong> {selectedLog.operationType || selectedLog.action}</p>
              <p><strong>ステータス:</strong> {selectedLog.status || 'N/A'}</p>
              <p><strong>日時:</strong> {selectedLog.timestamp || selectedLog.createdAt}</p>
            </div>
          ) : (
            <p>左のリストからログを選択してください</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuditPage;
