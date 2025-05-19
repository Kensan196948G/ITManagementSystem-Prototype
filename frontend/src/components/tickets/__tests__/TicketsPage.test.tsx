import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketsPage from '../TicketsPage';

// TicketList, TicketDetail, TicketEditFormはモック化して動作確認に集中
jest.mock('../TicketList', () => (props: any) => (
    <div>
        <button onClick={() => props.onSelectTicket(1)}>Select Ticket 1</button>
    </div>
));
jest.mock('../TicketDetail', () => (props: any) => (
    <div>TicketDetail Component for ticketId: {props.ticketId}</div>
));
jest.mock('../TicketEditForm', () => (props: any) => (
    <div>
        TicketEditForm Component for ticketId: {props.ticketId}
        <button onClick={props.onUpdateSuccess}>Update Success</button>
        <button onClick={props.onCancel}>Cancel</button>
    </div>
));

describe('TicketsPage', () => {
    const authToken = 'dummy-token';

    test('初期状態でチケット選択を促すメッセージが表示される', () => {
        render(<TicketsPage authToken={authToken} />);
        expect(screen.getByText('チケットを選択してください。')).toBeInTheDocument();
    });

    test('チケット選択で詳細表示に切り替わる', () => {
        render(<TicketsPage authToken={authToken} />);
        fireEvent.click(screen.getByText('Select Ticket 1'));
        expect(screen.getByText('TicketDetail Component for ticketId: 1')).toBeInTheDocument();
    });

    test('編集ボタン押下で編集フォームに切り替わる', () => {
        render(<TicketsPage authToken={authToken} />);
        fireEvent.click(screen.getByText('Select Ticket 1'));
        fireEvent.click(screen.getByText('編集'));
        expect(screen.getByText('TicketEditForm Component for ticketId: 1')).toBeInTheDocument();
    });

    test('編集キャンセルで詳細表示に戻る', () => {
        render(<TicketsPage authToken={authToken} />);
        fireEvent.click(screen.getByText('Select Ticket 1'));
        fireEvent.click(screen.getByText('編集'));
        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.getByText('TicketDetail Component for ticketId: 1')).toBeInTheDocument();
    });

    test('更新成功で編集モード解除し詳細表示に戻る', () => {
        render(<TicketsPage authToken={authToken} />);
        fireEvent.click(screen.getByText('Select Ticket 1'));
        fireEvent.click(screen.getByText('編集'));
        fireEvent.click(screen.getByText('Update Success'));
        expect(screen.getByText('TicketDetail Component for ticketId: 1')).toBeInTheDocument();
    });
});