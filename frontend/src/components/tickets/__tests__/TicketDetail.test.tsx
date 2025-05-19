import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TicketDetail from '../TicketDetail';

// fetchをモック化
global.fetch = jest.fn();

describe('TicketDetail', () => {
    const authToken = 'dummy-token';

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    test('ticketIdがnullの場合、選択されていませんメッセージが表示される', () => {
        render(<TicketDetail ticketId={null} authToken={authToken} />);
        expect(screen.getByText('チケットが選択されていません。')).toBeInTheDocument();
    });

    test('読み込み中の表示', async () => {
        (fetch as jest.Mock).mockImplementation(() =>
            new Promise(() => { }) // 解決しないPromiseでloading状態をシミュレート
        );
        render(<TicketDetail ticketId={1} authToken={authToken} />);
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('APIエラー時にエラーメッセージが表示される', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });
        render(<TicketDetail ticketId={1} authToken={authToken} />);
        await waitFor(() => {
            expect(screen.getByText(/エラー: APIエラー: 500/)).toBeInTheDocument();
        });
    });

    test('正常にチケット情報が表示される', async () => {
        const mockData = {
            id: 1,
            title: 'Test Ticket',
            description: 'This is a test ticket',
            status: 'Open',
            created_at: '2025-05-19T00:00:00Z',
            updated_at: '2025-05-19T01:00:00Z',
            assignee: 'John Doe',
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });
        render(<TicketDetail ticketId={1} authToken={authToken} />);
        expect(await screen.findByText('チケット詳細')).toBeInTheDocument();
        expect(screen.getByText(mockData.title)).toBeInTheDocument();
        expect(screen.getByText(mockData.description)).toBeInTheDocument();
        expect(screen.getByText(mockData.status)).toBeInTheDocument();
        expect(screen.getByText(mockData.assignee)).toBeInTheDocument();
    });

    test('担当者がnullの場合は「未割当」と表示される', async () => {
        const mockData = {
            id: 2,
            title: 'No Assignee Ticket',
            description: 'No assignee',
            status: 'Open',
            created_at: '2025-05-19T00:00:00Z',
            updated_at: '2025-05-19T01:00:00Z',
            assignee: null,
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });
        render(<TicketDetail ticketId={2} authToken={authToken} />);
        await waitFor(() => {
            expect(screen.getByText('未割当')).toBeInTheDocument();
        });
    });
});