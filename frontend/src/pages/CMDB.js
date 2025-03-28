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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">PC端末</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">状態（ステータス）</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">稼働中</td>
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
                      <div>端末 → ユーザー: 山田太郎</div>
                      <div>ユーザー → ライセンス: Microsoft 365 E3</div>
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">営業部 / 山田太郎</td>
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">192.168.1.100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">MAC</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">00:1A:2B:3C:4D:5E</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">OS</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Windows 11</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">スペック情報</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Core i7 / 16GB / 512GB SSD</td>
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
