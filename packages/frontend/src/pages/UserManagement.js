import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ArrowPathIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// ユーザーロールのバッジコンポーネント
const RoleBadge = ({ role }) => {
  let color = 'bg-secondary-100 text-secondary-800';
  
  if (role === 'グローバル管理者') {
    color = 'bg-danger-100 text-danger-800';
  } else if (role === '一般ユーザー') {
    color = 'bg-primary-100 text-primary-800';
  } else if (role === 'ゲスト') {
    color = 'bg-warning-100 text-warning-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {role}
    </span>
  );
};

// ユーザー追加/編集モーダル
const UserFormModal = ({ user, onClose, onSubmit }) => {
  const { user: currentUser } = useAuth();
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || '一般ユーザー',
    department: user?.department || '',
    auth_type: user?.auth_type || 'ローカル認証',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // 現在のユーザーがグローバル管理者かどうかを判定
  const isGlobalAdmin = currentUser?.role === 'グローバル管理者';
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // 必須項目のバリデーション
    if (!formData.first_name.trim()) newErrors.first_name = '名を入力してください';
    if (!formData.last_name.trim()) newErrors.last_name = '姓を入力してください';
    if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';
    if (!formData.department.trim()) newErrors.department = '部署を入力してください';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 項目がフォーカスを失った時にバリデーションを実行
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // 個別フィールドのバリデーション
    if (name === 'first_name' && !formData.first_name.trim()) {
      setErrors(prev => ({ ...prev, first_name: '名を入力してください' }));
    } else if (name === 'last_name' && !formData.last_name.trim()) {
      setErrors(prev => ({ ...prev, last_name: '姓を入力してください' }));
    } else if (name === 'email' && !formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'メールアドレスを入力してください' }));
    } else if (name === 'department' && !formData.department.trim()) {
      setErrors(prev => ({ ...prev, department: '部署を入力してください' }));
    } else {
      // エラーをクリア
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // すべてのフィールドをタッチ済みとしてマーク
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    if (validateForm()) {
      onSubmit({
        id: user?.id || (Math.random().toString(36).substring(2, 15)),
        ...formData,
        status: user?.status || 'アクティブ',
        permissions: user?.permissions || ['read'],
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  {isEdit ? 'ユーザー編集' : 'ユーザー追加'}
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  {isEdit ? 'ユーザー情報を更新します' : '新しいユーザーを追加します'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-secondary-700">
                    姓 <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-1 form-input block w-full ${touched.last_name && errors.last_name ? 'border-danger-500' : ''}`}
                    required
                  />
                  {touched.last_name && errors.last_name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.last_name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-secondary-700">
                    名 <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-1 form-input block w-full ${touched.first_name && errors.first_name ? 'border-danger-500' : ''}`}
                    required
                  />
                  {touched.first_name && errors.first_name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.first_name}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                  メールアドレス <span className="text-danger-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 form-input block w-full ${touched.email && errors.email ? 'border-danger-500' : ''}`}
                  required
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
                )}
              </div>
              
              <div className="mt-4">
                <label htmlFor="department" className="block text-sm font-medium text-secondary-700">
                  部署 <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  id="department"
                  value={formData.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 form-input block w-full ${touched.department && errors.department ? 'border-danger-500' : ''}`}
                  required
                />
                {touched.department && errors.department && (
                  <p className="mt-1 text-sm text-danger-600">{errors.department}</p>
                )}
              </div>
              
              <div className="mt-4">
                <label htmlFor="role" className="block text-sm font-medium text-secondary-700">ロール</label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 form-select block w-full"
                  required
                >
                  {/* 常に全てのロールオプションを表示 */}
                  <option value="グローバル管理者">グローバル管理者</option>
                  <option value="一般ユーザー">一般ユーザー</option>
                  <option value="ゲスト">ゲスト</option>
                </select>
              </div>
              
              <div className="mt-4">
                <label htmlFor="auth_type" className="block text-sm font-medium text-secondary-700">認証タイプ</label>
                <select
                  name="auth_type"
                  id="auth_type"
                  value={formData.auth_type}
                  onChange={handleChange}
                  className="mt-1 form-select block w-full"
                  required
                >
                  <option value="ローカル認証">ローカル認証</option>
                  <option value="シングルサインオン">シングルサインオン</option>
                </select>
              </div>
            </div>
            
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto sm:ml-3"
              >
                {isEdit ? '更新' : '追加'}
              </button>
              <button
                type="button"
                className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
                onClick={onClose}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 権限設定モーダル
const PermissionsModal = ({ user, onClose, onSubmit }) => {
  const [permissions, setPermissions] = useState(user.permissions || []);
  
  const handlePermissionChange = (perm) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...user, permissions });
  };
  
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  権限設定
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  {`${user.last_name} ${user.first_name}`}の権限を設定します
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">管理権限</h4>
                    <p className="text-xs text-secondary-500">すべての管理機能へのアクセス</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="admin"
                      checked={permissions.includes('admin')}
                      onChange={() => handlePermissionChange('admin')}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">読み取り権限</h4>
                    <p className="text-xs text-secondary-500">ダッシュボードと情報の閲覧</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="read"
                      checked={permissions.includes('read')}
                      onChange={() => handlePermissionChange('read')}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">書き込み権限</h4>
                    <p className="text-xs text-secondary-500">データの更新と変更</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="write"
                      checked={permissions.includes('write')}
                      onChange={() => handlePermissionChange('write')}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">API管理権限</h4>
                    <p className="text-xs text-secondary-500">APIパーミッション管理機能へのアクセス</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="api_management"
                      checked={permissions.includes('api_management')}
                      onChange={() => handlePermissionChange('api_management')}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto sm:ml-3"
              >
                保存
              </button>
              <button
                type="button"
                className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
                onClick={onClose}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 削除確認モーダル
const DeleteConfirmModal = ({ user, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 sm:mx-0 sm:h-10 sm:w-10">
                <TrashIcon className="h-6 w-6 text-danger-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  ユーザーの削除
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-secondary-500">
                    {`${user.last_name} ${user.first_name} を削除してもよろしいですか？この操作は取り消せません。`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn btn-danger w-full sm:w-auto sm:ml-3"
              onClick={() => onConfirm(user.id)}
            >
              削除
            </button>
            <button
              type="button"
              className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
              onClick={onClose}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  // AuthContextからユーザーロールを取得
  const { user: currentUser } = useAuth();
  
  // モックユーザー一覧（実際のアプリではAPIから取得します）
  const [users, setUsers] = useState([
    {
      id: '1',
      first_name: '太郎',
      last_name: '山田',
      email: 'taro.yamada@example.com',
      role: 'グローバル管理者',
      department: 'IT部門',
      permissions: ['admin', 'read', 'write', 'api_management'],
      status: 'アクティブ',
      auth_type: 'ローカル認証'
    },
    {
      id: '2',
      first_name: '一郎',
      last_name: '鈴木',
      email: 'ichiro.suzuki@example.com',
      role: '一般ユーザー',
      department: 'IT部門',
      permissions: ['read', 'write'],
      status: 'アクティブ',
      auth_type: 'シングルサインオン'
    },
    {
      id: '3',
      first_name: '次郎',
      last_name: '佐藤',
      email: 'jiro.sato@example.com',
      role: 'ゲスト',
      department: '営業部',
      permissions: ['read'],
      status: 'アクティブ',
      auth_type: 'ローカル認証'
    },
    {
      id: '4',
      first_name: '花子',
      last_name: '田中',
      email: 'hanako.tanaka@example.com',
      role: '一般ユーザー',
      department: '総務部',
      permissions: ['read', 'write'],
      status: '無効',
      auth_type: 'シングルサインオン'
    }
  ]);
  
  // 検索とフィルタリング
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // モーダル状態管理
  const [modalState, setModalState] = useState({
    type: null, // 'add', 'edit', 'delete', 'permissions'
    user: null
  });
  
  // フィルタリング適用
  const filteredUsers = users.filter(user => {
    const nameMatch = `${user.last_name}${user.first_name}${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    const statusMatch = statusFilter === 'all' || 
                      (statusFilter === 'active' && user.status === 'アクティブ') ||
                      (statusFilter === 'inactive' && user.status === '無効');
    
    return nameMatch && roleMatch && statusMatch;
  });
  // ユーザー追加/編集の処理
  const handleUserSubmit = (userData) => {
    if (modalState.type === 'add') {
      setUsers([...users, userData]);
    } else if (modalState.type === 'edit') {
      setUsers(users.map(u => u.id === userData.id ? userData : u));
    }
    setModalState({ type: null, user: null });
  };
  
  // 権限設定の保存処理
  const handlePermissionsSave = (userData) => {
    setUsers(users.map(u => u.id === userData.id ? userData : u));
    setModalState({ type: null, user: null });
  };
  
  // ユーザー削除の処理
  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    setModalState({ type: null, user: null });
  };
  
  // ユーザー状態の切り替え
  const toggleUserStatus = (userId) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'アクティブ' ? '無効' : 'アクティブ'
        };
      }
      return u;
    }));
  };
  
  // アクティブユーザー数を計算
  const activeUsersCount = users.filter(user => user.status === 'アクティブ').length;
  
  // 現在のユーザーがグローバル管理者かどうか
  const isGlobalAdmin = currentUser?.role === 'グローバル管理者';
  
  // モーダルの表示
  const renderModal = () => {
    if (!modalState.type) return null;
    
    switch (modalState.type) {
      case 'add':
        return (
          <UserFormModal
            onClose={() => setModalState({ type: null, user: null })}
            onSubmit={handleUserSubmit}
          />
        );
      case 'edit':
        return (
          <UserFormModal
            user={modalState.user}
            onClose={() => setModalState({ type: null, user: null })}
            onSubmit={handleUserSubmit}
          />
        );
      case 'permissions':
        return (
          <PermissionsModal
            user={modalState.user}
            onClose={() => setModalState({ type: null, user: null })}
            onSubmit={handlePermissionsSave}
          />
        );
      case 'delete':
        return (
          <DeleteConfirmModal
            user={modalState.user}
            onClose={() => setModalState({ type: null, user: null })}
            onConfirm={handleDeleteUser}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">ローカルユーザー管理</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/13 18:25</span>
        </div>
      </div>
      
      {/* 検索とフィルター */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ユーザーを検索..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select 
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">すべてのロール</option>
            <option value="グローバル管理者">グローバル管理者</option>
            <option value="一般ユーザー">一般ユーザー</option>
            <option value="ゲスト">ゲスト</option>
          </select>
          
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">すべての状態</option>
            <option value="active">アクティブ</option>
            <option value="inactive">無効</option>
          </select>
        </div>
      </div>
      
      {/* ユーザー情報テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              {['氏名', 'メールアドレス', '部署', 'ロール', '状態', '認証タイプ', 'アクション'].map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-secondary-900">
                    {user.last_name} {user.first_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-secondary-500">{user.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'アクティブ'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-secondary-100 text-secondary-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {user.auth_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  <div className="flex space-x-2">
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="編集"
                      onClick={() => setModalState({ type: 'edit', user })}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="権限設定"
                      onClick={() => setModalState({ type: 'permissions', user })}
                    >
                      <KeyIcon className="h-5 w-5" />
                    </button>
                    <button
                      className={`${
                        user.status === 'アクティブ' ? 'text-danger-600 hover:text-danger-900' : 'text-success-600 hover:text-success-900'
                      }`}
                      title={user.status === 'アクティブ' ? '無効化' : '有効化'}
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === 'アクティブ' ? (
                        <XCircleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      className="text-danger-600 hover:text-danger-900"
                      title="削除"
                      onClick={() => setModalState({ type: 'delete', user })}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* アクション領域 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-secondary-600">
          {activeUsersCount} 人のアクティブユーザー
        </div>
        <button
          className="btn btn-primary flex items-center space-x-1"
          onClick={() => setModalState({ type: 'add', user: null })}
        >
          <PlusIcon className="h-5 w-5" />
          <span>ユーザー追加</span>
        </button>
      </div>
      
      {/* モーダル表示 */}
      {renderModal()}
    </div>
  );
  
};

export default UserManagement;
