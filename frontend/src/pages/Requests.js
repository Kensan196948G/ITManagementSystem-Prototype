import React, { useState } from 'react';

const RequestsPage = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  // サンプルデータ
  const requests = [
    {
      id: 'REQ-202503-001',
      type: 'アカウント作成',
      requester: 'tanaka.taro@example.com',
      date: '2025/03/26 11:20',
      status: '承認待ち',
      assignee: '管理者（Yamada）',
      content: 'ADアカウント新規作成依頼。\n所属部門：営業部 本社拠点\n使用予定PC：PC-001',
      attachments: ['ADアカウント申請書.pdf']
    },
    {
      id: 'REQ-202503-002',
      type: 'アクセス権限変更',
      requester: 'sato.hanako@example.com',
      date: '2025/03/27 14:35',
      status: '処理中',
      assignee: '管理者（Suzuki）',
      content: '営業→マーケティング部門への異動に伴い、共有フォルダのアクセス権限変更を依頼',
      attachments: []
    },
    {
      id: 'REQ-202503-003',
      type: 'ソフトウェアインストール',
      requester: 'yamamoto.kei@example.com',
      date: '2025/03/28 09:15',
      status: '完了',
      assignee: '管理者（Tanaka）',
      content: 'Adobe Photoshop CC インストール依頼\nライセンス番号: PS-2025-001',
      attachments: ['ライセンス証明書.pdf', 'インストールガイド.pdf']
    }
  ];

  return (
    <div className="flex h-full p-6 gap-6">
      {/* 左ペイン - リクエスト一覧 */}
      <div className="w-1/3 bg-white rounded-lg shadow p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">リクエスト一覧</h1>
        <div className="space-y-3">
          {requests.map((request) => (
            <div 
              key={request.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{request.id}</h3>
                  <p className="text-sm text-gray-600">{request.type}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.status === '承認待ち' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === '処理中' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{request.requester}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 右ペイン - リクエスト詳細 */}
      {selectedRequest && (
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📨 リクエスト詳細（{selectedRequest.id}）
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">申請種別</p>
                <p className="font-medium">🏷 {selectedRequest.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">申請者</p>
                <p className="font-medium">👤 {selectedRequest.requester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">登録日時</p>
                <p className="font-medium">📅 {selectedRequest.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ステータス</p>
                <p className="font-medium">📌 {selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">担当者</p>
                <p className="font-medium">👨‍💼 {selectedRequest.assignee}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">内容</p>
              <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-line">
                💬 {selectedRequest.content}
              </div>
            </div>

            {selectedRequest.attachments?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">添付</p>
                <div className="mt-2 space-y-2">
                  {selectedRequest.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span>📎</span>
                      <span className="text-sm">{file}</span>
                      <button className="ml-auto text-xs text-blue-600 hover:text-blue-800">
                        ダウンロード
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 flex justify-end gap-3">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                ✅ 承認
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                ❌ 却下
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                📝 コメント追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
