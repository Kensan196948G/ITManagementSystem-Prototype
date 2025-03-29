import React, { useState } from 'react';

const KnowledgePage = () => {
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  // サンプルデータ
  const knowledgeItems = [
    {
      id: 'KDB-0001',
      title: 'Teamsサインイン障害対処法',
      category: 'インシデント',
      updater: 'admin',
      updatedAt: '2025/03/10',
      views: 48,
      content: `Microsoft Teams にサインインできない障害が発生。
原因はキャッシュ破損で、Teamsフォルダの削除で解消。
手順は以下のとおり：
① Teams 完全終了 → ② AppDataフォルダ削除 → ③ 再起動`,
      attachments: [
        { name: 'teams_cache_delete.pdf', type: 'pdf' },
        { name: 'screenshot1.png', type: 'image' }
      ],
      relatedItems: {
        ci: 'PC-001 / tanaka.taro',
        incident: 'INC-202503-032'
      }
    },
    {
      id: 'KDB-0002',
      title: 'Outlookメール転送設定手順',
      category: '設定方法',
      updater: 'yamada',
      updatedAt: '2025/03/15',
      views: 32,
      content: 'Outlookでメール転送を設定する手順を説明します。\n① ファイル → オプション → メール → 転送\n② 転送先アドレスを入力\n③ サーバーにコピーを残すにチェック',
      attachments: [
        { name: 'outlook_forward_setting.pdf', type: 'pdf' }
      ],
      relatedItems: {}
    }
  ];

  return (
    <div className="flex h-full p-6 gap-6">
      {/* 左ペイン - ナレッジ一覧 */}
      <div className="w-1/3 bg-white rounded-lg shadow p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ナレッジ一覧</h1>
        <div className="space-y-3">
          {knowledgeItems.map((item) => (
            <div 
              key={item.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                selectedKnowledge?.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedKnowledge(item)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.id} - {item.title}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <span className="text-xs text-gray-500">
                  👁‍🗨 {item.views}回
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">更新: {item.updater} ({item.updatedAt})</p>
            </div>
          ))}
        </div>
      </div>

      {/* 右ペイン - ナレッジ詳細 */}
      {selectedKnowledge && (
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📘 ナレッジ詳細（{selectedKnowledge.id}）
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">タイトル</p>
                <p className="font-medium">🏷 {selectedKnowledge.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">カテゴリ</p>
                <p className="font-medium">🗂 {selectedKnowledge.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">更新者</p>
                <p className="font-medium">👤 {selectedKnowledge.updater}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">更新日</p>
                <p className="font-medium">📅 {selectedKnowledge.updatedAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">参照数</p>
                <p className="font-medium">👁‍🗨 {selectedKnowledge.views}回</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">内容</p>
              <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-line">
                💬 {selectedKnowledge.content}
              </div>
            </div>

            {selectedKnowledge.attachments?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">添付ファイル</p>
                <div className="mt-2 space-y-2">
                  {selectedKnowledge.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {file.type === 'pdf' ? '📄' : '🖼️'}
                      <span className="text-sm">{file.name}</span>
                      <button className="ml-auto text-xs text-blue-600 hover:text-blue-800">
                        {file.type === 'pdf' ? '開く' : '表示'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedKnowledge.relatedItems?.ci || selectedKnowledge.relatedItems?.incident ? (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">関連情報</p>
                <div className="mt-2 space-y-2">
                  {selectedKnowledge.relatedItems.ci && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span>📌</span>
                      <span className="text-sm">関連CI: {selectedKnowledge.relatedItems.ci}</span>
                    </div>
                  )}
                  {selectedKnowledge.relatedItems.incident && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span>🔗</span>
                      <span className="text-sm">関連インシデント: {selectedKnowledge.relatedItems.incident}</span>
                      <button className="ml-auto text-xs text-blue-600 hover:text-blue-800">
                        開く
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="border-t pt-4 flex justify-end gap-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                ✏️ 編集
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                🗑️ 削除
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                🔁 テンプレート化
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgePage;
