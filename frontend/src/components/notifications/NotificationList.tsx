import React, { useEffect, useState } from 'react';

interface Notification {
    id: number;
    user_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                // 認証トークンをlocalStorageから取得（必要に応じて変更してください）
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('認証トークンが見つかりません');
                }

                const response = await fetch('/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
                }

                const data: Notification[] = await response.json();
                setNotifications(data);
            } catch (err: any) {
                setError(err.message || '通知の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-500">
                ローディング中...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                エラー: {error}
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="p-4 text-center text-gray-400">
                通知はありません
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">通知一覧</h2>
            <ul>
                {notifications.map((notification) => (
                    <li
                        key={notification.id}
                        className={`mb-3 p-3 rounded border ${notification.is_read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-900 font-semibold'
                            }`}
                    >
                        <p>{notification.message}</p>
                        <time className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                        </time>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationList;