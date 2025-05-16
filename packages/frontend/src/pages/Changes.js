import React, { useState } from 'react';

function ChangesPage() {
  const [changes] = useState([
    {
      id: 'CHG-202503-01',
      target: 'ADポリシー',
      content: 'グループポリシー修正（新部署追加）',
      requester: '山田太郎',
      approver: '佐藤花子',
      executor: '',
      plannedDate: '2025/03/28',
      actualDate: '',
      status: '承認待ち',
      comment: '新部門体制に対応するためのポリシー更新として妥当です',
      attachments: [
        { name: 'gpo_plan.pdf', size: '1.2MB' },
      ],
    },
    {
      id: 'CHG-202503-02',
      target: 'M365ライセンス',
      content: '新規ライセンス割当（総務部）',
      requester: '鈴木一郎',
      approver: '佐藤花子',
      executor: '',
      plannedDate: '2025/03/29',
      actualDate: '',
      status: '承認済み',
      comment: '',
      attachments: [],
    },
  ]);
  const [selectedChange, setSelectedChange] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">変更管理</h1>
      <div className="flex gap-6">
        {/* 左ペイン - 一覧表示 */}
        <div className="w-1/2 bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">変更ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">対象CI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申請者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">承認者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">予定日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">実施日時</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {changes.map((change) => (
                  <tr
                    key={change.id}
                    onClick={() => setSelectedChange(change)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedChange?.id === change.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{change.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.target}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{change.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.requester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.approver}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.plannedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.actualDate || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${change.status === '承認済み' ? 'bg-green-100 text-green-800'
                        : change.status === '承認待ち' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'}`}
                      >
                        {change.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右ペイン - 詳細表示 */}
        {selectedChange ? (
          <div className="w-1/2 bg-white rounded-lg shadow p-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🔄 変更詳細 (
                {selectedChange.id}
                )
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-500">基本情報</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">対象CI</p>
                    <p className="font-medium">{selectedChange.target}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">内容</p>
                    <p className="font-medium">{selectedChange.content}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">予定日時</p>
                    <p className="font-medium">{selectedChange.plannedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">実施日時</p>
                    <p className="font-medium">{selectedChange.actualDate || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ステータス</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedChange.status === '承認済み' ? 'bg-green-100 text-green-800'
                        : selectedChange.status === '承認待ち' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                    >
                      {selectedChange.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-500">関係者</h3>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">申請者</p>
                    <p className="font-medium">{selectedChange.requester}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">承認者</p>
                    <p className="font-medium">{selectedChange.approver}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">実施者</p>
                    <p className="font-medium">{selectedChange.executor || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedChange.comment && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-500">承認コメント</h3>
                  <p className="mt-2 text-sm bg-gray-50 p-3 rounded">
                    {selectedChange.comment}
                  </p>
                </div>
              )}

              {selectedChange.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-500">添付ドキュメント</h3>
                  <div className="mt-2 space-y-2">
                    {selectedChange.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span>📄</span>
                        <span>{file.name}</span>
                        <span className="text-gray-500">
                          (
                          {file.size}
                          )
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-500">操作</h3>
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    onClick={() => console.log('承認処理:', selectedChange.id)}
                  >
                    承認
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    onClick={() => console.log('却下処理:', selectedChange.id)}
                  >
                    却下
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    onClick={() => console.log('実施開始:', selectedChange.id)}
                  >
                    実施開始
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                    onClick={() => window.open(`/logs/changes/${selectedChange.id}`, '_blank')}
                  >
                    変更履歴
                  </button>
                  <a
                    href={`/logs/changes/${selectedChange.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm inline-block"
                  >
                    操作ログを確認
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-1/2 bg-white rounded-lg shadow flex items-center justify-center">
            <p className="text-gray-500">変更項目を選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangesPage;
