import React, { useState } from 'react';

const ChangesPage = () => {
  const [changes, setChanges] = useState([
    {
      id: 'CHG-202503-01',
      target: 'ADポリシー',
      content: 'グループポリシー修正（新部署追加）',
      requester: '山田太郎',
      approver: '佐藤花子',
      plannedDate: '2025/03/28',
      actualDate: '',
      status: '承認待ち'
    },
    {
      id: 'CHG-202503-02',
      target: 'M365ライセンス',
      content: '新規ライセンス割当（総務部）',
      requester: '鈴木一郎',
      approver: '佐藤花子',
      plannedDate: '2025/03/29',
      actualDate: '',
      status: '承認済み'
    }
  ]);

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">変更管理</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <tr key={change.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{change.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.target}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{change.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.requester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.approver}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.plannedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.actualDate || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${change.status === '承認済み' ? 'bg-green-100 text-green-800' : 
                          change.status === '承認待ち' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {change.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default ChangesPage;
