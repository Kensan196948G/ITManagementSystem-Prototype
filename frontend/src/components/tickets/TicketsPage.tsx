import React, { useState } from 'react';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import TicketEditForm from './TicketEditForm';

interface TicketsPageProps {
    authToken: string;
}

const TicketsPage: React.FC<TicketsPageProps> = ({ authToken }) => {
    // 選択中のチケットIDを管理
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    // 編集モードの管理（true: 編集フォーム表示、false: 詳細表示）
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // チケット選択時のハンドラ
    const handleSelectTicket = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setIsEditing(false); // 詳細表示モードに切り替え
    };

    // 編集開始ボタン押下時のハンドラ
    const handleStartEdit = () => {
        if (selectedTicketId !== null) {
            setIsEditing(true);
        }
    };

    // 編集キャンセル時のハンドラ
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // 編集成功時のハンドラ（更新後は詳細表示に戻る）
    const handleUpdateSuccess = () => {
        setIsEditing(false);
        // 必要に応じてチケット一覧の再取得などの処理を追加可能
    };

    return (
        <div className="flex flex-col md:flex-row h-full p-4 gap-4">
            {/* チケット一覧 */}
            <div className="md:w-1/3 border rounded p-2 overflow-auto max-h-[80vh]">
                <TicketList authToken={authToken} onSelectTicket={handleSelectTicket} />
            </div>

            {/* チケット詳細 or 編集フォーム */}
            <div className="md:w-2/3 border rounded p-4 overflow-auto max-h-[80vh] flex flex-col">
                {selectedTicketId === null ? (
                    <p className="text-center text-gray-500">チケットを選択してください。</p>
                ) : isEditing ? (
                    <TicketEditForm
                        ticketId={selectedTicketId}
                        authToken={authToken}
                        onUpdateSuccess={handleUpdateSuccess}
                        onCancel={handleCancelEdit}
                    />
                ) : (
                    <>
                        <TicketDetail ticketId={selectedTicketId} authToken={authToken} />
                        <div className="mt-4">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleStartEdit}
                            >
                                編集
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TicketsPage;