import React, { useState } from 'react';
import { Plus, AlertTriangle, User, Calendar, Clock, FileText, Upload } from 'lucide-react';

interface IncidentForm {
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  affectedServices: string[];
  reportedBy: string;
  contactInfo: string;
  businessImpact: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: string;
  dueDate: string;
  attachments: File[];
}

const CreateIncident: React.FC = () => {
  const [formData, setFormData] = useState<IncidentForm>({
    title: '',
    description: '',
    priority: 'Medium',
    category: '',
    affectedServices: [],
    reportedBy: '',
    contactInfo: '',
    businessImpact: '',
    urgency: 'Medium',
    impact: 'Medium',
    assignee: '',
    dueDate: '',
    attachments: []
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const serviceOptions = [
    'Email Service',
    'Web Service',
    'Database Service',
    'Network Infrastructure',
    'VPN Service',
    'Print Service',
    'File Server',
    'Active Directory',
    'Backup Service',
    'Monitoring Service'
  ];

  const categoryOptions = [
    'Hardware',
    'Software',
    'Network',
    'Security',
    'Performance',
    'Access',
    'Data',
    'Other'
  ];

  const assigneeOptions = [
    '田中 太郎',
    '山田 次郎',
    '高橋 美咲',
    '佐藤 花子',
    '鈴木 一郎'
  ];

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
    setFormData(prev => ({
      ...prev,
      affectedServices: selectedServices.includes(service)
        ? selectedServices.filter(s => s !== service)
        : [...selectedServices, service]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally submit to an API
    console.log('Incident created:', formData);
    alert('インシデントが正常に作成されました！');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-red-500 text-red-700 bg-red-50';
      case 'High': return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'Medium': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      case 'Low': return 'border-green-500 text-green-700 bg-green-50';
      default: return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Plus className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">新規インシデント作成</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左カラム */}
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                基本情報
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="インシデントの簡潔なタイトルを入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明 *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="インシデントの詳細な説明を入力してください"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      カテゴリ *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">選択してください</option>
                      {categoryOptions.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      優先度
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getPriorityColor(formData.priority)}`}
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="Low">低</option>
                      <option value="Medium">中</option>
                      <option value="High">高</option>
                      <option value="Critical">クリティカル</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緊急度
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                    >
                      <option value="Low">低</option>
                      <option value="Medium">中</option>
                      <option value="High">高</option>
                      <option value="Critical">クリティカル</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      影響度
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                      value={formData.impact}
                      onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value as any }))}
                    >
                      <option value="Low">低</option>
                      <option value="Medium">中</option>
                      <option value="High">高</option>
                      <option value="Critical">クリティカル</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 影響サービス */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                影響を受けるサービス
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {serviceOptions.map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedServices.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム */}
          <div className="space-y-6">
            {/* 報告者情報 */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                報告者情報
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    報告者名 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    value={formData.reportedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
                    placeholder="報告者の氏名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    連絡先 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                    placeholder="電話番号またはメールアドレス"
                  />
                </div>
              </div>
            </div>

            {/* 割り当て情報 */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                割り当て情報
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    担当者
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    value={formData.assignee}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                  >
                    <option value="">後で割り当て</option>
                    {assigneeOptions.map(assignee => (
                      <option key={assignee} value={assignee}>
                        {assignee}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    期限日
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* ビジネス影響 */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                ビジネス影響
              </h2>
              
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                value={formData.businessImpact}
                onChange={(e) => setFormData(prev => ({ ...prev, businessImpact: e.target.value }))}
                placeholder="このインシデントがビジネスに与える影響を詳しく記載してください"
              />
            </div>

            {/* 添付ファイル */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 text-indigo-600 mr-2" />
                添付ファイル
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-500">
                      ファイルを選択
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    または、ここにファイルをドラッグ&ドロップ
                  </p>
                </div>
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">選択されたファイル:</h4>
                  <ul className="text-sm text-gray-600">
                    {formData.attachments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            インシデントを作成
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIncident;