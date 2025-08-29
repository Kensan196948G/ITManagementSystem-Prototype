import React, { useEffect, useState } from 'react';

interface TicketDetailProps {
    ticketId: number | null;
    authToken: string;
}

interface TicketDetailData {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    assignee: string | null;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, authToken }) => {
    const [ticket, setTicket] = useState<TicketDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ticketId === null) {
            setTicket(null);
            return;
        }
        const fetchTicketDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/tickets/${ticketId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(`APIエラー: ${response.status}`);
                }
                const data = await response.json();
                setTicket(data);
            } catch (err: any) {
                setError(err.message || '不明なエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };
        fetchTicketDetail();
    }, [ticketId, authToken]);

    if (ticketId === null) return <p>チケットが選択されていません。</p>;
    if (loading) return <p>読み込み中...</p>;
    if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>;
    if (!ticket) return <p>チケット情報がありません。</p>;

    return (
        <div>
            <h2>チケット詳細</h2>
            <dl>
                <dt>タイトル</dt>
                <dd>{ticket.title}</dd>
                <dt>説明</dt>
                <dd>{ticket.description}</dd>
                <dt>ステータス</dt>
                <dd>{ticket.status}</dd>
                <dt>担当者</dt>
                <dd>{ticket.assignee || '未割当'}</dd>
                <dt>作成日時</dt>
                <dd>{new Date(ticket.created_at).toLocaleString()}</dd>
                <dt>更新日時</dt>
                <dd>{new Date(ticket.updated_at).toLocaleString()}</dd>
            </dl>
        </div>
    );
};

export default TicketDetail;