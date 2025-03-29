import React from 'react';
import Badge from '../ui/Badge';

const AuditLogDetail = ({ log }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🧾 操作ログ詳細 ({log.id})
        </h2>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6 space-y-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>👤</span> 実行ユーザー
            </p>
            <p className="font-medium mt-1">{log.user}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>⚙️</span> 操作種別
            </p>
            <p className="font-medium mt-1">{log.operationType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>🖥</span> 対象システム
            </p>
            <p className="font-medium mt-1">{log.targetSystem}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📅</span> 実行日時
            </p>
            <p className="font-medium mt-1">{log.timestamp}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>🟢</span> 結果
            </p>
            <div className="mt-1">
              <Badge color={log.status === '成功' ? 'green' : 'red'}>
                {log.status} ({log.statusCode})
              </Badge>
            </div>
          </div>
        </div>

        {/* 操作詳細 */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-500 mb-3 flex items-center gap-2">
            <span>🔍</span> 操作詳細
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <span>💻</span> PowerShellコマンド:
            </p>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto font-mono">
              {log.command}
            </pre>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">実行ホスト</p>
                <p className="text-sm font-medium">{log.host}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">実行者権限</p>
                <p className="text-sm font-medium">{log.privilege}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 添付ファイル */}
        {log.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-500 mb-3 flex items-center gap-2">
              <span>📎</span> 添付ファイル / 出力ログ
            </h3>
            <div className="space-y-2">
              {log.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span className="text-sm">[{file.name}]</span>
                  </div>
                  <button 
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    onClick={() => console.log('Download:', file.path)}
                  >
                    ダウンロード
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 関連変更 */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-500 mb-3 flex items-center gap-2">
            <span>🔁</span> 関連変更・CI
          </h3>
          <div className="space-y-3">
            {log.relatedChanges.map((change, index) => (
              <a
                key={index}
                href={`/changes/${change.id}`}
                className="block text-sm text-blue-600 hover:underline flex items-center gap-2 bg-gray-50 p-3 rounded"
              >
                <span>🔗</span>
                <span>
                  {change.type}: {change.id} ({change.target})
                </span>
              </a>
            ))}
            {/* 関連ユーザー (例として追加) */}
            {log.operationType === 'アカウント作成' && (
              <a
                href={`/users/${log.user.replace('.', '-')}`}
                className="block text-sm text-blue-600 hover:underline flex items-center gap-2 bg-gray-50 p-3 rounded"
              >
                <span>👤</span>
                <span>関連ユーザー: {log.user.replace('.', ' ')}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetail;
