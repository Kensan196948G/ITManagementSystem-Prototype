import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
// import Button from '../components/ui/Button'; // 必要に応じてコメントアウト解除
// import Modal from '../components/ui/Modal'; // 必要に応じてコメントアウト解除
// import TextInput from '../components/ui/TextInput'; // 必要に応じてコメントアウト解除
// import Select from '../components/ui/Select'; // 必要に応じてコメントアウト解除
// import Textarea from '../components/ui/Textarea'; // 必要に応じてコメントアウト解除

const ProblemManagementPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [editingProblemData, setEditingProblemData] = useState(null);
    const [problemIdToDelete, setProblemIdToDelete] = useState(null);
    const [newProblemData, setNewProblemData] = useState({
        title: '',
        description: '',
        priority: '',
        category: '', // 問題カテゴリ
        assigned_to_id: null,
        //根本原因分析(RCA)や回避策は詳細画面や編集画面で別途管理する想定
    });
    const [priorities, setPriorities] = useState([]);
    const [users, setUsers] = useState([]); // 担当者用
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]); // 問題カテゴリ用

    // 詳細表示用
    const [currentRcas, setCurrentRcas] = useState([]);
    const [newRcaText, setNewRcaText] = useState('');
    const [rcaLoading, setRcaLoading] = useState(false);
    const [rcaError, setRcaError] = useState(null);

    const [currentWorkarounds, setCurrentWorkarounds] = useState([]);
    const [newWorkaroundText, setNewWorkaroundText] = useState('');
    const [workaroundLoading, setWorkaroundLoading] = useState(false);
    const [workaroundError, setWorkaroundError] = useState(null);

    const [currentComments, setCurrentComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null); // 新規作成・編集用
    const [attachments, setAttachments] = useState([]); // 詳細表示用

    // バッジの表示分け (インシデント管理から流用、必要に応じて調整)
    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'オープン': case 'new': case 'open': return 'warning';
            case '調査中': case 'investigating': return 'info';
            case '解決策適用中': case 'pending': return 'info'; // 仮
            case '解決済み': case 'resolved': case 'closed': return 'success'; // 問題管理では「解決済み」と「クローズ」を分けるか検討
            default: return 'neutral';
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority?.toLowerCase()) {
            case '低': case 'low': return 'success';
            case '中': case 'medium': return 'warning';
            case '高': case 'high': return 'danger';
            case '緊急': case 'critical': return 'critical'; // 問題管理では使わない可能性も
            default: return 'neutral';
        }
    };

    // 問題一覧の取得
    const fetchProblems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/problems');
            setProblems(response.data.problems || response.data || []);
        } catch (err) {
            setError('問題データの取得に失敗しました。');
            console.error('Error fetching problems:', err);
            setProblems([]); // エラー時は空配列をセット
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProblems();
    }, [fetchProblems]);

    // フォーム用マスタデータの取得 (優先度、担当者、ステータス、カテゴリ)
    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const [priorityRes, usersRes, statusRes, categoryRes] = await Promise.all([
                    axios.get('/api/problems/priorities'),
                    axios.get('/api/users'), // 担当者リストは共通のエンドポイントを想定
                    axios.get('/api/problems/statuses'),
                    axios.get('/api/problems/categories')
                ]);
                setPriorities(priorityRes.data.priorities || priorityRes.data || []);
                setUsers(usersRes.data.users || usersRes.data || []);
                setStatuses(statusRes.data.statuses || statusRes.data || []);
                setCategories(categoryRes.data.categories || categoryRes.data || []);
            } catch (err) {
                console.error('Error fetching form data:', err);
                // エラー時のフォールバックデータ (開発用)
                setPriorities([{ id: 'low', name: '低' }, { id: 'medium', name: '中' }, { id: 'high', name: '高' }]);
                setUsers([{ id: 1, username: '担当A' }, { id: 2, username: '担当B' }]);
                setStatuses([{ id: 'open', name: 'オープン' }, { id: 'investigating', name: '調査中' }]);
                setCategories([{ id: 'bug', name: 'バグ' }, { id: 'performance', name: 'パフォーマンス' }]);
            }
        };
        fetchFormData();
    }, []);

    // 根本原因分析(RCA)の取得
    const fetchRcas = async (problemId) => {
        if (!problemId) return;
        setRcaLoading(true);
        setRcaError(null);
        try {
            const response = await axios.get(`/api/problems/${problemId}/rca`);
            setCurrentRcas(response.data.rcas || response.data || []);
        } catch (err) {
            setRcaError('根本原因分析の取得に失敗しました。');
            console.error('Error fetching RCAs:', err);
            setCurrentRcas([]);
        } finally {
            setRcaLoading(false);
        }
    };

    // 回避策の取得
    const fetchWorkarounds = async (problemId) => {
        if (!problemId) return;
        setWorkaroundLoading(true);
        setWorkaroundError(null);
        try {
            const response = await axios.get(`/api/problems/${problemId}/workarounds`);
            setCurrentWorkarounds(response.data.workarounds || response.data || []);
        } catch (err) {
            setWorkaroundError('回避策の取得に失敗しました。');
            console.error('Error fetching workarounds:', err);
            setCurrentWorkarounds([]);
        } finally {
            setWorkaroundLoading(false);
        }
    };


    // コメントの取得
    const fetchComments = async (problemId) => {
        if (!problemId) return;
        setCommentLoading(true);
        setCommentError(null);
        try {
            const response = await axios.get(`/api/problems/${problemId}/comments`);
            setCurrentComments(response.data.comments || response.data || []);
        } catch (err) {
            setCommentError('コメントの取得に失敗しました。');
            console.error('Error fetching comments:', err);
            setCurrentComments([]);
        } finally {
            setCommentLoading(false);
        }
    };

    // 添付ファイルの取得
    const fetchAttachments = async (problemId) => {
        if (!problemId) return;
        try {
            const response = await axios.get(`/api/problems/${problemId}/attachments`);
            setAttachments(response.data.attachments || response.data || []);
        } catch (err) {
            console.error('Error fetching attachments:', err);
            setAttachments([]);
        }
    };


    // モーダル開閉ハンドラ
    const handleCreateModalOpen = () => {
        setNewProblemData({ title: '', description: '', priority: '', category: '', assigned_to_id: null });
        setSelectedFile(null);
        setIsCreateModalOpen(true);
    };
    const handleCreateModalClose = () => setIsCreateModalOpen(false);

    const handleDetailModalOpen = (problem) => {
        setSelectedProblem(problem);
        setIsDetailModalOpen(true);
        fetchComments(problem.id);
        fetchAttachments(problem.id);
        fetchRcas(problem.id);
        fetchWorkarounds(problem.id);
    };
    const handleDetailModalClose = () => {
        setIsDetailModalOpen(false);
        setSelectedProblem(null);
        setCurrentComments([]);
        setNewCommentText('');
        setAttachments([]);
        setCurrentRcas([]);
        setNewRcaText('');
        setCurrentWorkarounds([]);
        setNewWorkaroundText('');
    };

    const handleEditModalOpen = (problem) => {
        const problemToEdit = {
            id: problem.id,
            title: problem.title || '',
            description: problem.description || '',
            priority: problem.priority_value || problem.priority_name || problem.priority || '',
            category: problem.category_value || problem.category_name || problem.category || '',
            assigned_to_id: problem.assigned_to_id || problem.assignee_id || null,
            status: problem.status_value || problem.status_name || problem.status || '',
            // RCAとWorkaroundは詳細画面で編集・追加する形式を想定。編集モーダルでは主要情報のみ。
        };
        setEditingProblemData(problemToEdit);
        setSelectedFile(null);
        fetchAttachments(problem.id); // 編集時にも添付ファイルは表示
        if (isDetailModalOpen) setIsDetailModalOpen(false);
        setIsEditModalOpen(true);
    };
    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setEditingProblemData(null);
        setSelectedFile(null);
        setAttachments([]);
    };

    const handleDeleteConfirmModalOpen = (problemId) => {
        setProblemIdToDelete(problemId);
        setIsDeleteConfirmModalOpen(true);
    };
    const handleDeleteConfirmModalClose = () => {
        setIsDeleteConfirmModalOpen(false);
        setProblemIdToDelete(null);
    };

    // フォーム入力ハンドラ
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProblemData({ ...newProblemData, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProblemData({ ...editingProblemData, [name]: value });
    };

    const handleCommentInputChange = (e) => setNewCommentText(e.target.value);
    const handleRcaInputChange = (e) => setNewRcaText(e.target.value);
    const handleWorkaroundInputChange = (e) => setNewWorkaroundText(e.target.value);

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);


    // --- CRUD操作 ---
    const handleCreateProblem = async (e) => {
        e.preventDefault();
        if (!newProblemData.title || !newProblemData.priority || !newProblemData.category) {
            alert('タイトル、優先度、カテゴリは必須です。'); return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('title', newProblemData.title);
        formData.append('description', newProblemData.description);
        formData.append('priority', newProblemData.priority);
        formData.append('category', newProblemData.category); // カテゴリを追加
        if (newProblemData.assigned_to_id) {
            formData.append('assigned_to_id', parseInt(newProblemData.assigned_to_id));
        }
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            // 問題作成API (ファイル添付は別エンドポイントの場合、別途呼び出し)
            const problemResponse = await axios.post('/api/problems', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // ファイル添付が成功した場合、問題作成APIのレスポンスに problem_id が含まれる想定
            // 必要であれば、ここで /api/problems/{problem_id}/attachments にPOSTする
            // if (selectedFile && problemResponse.data.id) {
            //     const attachmentFormData = new FormData();
            //     attachmentFormData.append('file', selectedFile);
            //     await axios.post(`/api/problems/${problemResponse.data.id}/attachments`, attachmentFormData);
            // }

            handleCreateModalClose();
            fetchProblems(); // 問題一覧を再取得
        } catch (err) {
            setError('問題の作成に失敗しました。');
            console.error('Error creating problem:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProblem = async (e) => {
        e.preventDefault();
        if (!editingProblemData || !editingProblemData.title || !editingProblemData.priority || !editingProblemData.category || !editingProblemData.status) {
            alert('タイトル、優先度、カテゴリ、ステータスは必須です。'); return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('title', editingProblemData.title);
        formData.append('description', editingProblemData.description);
        formData.append('priority', editingProblemData.priority);
        formData.append('category', editingProblemData.category);
        formData.append('status', editingProblemData.status);
        if (editingProblemData.assigned_to_id) {
            formData.append('assigned_to_id', parseInt(editingProblemData.assigned_to_id));
        } else {
            formData.append('assigned_to_id', ''); // 担当者未割り当ての場合
        }
        if (selectedFile) { // 新しいファイルが選択された場合のみ追加
            formData.append('file', selectedFile);
        }

        try {
            await axios.put(`/api/problems/${editingProblemData.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }, // ファイルがある場合は必要
            });
            // ファイル添付の更新ロジック (必要であれば)
            handleEditModalClose();
            fetchProblems();
        } catch (err) {
            setError('問題の更新に失敗しました。');
            console.error('Error updating problem:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProblem = async () => {
        if (!problemIdToDelete) return;
        setLoading(true);
        try {
            await axios.delete(`/api/problems/${problemIdToDelete}`);
            handleDeleteConfirmModalClose();
            fetchProblems();
        } catch (err) {
            setError('問題の削除に失敗しました。');
            console.error('Error deleting problem:', err);
            handleDeleteConfirmModalClose(); // エラーでもモーダルは閉じる
        } finally {
            setLoading(false);
        }
    };

    // コメント追加
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !selectedProblem) return;
        setCommentLoading(true);
        try {
            await axios.post(`/api/problems/${selectedProblem.id}/comments`, { comment_text: newCommentText });
            setNewCommentText('');
            fetchComments(selectedProblem.id);
        } catch (err) {
            setCommentError('コメントの投稿に失敗しました。');
            console.error('Error adding comment:', err);
        } finally {
            setCommentLoading(false);
        }
    };

    // RCA追加 (簡易版、実際はフォームや専用モーダルを検討)
    const handleAddRca = async (e) => {
        e.preventDefault();
        if (!newRcaText.trim() || !selectedProblem) return;
        setRcaLoading(true);
        try {
            // APIの仕様に合わせてpayloadを調整
            await axios.post(`/api/problems/${selectedProblem.id}/rca`, { description: newRcaText /* 他のRCAフィールド */ });
            setNewRcaText('');
            fetchRcas(selectedProblem.id);
        } catch (err) {
            setRcaError('根本原因分析の登録に失敗しました。');
            console.error('Error adding RCA:', err);
        } finally {
            setRcaLoading(false);
        }
    };

    // 回避策追加 (簡易版)
    const handleAddWorkaround = async (e) => {
        e.preventDefault();
        if (!newWorkaroundText.trim() || !selectedProblem) return;
        setWorkaroundLoading(true);
        try {
            // APIの仕様に合わせてpayloadを調整
            await axios.post(`/api/problems/${selectedProblem.id}/workarounds`, { description: newWorkaroundText /* 他の回避策フィールド */ });
            setNewWorkaroundText('');
            fetchWorkarounds(selectedProblem.id);
        } catch (err) {
            setWorkaroundError('回避策の登録に失敗しました。');
            console.error('Error adding workaround:', err);
        } finally {
            setWorkaroundLoading(false);
        }
    };


    // --- JSX ---
    return (
        <Layout>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">問題管理</h1>
                    <button onClick={handleCreateModalOpen} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out">新規作成</button>
                </div>

                {/* フィルタリングUI (未実装) */}
                <div className="mb-6 p-4 bg-white shadow rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">フィルタ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input type="text" placeholder="キーワード検索" className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        {/* 他のフィルタ条件 (ステータス、優先度、カテゴリなど) */}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">フィルタリング・ソート・ページネーション機能は現在未実装です。</p>
                </div>

                {loading && <div className="text-center py-4"><span className="text-lg font-medium text-gray-600">読み込み中...</span></div>}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p className="font-bold">エラー</p><p>{error}</p></div>}

                {!loading && !error && (
                    <div className="bg-white shadow-lg rounded-lg overflow-x-auto"> {/* overflow-x-auto を追加 */}
                        <table className="min-w-full w-full table-auto">
                            <thead className="bg-gray-100">
                                <tr className="text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">ID</th>
                                    <th className="py-3 px-6 text-left">タイトル</th>
                                    <th className="py-3 px-6 text-center">ステータス</th>
                                    <th className="py-3 px-6 text-center">優先度</th>
                                    <th className="py-3 px-6 text-left">カテゴリ</th>
                                    <th className="py-3 px-6 text-left">担当者</th>
                                    <th className="py-3 px-6 text-left">作成日時</th>
                                    <th className="py-3 px-6 text-center">アクション</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {problems.length === 0 ? (
                                    <tr><td colSpan="8" className="py-4 px-6 text-center text-gray-500">表示する問題はありません。</td></tr>
                                ) : (
                                    problems.map((problem) => (
                                        <tr key={problem.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                                            <td className="py-3 px-6 text-left whitespace-nowrap"><span className="font-medium">{problem.id}</span></td>
                                            <td className="py-3 px-6 text-left">{problem.title}</td>
                                            <td className="py-3 px-6 text-center"><Badge variant={getStatusBadgeVariant(problem.status_name || problem.status)}>{problem.status_name || problem.status}</Badge></td>
                                            <td className="py-3 px-6 text-center"><Badge variant={getPriorityBadgeVariant(problem.priority_name || problem.priority)}>{problem.priority_name || problem.priority}</Badge></td>
                                            <td className="py-3 px-6 text-left">{problem.category_name || problem.category || 'N/A'}</td>
                                            <td className="py-3 px-6 text-left">{problem.assignee_name || problem.assigned_to || '未割り当て'}</td>
                                            <td className="py-3 px-6 text-left">{problem.created_at ? new Date(problem.created_at).toLocaleString('ja-JP') : 'N/A'}</td>
                                            <td className="py-3 px-6 text-center">
                                                <div className="flex item-center justify-center space-x-2">
                                                    <button onClick={() => handleDetailModalOpen(problem)} title="詳細" className="text-blue-500 hover:text-blue-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></button>
                                                    <button onClick={() => handleEditModalOpen(problem)} title="編集" className="text-green-500 hover:text-green-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                                    <button onClick={() => handleDeleteConfirmModalOpen(problem.id)} title="削除" className="text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* ページネーション (未実装) */}
                {!loading && !error && problems.length > 0 && (<div className="mt-6 flex justify-center"><p className="text-sm text-gray-500">ページネーション (未実装)</p></div>)}

                {/* 新規作成モーダル */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"> {/* top-20からtop-10に変更 */}
                            <div className="flex justify-between items-center pb-3 border-b"><h3 className="text-2xl font-semibold text-gray-700">新規問題作成</h3><button onClick={handleCreateModalClose} className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                            <form onSubmit={handleCreateProblem} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-2"> {/* space-y-6から4, max-h, overflow-y-auto追加 */}
                                <div><label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label><input type="text" name="title" id="title" value={newProblemData.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">説明</label><textarea name="description" id="description" rows="3" value={newProblemData.description} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea></div>
                                <div><label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">優先度 <span className="text-red-500">*</span></label><select name="priority" id="priority" value={newProblemData.priority} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">選択してください</option>{priorities.map(p => <option key={p.id || p.value || p.name} value={p.value || p.name || p.id}>{p.name || p.label || p.id}</option>)}</select></div>
                                <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">カテゴリ <span className="text-red-500">*</span></label><select name="category" id="category" value={newProblemData.category} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">選択してください</option>{categories.map(c => <option key={c.id || c.value || c.name} value={c.value || c.name || c.id}>{c.name || c.label || c.id}</option>)}</select></div>
                                <div><label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700 mb-1">担当者 (任意)</label><select name="assigned_to_id" id="assigned_to_id" value={newProblemData.assigned_to_id || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">未割り当て</option>{users.map(user => <option key={user.id} value={user.id}>{user.username || user.name}</option>)}</select></div>
                                <div><label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">添付ファイル</label><input type="file" name="file" id="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />{selectedFile && <p className="text-xs text-gray-500 mt-1">選択中: {selectedFile.name}</p>}</div>
                                <div className="flex justify-end space-x-3 pt-4 border-t mt-6"><button type="button" onClick={handleCreateModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">キャンセル</button><button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150">{loading ? '保存中...' : '保存'}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 編集モーダル */}
                {isEditModalOpen && editingProblemData && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center pb-3 border-b"><h3 className="text-2xl font-semibold text-gray-700">問題編集 (ID: {editingProblemData.id})</h3><button onClick={handleEditModalClose} className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                            <form onSubmit={handleUpdateProblem} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                                <div><label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label><input type="text" name="title" id="edit-title" value={editingProblemData.title} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">説明</label><textarea name="description" id="edit-description" rows="3" value={editingProblemData.description} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea></div>
                                <div><label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">優先度 <span className="text-red-500">*</span></label><select name="priority" id="edit-priority" value={editingProblemData.priority} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">選択してください</option>{priorities.map(p => <option key={p.id || p.value || p.name} value={p.value || p.name || p.id}>{p.name || p.label || p.id}</option>)}</select></div>
                                <div><label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">カテゴリ <span className="text-red-500">*</span></label><select name="category" id="edit-category" value={editingProblemData.category} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">選択してください</option>{categories.map(c => <option key={c.id || c.value || c.name} value={c.value || c.name || c.id}>{c.name || c.label || c.id}</option>)}</select></div>
                                <div><label htmlFor="edit-assigned_to_id" className="block text-sm font-medium text-gray-700 mb-1">担当者</label><select name="assigned_to_id" id="edit-assigned_to_id" value={editingProblemData.assigned_to_id || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">未割り当て</option>{users.map(user => <option key={user.id} value={user.id}>{user.username || user.name}</option>)}</select></div>
                                <div><label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">ステータス <span className="text-red-500">*</span></label><select name="status" id="edit-status" value={editingProblemData.status} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">選択してください</option>{statuses.map(s => <option key={s.id || s.value || s.name} value={s.value || s.name || s.id}>{s.name || s.label || s.id}</option>)}</select></div>
                                <div><label htmlFor="edit-file" className="block text-sm font-medium text-gray-700 mb-1">添付ファイル (新規追加)</label><input type="file" name="file" id="edit-file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />{selectedFile && <p className="text-xs text-gray-500 mt-1">選択中: {selectedFile.name}</p>}</div>
                                {attachments.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-sm font-medium text-gray-700 mb-1">既存の添付ファイル:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {attachments.map(file => (
                                                <li key={file.id || file.name}>
                                                    <a href={file.url || `/api/attachments/download/${file.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">{file.filename || file.name}</a>
                                                    {/* TODO: 添付ファイル削除機能 */}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="flex justify-end space-x-3 pt-4 border-t mt-6"><button type="button" onClick={handleEditModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">キャンセル</button><button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150">{loading ? '更新中...' : '更新'}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 詳細表示モーダル */}
                {isDetailModalOpen && selectedProblem && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center pb-3 border-b mb-4"><h3 className="text-2xl font-semibold text-gray-800">問題詳細: ID {selectedProblem.id}</h3><button onClick={handleDetailModalClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button></div>
                            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-3"> {/* pr-2 から pr-3 に変更 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                    <div><p className="text-sm font-medium text-gray-500">タイトル</p><p className="text-lg text-gray-800">{selectedProblem.title}</p></div>
                                    <div><p className="text-sm font-medium text-gray-500">ステータス</p><Badge variant={getStatusBadgeVariant(selectedProblem.status_name || selectedProblem.status)}>{selectedProblem.status_name || selectedProblem.status}</Badge></div>
                                    <div><p className="text-sm font-medium text-gray-500">優先度</p><Badge variant={getPriorityBadgeVariant(selectedProblem.priority_name || selectedProblem.priority)}>{selectedProblem.priority_name || selectedProblem.priority}</Badge></div>
                                    <div><p className="text-sm font-medium text-gray-500">カテゴリ</p><p className="text-gray-800">{selectedProblem.category_name || selectedProblem.category || 'N/A'}</p></div>
                                    <div><p className="text-sm font-medium text-gray-500">担当者</p><p className="text-gray-800">{selectedProblem.assignee_name || selectedProblem.assigned_to || '未割り当て'}</p></div>
                                    <div><p className="text-sm font-medium text-gray-500">報告者</p><p className="text-gray-800">{selectedProblem.reporter_name || selectedProblem.reporter_id || 'N/A'}</p></div> {/* 報告者を追加 */}
                                    <div><p className="text-sm font-medium text-gray-500">作成日時</p><p className="text-gray-800">{selectedProblem.created_at ? new Date(selectedProblem.created_at).toLocaleString('ja-JP') : 'N/A'}</p></div>
                                    <div><p className="text-sm font-medium text-gray-500">最終更新日時</p><p className="text-gray-800">{selectedProblem.updated_at ? new Date(selectedProblem.updated_at).toLocaleString('ja-JP') : 'N/A'}</p></div>
                                </div>
                                <div className="pt-2"><p className="text-sm font-medium text-gray-500">説明</p><p className="text-gray-800 whitespace-pre-wrap">{selectedProblem.description || '説明はありません。'}</p></div>

                                {/* 根本原因分析 (RCA) 表示・入力エリア */}
                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">根本原因分析 (RCA)</h4>
                                    {rcaLoading && <p className="text-sm text-gray-500">RCAを読み込み中...</p>}
                                    {rcaError && <p className="text-sm text-red-500">{rcaError}</p>}
                                    {!rcaLoading && !rcaError && (
                                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto"> {/* max-h-60 から 40 */}
                                            {currentRcas.length > 0 ? currentRcas.map(rca => (
                                                <div key={rca.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{rca.description}</p>
                                                    {/* 他のRCA情報 (作成者、日時など) も表示 */}
                                                </div>
                                            )) : <p className="text-sm text-gray-500">根本原因分析はまだ登録されていません。</p>}
                                        </div>
                                    )}
                                    {/* RCA入力フォーム (簡易版) - 本来は専用の入力UIや編集機能が必要 */}
                                    <form onSubmit={handleAddRca} className="flex items-start space-x-2">
                                        <textarea value={newRcaText} onChange={handleRcaInputChange} placeholder="根本原因分析を記述..." rows="2" className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        <button type="submit" disabled={rcaLoading || !newRcaText.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150">{rcaLoading ? '登録中...' : '登録'}</button>
                                    </form>
                                </div>

                                {/* 回避策 表示・入力エリア */}
                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">回避策</h4>
                                    {workaroundLoading && <p className="text-sm text-gray-500">回避策を読み込み中...</p>}
                                    {workaroundError && <p className="text-sm text-red-500">{workaroundError}</p>}
                                    {!workaroundLoading && !workaroundError && (
                                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                                            {currentWorkarounds.length > 0 ? currentWorkarounds.map(workaround => (
                                                <div key={workaround.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{workaround.description}</p>
                                                    {/* 他の回避策情報 (作成者、日時、編集・削除ボタンなど) も表示 */}
                                                </div>
                                            )) : <p className="text-sm text-gray-500">回避策はまだ登録されていません。</p>}
                                        </div>
                                    )}
                                    {/* 回避策入力フォーム (簡易版) */}
                                    <form onSubmit={handleAddWorkaround} className="flex items-start space-x-2">
                                        <textarea value={newWorkaroundText} onChange={handleWorkaroundInputChange} placeholder="回避策を記述..." rows="2" className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        <button type="submit" disabled={workaroundLoading || !newWorkaroundText.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150">{workaroundLoading ? '登録中...' : '登録'}</button>
                                    </form>
                                </div>

                                {/* コメント機能 */}
                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-3">コメント</h4>
                                    {commentLoading && <p className="text-sm text-gray-500">コメントを読み込み中...</p>}
                                    {commentError && <p className="text-sm text-red-500">{commentError}</p>}
                                    {!commentLoading && !commentError && (
                                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto"> {/* max-h-60 から 40 */}
                                            {currentComments.length > 0 ? currentComments.map(comment => (
                                                <div key={comment.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-semibold text-sm text-gray-700">{comment.user_name || '不明なユーザー'}</span>
                                                        <span className="text-xs text-gray-500">{comment.created_at ? new Date(comment.created_at).toLocaleString('ja-JP') : ''}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.comment_text}</p>
                                                </div>
                                            )) : <p className="text-sm text-gray-500">コメントはまだありません。</p>}
                                        </div>
                                    )}
                                    <form onSubmit={handleAddComment} className="flex items-start space-x-2">
                                        <textarea value={newCommentText} onChange={handleCommentInputChange} placeholder="コメントを追加..." rows="2" className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        <button type="submit" disabled={commentLoading || !newCommentText.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150">{commentLoading ? '送信中...' : '送信'}</button>
                                    </form>
                                </div>

                                {/* 添付ファイル */}
                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">添付ファイル</h4>
                                    {attachments.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {attachments.map(file => (
                                                <li key={file.id || file.name} className="text-sm">
                                                    <a href={file.url || `/api/attachments/download/${file.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">{file.filename || file.name}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">添付ファイルはありません。</p>
                                    )}
                                    {/* TODO: 添付ファイル追加UI (詳細モーダル内にも必要か検討) */}
                                </div>
                                {/* 関連インシデント表示エリア (未実装) */}
                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">関連インシデント</h4>
                                    <p className="text-sm text-gray-500">関連インシデント表示機能は未実装です。</p>
                                    {/* ここに関連インシデントの一覧やリンクを表示 */}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                                <button type="button" onClick={handleDetailModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">閉じる</button>
                                <button onClick={() => handleEditModalOpen(selectedProblem)} className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150">編集</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 削除確認モーダル */}
                {isDeleteConfirmModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-1/3 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">問題削除確認</h3>
                            <p className="text-gray-600 mb-6">問題 ID: {problemIdToDelete} を本当に削除しますか？この操作は元に戻せません。</p>
                            <div className="flex justify-end space-x-3">
                                <button onClick={handleDeleteConfirmModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">キャンセル</button>
                                <button onClick={handleDeleteProblem} disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition duration-150">{loading ? '削除中...' : '削除'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProblemManagementPage;