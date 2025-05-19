/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // jest-domの型定義をインポート
import NotificationList from '../NotificationList';

describe('NotificationList', () => {
    const mockNotifications = [
        {
            id: 1,
            user_id: 'user1',
            message: '通知メッセージ1',
            is_read: false,
            created_at: '2025-05-19T06:00:00Z',
        },
        {
            id: 2,
            user_id: 'user2',
            message: '通知メッセージ2',
            is_read: true,
            created_at: '2025-05-18T12:00:00Z',
        },
    ];

    beforeEach(() => {
        jest.resetAllMocks();
        // localStorageのgetItemをモック
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'authToken') return 'mocked-token';
            return null;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('ローディング表示が出ること', async () => {
        // fetchが解決しないPromiseを返すことでローディング状態をテスト
        global.fetch = jest.fn(() => new Promise(() => { }));
        render(<NotificationList />);
        expect(screen.getByText(/ローディング中/i)).toBeInTheDocument();
    });

    test('APIエラー時にエラーメッセージが表示されること', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response)
        );
        render(<NotificationList />);
        const errorMessage = await screen.findByText(/APIエラー: 500 Internal Server Error/i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('通知が空の場合に「通知はありません」が表示されること', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            } as Response)
        );
        render(<NotificationList />);
        const noNotificationMessage = await screen.findByText(/通知はありません/i);
        expect(noNotificationMessage).toBeInTheDocument();
    });

    test('通知リストが正しく表示されること', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockNotifications),
            } as Response)
        );
        render(<NotificationList />);
        for (const notification of mockNotifications) {
            const messageElement = await screen.findByText(notification.message);
            expect(messageElement).toBeInTheDocument();
            const time = screen.getByText(new RegExp(new Date(notification.created_at).toLocaleString()));
            expect(time).toBeInTheDocument();
        }
    });

    test('認証トークンがない場合にエラーが表示されること', async () => {
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        render(<NotificationList />);
        const errorMessage = await screen.findByText(/認証トークンが見つかりません/i);
        expect(errorMessage).toBeInTheDocument();
    });

    // 追加テスト
    test('APIのJSONパースエラー時にエラーメッセージが表示されること', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.reject(new Error('JSON parse error')),
            } as Response)
        );
        render(<NotificationList />);
        // 修正ポイント: エラーメッセージ文言をNotificationList.tsxの実際のエラーメッセージに合わせる
        const errorMessage = await screen.findByText((content) =>
            content.includes('JSON parse error')
        );
        expect(errorMessage).toBeInTheDocument();
    });

    test('通知の既読・未読に応じて適切なスタイルが適用されていること', async () => {
        const notifications = [
            { id: 1, user_id: 'u1', message: '未読通知', is_read: false, created_at: new Date().toISOString() },
            { id: 2, user_id: 'u2', message: '既読通知', is_read: true, created_at: new Date().toISOString() },
        ];
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(notifications),
            } as Response)
        );
        render(<NotificationList />);
        for (const notification of notifications) {
            const messageElement = await screen.findByText(notification.message);
            expect(messageElement).toBeInTheDocument();
            if (notification.is_read) {
                // 修正ポイント: 既読・未読のスタイルはNotificationList.tsxのクラス名に合わせて検証
                expect(messageElement.parentElement).toHaveClass('bg-gray-100');
            } else {
                expect(messageElement.parentElement).toHaveClass('bg-blue-100');
            }
        }
    });
});