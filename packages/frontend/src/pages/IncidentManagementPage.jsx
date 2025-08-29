import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
// import Button from '../components/ui/Button';
// import Modal from '../components/ui/Modal';
// import TextInput from '../components/ui/TextInput';
// import Select from '../components/ui/Select';
// import Textarea from '../components/ui/Textarea';

function IncidentManagementPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [editingIncidentData, setEditingIncidentData] = useState(null);
  const [incidentIdToDelete, setIncidentIdToDelete] = useState(null);
  const [newIncidentData, setNewIncidentData] = useState({
    title: '',
    description: '',
    priority: '',
    assigned_to_id: null,
  });
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [currentComments, setCurrentComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // 新規作成・編集用
  const [attachments, setAttachments] = useState([]); // 詳細表示用

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'オープン': case 'new': case 'open': return 'warning';
      case '対応中': case 'in progress': case 'pending': return 'info';
      case '解決済み': case 'resolved': return 'success';
      case 'クローズ': case 'closed': return 'neutral';
      default: return 'neutral';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case '低': case 'low': return 'success';
      case '中': case 'medium': return 'warning';
      case '高': case 'high': return 'danger';
      case '緊急': case 'critical': return 'critical';
      default: return 'neutral';
    }
  };

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/incidents');
      setIncidents(response.data.incidents || response.data || []);
    } catch (err) {
      setError('インシデントデータの取得に失敗しました。');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [priorityRes, usersRes, statusRes] = await Promise.all([
          axios.get('/api/incidents/priorities'),
          axios.get('/api/users'),
          axios.get('/api/incidents/statuses'),
        ]);
        setPriorities(priorityRes.data.priorities || priorityRes.data || []);
        setUsers(usersRes.data.users || usersRes.data || []);
        setStatuses(statusRes.data.statuses || statusRes.data || []);
      } catch (err) {
        console.error('Error fetching form data (priorities, users, statuses):', err);
        setPriorities([{ id: 'low', name: '低', value: 'low' }, { id: 'medium', name: '中', value: 'medium' }, { id: 'high', name: '高', value: 'high' }]);
        setUsers([{ id: 1, username: '山田太郎' }, { id: 2, username: '鈴木一郎' }]);
        setStatuses([{ id: 'open', name: 'オープン', value: 'open' }, { id: 'in_progress', name: '対応中', value: 'in_progress' }, { id: 'resolved', name: '解決済み', value: 'resolved' }]);
      }
    };
    fetchFormData();
  }, []);

  const fetchComments = async (incidentId) => {
    if (!incidentId) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      const response = await axios.get(`/api/incidents/${incidentId}/comments`);
      setCurrentComments(response.data.comments || response.data || []);
    } catch (err) {
      setCommentError('コメントの取得に失敗しました。');
      console.error('Error fetching comments:', err);
      setCurrentComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  const fetchAttachments = async (incidentId) => {
    if (!incidentId) return;
    // setLoading(true); // ページ全体のローディングとは別にするか検討
    try {
      const response = await axios.get(`/api/incidents/${incidentId}/attachments`);
      setAttachments(response.data.attachments || response.data || []);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setAttachments([]);
    } finally {
      // setLoading(false);
    }
  };

  const handleCreateModalOpen = () => {
    setNewIncidentData({
      title: '', description: '', priority: '', assigned_to_id: null,
    });
    setSelectedFile(null);
    setIsCreateModalOpen(true);
  };
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedFile(null);
  };

  const handleDetailModalOpen = (incident) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
    fetchComments(incident.id);
    fetchAttachments(incident.id);
  };
  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedIncident(null);
    setCurrentComments([]);
    setNewCommentText('');
    setCommentError(null);
    setAttachments([]);
  };

  const handleEditModalOpen = (incident) => {
    const incidentToEdit = {
      id: incident.id,
      title: incident.title || '',
      description: incident.description || '',
      priority: incident.priority_value || incident.priority_name || incident.priority || '',
      assigned_to_id: incident.assigned_to_id || incident.assignee_id || null,
      status: incident.status_value || incident.status_name || incident.status || '',
    };
    setEditingIncidentData(incidentToEdit);
    setSelectedFile(null); // 編集モーダル開く際もクリア
    if (isDetailModalOpen) setIsDetailModalOpen(false); // 詳細モーダルが開いていれば閉じる
    setIsEditModalOpen(true);
    // 既存の添付ファイルも表示・管理する場合、ここで取得・設定するロジックが必要
    fetchAttachments(incident.id); // 編集時にも添付ファイルを取得
  };
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingIncidentData(null);
    setSelectedFile(null);
    setAttachments([]);
  };

  const handleDeleteConfirmModalOpen = (incidentId) => {
    setIncidentIdToDelete(incidentId);
    setIsDeleteConfirmModalOpen(true);
  };
  const handleDeleteConfirmModalClose = () => {
    setIsDeleteConfirmModalOpen(false);
    setIncidentIdToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncidentData({ ...newIncidentData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingIncidentData({ ...editingIncidentData, [name]: value });
  };

  const handleCommentInputChange = (e) => {
    setNewCommentText(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!newIncidentData.title || !newIncidentData.priority) {
      alert('タイトルと優先度は必須です。'); return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', newIncidentData.title);
    formData.append('description', newIncidentData.description);
    formData.append('priority', newIncidentData.priority);
    if (newIncidentData.assigned_to_id) {
      formData.append('assigned_to_id', parseInt(newIncidentData.assigned_to_id));
    }
    if (selectedFile) {
      formData.append('file', selectedFile); // 'file' はバックエンドAPIの期待するキー名
    }

    try {
      const response = await axios.post('/api/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // ファイル添付APIが別の場合、ここで続けて呼び出す
      // if (selectedFile && response.data.incident_id) {
      //   const attachmentFormData = new FormData();
      //   attachmentFormData.append('file', selectedFile);
      //   await axios.post(`/api/incidents/${response.data.incident_id}/attachments`, attachmentFormData, {
      //     headers: { 'Content-Type': 'multipart/form-data' },
      //   });
      // }
      handleCreateModalClose();
      fetchIncidents();
    } catch (err) {
      setError('インシデントの作成に失敗しました。'); console.error('Error creating incident:', err);
    } finally { setLoading(false); }
  };

  const handleUpdateIncident = async (e) => {
    e.preventDefault();
    if (!editingIncidentData || !editingIncidentData.title || !editingIncidentData.priority) {
      alert('タイトルと優先度は必須です。'); return;
    }
    setLoading(true);
    const formData = new FormData(); // 更新時もFormDataを使用
    formData.append('title', editingIncidentData.title);
    formData.append('description', editingIncidentData.description);
    formData.append('priority', editingIncidentData.priority);
    formData.append('status', editingIncidentData.status);
    if (editingIncidentData.assigned_to_id) {
      formData.append('assigned_to_id', parseInt(editingIncidentData.assigned_to_id));
    } else {
      formData.append('assigned_to_id', ''); // nullの代わりに空文字か、API仕様による
    }
    if (selectedFile) { // 新しいファイルが選択された場合のみ追加
      formData.append('file', selectedFile);
    }
    // 既存の添付ファイルを削除するUIやロジックも必要に応じて追加

    try {
      await axios.put(`/api/incidents/${editingIncidentData.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // ファイルがある場合は必要
      });
      // ファイル添付APIが別の場合の処理
      // if (selectedFile) {
      //   const attachmentFormData = new FormData();
      //   attachmentFormData.append('file', selectedFile);
      //   await axios.post(`/api/incidents/${editingIncidentData.id}/attachments`, attachmentFormData, { // PUT or POST
      //     headers: { 'Content-Type': 'multipart/form-data' },
      //   });
      // }
      handleEditModalClose();
      fetchIncidents();
    } catch (err) {
      setError('インシデントの更新に失敗しました。'); console.error('Error updating incident:', err);
    } finally { setLoading(false); }
  };

  const handleDeleteIncident = async () => {
    if (!incidentIdToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/incidents/${incidentIdToDelete}`);
      handleDeleteConfirmModalClose(); fetchIncidents();
    } catch (err) {
      setError('インシデントの削除に失敗しました。'); console.error('Error deleting incident:', err);
      handleDeleteConfirmModalClose();
    } finally { setLoading(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedIncident) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      const payload = { comment_text: newCommentText };
      await axios.post(`/api/incidents/${selectedIncident.id}/comments`, payload);
      setNewCommentText('');
      fetchComments(selectedIncident.id);
    } catch (err) {
      setCommentError('コメントの投稿に失敗しました。');
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">インシデント管理</h1>
          <button onClick={handleCreateModalOpen} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out">新規作成</button>
        </div>

        <div className="mb-6 p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">フィルタ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" placeholder="キーワード検索" className="p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">フィルタリング機能は現在未実装です。</p>
        </div>

        {loading && <div className="text-center py-4"><span className="text-lg font-medium text-gray-600">読み込み中...</span></div>}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full w-full table-auto">
              <thead className="bg-gray-100">
                <tr className="text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">タイトル</th>
                  <th className="py-3 px-6 text-center">ステータス</th>
                  <th className="py-3 px-6 text-center">優先度</th>
                  <th className="py-3 px-6 text-left">担当者</th>
                  <th className="py-3 px-6 text-left">作成日時</th>
                  <th className="py-3 px-6 text-center">アクション</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {incidents.length === 0 ? (
                  <tr><td colSpan="7" className="py-4 px-6 text-center text-gray-500">表示するインシデントはありません。</td></tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="py-3 px-6 text-left whitespace-nowrap"><span className="font-medium">{incident.id}</span></td>
                      <td className="py-3 px-6 text-left">{incident.title}</td>
                      <td className="py-3 px-6 text-center"><Badge variant={getStatusBadgeVariant(incident.status_name || incident.status)}>{incident.status_name || incident.status}</Badge></td>
                      <td className="py-3 px-6 text-center"><Badge variant={getPriorityBadgeVariant(incident.priority_name || incident.priority)}>{incident.priority_name || incident.priority}</Badge></td>
                      <td className="py-3 px-6 text-left">{incident.assignee_name || incident.assigned_to || '未割り当て'}</td>
                      <td className="py-3 px-6 text-left">{incident.created_at ? new Date(incident.created_at).toLocaleString('ja-JP') : 'N/A'}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <button onClick={() => handleDetailModalOpen(incident)} title="詳細" className="text-blue-500 hover:text-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button onClick={() => handleEditModalOpen(incident)} title="編集" className="text-green-500 hover:text-green-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteConfirmModalOpen(incident.id)} title="削除" className="text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && incidents.length > 0 && (<div className="mt-6 flex justify-center"><p className="text-sm text-gray-500">ページネーション (未実装)</p></div>)}

        {/* 新規作成モーダル */}
        {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-2xl font-semibold text-gray-700">新規インシデント作成</h3>
              <button onClick={handleCreateModalClose} className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreateIncident} className="mt-5 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                  <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" id="title" value={newIncidentData.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea name="description" id="description" rows="4" value={newIncidentData.description} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  優先度
                  <span className="text-red-500">*</span>
                </label>
                <select name="priority" id="priority" value={newIncidentData.priority} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">選択してください</option>
                  {priorities.map((p) => <option key={p.id || p.value || p.name} value={p.value || p.name || p.id}>{p.name || p.label || p.id}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700 mb-1">担当者 (任意)</label>
                <select name="assigned_to_id" id="assigned_to_id" value={newIncidentData.assigned_to_id || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">未割り当て</option>
                  {users.map((user) => <option key={user.id} value={user.id}>{user.username || user.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">添付ファイル</label>
                <input type="file" name="file" id="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {selectedFile && (
                <p className="text-xs text-gray-500 mt-1">
                  選択中:
                  {selectedFile.name}
                </p>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={handleCreateModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">キャンセル</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150">{loading ? '保存中...' : '保存'}</button>
              </div>
            </form>
          </div>
        </div>
        )}

        {/* 編集モーダル */}
        {isEditModalOpen && editingIncidentData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-2xl font-semibold text-gray-700">
                インシデント編集 (ID:
                {editingIncidentData.id}
                )
              </h3>
              <button onClick={handleEditModalClose} className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleUpdateIncident} className="mt-5 space-y-6">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                  <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" id="edit-title" value={editingIncidentData.title} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea name="description" id="edit-description" rows="4" value={editingIncidentData.description} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
                  優先度
                  <span className="text-red-500">*</span>
                </label>
                <select name="priority" id="edit-priority" value={editingIncidentData.priority} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">選択してください</option>
                  {priorities.map((p) => <option key={p.id || p.value || p.name} value={p.value || p.name || p.id}>{p.name || p.label || p.id}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-assigned_to_id" className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                <select name="assigned_to_id" id="edit-assigned_to_id" value={editingIncidentData.assigned_to_id || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">未割り当て</option>
                  {users.map((user) => <option key={user.id} value={user.id}>{user.username || user.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                  <span className="text-red-500">*</span>
                </label>
                <select name="status" id="edit-status" value={editingIncidentData.status} onChange={handleEditInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">選択してください</option>
                  {statuses.map((s) => <option key={s.id || s.value || s.name} value={s.value || s.name || s.id}>{s.name || s.label || s.id}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="edit-file" className="block text-sm font-medium text-gray-700 mb-1">添付ファイル (新規追加)</label>
                <input type="file" name="file" id="edit-file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {selectedFile && (
                <p className="text-xs text-gray-500 mt-1">
                  選択中:
                  {selectedFile.name}
                </p>
                )}
              </div>
              {/* 既存の添付ファイル表示エリア (編集モーダル内) */}
              {attachments.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">既存の添付ファイル:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {attachments.map((file) => (
                    <li key={file.id || file.name}>
                      <a href={file.url || `/api/attachments/download/${file.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">{file.filename || file.name}</a>
                      {/* TODO: 削除ボタン */}
                    </li>
                  ))}
                </ul>
              </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={handleEditModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">キャンセル</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150">{loading ? '更新中...' : '更新'}</button>
              </div>
            </form>
          </div>
        </div>
        )}

        {/* 詳細表示モーダル */}
        {isDetailModalOpen && selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">
                インシデント詳細: ID
                {selectedIncident.id}
              </h3>
              <button onClick={handleDetailModalClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">タイトル</p>
                  <p className="text-lg text-gray-800">{selectedIncident.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ステータス</p>
                  <Badge variant={getStatusBadgeVariant(selectedIncident.status_name || selectedIncident.status)}>{selectedIncident.status_name || selectedIncident.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">優先度</p>
                  <Badge variant={getPriorityBadgeVariant(selectedIncident.priority_name || selectedIncident.priority)}>{selectedIncident.priority_name || selectedIncident.priority}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">担当者</p>
                  <p className="text-gray-800">{selectedIncident.assignee_name || selectedIncident.assigned_to || '未割り当て'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">作成日時</p>
                  <p className="text-gray-800">{selectedIncident.created_at ? new Date(selectedIncident.created_at).toLocaleString('ja-JP') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">最終更新日時</p>
                  <p className="text-gray-800">{selectedIncident.updated_at ? new Date(selectedIncident.updated_at).toLocaleString('ja-JP') : 'N/A'}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-500">説明</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedIncident.description || '説明はありません。'}</p>
              </div>

              <div className="pt-4 mt-4 border-t">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">コメント</h4>
                {commentLoading && <p className="text-sm text-gray-500">コメントを読み込み中...</p>}
                {commentError && <p className="text-sm text-red-500">{commentError}</p>}
                {!commentLoading && !commentError && (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {currentComments.length > 0 ? currentComments.map((comment) => (
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

              <div className="pt-4 mt-4 border-t">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">添付ファイル</h4>
                {attachments.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {attachments.map((file) => (
                      <li key={file.id || file.name} className="text-sm">
                        <a href={file.url || `/api/attachments/download/${file.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">{file.filename || file.name}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">添付ファイルはありません。</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
              <button type="button" onClick={handleDetailModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">閉じる</button>
              <button onClick={() => handleEditModalOpen(selectedIncident)} className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150">編集</button>
            </div>
          </div>
        </div>
        )}

        {/* 削除確認モーダル */}
        {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-1/3 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">インシデント削除確認</h3>
            <p className="text-gray-600 mb-6">
              インシデント ID:
              {incidentIdToDelete}
              {' '}
              を本当に削除しますか？この操作は元に戻せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={handleDeleteConfirmModalClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150">キャンセル</button>
              <button onClick={handleDeleteIncident} disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition duration-150">{loading ? '削除中...' : '削除'}</button>
            </div>
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
}

export default IncidentManagementPage;
