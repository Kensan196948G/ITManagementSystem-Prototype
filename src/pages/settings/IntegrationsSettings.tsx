import React, { useState, useRef } from 'react';
import {
  Cloud,
  Database,
  Mail,
  Shield,
  AlertTriangle,
  Settings,
  Download,
  Upload,
  Check,
  X
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  status?: 'connected' | 'disconnected' | 'error';
  config?: any;
}

const IntegrationsSettings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud Services - Reordered with Azure first, proper defaults
  const [cloudIntegrations, setCloudIntegrations] = useState<Integration[]>([
    {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Azureクラウドサービスとの統合',
      icon: <Cloud className="h-6 w-6 text-blue-500" />,
      enabled: true, // ON by default
      status: 'connected'
    },
    {
      id: 'aws',
      name: 'Amazon Web Services',
      description: 'AWSクラウドサービスとの統合',
      icon: <Cloud className="h-6 w-6 text-orange-500" />,
      enabled: false, // OFF by default
      status: 'disconnected'
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      description: 'GCPクラウドサービスとの統合',
      icon: <Cloud className="h-6 w-6 text-green-500" />,
      enabled: false, // OFF by default
      status: 'disconnected'
    }
  ]);

  // Directory Services - Reordered with Active Directory first
  const [directoryIntegrations, setDirectoryIntegrations] = useState<Integration[]>([
    {
      id: 'ad',
      name: 'Active Directory',
      description: 'Microsoft Active Directoryとの統合',
      icon: <Database className="h-6 w-6 text-blue-600" />,
      enabled: true, // ON by default
      status: 'connected'
    },
    {
      id: 'ldap',
      name: 'LDAP',
      description: 'LDAPディレクトリサービスとの統合',
      icon: <Database className="h-6 w-6 text-green-600" />,
      enabled: false, // OFF by default
      status: 'disconnected'
    }
  ]);

  // Email Settings with Microsoft 365 configuration
  const [emailSettings, setEmailSettings] = useState({
    smtp: {
      server: 'smtp.office365.com', // Microsoft 365 default
      port: 587,
      security: 'STARTTLS',
      authentication: 'OAuth 2.0',
      username: '',
      password: ''
    },
    imap: {
      server: 'outlook.office365.com', // Microsoft 365 default
      port: 993,
      security: 'SSL/TLS',
      authentication: 'OAuth 2.0',
      username: '',
      password: ''
    }
  });

  const [securityIntegrations, setSecurityIntegrations] = useState<Integration[]>([
    {
      id: 'antivirus',
      name: 'ウイルス対策ソフト',
      description: 'エンドポイント保護との統合',
      icon: <Shield className="h-6 w-6 text-red-500" />,
      enabled: true,
      status: 'connected'
    },
    {
      id: 'firewall',
      name: 'ファイアウォール',
      description: 'ネットワークセキュリティとの統合',
      icon: <Shield className="h-6 w-6 text-orange-500" />,
      enabled: true,
      status: 'connected'
    }
  ]);

  // Import functionality
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result as string);
          
          // Update all states with imported data
          if (imported.cloudIntegrations) {
            setCloudIntegrations(imported.cloudIntegrations);
          }
          if (imported.directoryIntegrations) {
            setDirectoryIntegrations(imported.directoryIntegrations);
          }
          if (imported.emailSettings) {
            setEmailSettings(imported.emailSettings);
          }
          if (imported.securityIntegrations) {
            setSecurityIntegrations(imported.securityIntegrations);
          }
          
          alert('統合設定をインポートしました');
        } catch (error) {
          alert('インポートに失敗しました。ファイル形式を確認してください。');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const exportData = {
      cloudIntegrations,
      directoryIntegrations,
      emailSettings,
      securityIntegrations
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'integration-settings.json';
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const toggleIntegration = (type: string, id: string) => {
    switch (type) {
      case 'cloud':
        setCloudIntegrations(prev => 
          prev.map(item => 
            item.id === id ? { ...item, enabled: !item.enabled } : item
          )
        );
        break;
      case 'directory':
        setDirectoryIntegrations(prev => 
          prev.map(item => 
            item.id === id ? { ...item, enabled: !item.enabled } : item
          )
        );
        break;
      case 'security':
        setSecurityIntegrations(prev => 
          prev.map(item => 
            item.id === id ? { ...item, enabled: !item.enabled } : item
          )
        );
        break;
    }
  };

  const IntegrationCard = ({ 
    integration, 
    type, 
    onToggle 
  }: { 
    integration: Integration; 
    type: string; 
    onToggle: (type: string, id: string) => void;
  }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {integration.icon}
          <div>
            <h3 className="text-lg font-medium text-white">{integration.name}</h3>
            <p className="text-gray-300 text-sm">{integration.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              integration.status === 'connected' ? 'bg-green-400' :
              integration.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-300">
              {integration.status === 'connected' ? '接続済み' :
               integration.status === 'error' ? 'エラー' : '未接続'}
            </span>
          </div>
          <button
            onClick={() => onToggle(type, integration.id)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              integration.enabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                integration.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">統合設定</h1>
          <p className="text-gray-400 mt-2">外部サービスとの統合を管理します</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleImportClick}
            className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 transition-all duration-200 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>インポート</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30 transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>エクスポート</span>
          </button>
        </div>
      </div>

      {/* Cloud Services */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Cloud className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">クラウドサービス</h2>
        </div>
        <div className="space-y-4">
          {cloudIntegrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              type="cloud"
              onToggle={toggleIntegration}
            />
          ))}
        </div>
      </div>

      {/* Directory Services */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">ディレクトリサービス</h2>
        </div>
        <div className="space-y-4">
          {directoryIntegrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              type="directory"
              onToggle={toggleIntegration}
            />
          ))}
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">メール設定</h2>
        </div>
        
        {/* Microsoft 365 Configuration Note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Microsoft 365設定</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            Microsoft 365のデフォルト設定が適用されています。OAuth 2.0認証を使用します。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SMTP Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-medium text-white mb-4">SMTP設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  サーバー
                </label>
                <input
                  type="text"
                  value={emailSettings.smtp.server}
                  onChange={(e) => setEmailSettings(prev => ({
                    ...prev,
                    smtp: { ...prev.smtp, server: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ポート
                  </label>
                  <input
                    type="number"
                    value={emailSettings.smtp.port}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, port: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    セキュリティ
                  </label>
                  <select
                    value={emailSettings.smtp.security}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      smtp: { ...prev.smtp, security: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="STARTTLS">STARTTLS</option>
                    <option value="SSL/TLS">SSL/TLS</option>
                    <option value="None">なし</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  認証方式
                </label>
                <select
                  value={emailSettings.smtp.authentication}
                  onChange={(e) => setEmailSettings(prev => ({
                    ...prev,
                    smtp: { ...prev.smtp, authentication: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="OAuth 2.0">OAuth 2.0</option>
                  <option value="Basic Auth">Basic Auth</option>
                  <option value="NTLM">NTLM</option>
                </select>
              </div>
            </div>
          </div>

          {/* IMAP Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-medium text-white mb-4">IMAP設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  サーバー
                </label>
                <input
                  type="text"
                  value={emailSettings.imap.server}
                  onChange={(e) => setEmailSettings(prev => ({
                    ...prev,
                    imap: { ...prev.imap, server: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ポート
                  </label>
                  <input
                    type="number"
                    value={emailSettings.imap.port}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      imap: { ...prev.imap, port: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    セキュリティ
                  </label>
                  <select
                    value={emailSettings.imap.security}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      imap: { ...prev.imap, security: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SSL/TLS">SSL/TLS</option>
                    <option value="STARTTLS">STARTTLS</option>
                    <option value="None">なし</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  認証方式
                </label>
                <select
                  value={emailSettings.imap.authentication}
                  onChange={(e) => setEmailSettings(prev => ({
                    ...prev,
                    imap: { ...prev.imap, authentication: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="OAuth 2.0">OAuth 2.0</option>
                  <option value="Basic Auth">Basic Auth</option>
                  <option value="NTLM">NTLM</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Integrations */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">セキュリティ統合</h2>
        </div>
        <div className="space-y-4">
          {securityIntegrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              type="security"
              onToggle={toggleIntegration}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;