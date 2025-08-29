import React, { useEffect, useState } from 'react';

interface ChangeRequest {
  id: number;
  title: string;
  status: string;
  description: string;
}

const ChangeRequestsList: React.FC = () => {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/changes')
      .then((res) => {
        if (!res.ok) {
          throw new Error('変更リクエストの取得に失敗しました');
        }
        return res.json();
      })
      .then((data: ChangeRequest[]) => {
        setChanges(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) {
    return (
      <div>
        エラー:
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">変更管理リスト</h1>
      <ul>
        {changes.map((change) => (
          <li key={change.id} className="mb-2 p-2 border rounded">
            <h2 className="font-semibold">{change.title}</h2>
            <p>
              ステータス:
              {change.status}
            </p>
            <p>{change.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChangeRequestsList;
