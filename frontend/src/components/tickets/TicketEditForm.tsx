import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface TicketEditFormProps {
    ticketId: number | null;
    authToken: string;
    onUpdateSuccess: () => void;
    onCancel: () => void;
}

interface TicketData {
    title: string;
    description: string;
    status: string;
}

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

const TicketEditForm: React.FC<TicketEditFormProps> = ({ ticketId, authToken, onUpdateSuccess, onCancel }) => {
    const [formData, setFormData] = useState<TicketData>({
        title: '',
        description: '',
        status: 'Open',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Partial<TicketData>>({});

    useEffect(() => {
        if (ticketId === null) {
            return;
        }
        const fetchTicket = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/tickets/${ticketId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(`APIエラー: ${response.status}`);
                }
                const data = await response.json();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    status: data.status || 'Open',
                });
            } catch (err: any) {
                setError(err.message || '不明なエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId, authToken]);

    const validate = () => {
        const errors: Partial<TicketData> = {};
        if (!formData.title.trim()) {
            errors.title = 'タイトルは必須です。';
        }
        if (!statusOptions.includes(formData.status)) {
            errors.status = '無効なステータスです。';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status}`);
            }
            onUpdateSuccess();
        } catch (err: any) {
            setError(err.message || '更新に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (ticketId === null) return <p>編集するチケットが選択されていません。</p>;
    if (loading) return <p>読み込み中...</p>;
    if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>チケット編集</h2>
            <div>
                <label htmlFor="title">タイトル</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.title}
                    aria-describedby="title-error"
                />
                {validationErrors.title && <p id="title-error" style={{ color: 'red' }}>{validationErrors.title}</p>}
            </div>
            <div>
                <label htmlFor="description">説明</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="status">ステータス</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.status}
                    aria-describedby="status-error"
                >
                    {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                {validationErrors.status && <p id="status-error" style={{ color: 'red' }}>{validationErrors.status}</p>}
            </div>
            <button type="submit">更新</button>
            <button type="button" onClick={onCancel} style={{ marginLeft: '8px' }}>キャンセル</button>
        </form>
    );
};

export default TicketEditForm;