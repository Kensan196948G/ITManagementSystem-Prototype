import React, { useState } from 'react';
import { Users, Calendar, Plus, Clock, CheckCircle, AlertTriangle, Video, FileText, ArrowLeft } from 'lucide-react';

interface CABMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  chair: string;
  attendees: { name: string; role: string; status: 'Confirmed' | 'Pending' | 'Declined' }[];
  agenda: { id: string; rfcId: string; title: string; type: string; presenter: string; duration: string; decision?: 'Approved' | 'Rejected' | 'Deferred' }[];
  meetingRoom: string;
  meetingLink: string;
  minutes?: string;
}

interface CABMember {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
}

const CABMeetings: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'calendar' | 'upcoming' | 'history'>('upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60分',
    chair: '',
    meetingRoom: '',
    meetingLink: '',
    agenda: [] as any[],
    attendees: [] as string[]
  });

  const mockMeetings: CABMeeting[] = [
    {
      id: 'CAB-2024-08-001',
      title: '週次CAB会議',
      date: '2024-08-30',
      time: '14:00',
      duration: '90分',
      status: 'Scheduled',
      chair: 'CTO 佐藤',
      attendees: [
        { name: 'CTO 佐藤', role: 'Chair', status: 'Confirmed' },
        { name: 'インフラ責任者 鈴木', role: 'Member', status: 'Confirmed' },
        { name: 'セキュリティ責任者 高橋', role: 'Member', status: 'Confirmed' },
        { name: '品質保証 田中', role: 'Member', status: 'Pending' },
        { name: '運用責任者 山田', role: 'Member', status: 'Confirmed' }
      ],
      agenda: [
        {
          id: '1',
          rfcId: 'RFC-2024-001',
          title: 'データベースサーバーのメモリ増設',
          type: 'Normal',
          presenter: '田中 太郎',
          duration: '20分'
        },
        {
          id: '2',
          rfcId: 'RFC-2024-004',
          title: 'ファイアウォール設定変更',
          type: 'Standard',
          presenter: '高橋 美咲',
          duration: '15分'
        },
        {
          id: '3',
          rfcId: 'RFC-2024-005',
          title: 'バックアップシステム更新',
          type: 'Normal',
          presenter: '中村 健太',
          duration: '25分'
        }
      ],
      meetingRoom: '会議室A',
      meetingLink: 'https://meet.company.com/cab-meeting-001'
    },
    {
      id: 'CAB-2024-08-002',
      title: '緊急CAB会議',
      date: '2024-08-28',
      time: '20:00',
      duration: '30分',
      status: 'Completed',
      chair: 'CTO 佐藤',
      attendees: [
        { name: 'CTO 佐藤', role: 'Chair', status: 'Confirmed' },
        { name: 'セキュリティ責任者 高橋', role: 'Member', status: 'Confirmed' },
        { name: '運用責任者 山田', role: 'Member', status: 'Confirmed' }
      ],
      agenda: [
        {
          id: '1',
          rfcId: 'RFC-2024-002',
          title: 'メールサーバーセキュリティパッチ適用',
          type: 'Emergency',
          presenter: '高橋 美咲',
          duration: '15分',
          decision: 'Approved'
        }
      ],
      meetingRoom: 'オンライン',
      meetingLink: 'https://meet.company.com/cab-emergency-002',
      minutes: '緊急セキュリティパッチの適用について議論。リスクは低く、即座に実装することを全員一致で承認。'
    }
  ];

  const cabMembers: CABMember[] = [
    {
      name: 'CTO 佐藤',
      role: 'Chairperson',
      department: '技術本部',
      email: 'sato@company.com',
      phone: '03-1234-5678'
    },
    {
      name: 'インフラ責任者 鈴木',
      role: 'Member',
      department: 'インフラ部',
      email: 'suzuki@company.com',
      phone: '03-1234-5679'
    },
    {
      name: 'セキュリティ責任者 高橋',
      role: 'Member',
      department: 'セキュリティ部',
      email: 'takahashi@company.com',
      phone: '03-1234-5680'
    },
    {
      name: '品質保証 田中',
      role: 'Member',
      department: '品質保証部',
      email: 'tanaka@company.com',
      phone: '03-1234-5681'
    },
    {
      name: '運用責任者 山田',
      role: 'Member',
      department: '運用部',
      email: 'yamada@company.com',
      phone: '03-1234-5682'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAttendeeStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Deferred': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedMeetingData = mockMeetings.find(meeting => meeting.id === selectedMeeting);

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">CAB会議管理</h1>
        </div>
        <button 
          onClick={() => setShowScheduleForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          CAB会議をスケジュール
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今月の会議</p>
              <p className="text-2xl font-bold text-blue-600">8</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認されたRFC</p>
              <p className="text-2xl font-bold text-green-600">42</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">保留中のRFC</p>
              <p className="text-2xl font-bold text-yellow-600">7</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均会議時間</p>
              <p className="text-2xl font-bold text-purple-600">75分</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
        <nav className="flex space-x-8 px-6 pt-6">
          {[
            { key: 'upcoming', label: '予定されている会議', icon: Calendar },
            { key: 'history', label: '会議履歴', icon: FileText },
            { key: 'calendar', label: 'カレンダービュー', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedView(key as any)}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                selectedView === key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-6">
          {showScheduleForm ? (
            /* CAB会議スケジュールフォーム */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">新しいCAB会議をスケジュール</h2>
                <button 
                  onClick={() => {
                    setShowScheduleForm(false);
                    setNewMeeting({
                      title: '',
                      date: '',
                      time: '',
                      duration: '60分',
                      chair: '',
                      meetingRoom: '',
                      meetingLink: '',
                      agenda: [],
                      attendees: []
                    });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左側の基本情報 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会議タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="例: 週次CAB会議"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        日付 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        開始時刻 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会議時間
                    </label>
                    <select
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting({...newMeeting, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="30分">30分</option>
                      <option value="60分">60分</option>
                      <option value="90分">90分</option>
                      <option value="120分">120分</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      議長 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMeeting.chair}
                      onChange={(e) => setNewMeeting({...newMeeting, chair: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">選択してください</option>
                      {cabMembers.filter(m => m.role === 'Chairperson').map((member) => (
                        <option key={member.name} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会議室/場所
                    </label>
                    <input
                      type="text"
                      value={newMeeting.meetingRoom}
                      onChange={(e) => setNewMeeting({...newMeeting, meetingRoom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="例: 会議室A または オンライン"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      オンライン会議リンク
                    </label>
                    <input
                      type="url"
                      value={newMeeting.meetingLink}
                      onChange={(e) => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="https://meet.company.com/..."
                    />
                  </div>
                </div>

                {/* 右側の参加者とアジェンダ */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      参加者を選択 <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {cabMembers.map((member) => (
                        <div key={member.name} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newMeeting.attendees.includes(member.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewMeeting({
                                  ...newMeeting,
                                  attendees: [...newMeeting.attendees, member.name]
                                });
                              } else {
                                setNewMeeting({
                                  ...newMeeting,
                                  attendees: newMeeting.attendees.filter(a => a !== member.name)
                                });
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.role} - {member.department}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アジェンダ
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-3">
                        承認待ちのRFCから選択してアジェンダに追加します
                      </div>
                      <button
                        type="button"
                        className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
                      >
                        + RFCを追加
                      </button>
                      {newMeeting.agenda.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {newMeeting.agenda.map((item, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              {item.rfcId}: {item.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備考
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      placeholder="会議に関する追加情報"
                    />
                  </div>
                </div>
              </div>

              {/* 送信ボタン */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowScheduleForm(false);
                    setNewMeeting({
                      title: '',
                      date: '',
                      time: '',
                      duration: '60分',
                      chair: '',
                      meetingRoom: '',
                      meetingLink: '',
                      agenda: [],
                      attendees: []
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    alert('CAB会議が正常にスケジュールされました！');
                    setShowScheduleForm(false);
                    setNewMeeting({
                      title: '',
                      date: '',
                      time: '',
                      duration: '60分',
                      chair: '',
                      meetingRoom: '',
                      meetingLink: '',
                      agenda: [],
                      attendees: []
                    });
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  会議をスケジュール
                </button>
              </div>
            </div>
          ) : selectedView === 'upcoming' && !selectedMeeting ? (
            <div className="space-y-4">
              {mockMeetings.filter(meeting => meeting.status !== 'Completed').map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedMeeting(meeting.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-600">{meeting.id}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{meeting.date} {meeting.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{meeting.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>議長: {meeting.chair}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>アジェンダ: {meeting.agenda.length}件</span>
                      <span>•</span>
                      <span>参加者: {meeting.attendees.filter(a => a.status === 'Confirmed').length}/{meeting.attendees.length}名確認済み</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                        詳細
                      </button>
                      {meeting.meetingLink && (
                        <button className="px-3 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100 flex items-center">
                          <Video className="h-3 w-3 mr-1" />
                          参加
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedView === 'history' && !selectedMeeting ? (
            <div className="space-y-4">
              {mockMeetings.filter(meeting => meeting.status === 'Completed').map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedMeeting(meeting.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-600">{meeting.id}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{meeting.date} {meeting.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{meeting.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>議長: {meeting.chair}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      <span>承認: {meeting.agenda.filter(a => a.decision === 'Approved').length}件</span>
                    </div>
                  </div>

                  {meeting.minutes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>議事録:</strong> {meeting.minutes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : selectedView === 'calendar' && !showScheduleForm ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">カレンダービュー（実装予定）</p>
            </div>
          ) : selectedMeeting && selectedMeetingData && !showScheduleForm ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMeetingData.title}
                </h2>
                <button 
                  onClick={() => setSelectedMeeting(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  一覧に戻る
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* アジェンダ */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">アジェンダ</h3>
                    <div className="space-y-3">
                      {selectedMeetingData.agenda.map((item) => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <p className="text-sm text-blue-600">{item.rfcId}</p>
                            </div>
                            {item.decision && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDecisionColor(item.decision)}`}>
                                {item.decision}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>発表者: {item.presenter}</span>
                            <span>予定時間: {item.duration}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              item.type === 'Emergency' ? 'bg-red-100 text-red-800' :
                              item.type === 'Normal' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 議事録 */}
                  {selectedMeetingData.minutes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">議事録</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{selectedMeetingData.minutes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* 会議詳細 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">会議詳細</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">日時:</span>
                        <span>{selectedMeetingData.date} {selectedMeetingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">時間:</span>
                        <span>{selectedMeetingData.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">場所:</span>
                        <span>{selectedMeetingData.meetingRoom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ステータス:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedMeetingData.status)}`}>
                          {selectedMeetingData.status}
                        </span>
                      </div>
                    </div>

                    {selectedMeetingData.meetingLink && (
                      <div className="mt-4">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                          <Video className="h-4 w-4 mr-2" />
                          オンライン会議に参加
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 参加者 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">参加者</h3>
                    <div className="space-y-2">
                      {selectedMeetingData.attendees.map((attendee, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-gray-900">{attendee.name}</div>
                            <div className="text-xs text-gray-500">{attendee.role}</div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getAttendeeStatusColor(attendee.status)}`}>
                            {attendee.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CABメンバー */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CABメンバー</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cabMembers.map((member, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded">
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.role} - {member.department}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CABMeetings;