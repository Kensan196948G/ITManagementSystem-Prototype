import React, { useState } from 'react';
import axios from 'axios';

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            alert(`ログイン成功: ${response.data.user.username}`);
            // TODO: ログイン成功後の処理（例: ユーザー情報の保存、画面遷移）
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('ログインに失敗しました。');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">ログイン</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <div className="mb-4">
                <label htmlFor="username" className="block mb-1 font-semibold">ユーザー名</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block mb-1 font-semibold">パスワード</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'ログイン中...' : 'ログイン'}
            </button>
        </form>
    );
};

export default LoginForm;