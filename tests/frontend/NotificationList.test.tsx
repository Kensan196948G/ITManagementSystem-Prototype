import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import NotificationList from '../../packages/frontend/src/components/notifications/NotificationList';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationList', () => {
    it('通知を正しく表示する', async () => {
        const notifications = [
            {
                id: 1,
                title: 'テスト通知',
                message: 'これはテスト通知です。',
                user_id: 1,
                created_at: new Date().toISOString(),
                read: false,
            },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: notifications });

        render(<NotificationList />);

        expect(screen.getByText('読み込み中...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('テスト通知')).toBeInTheDocument();
            expect(screen.getByText('これはテスト通知です。')).toBeInTheDocument();
        });
    });

    it('通知取得失敗時にエラーメッセージを表示する', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('通知の取得に失敗しました。')).toBeInTheDocument();
        });
    });
});