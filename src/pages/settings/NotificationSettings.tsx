import React, { useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Slack,
  Users,
  Volume2,
  Moon,
  Settings,
  Play,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Filter,
  History,
  Download,
  Upload,
  Save,
  RefreshCw,
  Shield,
  Eye,
  Star,
  Trash2,
  Plus,
  Globe
} from 'lucide-react';

interface NotificationSettings {
  email: {
    enabled: boolean;
    events: Record<string, boolean>;
    frequency: string;
    batching: boolean;
    digest: boolean;
  };
  sms: {
    enabled: boolean;
    events: Record<string, boolean>;
    phoneNumber: string;
    verified: boolean;
  };
  inApp: {
    enabled: boolean;
    events: Record<string, boolean>;
    sound: boolean;
    desktop: boolean;
    badge: boolean;
  };
  channels: {
    slack: {
      enabled: boolean;
      webhook: string;
      channels: string[];
    };
    teams: {
      enabled: boolean;
      webhook: string;
      channels: string[];
    };
  };
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
    exceptions: string[];
  };
  escalation: {
    enabled: boolean;
    rules: Array<{
      id: string;
      condition: string;
      delay: number;
      actions: string[];
    }>;
  };
  templates: {
    email: Record<string, string>;
    sms: Record<string, string>;
    slack: Record<string, string>;
  };
  severityLevels: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
    info: boolean;
  };
  sounds: {
    enabled: boolean;
    volume: number;
    critical: string;
    high: string;
    medium: string;
    low: string;
    info: string;
  };
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      events: {
        incident: true,
        change: true,
        problem: true,
        release: false,
        maintenance: true,
        security: true,
        performance: false,
        user: false,
        system: true,
        backup: false
      },
      frequency: 'immediate',
      batching: false,
      digest: false
    },
    sms: {
      enabled: false,
      events: {
        incident: true,
        change: false,
        problem: true,
        release: false,
        maintenance: false,
        security: true,
        performance: false,
        user: false,
        system: false,
        backup: false
      },
      phoneNumber: '',
      verified: false
    },
    inApp: {
      enabled: true,
      events: {
        incident: true,
        change: true,
        problem: true,
        release: true,
        maintenance: true,
        security: true,
        performance: true,
        user: true,
        system: true,
        backup: true
      },
      sound: true,
      desktop: true,
      badge: true
    },
    channels: {
      slack: {
        enabled: false,
        webhook: '',
        channels: []
      },
      teams: {
        enabled: true,
        webhook: '',
        channels: []
      }
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      days: [],
      exceptions: ['critical', 'security']
    },
    escalation: {
      enabled: false,
      rules: []
    },
    templates: {
      email: {},
      sms: {},
      slack: {}
    },
    severityLevels: {
      critical: true,
      high: true,
      medium: true,
      low: false,
      info: false
    },
    sounds: {
      enabled: false,
      volume: 0,
      critical: 'alert-critical.mp3',
      high: 'alert-high.mp3',
      medium: 'alert-medium.mp3',
      low: 'alert-low.mp3',
      info: 'alert-info.mp3'
    }
  });

  // Email list management
  const [emailList, setEmailList] = useState([
    'admin@example.com',
    'support@example.com'
  ]);
  const [newEmail, setNewEmail] = useState('');

  // SMS phone number list management
  const [phoneList, setPhoneList] = useState([
    '090-1234-5678',
    '080-9876-5432'
  ]);
  const [newPhone, setNewPhone] = useState('');

  // DeskNet's NEO user list
  const [desknetUsers, setDesknetUsers] = useState([
    { id: 1, name: '田中太郎', enabled: true, department: 'IT部' },
    { id: 2, name: '山田花子', enabled: false, department: '経理部' },
    { id: 3, name: '佐藤一郎', enabled: true, department: '営業部' },
    { id: 4, name: '鈴木美咲', enabled: false, department: '人事部' },
    { id: 5, name: '高橋健太', enabled: true, department: 'IT部' },
    { id: 6, name: '渡辺由美', enabled: false, department: '総務部' }
  ]);

  const [activeTab, setActiveTab] = useState('email');
  const [expandedSections] = useState<Set<string>>(new Set(['basic']));
  const [testNotification, setTestNotification] = useState<{ type: string; status: string } | null>(null);
  const [notificationHistory] = useState([
    {
      id: '1',
      type: 'incident',
      channel: 'email',
      title: 'システム障害発生',
      timestamp: '2025-08-29T10:30:00Z',
      status: 'delivered',
      severity: 'critical'
    },
    {
      id: '2',
      type: 'change',
      channel: 'in-app',
      title: '定期メンテナンス予定',
      timestamp: '2025-08-29T09:15:00Z',
      status: 'read',
      severity: 'medium'
    },
    {
      id: '3',
      type: 'security',
      channel: 'sms',
      title: 'セキュリティアラート',
      timestamp: '2025-08-29T08:45:00Z',
      status: 'failed',
      severity: 'high'
    }
  ]);

  const eventTypes = {
    incident: 'インシデント',
    change: '変更管理',
    problem: '問題管理',
    release: 'リリース管理',
    maintenance: 'メンテナンス',
    security: 'セキュリティ',
    performance: 'パフォーマンス',
    user: 'ユーザー管理',
    system: 'システム',
    backup: 'バックアップ'
  };

  const severityLevels = {
    critical: { label: '重大', color: 'text-red-500', icon: XCircle },
    high: { label: '高', color: 'text-orange-500', icon: AlertTriangle },
    medium: { label: '中', color: 'text-yellow-500', icon: Info },
    low: { label: '低', color: 'text-blue-500', icon: Info },
    info: { label: '情報', color: 'text-gray-500', icon: CheckCircle }
  };

  const soundOptions = [
    { value: 'alert-critical.mp3', label: 'アラート（重大）' },
    { value: 'alert-high.mp3', label: 'アラート（高）' },
    { value: 'alert-medium.mp3', label: 'アラート（中）' },
    { value: 'alert-low.mp3', label: 'アラート（低）' },
    { value: 'alert-info.mp3', label: 'アラート（情報）' },
    { value: 'chime.mp3', label: 'チャイム' },
    { value: 'bell.mp3', label: 'ベル' },
    { value: 'notification.mp3', label: '通知音' }
  ];


  const updateSettings = (path: string[], value: any) => {
    setSettings(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i] as keyof typeof current] as any;
      }
      
      current[path[path.length - 1] as keyof typeof current] = value;
      return updated;
    });
  };

  // Email management functions
  const addEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailList([...emailList, newEmail]);
      setNewEmail('');
    } else {
      alert('有効なメールアドレスを入力してください');
    }
  };

  const removeEmail = (index: number) => {
    setEmailList(emailList.filter((_, i) => i !== index));
  };

  // Phone management functions
  const addPhone = () => {
    // Japanese phone number validation
    if (newPhone && /^(0[5-9]0-[0-9]{4}-[0-9]{4}|0[1-9]-[0-9]{4}-[0-9]{4}|0[1-9][0-9]-[0-9]{3}-[0-9]{4})$/.test(newPhone)) {
      setPhoneList([...phoneList, newPhone]);
      setNewPhone('');
    } else {
      alert('有効な電話番号を入力してください（例: 090-1234-5678）');
    }
  };

  const removePhone = (index: number) => {
    setPhoneList(phoneList.filter((_, i) => i !== index));
  };

  // DeskNet user management functions
  const toggleDesknetUser = (userId: number) => {
    setDesknetUsers(users => 
      users.map(user => 
        user.id === userId ? { ...user, enabled: !user.enabled } : user
      )
    );
  };

  const sendTestNotification = async (type: string) => {
    setTestNotification({ type, status: 'sending' });
    
    // Simulate API call
    setTimeout(() => {
      setTestNotification({ type, status: 'sent' });
      setTimeout(() => {
        setTestNotification(null);
      }, 3000);
    }, 1000);
  };

  const saveSettings = () => {
    // Collect all settings into a single object
    const allSettings = {
      ...settings,
      emailList,
      phoneList,
      desknetUsers
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(allSettings));
      alert('通知設定を保存しました');
      console.log('Notification settings saved:', allSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('設定の保存に失敗しました');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'notification-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'email', label: 'メール通知', icon: Mail },
    { id: 'sms', label: 'SMS通知', icon: Smartphone },
    { id: 'inapp', label: 'アプリ内通知', icon: Bell },
    { id: 'channels', label: 'チャンネル', icon: MessageSquare },
    { id: 'advanced', label: '詳細設定', icon: Settings },
    { id: 'history', label: '履歴', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">通知設定</h1>
                <p className="text-gray-300">通知の配信方法と頻度を管理</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportSettings}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>エクスポート</span>
              </button>
              <label className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>インポート</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
              <button
                onClick={saveSettings}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-2 mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Email Notifications */}
            {activeTab === 'email' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">メール通知設定</h2>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email.enabled}
                      onChange={(e) => updateSettings(['email', 'enabled'], e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.email.enabled && (
                  <div className="space-y-6">
                    {/* Event Types */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">通知するイベント</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(eventTypes).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.email.events[key]}
                              onChange={(e) => updateSettings(['email', 'events', key], e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-300">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Frequency Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">配信頻度</h3>
                      <div className="space-y-3">
                        <select
                          value={settings.email.frequency}
                          onChange={(e) => updateSettings(['email', 'frequency'], e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="immediate">即座</option>
                          <option value="hourly">1時間毎</option>
                          <option value="daily">1日毎</option>
                          <option value="weekly">週1回</option>
                        </select>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.email.batching}
                            onChange={(e) => updateSettings(['email', 'batching'], e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-300">通知をまとめて送信</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.email.digest}
                            onChange={(e) => updateSettings(['email', 'digest'], e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-300">日次ダイジェスト送信</span>
                        </label>
                      </div>
                    </div>

                    {/* Email Address Management */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">メールアドレス管理</h3>
                      <div className="space-y-4">
                        {/* Add new email */}
                        <div className="flex space-x-2">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="メールアドレスを入力"
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={addEmail}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>追加</span>
                          </button>
                        </div>
                        
                        {/* Email list */}
                        <div className="space-y-2">
                          {emailList.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                              <span className="text-gray-300">{email}</span>
                              <button
                                onClick={() => removeEmail(index)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {emailList.length === 0 && (
                            <p className="text-gray-500 text-center py-4">メールアドレスが登録されていません</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Button */}
                    <div>
                      <button
                        onClick={() => sendTestNotification('email')}
                        disabled={testNotification?.type === 'email'}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {testNotification?.type === 'email' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>テスト送信</span>
                      </button>
                      {testNotification?.type === 'email' && testNotification.status === 'sent' && (
                        <p className="text-green-400 mt-2">テストメールを送信しました</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SMS Notifications */}
            {activeTab === 'sms' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">SMS通知設定</h2>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sms.enabled}
                      onChange={(e) => updateSettings(['sms', 'enabled'], e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.sms.enabled && (
                  <div className="space-y-6">
                    {/* Phone Number Management */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">電話番号管理</h3>
                      <div className="space-y-4">
                        {/* Add new phone */}
                        <div className="flex space-x-2">
                          <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="090-1234-5678"
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={addPhone}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>追加</span>
                          </button>
                        </div>
                        
                        {/* Phone list */}
                        <div className="space-y-2">
                          {phoneList.map((phone, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                              <div className="flex items-center space-x-3">
                                <span className="text-gray-300">{phone}</span>
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">認証済み</span>
                              </div>
                              <button
                                onClick={() => removePhone(index)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {phoneList.length === 0 && (
                            <p className="text-gray-500 text-center py-4">電話番号が登録されていません</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Event Types */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">SMS通知するイベント</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(eventTypes).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.sms.events[key]}
                              onChange={(e) => updateSettings(['sms', 'events', key], e.target.checked)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-300">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Test Button */}
                    <div>
                      <button
                        onClick={() => sendTestNotification('sms')}
                        disabled={testNotification?.type === 'sms' || !settings.sms.verified}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {testNotification?.type === 'sms' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>テストSMS送信</span>
                      </button>
                      {testNotification?.type === 'sms' && testNotification.status === 'sent' && (
                        <p className="text-green-400 mt-2">テストSMSを送信しました</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* In-App Notifications */}
            {activeTab === 'inapp' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">アプリ内通知設定</h2>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.inApp.enabled}
                      onChange={(e) => updateSettings(['inApp', 'enabled'], e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.inApp.enabled && (
                  <div className="space-y-6">
                    {/* Display Options */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">表示オプション</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.inApp.sound}
                            onChange={(e) => updateSettings(['inApp', 'sound'], e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <Volume2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">通知音を再生</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.inApp.desktop}
                            onChange={(e) => updateSettings(['inApp', 'desktop'], e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">デスクトップ通知</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.inApp.badge}
                            onChange={(e) => updateSettings(['inApp', 'badge'], e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <Star className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">バッジカウンター表示</span>
                        </label>
                      </div>
                    </div>

                    {/* Event Types */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">アプリ内通知するイベント</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(eventTypes).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.inApp.events[key]}
                              onChange={(e) => updateSettings(['inApp', 'events', key], e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-gray-300">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Test Button */}
                    <div>
                      <button
                        onClick={() => sendTestNotification('inapp')}
                        disabled={testNotification?.type === 'inapp'}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {testNotification?.type === 'inapp' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>テスト通知表示</span>
                      </button>
                      {testNotification?.type === 'inapp' && testNotification.status === 'sent' && (
                        <p className="text-green-400 mt-2">テスト通知を表示しました</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Channels */}
            {activeTab === 'channels' && (
              <div className="space-y-6">
                {/* Slack */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Slack className="w-6 h-6 text-green-400" />
                      <h2 className="text-xl font-semibold text-white">Slack通知</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.channels.slack.enabled}
                        onChange={(e) => updateSettings(['channels', 'slack', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.channels.slack.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={settings.channels.slack.webhook}
                          onChange={(e) => updateSettings(['channels', 'slack', 'webhook'], e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">送信先チャンネル</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="#general, #alerts"
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                          />
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                            追加
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => sendTestNotification('slack')}
                        disabled={testNotification?.type === 'slack'}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {testNotification?.type === 'slack' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Slackテスト送信</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Microsoft Teams */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">Microsoft Teams通知</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.channels.teams.enabled}
                        onChange={(e) => updateSettings(['channels', 'teams', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.channels.teams.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={settings.channels.teams.webhook}
                          onChange={(e) => updateSettings(['channels', 'teams', 'webhook'], e.target.value)}
                          placeholder="https://outlook.office.com/webhook/..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                        />
                      </div>

                      <button
                        onClick={() => sendTestNotification('teams')}
                        disabled={testNotification?.type === 'teams'}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {testNotification?.type === 'teams' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Teamsテスト送信</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* DeskNet's NEO */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-orange-400" />
                      <h2 className="text-xl font-semibold text-white">DeskNet's NEO通知</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-orange-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">登録ユーザー管理</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {desknetUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={user.enabled}
                                  onChange={() => toggleDesknetUser(user.id)}
                                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <div>
                                  <span className="text-gray-300 font-medium">{user.name}</span>
                                  <span className="text-gray-500 text-sm ml-2">({user.department})</span>
                                </div>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              {user.enabled ? (
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">有効</span>
                              ) : (
                                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">無効</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                        <p className="text-blue-300 text-sm">
                          <span className="font-medium">有効ユーザー:</span> {desknetUsers.filter(u => u.enabled).length}名 / 
                          <span className="font-medium"> 総ユーザー:</span> {desknetUsers.length}名
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => sendTestNotification('desknet')}
                      disabled={testNotification?.type === 'desknet'}
                      className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {testNotification?.type === 'desknet' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>DeskNetテスト送信</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Do Not Disturb */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Moon className="w-6 h-6 text-indigo-400" />
                      <h2 className="text-xl font-semibold text-white">サイレント時間設定</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.doNotDisturb.enabled}
                        onChange={(e) => updateSettings(['doNotDisturb', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.doNotDisturb.enabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">開始時刻</label>
                          <input
                            type="time"
                            value={settings.doNotDisturb.startTime}
                            onChange={(e) => updateSettings(['doNotDisturb', 'startTime'], e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">終了時刻</label>
                          <input
                            type="time"
                            value={settings.doNotDisturb.endTime}
                            onChange={(e) => updateSettings(['doNotDisturb', 'endTime'], e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">適用曜日</label>
                        <div className="flex space-x-2">
                          {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
                            <button
                              key={day}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                settings.doNotDisturb.days.includes(day)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">例外（重要度）</label>
                        <div className="space-y-2">
                          {Object.entries(severityLevels).map(([key, { label, color }]) => (
                            <label key={key} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={settings.doNotDisturb.exceptions.includes(key)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className={`${color}`}>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Severity Levels */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-orange-400" />
                    <span>通知する重要度レベル</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {Object.entries(severityLevels).map(([key, { label, color, icon: Icon }]) => (
                      <label key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${color}`} />
                          <span className="text-white font-medium">{label}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.severityLevels[key as keyof typeof settings.severityLevels]}
                            onChange={(e) => updateSettings(['severityLevels', key], e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sound Settings */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-6 h-6 text-green-400" />
                      <h2 className="text-xl font-semibold text-white">通知音設定</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sounds.enabled}
                        onChange={(e) => updateSettings(['sounds', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.sounds.enabled && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">音量: {settings.sounds.volume}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.sounds.volume}
                          onChange={(e) => updateSettings(['sounds', 'volume'], parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {Object.entries(severityLevels).map(([key, { label, color }]) => (
                        <div key={key} className="flex items-center space-x-4">
                          <span className={`${color} font-medium w-16`}>{label}</span>
                          <select
                            value={settings.sounds[key as keyof typeof settings.sounds] as string}
                            onChange={(e) => updateSettings(['sounds', key], e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                          >
                            {soundOptions.map((sound) => (
                              <option key={sound.value} value={sound.value}>
                                {sound.label}
                              </option>
                            ))}
                          </select>
                          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notification History */}
            {activeTab === 'history' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <History className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-xl font-semibold text-white">通知履歴</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option>すべて</option>
                      <option>メール</option>
                      <option>SMS</option>
                      <option>アプリ内</option>
                      <option>Slack</option>
                      <option>Teams</option>
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {notificationHistory.map((notification) => {
                    const severity = severityLevels[notification.severity as keyof typeof severityLevels];
                    const SeverityIcon = severity.icon;
                    
                    return (
                      <div key={notification.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
                          <div>
                            <h3 className="text-white font-medium">{notification.title}</h3>
                            <p className="text-gray-400 text-sm">
                              {eventTypes[notification.type as keyof typeof eventTypes]} • 
                              {notification.channel} • 
                              {new Date(notification.timestamp).toLocaleString('ja-JP')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.status === 'delivered' ? 'bg-green-600 text-white' :
                            notification.status === 'read' ? 'bg-blue-600 text-white' :
                            notification.status === 'failed' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {notification.status === 'delivered' ? '配信済み' :
                             notification.status === 'read' ? '既読' :
                             notification.status === 'failed' ? '失敗' : '送信中'}
                          </span>
                          <button className="text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <p className="text-gray-400">10件中 3件を表示</p>
                  <div className="flex space-x-2">
                    <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">
                      前へ
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">
                      次へ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">通知統計</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">今日の通知</span>
                  <span className="text-white font-semibold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">未読</span>
                  <span className="text-red-400 font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">配信成功率</span>
                  <span className="text-green-400 font-semibold">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">平均応答時間</span>
                  <span className="text-blue-400 font-semibold">2.3s</span>
                </div>
              </div>
            </div>

            {/* Channel Status */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">チャンネル状態</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">メール</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">SMS</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 text-sm">警告</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Slack className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Slack</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 text-sm">エラー</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Teams</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">正常</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Notifications Preview */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">最近の通知</h3>
              <div className="space-y-3">
                {notificationHistory.slice(0, 3).map((notification) => {
                  const severity = severityLevels[notification.severity as keyof typeof severityLevels];
                  const SeverityIcon = severity.icon;
                  
                  return (
                    <div key={notification.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <SeverityIcon className={`w-4 h-4 mt-0.5 ${severity.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{notification.title}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(notification.timestamp).toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                すべて表示
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  全通知を既読にする
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  全通知を削除
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  設定をリセット
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  通知テスト実行
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;