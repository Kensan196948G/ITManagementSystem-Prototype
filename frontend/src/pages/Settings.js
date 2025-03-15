import React, { useState } from 'react';
import { 
  Cog6ToothIcon, 
  UserIcon, 
  KeyIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// 設定タブコンポーネント
const SettingsTab = ({ icon: Icon, label, active, onClick }) => {
  return (
    <div 
      className={`flex items-center px-4 py-3 cursor-pointer border-l-4 ${
        active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-transparent hover:bg-secondary-50'
      }`}
      onClick={onClick}
    >
      <Icon className={`h-5 w-5 mr-3 ${active ? 'text-primary-500' : 'text-secondary-500'}`} />
      <span className={`${active ? 'font-medium' : ''}`}>{label}</span>
    </div>
  );
};

// 設定セクションヘッダーコンポーネント
const SectionHeader = ({ title }) => (
  <h3 className="text-lg font-medium text-secondary-900 mb-4">{title}</h3>
);

// 設定トグルコンポーネント
const SettingToggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-start justify-between py-4 border-b border-secondary-200 last:border-0">
    <div className="flex-1 pr-4">
      <p className="font-medium text-secondary-900">{label}</p>
      {description && <p className="text-sm text-secondary-500 mt-1">{description}</p>}
    </div>
    <div className="flex items-center h-6">
      <button 
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? 'bg-primary-600' : 'bg-secondary-200'}`}
        onClick={() => onChange(!enabled)}
      >
        <span 
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  </div>
);

// 設定選択コンポーネント
const SettingSelect = ({ label, description, value, options, onChange }) => (
  <div className="flex flex-col py-4 border-b border-secondary-200 last:border-0">
    <div className="mb-2">
      <p className="font-medium text-secondary-900">{label}</p>
      {description && <p className="text-sm text-secondary-500 mt-1">{description}</p>}
    </div>
    <div>
      <select 
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const Settings = () => {
  // AuthContextからユーザー情報を取得
  const { currentUser: user } = useAuth();
  
  // 現在のタブ
  const [activeTab, setActiveTab] = useState('general');
  
  // 一般設定の状態
  const [settings, setSettings] = useState({
    enableNotifications: true,
    emailNotifications: true,
    slackNotifications: false,
    teamsNotifications: false,
    autoBackup: true,
    backupLocation: 'cloud',
    language: 'ja',
    theme: 'light',
    dataRetention: '90',
    timezone: 'Asia/Tokyo'
  });

  // セキュリティ設定の状態
  const [securitySettings, setSecuritySettings] = useState({
    strongPassword: true,
    passwordExpiration: '90',
    passwordHistory: '5',
    loginAttemptLimit: true,
    accountLockTime: '30',
    mfaPolicy: 'all',
    mfaMethods: {
      authenticator: true,
      sms: true,
      email: true,
      fido2: false
    },
    riskBasedAuth: false
  });
  
  // 言語オプション
  const languageOptions = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: '英語' }
  ];
  
  // タイムゾーンオプション
  const timezoneOptions = [
    { value: 'Asia/Tokyo', label: '東京 (UTC+9:00)' },
    { value: 'Asia/Osaka', label: '大阪 (UTC+9:00)' },
    { value: 'America/New_York', label: 'ニューヨーク (UTC-5:00)' },
    { value: 'Europe/London', label: 'ロンドン (UTC+0:00)' }
  ];
  
  // データ保持期間オプション
  const dataRetentionOptions = [
    { value: '30', label: '30日間' },
    { value: '90', label: '90日間' },
    { value: '180', label: '180日間' },
    { value: '365', label: '1年間' }
  ];

  // パスワード有効期限オプション
  const passwordExpirationOptions = [
    { value: '0', label: '無効' },
    { value: '30', label: '30日' },
    { value: '90', label: '90日' },
    { value: '180', label: '180日' }
  ];

  // パスワード履歴オプション
  const passwordHistoryOptions = [
    { value: '0', label: '無効' },
    { value: '3', label: '過去3パスワード' },
    { value: '5', label: '過去5パスワード' },
    { value: '10', label: '過去10パスワード' }
  ];

  // アカウントロック時間オプション
  const accountLockTimeOptions = [
    { value: '15', label: '15分' },
    { value: '30', label: '30分' },
    { value: '60', label: '1時間' },
    { value: 'admin', label: '管理者による解除が必要' }
  ];

  // MFAポリシーオプション
  const mfaPolicyOptions = [
    { value: 'disabled', label: '無効 (推奨されません)' },
    { value: 'admin', label: '管理者のみ必須' },
    { value: 'all', label: '全ユーザー必須' },
    { value: 'risk', label: '条件付き (リスクベース)' }
  ];

  // 設定変更ハンドラー
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // セキュリティ設定変更ハンドラー
  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // MFA方式変更ハンドラー
  const handleMfaMethodChange = (method, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      mfaMethods: {
        ...prev.mfaMethods,
        [method]: value
      }
    }));
  };

  // メインレンダリング部分
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">設定</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/14 15:30</span>
        </div>
      </div>

      {/* ログインユーザー情報 */}
      {user && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-2">ログインユーザー情報</h2>
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-full">
              <UserIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-secondary-900">
                {user?.microsoftInfo?.displayName || `${user?.first_name} ${user?.last_name}` || 'ユーザー名'}
              </p>
              <p className="text-sm text-secondary-500">
                {user?.email || user?.microsoftInfo?.userPrincipalName || 'メールアドレス'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 設定タブナビゲーション */}
        <div className="w-full md:w-64 bg-secondary-50 border-b md:border-b-0 md:border-r border-secondary-200">
          <SettingsTab 
            icon={Cog6ToothIcon} 
            label="一般設定" 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
          />
          <SettingsTab 
            icon={UserIcon} 
            label="ローカルユーザー管理" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
          <SettingsTab 
            icon={KeyIcon} 
            label="APIキー" 
            active={activeTab === 'api'} 
            onClick={() => setActiveTab('api')} 
          />
          <SettingsTab 
            icon={ServerIcon} 
            label="バックアップ" 
            active={activeTab === 'backup'} 
            onClick={() => setActiveTab('backup')} 
          />
          <SettingsTab 
            icon={ShieldCheckIcon} 
            label="セキュリティ" 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
          />
        </div>

        {/* 設定内容 */}
        <div className="flex-1 p-6">
          {/* 一般設定 */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <SectionHeader title="一般設定" />
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <SectionHeader title="通知設定" />
                <SettingToggle 
                  label="通知を有効にする" 
                  description="システムからの通知を受け取る" 
                  enabled={settings.enableNotifications} 
                  onChange={(value) => handleSettingChange('enableNotifications', value)} 
                />
                <SettingToggle 
                  label="メール通知" 
                  description="重要なイベントやアラートをメールで受け取る" 
                  enabled={settings.emailNotifications} 
                  onChange={(value) => handleSettingChange('emailNotifications', value)} 
                />
                <SettingToggle 
                  label="Microsoft Teams通知" 
                  description="Microsoft Teamsチャネルに通知を送信する" 
                  enabled={settings.teamsNotifications} 
                  onChange={(value) => handleSettingChange('teamsNotifications', value)} 
                />
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <SectionHeader title="システム設定" />
                <SettingSelect 
                  label="言語" 
                  description="インターフェースの表示言語" 
                  value={settings.language} 
                  options={languageOptions} 
                  onChange={(value) => handleSettingChange('language', value)} 
                />
                <SettingSelect 
                  label="タイムゾーン" 
                  description="表示されるすべての日時に適用されます" 
                  value={settings.timezone} 
                  options={timezoneOptions} 
                  onChange={(value) => handleSettingChange('timezone', value)} 
                />
                <SettingSelect 
                  label="データ保持期間" 
                  description="ログとイベントデータを保持する期間" 
                  value={settings.dataRetention} 
                  options={dataRetentionOptions} 
                  onChange={(value) => handleSettingChange('dataRetention', value)} 
                />
              </div>
            </div>
          )}

          {/* ローカルユーザー管理 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <SectionHeader title="ローカルユーザー管理" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  ユーザー追加
                </button>
              </div>
              
              {/* フィルターと検索 */}
              <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-secondary-200">
                <div className="w-64">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>すべての役割</option>
                    <option>管理者</option>
                    <option>一般ユーザー</option>
                    <option>閲覧者</option>
                  </select>
                </div>
                <div className="flex-1">
                  <input type="text" placeholder="ユーザー検索..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button className="px-4 py-2 border border-secondary-300 rounded-md hover:bg-secondary-50">フィルター</button>
              </div>
              
              {/* ユーザーリスト */}
              <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">名前</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">メール</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">役割</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">ステータス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">最終ログイン</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {/* サンプルユーザー行 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-800 font-medium">TS</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">鈴木 太郎</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">taro.suzuki@example.com</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          管理者
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          有効
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">2025-03-14 15:30</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">編集</button>
                        <button className="text-red-600 hover:text-red-900">無効化</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-800 font-medium">HT</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">田中 花子</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">hanako.tanaka@example.com</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          一般ユーザー
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          有効
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">2025-03-13 10:15</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">編集</button>
                        <button className="text-red-600 hover:text-red-900">無効化</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button className="px-4 py-2 border border-secondary-300 rounded-md hover:bg-secondary-50">前へ</button>
                    <button className="px-4 py-2 border border-secondary-300 rounded-md hover:bg-secondary-50">次へ</button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-secondary-700">
                        全 <span className="font-medium">12</span> 件中 <span className="font-medium">1</span> - <span className="font-medium">10</span> 件を表示
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50">
                          前へ
                        </button>
                        <button className="relative inline-flex items-center px-4 py-2 border border-secondary-300 bg-primary-50 text-sm font-medium text-primary-600">
                          1
                        </button>
                        <button className="relative inline-flex items-center px-4 py-2 border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50">
                          2
                        </button>
                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50">
                          次へ
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* APIキー管理 */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <SectionHeader title="APIキー管理" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                  <KeyIcon className="h-4 w-4 mr-2" />
                  新規APIキー生成
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <div className="text-sm text-secondary-600 mb-4">
                  <p>APIキーはシステムへのプログラマティックなアクセスを提供します。適切なアクセス制御と監視を行ってください。</p>
                  <p className="mt-2 text-orange-600 font-medium">セキュリティ注意事項: APIキーは機密情報です。安全に保管し、公開リポジトリにコミットしないでください。</p>
                </div>
                
                {/* APIキーリスト */}
                <div className="mt-6 space-y-4">
                  <div className="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-secondary-900">バックアップシステム連携</p>
                        <p className="text-sm text-secondary-500 mt-1">作成日: 2025-02-10</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">有効</span>
                        <button className="px-3 py-1 border border-secondary-300 rounded-md text-sm hover:bg-secondary-50">無効化</button>
                        <button className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50">削除</button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-secondary-500 mb-1">APIキー (最後の4文字のみ表示)</p>
                      <div className="flex items-center">
                        <code className="bg-secondary-100 px-3 py-1 rounded text-secondary-800">****-****-****-7890</code>
                        <button className="ml-2 text-primary-600 text-sm">表示</button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-secondary-500 mb-1">アクセス権限</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">読み取り</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">バックアップ</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-secondary-500 mb-1">有効期限</p>
                      <p className="text-sm">2026-02-10 (残り335日)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* バックアップ設定 */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <SectionHeader title="バックアップ設定" />
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-secondary-900">自動バックアップ</h3>
                  <div className="flex items-center">
                    <span className={`mr-3 text-sm ${settings.autoBackup ? 'text-green-600' : 'text-secondary-500'}`}>
                      {settings.autoBackup ? '有効' : '無効'}
                    </span>
                    <button 
                      type="button"
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings.autoBackup ? 'bg-primary-600' : 'bg-secondary-200'}`}
                      onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${settings.autoBackup ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                
                {settings.autoBackup && (
                  <div className="space-y-4 mt-4 border-t pt-4 border-secondary-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">バックアップ頻度</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>毎日</option>
                          <option>毎週</option>
                          <option>毎月</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">保持期間</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>30日間</option>
                          <option>90日間</option>
                          <option>1年間</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">手動バックアップ</h3>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                  今すぐバックアップを実行
                </button>
                <p className="text-sm text-secondary-500 mt-2">最終バックアップ: 2025-03-14 03:00</p>
              </div>
            </div>
          )}
          
          {/* セキュリティ設定 */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <SectionHeader title="セキュリティ設定" />
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">パスワードポリシー</h3>
                <div className="space-y-4">
                  <SettingToggle 
                    label="強力なパスワードを要求" 
                    description="パスワードは8文字以上で、大文字、小文字、数字、特殊文字を含める必要があります" 
                    enabled={securitySettings.strongPassword} 
                    onChange={(value) => handleSecuritySettingChange('strongPassword', value)} 
                  />
                  
                  <div className="flex items-center justify-between py-4 border-b border-secondary-200">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-secondary-900">パスワード有効期限</p>
                      <p className="text-sm text-secondary-500 mt-1">ユーザーに定期的なパスワード変更を要求します</p>
                    </div>
                    <div>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={securitySettings.passwordExpiration}
                        onChange={(e) => handleSecuritySettingChange('passwordExpiration', e.target.value)}
                      >
                        {passwordExpirationOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-secondary-200">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-secondary-900">パスワード履歴</p>
                      <p className="text-sm text-secondary-500 mt-1">過去に使用したパスワードの再利用を防止します</p>
                    </div>
                    <div>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={securitySettings.passwordHistory}
                        onChange={(e) => handleSecuritySettingChange('passwordHistory', e.target.value)}
                      >
                        {passwordHistoryOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <SettingToggle 
                    label="ログイン試行制限" 
                    description="5回連続で失敗した場合、アカウントを一時的にロックします" 
                    enabled={securitySettings.loginAttemptLimit} 
                    onChange={(value) => handleSecuritySettingChange('loginAttemptLimit', value)} 
                  />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-secondary-200">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">多要素認証 (MFA)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-secondary-200">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-secondary-900">多要素認証ポリシー</p>
                      <p className="text-sm text-secondary-500 mt-1">ユーザーに対するMFAの要求レベルを設定します</p>
                    </div>
                    <div>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={securitySettings.mfaPolicy}
                        onChange={(e) => handleSecuritySettingChange('mfaPolicy', e.target.value)}
                      >
                        {mfaPolicyOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="py-4 border-b border-secondary-200">
                    <p className="font-medium text-secondary-900">許可するMFA方式</p>
                    <p className="text-sm text-secondary-500 mt-1">ユーザーが利用できる認証方法を選択</p>
                    
                    <div className="mt-3 space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded text-primary-600 border-secondary-300"
                          checked={securitySettings.mfaMethods.authenticator}
                          onChange={(e) => handleMfaMethodChange('authenticator', e.target.checked)}
                        />
                        <span className="ml-2">Microsoft Authenticatorアプリ</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded text-primary-600 border-secondary-300"
                          checked={securitySettings.mfaMethods.sms}
                          onChange={(e) => handleMfaMethodChange('sms', e.target.checked)}
                        />
                        <span className="ml-2">SMSワンタイムパスワード</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded text-primary-600 border-secondary-300"
                          checked={securitySettings.mfaMethods.email}
                          onChange={(e) => handleMfaMethodChange('email', e.target.checked)}
                        />
                        <span className="ml-2">Eメールワンタイムパスワード</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded text-primary-600 border-secondary-300"
                          checked={securitySettings.mfaMethods.fido2}
                          onChange={(e) => handleMfaMethodChange('fido2', e.target.checked)}
                        />
                        <span className="ml-2">FIDO2セキュリティキー</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
