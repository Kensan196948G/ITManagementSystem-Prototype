import React, { useState, useEffect } from 'react';

interface ChangeRequest {
  id: number;
  title: string;
  description: string;
  status: string;
}

interface EditChangeRequestProps {
  changeId: number;
  onUpdated: () => void;
}

const EditChangeRequest: React.FC<EditChangeRequestProps> = ({ changeId, onUpdated }) => {
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/changes/${changeId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('変更リクエストの取得に失敗しました');
        }
        return res.json();
      })
      .then((data: ChangeRequest) => {
        setChange(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [changeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!change) return;

    try {
      const response = await fetch(`/api/changes/${change.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change),
      });
      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) {
    return (
      <div>
        エラー:
        {error}
      </div>
    );
  }
  if (!change) return <div>変更リクエストが見つかりません</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">変更リクエスト編集</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="title">タイトル</label>
        <input
          id="title"
          type="text"
          value={change.title}
          onChange={(e) => setChange({ ...change, title: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="description">説明</label>
        <textarea
          id="description"
          value={change.description}
          onChange={(e) => setChange({ ...change, description: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="status">ステータス</label>
        <select
          id="status"
          value={change.status}
          onChange={(e) => setChange({ ...change, status: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        更新
      </button>
    </form>
  );
};

export default EditChangeRequest;
