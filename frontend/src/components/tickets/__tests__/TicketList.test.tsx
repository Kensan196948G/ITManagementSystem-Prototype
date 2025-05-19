import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // 修正ポイント: toBeInTheDocumentを使うためのimportを追加
import TicketList from '../TicketList';

// fetchをモック化
global.fetch = jest.fn();

describe('TicketList コンポーネント', () => {
    const authToken = 'dummy-token';
    const ticketsMock = [
        { id: 1, title: 'チケット1', status: 'Open', created_at: '2025-05-19T10:00:00Z' },
        { id: 2, title: 'チケット2', status: 'Closed', created_at: '2025-05-18T09:00:00Z' },
    ];

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    test('正常にチケット一覧を取得し表示する', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ticketsMock,
        });

        const onSelectTicket = jest.fn();
        render(<TicketList authToken={authToken} onSelectTicket={onSelectTicket} />);

        expect(screen.getByText('読み込み中...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('チケット一覧')).toBeInTheDocument();
        });

        ticketsMock.forEach(ticket => {
            expect(screen.getByText(new RegExp(ticket.title))).toBeInTheDocument();
        });
    });

    test('APIエラー時にエラーメッセージを表示する', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        render(<TicketList authToken={authToken} onSelectTicket={() => { }} />);

        await waitFor(() => {
            expect(screen.getByText(/エラー: 500/)).toBeInTheDocument();
        });
    });

    test('チケットが空の場合にメッセージを表示する', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<TicketList authToken={authToken} onSelectTicket={() => { }} />);

        await waitFor(() => {
            expect(screen.getByText('チケットがありません。')).toBeInTheDocument();
        });
    });

    test('チケットクリック時にonSelectTicketが呼ばれる', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ticketsMock,
        });

        const onSelectTicket = jest.fn();
        render(<TicketList authToken={authToken} onSelectTicket={onSelectTicket} />);

        await waitFor(() => {
            expect(screen.getByText('チケット一覧')).toBeInTheDocument();
        });

        const ticketItem = screen.getByText(/チケット1/);
        fireEvent.click(ticketItem);

        expect(onSelectTicket).toHaveBeenCalledWith(1);
    });
});