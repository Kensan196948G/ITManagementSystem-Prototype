import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  CogIcon,
  DocumentDuplicateIcon,
  ServerIcon,
  RocketLaunchIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  CubeTransparentIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  ClockIcon,
  BugAntIcon,
  LightBulbIcon,
  CommandLineIcon,
  PencilSquareIcon,
  UsersIcon,
  ArchiveBoxIcon,
  ShareIcon,
  TagIcon,
  LinkIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  ListBulletIcon,
  HandRaisedIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  InboxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  badge?: number | string;
  children?: MenuItem[];
}

interface Notification {
  id: number;
  type: 'incident' | 'change' | 'approval' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dashboard']));
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Badge counts based on actual data
  const badgeCounts = {
    incidents: {
      active: 5,
      pending: 7,
      total: 12
    },
    problems: 4,
    changes: 8,
    releases: 2
  };

  // Notification data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'incident',
      title: '重大インシデント発生',
      message: 'データベースサーバーの応答遅延が発生しています',
      time: '5分前',
      read: false,
      severity: 'high'
    },
    {
      id: 2,
      type: 'change',
      title: '緊急変更要求',
      message: 'セキュリティパッチの緊急適用が必要です',
      time: '12分前',
      read: false,
      severity: 'critical'
    },
    {
      id: 3,
      type: 'approval',
      title: '承認待ち',
      message: '新しいサービスリクエストの承認が必要です',
      time: '1時間前',
      read: false,
      severity: 'medium'
    },
    {
      id: 4,
      type: 'system',
      title: 'システム更新完了',
      message: 'メンテナンスウィンドウの作業が完了しました',
      time: '2時間前',
      read: true,
      severity: 'low'
    },
    {
      id: 5,
      type: 'incident',
      title: 'ネットワーク障害復旧',
      message: '東京データセンターのネットワーク障害が復旧しました',
      time: '3時間前',
      read: true,
      severity: 'medium'
    },
    {
      id: 6,
      type: 'change',
      title: '計画変更通知',
      message: '週末のシステム更新作業の詳細が確定しました',
      time: '4時間前',
      read: false,
      severity: 'low'
    },
    {
      id: 7,
      type: 'approval',
      title: 'リソース要求承認',
      message: 'サーバー増設の予算承認が下りました',
      time: '5時間前',
      read: true,
      severity: 'medium'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside handler for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notification handlers
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return ExclamationTriangleIcon;
      case 'change': return PencilSquareIcon;
      case 'approval': return CheckCircleIcon;
      case 'system': return CogIcon;
      default: return BellIcon;
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: HomeIcon,
      children: [
        { id: 'overview', label: 'Overview', icon: ChartPieIcon, path: '/dashboard' },
        { id: 'analytics', label: 'Analytics', icon: PresentationChartLineIcon, path: '/analytics' },
        { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon, path: '/reports' }
      ]
    },
    {
      id: 'incident',
      label: 'インシデント管理',
      icon: ExclamationTriangleIcon,
      badge: badgeCounts.incidents.total,
      children: [
        { id: 'active-incidents', label: 'Active', icon: ExclamationCircleIcon, path: '/incidents', badge: badgeCounts.incidents.active },
        { id: 'resolved-incidents', label: 'Resolved', icon: CheckCircleIcon, path: '/incidents/resolved' },
        { id: 'create-incident', label: 'Create New', icon: PlusCircleIcon, path: '/incidents/create' },
        { id: 'sla-incidents', label: 'SLA Monitoring', icon: ClockIcon, path: '/incidents/sla', badge: badgeCounts.incidents.pending }
      ]
    },
    {
      id: 'problem',
      label: '問題管理',
      icon: BugAntIcon,
      badge: badgeCounts.problems,
      children: [
        { id: 'known-errors', label: 'Known Errors', icon: DocumentTextIcon, path: '/problems' },
        { id: 'root-cause', label: 'Root Cause Analysis', icon: LightBulbIcon, path: '/problems/root-cause' },
        { id: 'workarounds', label: 'Workarounds', icon: CommandLineIcon, path: '/problems/workarounds' }
      ]
    },
    {
      id: 'change',
      label: '変更管理',
      icon: PencilSquareIcon,
      badge: badgeCounts.changes,
      children: [
        { id: 'rfc', label: 'RFC Management', icon: DocumentDuplicateIcon, path: '/changes/rfc' },
        { id: 'cab', label: 'CAB Meetings', icon: UsersIcon, path: '/changes/cab' },
        { id: 'schedule', label: 'Change Schedule', icon: CalendarDaysIcon, path: '/changes/schedule' },
        { id: 'risk-assessment', label: 'Risk Assessment', icon: ShieldExclamationIcon, path: '/changes/risk' }
      ]
    },
    {
      id: 'configuration',
      label: '構成管理',
      icon: CubeTransparentIcon,
      children: [
        { id: 'cmdb', label: 'CMDB', icon: ServerIcon, path: '/configuration/cmdb' },
        { id: 'assets', label: 'Assets', icon: ArchiveBoxIcon, path: '/configuration/assets' },
        { id: 'relationships', label: 'CI Relationships', icon: ShareIcon, path: '/configuration/relationships' }
      ]
    },
    {
      id: 'release',
      label: 'リリース管理',
      icon: RocketLaunchIcon,
      badge: badgeCounts.releases,
      children: [
        { id: 'release-planning', label: 'Planning', icon: CalendarDaysIcon, path: '/release/planning' },
        { id: 'release-testing', label: 'Testing', icon: BeakerIcon, path: '/release/testing' },
        { id: 'deployment', label: 'Deployment', icon: CloudArrowUpIcon, path: '/release/deployment' }
      ]
    },
    {
      id: 'service-catalog',
      label: 'サービスカタログ',
      icon: BookOpenIcon,
      children: [
        { id: 'services', label: 'Services', icon: TagIcon, path: '/catalog/services' },
        { id: 'slas', label: 'SLAs', icon: HandRaisedIcon, path: '/catalog/slas' },
        { id: 'olas', label: 'OLAs', icon: LinkIcon, path: '/catalog/olas' }
      ]
    },
    {
      id: 'reports',
      label: 'レポート',
      icon: ChartBarIcon,
      children: [
        { id: 'performance', label: 'Performance', icon: CpuChipIcon, path: '/reports/performance' },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon, path: '/reports/compliance' },
        { id: 'custom', label: 'Custom Reports', icon: DocumentMagnifyingGlassIcon, path: '/reports/custom' }
      ]
    },
    {
      id: 'settings',
      label: '設定',
      icon: Cog6ToothIcon,
      children: [
        { id: 'general', label: 'General', icon: CogIcon, path: '/settings/general' },
        { id: 'security', label: 'Security', icon: ShieldCheckIcon, path: '/settings/security' },
        { id: 'notifications', label: 'Notifications', icon: ChatBubbleLeftRightIcon, path: '/settings/notifications' },
        { id: 'integrations', label: 'Integrations', icon: WrenchScrewdriverIcon, path: '/settings/integrations' }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isActiveItem = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    return false;
  };

  const isActivePage = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    // ログアウト確認
    if (window.confirm('ログアウトしますか？')) {
      logout();
      navigate('/login');
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isActive = isActiveItem(item);
    const Icon = item.icon;

    return (
      <div key={item.id} className="mb-1">
        <div
          onClick={() => hasChildren ? toggleSection(item.id) : handleNavigation(item.path)}
          className={`
            flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group
            ${level === 0 ? 'mx-2' : 'mx-4 ml-6'}
            ${isActive 
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg' 
              : 'hover:bg-white/5 hover:backdrop-blur-sm'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <Icon 
              className={`w-5 h-5 transition-colors duration-300 ${
                isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
              }`} 
            />
            <span className={`font-medium transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
            }`}>
              {item.label}
            </span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        
        {hasChildren && (
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="mt-2 space-y-1">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 w-80 h-full bg-gray-900/90 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ServerIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ITSM Portal</h1>
              <p className="text-sm text-gray-400">Service Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar" style={{
          maxHeight: 'calc(100vh - 200px)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4b5563 #1f2937'
        }}>
          <nav className="space-y-2">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-gray-700/50">
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
            <div className="flex space-x-2">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleNotifications}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 relative"
                >
                  <BellIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-96 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">通知</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              すべて既読にする
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>通知はありません</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700/50">
                          {notifications.map((notification) => {
                            const TypeIcon = getTypeIcon(notification.type);
                            return (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-blue-500/10' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg ${getSeverityColor(notification.severity)}`}>
                                    <TypeIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className={`text-sm font-medium ${
                                        !notification.read ? 'text-white' : 'text-gray-300'
                                      }`}>
                                        {notification.title}
                                      </h4>
                                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                        {notification.time}
                                      </span>
                                    </div>
                                    <p className={`text-sm mt-1 ${
                                      !notification.read ? 'text-gray-300' : 'text-gray-400'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center mt-2 space-x-2">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSeverityColor(notification.severity)}`}>
                                        {notification.severity.toUpperCase()}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-700/50 text-gray-300">
                                        {notification.type.toUpperCase()}
                                      </span>
                                      {!notification.read && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-700/50 text-center">
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          すべての通知を表示
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all duration-300"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-80 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {menuItems.find(item => 
                    item.children?.some(child => child.path === location.pathname)
                  )?.label || 'Dashboard'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {new Date().toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">System Status: Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;