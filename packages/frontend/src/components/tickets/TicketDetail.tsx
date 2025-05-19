import React from 'react';

type Ticket = {
    id: string;
    title: string;
    description: string;
    status: string;
    createdBy: string;
    createdAt: string;
};

export default function TicketDetail({
    ticket,
    onClose,
}: {
    ticket: Ticket | null;
    onClose: () => void;
}) {
    if (!ticket) {
        return <div className="p-4">チケットが選択されていません。</div>;
    }

    return (
        <div className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-bold mb-2">チケット詳細</h2>
            <div className="mb-2">
                <strong>ID:</strong>
                <br />
                {ticket.id}
            </div>
            <div className="mb-2">
                <strong>タイトル:</strong>
                <br />
                {ticket.title}
            </div>
            <div className="mb-2">
                <strong>説明:</strong>
                <br />
                {ticket.description}
            </div>
            <div className="mb-2">
                <strong>ステータス:</strong>
                <br />
                {ticket.status}
            </div>
            <div className="mb-2">
                <strong>作成者:</strong>
                <br />
                {ticket.createdBy}
            </div>
            <div className="mb-2">
                <strong>作成日:</strong>
                <br />
                {ticket.createdAt}
            </div>
            <div className="mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
}
