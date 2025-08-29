import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Clock,
  Globe,
  Smartphone,
  FileText,
  Bell,
  Fingerprint,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'password_change' | 'mfa_enabled' | 'api_key_created' | 'suspicious_activity';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  user?: string;
  ip?: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed?: string;
  isActive: boolean;
}

interface IPRule {
  id: string;
  ip: string;
  type: 'whitelist' | 'blacklist';
  description: string;
  created: string;
}

const SecuritySettings: React.FC = () => {
  // Password Policy Settings
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [passwordRequireUppercase, setPasswordRequireUppercase] = useState(true);
  const [passwordRequireLowercase, setPasswordRequireLowercase] = useState(true);
  const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(true);
  const [passwordRequireSpecialChars, setPasswordRequireSpecialChars] = useState(true);
  const [passwordExpirationDays, setPasswordExpirationDays] = useState(90);
  const [passwordHistoryCount, setPasswordHistoryCount] = useState(5);

  // MFA Settings
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Login Security Settings
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(30);
  const [enableCaptcha, setEnableCaptcha] = useState(true);
  const [rememberMeEnabled, setRememberMeEnabled] = useState(true);
  const [rememberMeDays, setRememberMeDays] = useState(30);

  // Session Security Settings
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(120);
  const [concurrentSessionLimit, setConcurrentSessionLimit] = useState(3);
  const [forceLogoutOnPasswordChange, setForceLogoutOnPasswordChange] = useState(true);
  const [secureSessionCookies, setSecureSessionCookies] = useState(true);

  // Encryption Settings
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState('AES-256');
  const [hashingAlgorithm, setHashingAlgorithm] = useState('SHA-256');
  const [encryptDatabaseFields, setEncryptDatabaseFields] = useState(true);
  const [encryptFileStorage, setEncryptFileStorage] = useState(true);

  // Audit Settings
  const [auditLogEnabled, setAuditLogEnabled] = useState(true);
  const [auditLogRetentionDays, setAuditLogRetentionDays] = useState(365);
  const [auditFailedLogins, setAuditFailedLogins] = useState(true);
  const [auditDataChanges, setAuditDataChanges] = useState(true);
  const [auditSystemAccess, setAuditSystemAccess] = useState(true);

  // Alert Settings
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertEmailRecipients, setAlertEmailRecipients] = useState('admin@company.com');
  const [alertOnFailedLogins, setAlertOnFailedLogins] = useState(true);
  const [alertOnUnusualActivity, setAlertOnUnusualActivity] = useState(true);
  const [alertOnConfigChanges, setAlertOnConfigChanges] = useState(true);

  // IP Management
  const [ipRules, setIpRules] = useState<IPRule[]>([
    {
      id: '1',
      ip: '192.168.1.0/24',
      type: 'whitelist',
      description: '社内ネットワーク',
      created: '2024-01-15'
    },
    {
      id: '2',
      ip: '10.0.0.0/8',
      type: 'blacklist',
      description: '疑わしいIPレンジ',
      created: '2024-02-01'
    }
  ]);

  // API Keys
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'モバイルアプリ',
      key: 'sk_live_***************',
      permissions: ['read', 'write'],
      created: '2024-01-10',
      lastUsed: '2024-03-15',
      isActive: true
    },
    {
      id: '2',
      name: '外部統合',
      key: 'sk_test_***************',
      permissions: ['read'],
      created: '2024-02-05',
      isActive: false
    }
  ]);

  // Security Events
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login_attempt',
      description: '複数回のログイン失敗',
      timestamp: '2024-03-15 14:30:00',
      severity: 'medium',
      user: 'user@example.com',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      type: 'mfa_enabled',
      description: 'MFAが有効化されました',
      timestamp: '2024-03-14 10:15:00',
      severity: 'low',
      user: 'admin@example.com'
    },
    {
      id: '3',
      type: 'suspicious_activity',
      description: '異常なAPIアクセスパターンを検出',
      timestamp: '2024-03-13 16:45:00',
      severity: 'high',
      ip: '203.0.113.50'
    }
  ]);

  // New IP Rule states
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpType, setNewIpType] = useState<'whitelist' | 'blacklist'>('whitelist');
  const [newIpDescription, setNewIpDescription] = useState('');
  const [showAddIpForm, setShowAddIpForm] = useState(false);

  // New API Key states
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>(['read']);
  const [showAddApiKeyForm, setShowAddApiKeyForm] = useState(false);

  // File input ref for import
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const calculateSecurityLevel = (): 'low' | 'medium' | 'high' => {
    let score = 0;
    
    // Password policy (max 30 points)
    if (passwordMinLength >= 8) score += 5;
    if (passwordRequireUppercase) score += 3;
    if (passwordRequireLowercase) score += 3;
    if (passwordRequireNumbers) score += 3;
    if (passwordRequireSpecialChars) score += 3;
    if (passwordExpirationDays <= 90) score += 5;
    if (passwordHistoryCount >= 5) score += 3;
    
    // MFA (max 25 points)
    if (mfaEnabled) score += 15;
    if (mfaRequired) score += 10;
    
    // Login security (max 20 points)
    if (maxLoginAttempts <= 5) score += 5;
    if (lockoutDurationMinutes >= 15) score += 5;
    if (enableCaptcha) score += 5;
    if (sessionTimeoutMinutes <= 120) score += 5;
    
    // Encryption & Audit (max 15 points)
    if (encryptDatabaseFields) score += 5;
    if (auditLogEnabled) score += 5;
    if (alertsEnabled) score += 5;
    
    // Security monitoring (max 10 points)
    if (ipRules.length > 0) score += 5;
    if (concurrentSessionLimit <= 3) score += 5;
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const securityLevel = calculateSecurityLevel();

  const handleSave = () => {
    // Save security settings
    try {
      const settings = {
        passwordPolicy: {
          minLength: passwordMinLength,
          requireUppercase: passwordRequireUppercase,
          requireLowercase: passwordRequireLowercase,
          requireNumbers: passwordRequireNumbers,
          requireSpecialChars: passwordRequireSpecialChars,
          expirationDays: passwordExpirationDays,
          historyCount: passwordHistoryCount
        },
        mfa: {
          enabled: mfaEnabled,
          required: mfaRequired,
          totpEnabled,
          smsEnabled,
          emailEnabled
        },
        loginSecurity: {
          maxLoginAttempts,
          lockoutDurationMinutes,
          enableCaptcha,
          rememberMeEnabled,
          rememberMeDays
        },
        sessionSecurity: {
          sessionTimeoutMinutes,
          concurrentSessionLimit,
          forceLogoutOnPasswordChange,
          secureSessionCookies
        },
        encryption: {
          encryptionAlgorithm,
          hashingAlgorithm,
          encryptDatabaseFields,
          encryptFileStorage
        },
        audit: {
          auditLogEnabled,
          auditLogRetentionDays,
          auditFailedLogins,
          auditDataChanges,
          auditSystemAccess
        },
        alerts: {
          alertsEnabled,
          alertEmailRecipients,
          alertOnFailedLogins,
          alertOnUnusualActivity,
          alertOnConfigChanges
        },
        ipRules,
        apiKeys
      };
      
      // Simulate save operation
      localStorage.setItem('securitySettings', JSON.stringify(settings));
      alert('設定を保存しました');
    } catch (error) {
      alert('設定の保存に失敗しました');
    }
  };

  const handleReset = () => {
    // Reset to default settings
    if (confirm('全ての設定をデフォルトに戻しますか？この操作は取り消せません。')) {
      // Password Policy defaults
      setPasswordMinLength(8);
      setPasswordRequireUppercase(true);
      setPasswordRequireLowercase(true);
      setPasswordRequireNumbers(true);
      setPasswordRequireSpecialChars(true);
      setPasswordExpirationDays(90);
      setPasswordHistoryCount(5);

      // MFA defaults
      setMfaEnabled(false);
      setMfaRequired(false);
      setTotpEnabled(true);
      setSmsEnabled(false);
      setEmailEnabled(true);

      // Login Security defaults
      setMaxLoginAttempts(5);
      setLockoutDurationMinutes(30);
      setEnableCaptcha(true);
      setRememberMeEnabled(true);
      setRememberMeDays(30);

      // Session Security defaults
      setSessionTimeoutMinutes(120);
      setConcurrentSessionLimit(3);
      setForceLogoutOnPasswordChange(true);
      setSecureSessionCookies(true);

      // Encryption defaults
      setEncryptionAlgorithm('AES-256');
      setHashingAlgorithm('SHA-256');
      setEncryptDatabaseFields(true);
      setEncryptFileStorage(true);

      // Audit defaults
      setAuditLogEnabled(true);
      setAuditLogRetentionDays(365);
      setAuditFailedLogins(true);
      setAuditDataChanges(true);
      setAuditSystemAccess(true);

      // Alerts defaults
      setAlertsEnabled(true);
      setAlertEmailRecipients('admin@company.com');
      setAlertOnFailedLogins(true);
      setAlertOnUnusualActivity(true);
      setAlertOnConfigChanges(true);

      // Clear IP rules and API keys
      setIpRules([]);
      setApiKeys([]);

      alert('設定をデフォルトにリセットしました');
    }
  };

  const exportSettings = () => {
    // Export security configuration
    try {
      const settings = {
        passwordPolicy: {
          minLength: passwordMinLength,
          requireUppercase: passwordRequireUppercase,
          requireLowercase: passwordRequireLowercase,
          requireNumbers: passwordRequireNumbers,
          requireSpecialChars: passwordRequireSpecialChars,
          expirationDays: passwordExpirationDays,
          historyCount: passwordHistoryCount
        },
        mfa: {
          enabled: mfaEnabled,
          required: mfaRequired,
          totpEnabled,
          smsEnabled,
          emailEnabled
        },
        loginSecurity: {
          maxLoginAttempts,
          lockoutDurationMinutes,
          enableCaptcha,
          rememberMeEnabled,
          rememberMeDays
        },
        sessionSecurity: {
          sessionTimeoutMinutes,
          concurrentSessionLimit,
          forceLogoutOnPasswordChange,
          secureSessionCookies
        },
        encryption: {
          encryptionAlgorithm,
          hashingAlgorithm,
          encryptDatabaseFields,
          encryptFileStorage
        },
        audit: {
          auditLogEnabled,
          auditLogRetentionDays,
          auditFailedLogins,
          auditDataChanges,
          auditSystemAccess
        },
        alerts: {
          alertsEnabled,
          alertEmailRecipients,
          alertOnFailedLogins,
          alertOnUnusualActivity,
          alertOnConfigChanges
        },
        ipRules,
        apiKeys,
        exportDate: new Date().toISOString()
      };
      
      const json = JSON.stringify(settings, null, 2);
      const blob = new Blob(['\uFEFF' + json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      alert('設定をエクスポートしました');
    } catch (error) {
      alert('エクスポートに失敗しました');
    }
  };

  const importSettings = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const settings = JSON.parse(result);
          
          // Validate and update settings
          if (settings.passwordPolicy) {
            setPasswordMinLength(settings.passwordPolicy.minLength || 8);
            setPasswordRequireUppercase(settings.passwordPolicy.requireUppercase !== false);
            setPasswordRequireLowercase(settings.passwordPolicy.requireLowercase !== false);
            setPasswordRequireNumbers(settings.passwordPolicy.requireNumbers !== false);
            setPasswordRequireSpecialChars(settings.passwordPolicy.requireSpecialChars !== false);
            setPasswordExpirationDays(settings.passwordPolicy.expirationDays || 90);
            setPasswordHistoryCount(settings.passwordPolicy.historyCount || 5);
          }
          
          if (settings.mfa) {
            setMfaEnabled(settings.mfa.enabled || false);
            setMfaRequired(settings.mfa.required || false);
            setTotpEnabled(settings.mfa.totpEnabled !== false);
            setSmsEnabled(settings.mfa.smsEnabled || false);
            setEmailEnabled(settings.mfa.emailEnabled !== false);
          }
          
          if (settings.loginSecurity) {
            setMaxLoginAttempts(settings.loginSecurity.maxLoginAttempts || 5);
            setLockoutDurationMinutes(settings.loginSecurity.lockoutDurationMinutes || 30);
            setEnableCaptcha(settings.loginSecurity.enableCaptcha !== false);
            setRememberMeEnabled(settings.loginSecurity.rememberMeEnabled !== false);
            setRememberMeDays(settings.loginSecurity.rememberMeDays || 30);
          }
          
          if (settings.sessionSecurity) {
            setSessionTimeoutMinutes(settings.sessionSecurity.sessionTimeoutMinutes || 120);
            setConcurrentSessionLimit(settings.sessionSecurity.concurrentSessionLimit || 3);
            setForceLogoutOnPasswordChange(settings.sessionSecurity.forceLogoutOnPasswordChange !== false);
            setSecureSessionCookies(settings.sessionSecurity.secureSessionCookies !== false);
          }
          
          if (settings.encryption) {
            setEncryptionAlgorithm(settings.encryption.encryptionAlgorithm || 'AES-256');
            setHashingAlgorithm(settings.encryption.hashingAlgorithm || 'SHA-256');
            setEncryptDatabaseFields(settings.encryption.encryptDatabaseFields !== false);
            setEncryptFileStorage(settings.encryption.encryptFileStorage !== false);
          }
          
          if (settings.audit) {
            setAuditLogEnabled(settings.audit.auditLogEnabled !== false);
            setAuditLogRetentionDays(settings.audit.auditLogRetentionDays || 365);
            setAuditFailedLogins(settings.audit.auditFailedLogins !== false);
            setAuditDataChanges(settings.audit.auditDataChanges !== false);
            setAuditSystemAccess(settings.audit.auditSystemAccess !== false);
          }
          
          if (settings.alerts) {
            setAlertsEnabled(settings.alerts.alertsEnabled !== false);
            setAlertEmailRecipients(settings.alerts.alertEmailRecipients || 'admin@company.com');
            setAlertOnFailedLogins(settings.alerts.alertOnFailedLogins !== false);
            setAlertOnUnusualActivity(settings.alerts.alertOnUnusualActivity !== false);
            setAlertOnConfigChanges(settings.alerts.alertOnConfigChanges !== false);
          }
          
          if (settings.ipRules && Array.isArray(settings.ipRules)) {
            setIpRules(settings.ipRules);
          }
          
          if (settings.apiKeys && Array.isArray(settings.apiKeys)) {
            setApiKeys(settings.apiKeys);
          }
          
          alert('設定をインポートしました');
        } catch (error) {
          alert('インポートに失敗しました。ファイル形式を確認してください。');
        }
      };
      reader.readAsText(file);
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const addIpRule = () => {
    if (newIpAddress && newIpDescription) {
      const newRule: IPRule = {
        id: Date.now().toString(),
        ip: newIpAddress,
        type: newIpType,
        description: newIpDescription,
        created: new Date().toISOString().split('T')[0]
      };
      setIpRules([...ipRules, newRule]);
      cancelIpRuleForm();
    }
  };

  const cancelIpRuleForm = () => {
    setNewIpAddress('');
    setNewIpType('whitelist');
    setNewIpDescription('');
    setShowAddIpForm(false);
  };

  const removeIpRule = (id: string) => {
    setIpRules(ipRules.filter(rule => rule.id !== id));
  };

  const addApiKey = () => {
    if (newApiKeyName) {
      const newKey: APIKey = {
        id: Date.now().toString(),
        name: newApiKeyName,
        key: `sk_live_${Math.random().toString(36).substr(2, 24)}`,
        permissions: newApiKeyPermissions,
        created: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setApiKeys([...apiKeys, newKey]);
      cancelApiKeyForm();
    }
  };

  const cancelApiKeyForm = () => {
    setNewApiKeyName('');
    setNewApiKeyPermissions(['read']);
    setShowAddApiKeyForm(false);
  };

  const toggleApiKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, isActive: !key.isActive } : key
    ));
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">セキュリティ設定</h1>
          <p className="text-gray-300">システムのセキュリティ設定を管理します</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">セキュリティレベル:</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              securityLevel === 'high' ? 'bg-green-500 text-white' :
              securityLevel === 'medium' ? 'bg-yellow-500 text-black' :
              'bg-red-500 text-white'
            }`}>
              {securityLevel === 'high' ? '高' : securityLevel === 'medium' ? '中' : '低'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Password Policy */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">パスワードポリシー</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最小文字数: {passwordMinLength}
              </label>
              <input
                type="range"
                min="6"
                max="20"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={passwordRequireUppercase}
                  onChange={(e) => setPasswordRequireUppercase(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">大文字を必須にする</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={passwordRequireLowercase}
                  onChange={(e) => setPasswordRequireLowercase(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">小文字を必須にする</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={passwordRequireNumbers}
                  onChange={(e) => setPasswordRequireNumbers(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">数字を必須にする</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={passwordRequireSpecialChars}
                  onChange={(e) => setPasswordRequireSpecialChars(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">特殊文字を必須にする</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                有効期限（日）
              </label>
              <input
                type="number"
                value={passwordExpirationDays}
                onChange={(e) => setPasswordExpirationDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                min="0"
                max="365"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                履歴保持数
              </label>
              <input
                type="number"
                value={passwordHistoryCount}
                onChange={(e) => setPasswordHistoryCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                min="0"
                max="20"
              />
            </div>
          </div>
        </div>

        {/* Multi-Factor Authentication */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">多要素認証</h2>
            <div className={`w-3 h-3 rounded-full ${mfaEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">MFAを有効にする</span>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">MFAを必須にする</span>
              <input
                type="checkbox"
                checked={mfaRequired}
                onChange={(e) => setMfaRequired(e.target.checked)}
                className="toggle"
                disabled={!mfaEnabled}
              />
            </label>
            
            <div className="border-t border-white/20 pt-4">
              <h3 className="text-sm font-medium text-white mb-3">認証方法</h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">TOTP（認証アプリ）</span>
                  <input
                    type="checkbox"
                    checked={totpEnabled}
                    onChange={(e) => setTotpEnabled(e.target.checked)}
                    disabled={!mfaEnabled}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">SMS</span>
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    disabled={!mfaEnabled}
                    className="rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">メール</span>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    disabled={!mfaEnabled}
                    className="rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Login Security */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">ログインセキュリティ</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最大ログイン試行回数
              </label>
              <input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ロックアウト時間（分）
              </label>
              <input
                type="number"
                value={lockoutDurationMinutes}
                onChange={(e) => setLockoutDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                min="1"
                max="1440"
              />
            </div>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">CAPTCHA認証</span>
              <input
                type="checkbox"
                checked={enableCaptcha}
                onChange={(e) => setEnableCaptcha(e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">ログイン状態の保持</span>
              <input
                type="checkbox"
                checked={rememberMeEnabled}
                onChange={(e) => setRememberMeEnabled(e.target.checked)}
                className="toggle"
              />
            </label>
            
            {rememberMeEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  保持期間（日）
                </label>
                <input
                  type="number"
                  value={rememberMeDays}
                  onChange={(e) => setRememberMeDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  min="1"
                  max="365"
                />
              </div>
            )}
          </div>
        </div>

        {/* Session Security */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">セッションセキュリティ</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                セッションタイムアウト（分）: {sessionTimeoutMinutes}
              </label>
              <input
                type="range"
                min="15"
                max="480"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                同時セッション数制限
              </label>
              <input
                type="number"
                value={concurrentSessionLimit}
                onChange={(e) => setConcurrentSessionLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                min="1"
                max="10"
              />
            </div>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">パスワード変更時強制ログアウト</span>
              <input
                type="checkbox"
                checked={forceLogoutOnPasswordChange}
                onChange={(e) => setForceLogoutOnPasswordChange(e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">セキュアクッキー</span>
              <input
                type="checkbox"
                checked={secureSessionCookies}
                onChange={(e) => setSecureSessionCookies(e.target.checked)}
                className="toggle"
              />
            </label>
          </div>
        </div>

        {/* Encryption Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Fingerprint className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">暗号化設定</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                暗号化アルゴリズム
              </label>
              <select
                value={encryptionAlgorithm}
                onChange={(e) => setEncryptionAlgorithm(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              >
                <option value="AES-256">AES-256</option>
                <option value="AES-192">AES-192</option>
                <option value="AES-128">AES-128</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ハッシュアルゴリズム
              </label>
              <select
                value={hashingAlgorithm}
                onChange={(e) => setHashingAlgorithm(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              >
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-512">SHA-512</option>
                <option value="bcrypt">bcrypt</option>
              </select>
            </div>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">データベース暗号化</span>
              <input
                type="checkbox"
                checked={encryptDatabaseFields}
                onChange={(e) => setEncryptDatabaseFields(e.target.checked)}
                className="toggle"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">ファイルストレージ暗号化</span>
              <input
                type="checkbox"
                checked={encryptFileStorage}
                onChange={(e) => setEncryptFileStorage(e.target.checked)}
                className="toggle"
              />
            </label>
          </div>
        </div>

        {/* Audit Log Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">監査ログ設定</h2>
            <div className={`w-3 h-3 rounded-full ${auditLogEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">監査ログを有効にする</span>
              <input
                type="checkbox"
                checked={auditLogEnabled}
                onChange={(e) => setAuditLogEnabled(e.target.checked)}
                className="toggle"
              />
            </label>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ログ保持期間（日）
              </label>
              <input
                type="number"
                value={auditLogRetentionDays}
                onChange={(e) => setAuditLogRetentionDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                min="1"
                max="7300"
                disabled={!auditLogEnabled}
              />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">ログ対象</h3>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">ログイン失敗</span>
                <input
                  type="checkbox"
                  checked={auditFailedLogins}
                  onChange={(e) => setAuditFailedLogins(e.target.checked)}
                  disabled={!auditLogEnabled}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">データ変更</span>
                <input
                  type="checkbox"
                  checked={auditDataChanges}
                  onChange={(e) => setAuditDataChanges(e.target.checked)}
                  disabled={!auditLogEnabled}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">システムアクセス</span>
                <input
                  type="checkbox"
                  checked={auditSystemAccess}
                  onChange={(e) => setAuditSystemAccess(e.target.checked)}
                  disabled={!auditLogEnabled}
                  className="rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* IP Whitelist/Blacklist Management */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">IP アクセス制御</h2>
          </div>
          <button
            onClick={() => setShowAddIpForm(!showAddIpForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            IPルール追加
          </button>
        </div>
        
        {showAddIpForm && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="IPアドレス/CIDR"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <select
                value={newIpType}
                onChange={(e) => setNewIpType(e.target.value as 'whitelist' | 'blacklist')}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              >
                <option value="whitelist">ホワイトリスト</option>
                <option value="blacklist">ブラックリスト</option>
              </select>
              <input
                type="text"
                placeholder="説明"
                value={newIpDescription}
                onChange={(e) => setNewIpDescription(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addIpRule}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                追加
              </button>
              <button
                onClick={cancelIpRuleForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">IPアドレス</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">タイプ</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">説明</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">作成日</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {ipRules.map((rule) => (
                <tr key={rule.id} className="border-b border-white/10">
                  <td className="py-3 px-4 text-white font-mono text-sm">{rule.ip}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.type === 'whitelist' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {rule.type === 'whitelist' ? 'ホワイト' : 'ブラック'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{rule.description}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{rule.created}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => removeIpRule(rule.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">APIキー管理</h2>
          </div>
          <button
            onClick={() => setShowAddApiKeyForm(!showAddApiKeyForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            APIキー作成
          </button>
        </div>
        
        {showAddApiKeyForm && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="APIキー名"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <div>
                <label className="block text-sm text-gray-300 mb-1">権限</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={newApiKeyPermissions.includes('read')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewApiKeyPermissions([...newApiKeyPermissions, 'read']);
                        } else {
                          setNewApiKeyPermissions(newApiKeyPermissions.filter(p => p !== 'read'));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">読み取り</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={newApiKeyPermissions.includes('write')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewApiKeyPermissions([...newApiKeyPermissions, 'write']);
                        } else {
                          setNewApiKeyPermissions(newApiKeyPermissions.filter(p => p !== 'write'));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">書き込み</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addApiKey}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                作成
              </button>
              <button
                onClick={cancelApiKeyForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-white">{apiKey.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${apiKey.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-400">
                      {apiKey.isActive ? '有効' : '無効'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="font-mono">{apiKey.key}</span>
                    <span>権限: {apiKey.permissions.join(', ')}</span>
                    <span>作成: {apiKey.created}</span>
                    {apiKey.lastUsed && <span>最終使用: {apiKey.lastUsed}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleApiKey(apiKey.id)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      apiKey.isActive 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    }`}
                  >
                    {apiKey.isActive ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => deleteApiKey(apiKey.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Alerts Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">セキュリティアラート設定</h2>
            <div className={`w-3 h-3 rounded-full ${alertsEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">アラートを有効にする</span>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="toggle"
              />
            </label>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                通知先メールアドレス
              </label>
              <input
                type="email"
                value={alertEmailRecipients}
                onChange={(e) => setAlertEmailRecipients(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                disabled={!alertsEnabled}
              />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">アラート条件</h3>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">ログイン失敗</span>
                <input
                  type="checkbox"
                  checked={alertOnFailedLogins}
                  onChange={(e) => setAlertOnFailedLogins(e.target.checked)}
                  disabled={!alertsEnabled}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">異常な活動</span>
                <input
                  type="checkbox"
                  checked={alertOnUnusualActivity}
                  onChange={(e) => setAlertOnUnusualActivity(e.target.checked)}
                  disabled={!alertsEnabled}
                  className="rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">設定変更</span>
                <input
                  type="checkbox"
                  checked={alertOnConfigChanges}
                  onChange={(e) => setAlertOnConfigChanges(e.target.checked)}
                  disabled={!alertsEnabled}
                  className="rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">最近のセキュリティイベント</h2>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {securityEvents.map((event) => (
              <div key={event.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{event.description}</span>
                      <span className="text-xs text-gray-400">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {event.user && <span>ユーザー: {event.user}</span>}
                      {event.ip && <span>IP: {event.ip}</span>}
                      <span className={`px-2 py-1 rounded ${
                        event.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                        event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {event.severity === 'high' ? '高' : event.severity === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/20">
        <div className="flex items-center gap-4">
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            設定をエクスポート
          </button>
          
          <button 
            onClick={importSettings}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            設定をインポート
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;