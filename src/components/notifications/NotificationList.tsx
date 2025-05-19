import React, { useEffect, useState } from "react";

// 通知データの型定義
interface Notification {
  id: string;
  title: string;
  message: string;
  date: string; // ISO文字列想定
}

const NotificationList: React.FC = () => {
  // 通知一覧の状態管理
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 通知APIからデータ取得
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/notifications");
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div>通知を読み込み中...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>エラー: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div>通知はありません。</div>;
  }

  return (
    <div>
      <h2>通知一覧</h2>
      <ul>
        {notifications.map(({ id, title, message, date }) => (
          <li
            key={id}
            style={{ marginBottom: "1em", borderBottom: "1px solid #ccc", paddingBottom: "0.5em" }}
          >
            <strong>{title}</strong>
            <br />
            <small>{new Date(date).toLocaleString()}</small>
            <p>{message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;