import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    systemName: 'IT Service Management',
    emailNotifications: true,
    autoAssignment: false,
    defaultPriority: 'Medium',
    sessionTimeout: 30,
    theme: 'light'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings">
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p className="page-subtitle">Configure system preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h2>General Settings</h2>
          <div className="setting-item">
            <label>System Name</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => handleSettingChange('systemName', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="setting-item">
            <label>Default Priority</label>
            <select
              value={settings.defaultPriority}
              onChange={(e) => handleSettingChange('defaultPriority', e.target.value)}
              className="form-select"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="form-input"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
              Enable Email Notifications
            </label>
          </div>
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoAssignment}
                onChange={(e) => handleSettingChange('autoAssignment', e.target.checked)}
              />
              Auto-assignment of Incidents
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label>Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="form-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;