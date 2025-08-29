import React, { useState } from 'react';

// チケット作成フォームの入力データ型定義
export interface NewTicketFormData {
    title: string;
    description: string;
    priority: string;
    category: string;
    assignee: string;
    dueDate: string;
}

interface NewTicketFormProps {
    // フォーム送信時に呼ばれるコールバック
    onSubmit: (data: NewTicketFormData) => void;
    // 担当者候補リスト（idと表示名）
    assignees: { id: string; name: string }[];
    // カテゴリ候補リスト
    categories: string[];
    // 優先度候補リスト
    priorities: string[];
}

export const NewTicketForm: React.FC<NewTicketFormProps> = ({
    onSubmit,
    assignees,
    categories,
    priorities,
}) => {
    // フォームの状態管理
    const [formData, setFormData] = useState<NewTicketFormData>({
        title: '',
        description: '',
        priority: priorities.length > 0 ? priorities[0] : '',
        category: categories.length > 0 ? categories[0] : '',
        assignee: assignees.length > 0 ? assignees[0].id : '',
        dueDate: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 入力変更時のハンドラ
    const handleChange = (field: keyof NewTicketFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' })); // エラークリア
    };

    // フォーム送信時のバリデーションと送信処理
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 簡易バリデーション
        const newErrors: { [key: string]: string } = {};
        if (!formData.title.trim()) {
            newErrors.title = 'タイトルは必須です';
        }
        if (formData.dueDate && Number.isNaN(Date.parse(formData.dueDate))) {
            newErrors.dueDate = '有効な日付を入力してください';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // バリデーション通過したら親にデータを渡す
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white">
            <div>
                <label htmlFor="title" className="block font-medium mb-1">
                    タイトル
                    <span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
                    placeholder="チケットのタイトルを入力"
                    aria-invalid={!!errors.title}
                    aria-describedby="title-error"
                    className="w-full border rounded px-2 py-1"
                />
                {errors.title && (
                    <p id="title-error" className="text-red-600 text-sm mt-1">
                        {errors.title}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="description" className="block font-medium mb-1">
                    説明
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                    placeholder="チケットの詳細説明を入力"
                    rows={4}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label htmlFor="priority" className="block font-medium mb-1">
                    優先度
                </label>
                <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('priority', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                >
                    {priorities.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="category" className="block font-medium mb-1">
                    カテゴリ
                </label>
                <select
                    id="category"
                    value={formData.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('category', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                >
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="assignee" className="block font-medium mb-1">
                    担当者
                </label>
                <select
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('assignee', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                >
                    {assignees.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="dueDate" className="block font-medium mb-1">
                    期限日
                </label>
                <input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('dueDate', e.target.value)}
                    aria-invalid={!!errors.dueDate}
                    aria-describedby="dueDate-error"
                    className="w-full border rounded px-2 py-1"
                />
                {errors.dueDate && (
                    <p id="dueDate-error" className="text-red-600 text-sm mt-1">
                        {errors.dueDate}
                    </p>
                )}
            </div>

            <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700">
                    チケット作成
                </button>
            </div>
        </form>
    );
};
