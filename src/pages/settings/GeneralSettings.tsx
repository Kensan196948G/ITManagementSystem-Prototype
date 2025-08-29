import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Clock,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Database,
  Calendar,
  Timer,
  Shield,
  Info,
  Save,
  RotateCcw,
  Building,
  User,
  MapPin,
  Palette,
  Eye,
  Server,
  HardDrive,
  Activity
} from 'lucide-react';

interface GeneralSettingsData {
  // システム情報
  systemName: string;
  organizationName: string;
  organizationCode: string;
  adminContact: string;
  location: string;
  
  // 言語設定
  language: 'ja' | 'en';
  
  // 時間設定
  timezone: string;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY年MM月DD日';
  timeFormat: '24h' | '12h';
  
  // ダッシュボード設定
  defaultDashboardView: 'summary' | 'detailed' | 'minimal';
  refreshInterval: number; // minutes
  showSystemMetrics: boolean;
  
  // セッション設定
  sessionTimeout: number; // minutes
  autoSaveInterval: number; // minutes
  maxConcurrentSessions: number;
  
  // テーマ設定
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  compactMode: boolean;
  
  // データ保持設定
  logRetentionDays: number;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataArchiveDays: number;
  
  // メンテナンス設定
  maintenanceWindow: {
    start: string;
    end: string;
    dayOfWeek: number; // 0 = Sunday
    enabled: boolean;
  };
  
  // 通知設定
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  enableSystemAlerts: boolean;
}

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState<GeneralSettingsData>({
    systemName: 'ITサービス管理システム',
    organizationName: '株式会社サンプル',
    organizationCode: 'SAMPLE001',
    adminContact: 'admin@sample.com',
    location: '東京都港区',
    language: 'ja',
    timezone: 'Asia/Tokyo',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: '24h',
    defaultDashboardView: 'summary',
    refreshInterval: 5,
    showSystemMetrics: true,
    sessionTimeout: 60,
    autoSaveInterval: 2,
    maxConcurrentSessions: 3,
    theme: 'auto',
    accentColor: '#3b82f6',
    compactMode: false,
    logRetentionDays: 90,
    backupFrequency: 'daily',
    dataArchiveDays: 365,
    maintenanceWindow: {
      start: '02:00',
      end: '04:00',
      dayOfWeek: 0,
      enabled: true
    },
    enableEmailNotifications: true,
    enableBrowserNotifications: true,
    enableSystemAlerts: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [systemInfo] = useState({
    version: 'v1.2.0',
    buildDate: '2025-08-29',
    lastUpdate: '2025-08-29 10:30:00',
    database: 'PostgreSQL 15.2',
    uptime: '7日 12時間 30分'
  });

  const languageOptions = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: 'English' }
  ];

  const timezoneOptions = [
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' }
  ];

  const dateFormatOptions = [
    { value: 'YYYY年MM月DD日', label: '2025年08月29日' },
    { value: 'YYYY-MM-DD', label: '2025-08-29' },
    { value: 'DD/MM/YYYY', label: '29/08/2025' },
    { value: 'MM/DD/YYYY', label: '08/29/2025' }
  ];

  const dashboardViewOptions = [
    { value: 'summary', label: 'サマリー表示' },
    { value: 'detailed', label: '詳細表示' },
    { value: 'minimal', label: 'ミニマル表示' }
  ];

  const themeOptions = [
    { value: 'light', label: 'ライトテーマ', icon: Sun },
    { value: 'dark', label: 'ダークテーマ', icon: Moon },
    { value: 'auto', label: '自動切替', icon: Laptop }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: '毎日' },
    { value: 'weekly', label: '毎週' },
    { value: 'monthly', label: '毎月' }
  ];

  const weekDays = [
    '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
  ];

  useEffect(() => {
    // 設定値の変更を検知
    setHasChanges(true);
  }, [settings]);

  const handleInputChange = (field: keyof GeneralSettingsData | string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof GeneralSettingsData] as any,
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      alert('設定が保存されました。');
    } catch (error) {
      alert('設定の保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('設定をデフォルトに戻しますか？未保存の変更は失われます。')) {
      // デフォルト設定にリセット
      setSettings({
        systemName: 'ITサービス管理システム',
        organizationName: '株式会社サンプル',
        organizationCode: 'SAMPLE001',
        adminContact: 'admin@sample.com',
        location: '東京都港区',
        language: 'ja',
        timezone: 'Asia/Tokyo',
        dateFormat: 'YYYY年MM月DD日',
        timeFormat: '24h',
        defaultDashboardView: 'summary',
        refreshInterval: 5,
        showSystemMetrics: true,
        sessionTimeout: 60,
        autoSaveInterval: 2,
        maxConcurrentSessions: 3,
        theme: 'auto',
        accentColor: '#3b82f6',
        compactMode: false,
        logRetentionDays: 90,
        backupFrequency: 'daily',
        dataArchiveDays: 365,
        maintenanceWindow: {
          start: '02:00',
          end: '04:00',
          dayOfWeek: 0,
          enabled: true
        },
        enableEmailNotifications: true,
        enableBrowserNotifications: true,
        enableSystemAlerts: true
      });
      setHasChanges(false);
    }
  };

  const validateTimeFormat = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const SettingSection: React.FC<{ title: string; icon: React.ComponentType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <motion.div
      variants={sectionVariants}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );

  const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="max-w-6xl mx-auto"
      >
        {/* ヘッダー */}
        <motion.div
          variants={sectionVariants}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">一般設定</h1>
                <p className="text-gray-300">システムの基本設定を管理します</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                リセット
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* システム情報 */}
          <SettingSection title="システム情報" icon={Building}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">システム名</label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="システム名を入力"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">組織名</label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="組織名を入力"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">組織コード</label>
                <input
                  type="text"
                  value={settings.organizationCode}
                  onChange={(e) => handleInputChange('organizationCode', e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="組織コードを入力"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">管理者連絡先</label>
                <input
                  type="email"
                  value={settings.adminContact}
                  onChange={(e) => handleInputChange('adminContact', e.target.value)}
                  className={`w-full px-3 py-2 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    validateEmail(settings.adminContact) ? 'border-gray-600 focus:ring-blue-500' : 'border-red-500 focus:ring-red-500'
                  }`}
                  placeholder="管理者のメールアドレス"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">所在地</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="所在地を入力"
                />
              </div>
            </div>
          </SettingSection>

          {/* 言語・地域設定 */}
          <SettingSection title="言語・地域設定" icon={Globe}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">言語</label>
              <select
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">タイムゾーン</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">日付形式</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateFormatOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">時刻形式</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="24h"
                    checked={settings.timeFormat === '24h'}
                    onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">24時間表示</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="12h"
                    checked={settings.timeFormat === '12h'}
                    onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">12時間表示</span>
                </label>
              </div>
            </div>
          </SettingSection>

          {/* ダッシュボード設定 */}
          <SettingSection title="ダッシュボード設定" icon={Monitor}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">デフォルト表示</label>
              <select
                value={settings.defaultDashboardView}
                onChange={(e) => handleInputChange('defaultDashboardView', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dashboardViewOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">自動更新間隔（分）</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.refreshInterval}
                onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Toggle
              checked={settings.showSystemMetrics}
              onChange={(checked) => handleInputChange('showSystemMetrics', checked)}
              label="システムメトリクスを表示"
            />
          </SettingSection>

          {/* セッション設定 */}
          <SettingSection title="セッション設定" icon={Timer}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">セッションタイムアウト（分）</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">自動保存間隔（分）</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.autoSaveInterval}
                onChange={(e) => handleInputChange('autoSaveInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">最大同時セッション数</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxConcurrentSessions}
                onChange={(e) => handleInputChange('maxConcurrentSessions', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </SettingSection>

          {/* テーマ設定 */}
          <SettingSection title="テーマ設定" icon={Palette}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">テーマ</label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('theme', option.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                      settings.theme === option.value
                        ? 'bg-blue-600/50 border-blue-400'
                        : 'bg-black/20 border-gray-600 hover:bg-black/30'
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-sm text-white">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">アクセントカラー</label>
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => handleInputChange('accentColor', e.target.value)}
                className="w-full h-10 bg-black/20 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Toggle
              checked={settings.compactMode}
              onChange={(checked) => handleInputChange('compactMode', checked)}
              label="コンパクトモード"
            />
          </SettingSection>

          {/* データ保持設定 */}
          <SettingSection title="データ保持設定" icon={Database}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">ログ保持期間（日）</label>
              <input
                type="number"
                min="7"
                max="730"
                value={settings.logRetentionDays}
                onChange={(e) => handleInputChange('logRetentionDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">バックアップ頻度</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {backupFrequencyOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">データアーカイブ期間（日）</label>
              <input
                type="number"
                min="30"
                max="2555"
                value={settings.dataArchiveDays}
                onChange={(e) => handleInputChange('dataArchiveDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </SettingSection>

          {/* メンテナンス設定 */}
          <SettingSection title="メンテナンス設定" icon={Server}>
            <Toggle
              checked={settings.maintenanceWindow.enabled}
              onChange={(checked) => handleInputChange('maintenanceWindow.enabled', checked)}
              label="メンテナンスウィンドウを有効化"
            />
            {settings.maintenanceWindow.enabled && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">実行曜日</label>
                  <select
                    value={settings.maintenanceWindow.dayOfWeek}
                    onChange={(e) => handleInputChange('maintenanceWindow.dayOfWeek', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {weekDays.map((day, index) => (
                      <option key={index} value={index} className="bg-gray-800">
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">開始時刻</label>
                    <input
                      type="time"
                      value={settings.maintenanceWindow.start}
                      onChange={(e) => handleInputChange('maintenanceWindow.start', e.target.value)}
                      className={`w-full px-3 py-2 bg-black/20 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                        validateTimeFormat(settings.maintenanceWindow.start) ? 'border-gray-600 focus:ring-blue-500' : 'border-red-500 focus:ring-red-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">終了時刻</label>
                    <input
                      type="time"
                      value={settings.maintenanceWindow.end}
                      onChange={(e) => handleInputChange('maintenanceWindow.end', e.target.value)}
                      className={`w-full px-3 py-2 bg-black/20 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                        validateTimeFormat(settings.maintenanceWindow.end) ? 'border-gray-600 focus:ring-blue-500' : 'border-red-500 focus:ring-red-500'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
          </SettingSection>

          {/* 通知設定 */}
          <SettingSection title="通知設定" icon={Shield}>
            <Toggle
              checked={settings.enableEmailNotifications}
              onChange={(checked) => handleInputChange('enableEmailNotifications', checked)}
              label="メール通知"
            />
            <Toggle
              checked={settings.enableBrowserNotifications}
              onChange={(checked) => handleInputChange('enableBrowserNotifications', checked)}
              label="ブラウザ通知"
            />
            <Toggle
              checked={settings.enableSystemAlerts}
              onChange={(checked) => handleInputChange('enableSystemAlerts', checked)}
              label="システムアラート"
            />
          </SettingSection>

          {/* システム情報表示 */}
          <SettingSection title="システム情報" icon={Info}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">バージョン</span>
                <span className="text-white font-mono">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">ビルド日時</span>
                <span className="text-white font-mono">{systemInfo.buildDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">最終更新</span>
                <span className="text-white font-mono">{systemInfo.lastUpdate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">データベース</span>
                <span className="text-white font-mono">{systemInfo.database}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">稼働時間</span>
                <span className="text-white font-mono">{systemInfo.uptime}</span>
              </div>
            </div>
          </SettingSection>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneralSettings;