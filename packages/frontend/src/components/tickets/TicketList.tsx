import React from 'react';

export interface Ticket {
    id: number;
    title: string;
    status: string;
    createdAt: string;
}

interface TicketListProps {
    tickets: Ticket[];
    onSelect: (ticket: Ticket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onSelect }) => (
    <div className="p-4">
        <h2 className="text-xl font-bold mb-4">チケット一覧</h2>
        <ul className="divide-y divide-gray-200 border border-gray-300 rounded-md">
            {tickets.map((ticket) => (
                <li
                    key={ticket.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    tabIndex={0}
                    role="button"
                    onClick={() => onSelect(ticket)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(ticket);
                        }
                    }}
                >
                    <div className="flex justify-between">
                        <span className="font-medium">{ticket.title}</span>
                        <span className="text-sm text-gray-500">{ticket.status}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        作成日: {ticket.createdAt}
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

export default TicketList;