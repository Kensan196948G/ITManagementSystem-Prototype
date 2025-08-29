import React from 'react';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

function UsersList(): JSX.Element {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingUserId, setEditingUserId] = React.useState<number | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error('ユーザー一覧の取得に失敗しました');
        }
        return res.json();
      })
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdated = () => {
    setEditingUserId(null);
    fetchUsers();
  };

  const handleUserDeleted = () => {
    fetchUsers();
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) {
    return (
      <div>
        エラー:
        {' '}
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ユーザー管理</h1>
      <button
        type="button"
        onClick={() => setEditingUserId(0)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        新規ユーザー作成
      </button>
      {editingUserId !== null && (
        <EditUser
          userId={editingUserId}
          onUpdated={handleUserUpdated}
        />
      )}
      <ul>
        {users.map((user) => (
          <li key={user.id} className="mb-2 p-2 border rounded flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{user.username}</h2>
              <p>
                メール:
                {' '}
                {user.email}
              </p>
              <p>
                役割:
                {' '}
                {user.role}
              </p>
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setEditingUserId(user.id)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                編集
              </button>
              <DeleteUser
                userId={user.id}
                onDeleted={handleUserDeleted}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;
