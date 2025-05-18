import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface EditUserProps {
  userId: number;
  onUpdated: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ userId, onUpdated }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        return res.json();
      })
      .then((data: User) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
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
  if (!user) return <div>ユーザーが見つかりません</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">ユーザー編集</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="username">ユーザー名</label>
        <input
          id="username"
          type="text"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="role">役割</label>
        <select
          id="role"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="user">ユーザー</option>
          <option value="admin">管理者</option>
        </select>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        更新
      </button>
    </form>
  );
};

export default EditUser;
