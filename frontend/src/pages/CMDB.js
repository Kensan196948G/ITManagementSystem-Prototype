import React from 'react';

const CMDBPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">CI管理</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <div className="space-y-8">
          {/* 基本情報セクション */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🆔</span>基本情報
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">CI名 / 機器管理番号</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">PC-001 / EXCH-01</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">CI種別</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-blue-50 text-blue-800">
                        <option value="pc">PC端末</option>
                        <option value="server">サーバ</option>
                        <option value="license">ライセンス</option>
                        <option value="user">ユーザー</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">状態（ステータス）</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mr-2"></span>
                        <span>稼働中</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 関連情報セクション */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📎</span>関連情報
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">紐づくサービス</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Microsoft 365</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">関連CI（依存関係）</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            端末
                          </span>
                          <span className="mx-2">→</span>
                          <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                            ユーザー: 山田太郎
                          </a>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ユーザー
                          </span>
                          <span className="mx-2">→</span>
                          <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                            ライセンス: Microsoft 365 E3
                          </a>
                        </div>
                      </div>
                      <div className="mt-2">
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          依存関係マップを表示
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 管理属性セクション */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🧑‍💼</span>管理属性
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">所有部署 / 担当者</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="mb-2">
                        <details className="group">
                          <summary className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
                            <span className="mr-1">▶</span>
                            <span>営業部</span>
                          </summary>
                          <div className="ml-4 mt-1 space-y-1">
                            <div className="flex items-center">
                              <span className="mr-1">├─</span>
                              <span>営業1課</span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-1">└─</span>
                              <span>営業2課</span>
                            </div>
                          </div>
                        </details>
                      </div>
                      <div>
                        <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50">
                          <option value="1">山田太郎</option>
                          <option value="2">佐藤花子</option>
                          <option value="3">鈴木一郎</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">設置場所</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">本社3F 営業課</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 履歴セクション */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📅</span>履歴
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">登録日時 / 最終更新日</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">2025/03/01 / 2025/03/15</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">ステータス履歴</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">稼働 → 障害 → 復旧</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 技術情報セクション */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🛠</span>技術情報
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">IPアドレス</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-mono">192.168.1.100</span>
                        <button 
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                          onClick={() => navigator.clipboard.writeText('192.168.1.100')}
                          title="コピー"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">MACアドレス</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-mono">00:1A:2B:3C:4D:5E</span>
                        <button 
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                          onClick={() => navigator.clipboard.writeText('00:1A:2B:3C:4D:5E')}
                          title="コピー"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">OS</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">🖥️</span>
                        <div>
                          <div>Windows 11 Pro</div>
                          <div className="text-xs text-gray-500">バージョン: 22H2 (ビルド 22621)</div>
                          <div className="text-xs text-gray-500">アーキテクチャ: 64-bit</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">スペック情報</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <span className="mr-2">💻</span>
                          <span>CPU: Core i7</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">🧠</span>
                          <span>メモリ: 16GB</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">💾</span>
                          <span>ストレージ: 512GB SSD</span>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* その他情報セクション */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📝</span>添付情報・メモ
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">ドキュメント</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">設定マニュアル.pdf</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">管理用メモ</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">次回点検予定: 2025/06/01</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">外部連携</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">SkySeaログ, Entraログ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMDBPage;
