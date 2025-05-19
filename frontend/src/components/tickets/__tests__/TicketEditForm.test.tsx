import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketEditForm from '../TicketEditForm';

global.fetch = jest.fn();

describe('TicketEditForm', () => {
    const authToken = 'dummy-token';
    const onUpdateSuccess = jest.fn();
    const onCancel = jest.fn();

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
        onUpdateSuccess.mockClear();
        onCancel.mockClear();
    });

    test('ticketIdがnullの場合、選択されていませんメッセージが表示される', () => {
        render(<TicketEditForm ticketId={null} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        expect(screen.getByText('編集するチケットが選択されていません。')).toBeInTheDocument();
    });

    test('読み込み中の表示', () => {
        (fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('APIエラー時にエラーメッセージが表示される', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        await waitFor(() => {
            expect(screen.getByText(/エラー: APIエラー: 500/)).toBeInTheDocument();
        });
    });

    test('フォームにAPIからの初期値がセットされる', async () => {
        const mockData = {
            title: 'Test Title',
            description: 'Test Description',
            status: 'In Progress',
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        expect(await screen.findByDisplayValue(mockData.title)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockData.description)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockData.status)).toBeInTheDocument();
    });

    test('バリデーションエラー（タイトル空）表示', async () => {
        const mockData = {
            title: '',
            description: 'Desc',
            status: 'Open',
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        expect(await screen.findByDisplayValue(mockData.description)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '' } });
        fireEvent.click(screen.getByText('更新'));

        expect(await screen.findByText('タイトルは必須です。')).toBeInTheDocument();
    });

    test('バリデーションエラー（無効なステータス）表示', async () => {
        const mockData = {
            title: 'Title',
            description: 'Desc',
            status: 'Open',
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        expect(await screen.findByDisplayValue(mockData.title)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('ステータス'), { target: { value: 'InvalidStatus' } });
        fireEvent.click(screen.getByText('更新'));

        expect(await screen.findByText('無効なステータスです。')).toBeInTheDocument();
    });

    test('正常に送信できてonUpdateSuccessが呼ばれる', async () => {
        const mockData = {
            title: 'Title',
            description: 'Desc',
            status: 'Open',
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
        });
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        expect(await screen.findByDisplayValue(mockData.title)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'Updated Title' } });
        fireEvent.click(screen.getByText('更新'));

        await waitFor(() => {
            expect(onUpdateSuccess).toHaveBeenCalled();
        });
    });

    test('キャンセルボタンでonCancelが呼ばれる', () => {
        render(<TicketEditForm ticketId={1} authToken={authToken} onUpdateSuccess={onUpdateSuccess} onCancel={onCancel} />);
        fireEvent.click(screen.getByText('キャンセル'));
        expect(onCancel).toHaveBeenCalled();
    });
});