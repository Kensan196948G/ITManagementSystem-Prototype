import React, { useEffect, useState } from 'react';

interface Ticket {
    id: number;
    title: string;
    status: string;
    created_at: string;
}

interface TicketListProps {
    authToken: string;
    onSelectTicket: (ticketId: number) => void;
}

const TicketList: React.FC<TicketListProps> = ({ authToken, onSelectTicket }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/tickets', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(`APIエラー: ${response.status}`);
                }
                const data = await response.json();
                setTickets(data);
            } catch (err: any) {
                setError(err.message || '不明なエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [authToken]);

    if (loading) return <p>読み込み中...</p>;
    if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>;

    return (
        <div>
            <h2>チケット一覧</h2>
            {tickets.length === 0 ? (
                <p>チケットがありません。</p>
            ) : (
                <ul>
                    {tickets.map(ticket => (
                        <li key={ticket.id} style={{ cursor: 'pointer' }} onClick={() => onSelectTicket(ticket.id)}>
                            {ticket.title} - {ticket.status} - {new Date(ticket.created_at).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TicketList;