import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Notification {
    id: number;
    title: string;
    message: string;
    user_id: number;
    created_at: string;
    read: boolean;
}

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/api/notifications');
                setNotifications(response.data);
            } catch (err) {
                setError('通知の取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await axios.put(`/api/notifications/${id}`, { read: true });
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
        } catch {
            setError('通知の更新に失敗しました。');
        }
    };

    if (loading) return <div>読み込み中...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">通知一覧</h2>
            {notifications.length === 0 && <p>通知はありません。</p>}
            <ul>
                {notifications.map((notif) => (
                    <li
                        key={notif.id}
                        className={`mb-2 p-2 border rounded cursor-pointer ${notif.read ? 'bg-gray-100' : 'bg-blue-100 font-semibold'
                            }`}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                        <div>{notif.title}</div>
                        <div className="text-sm text-gray-700">{notif.message}</div>
                        <div className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationList;