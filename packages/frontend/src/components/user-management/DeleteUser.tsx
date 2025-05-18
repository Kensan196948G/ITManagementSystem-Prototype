import React from 'react';

interface DeleteUserProps {
  userId: number;
  onDeleted: () => void;
}

const DeleteUser: React.FC<DeleteUserProps> = ({ userId, onDeleted }) => {
  const handleDelete = async () => {
    if (!window.confirm('本当にこのユーザーを削除しますか？')) {
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }
      onDeleted();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
    >
      削除
    </button>
  );
};

export default DeleteUser;
