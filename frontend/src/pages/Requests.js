import React from 'react';

const RequestsPage = () => {
  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">リクエスト管理</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            ユーザーからのサービス要求を管理します。新しい要求の作成、進捗管理、解決済み要求の確認が行えます。
          </p>
        </div>
      </div>
  );
};

export default RequestsPage;
