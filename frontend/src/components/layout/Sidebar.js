import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ServerIcon,
  CubeIcon,
  ClipboardDocumentIcon,
  BookOpenIcon,
  ArrowsRightLeftIcon,
  BugAntIcon // 問題管理用のアイコン
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'ダッシュボード', path: '/', icon: HomeIcon },
  { name: 'システム監視', path: '/monitoring', icon: ServerIcon },
  { name: 'インシデント管理', path: '/incidents', icon: ExclamationTriangleIcon },
  { name: '問題管理', path: '/problems', icon: BugAntIcon }, // 問題管理へのリンクを追加
  { name: 'セキュリティイベント', path: '/security', icon: ShieldCheckIcon },
  { name: 'レポート', path: '/reports', icon: DocumentChartBarIcon },
  { name: 'メトリクス分析', path: '/metrics', icon: ChartBarIcon },
  { name: 'CI管理', path: '/cmdb', icon: CubeIcon },
  { name: 'リクエスト管理', path: '/requests', icon: ClipboardDocumentIcon },
  { name: 'ナレッジ', path: '/knowledge', icon: BookOpenIcon },
  { name: '変更管理', path: '/changes', icon: ArrowsRightLeftIcon },
  { name: 'ユーザー管理', path: '/users', icon: UserGroupIcon },
  { name: '設定', path: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`bg-white fixed h-full shadow-sidebar border-r border-gray-200 transition-all duration-300 z-20 ${isOpen ? 'w-sidebar' : 'w-16'
        }`}
    >
      {/* ロゴ */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        {isOpen ? (
          <h1 className="text-xl font-bold text-primary-600">ITSM</h1>
        ) : (
          <h1 className="text-xl font-bold text-primary-600">IT</h1>
        )}
      </div>

      {/* ナビゲーションリンク */}
      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} ${!isOpen && 'justify-center'}`
                }
              >
                <item.icon className={`h-5 w-5 ${!isOpen && 'mx-auto'}`} />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* サイドバー下部 - ISOコンプライアンス表示 */}
      {isOpen && (
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">ISO 20000</span>
              <span className="badge badge-success">準拠</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">ISO 27001</span>
              <span className="badge badge-success">準拠</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">ISO 27002</span>
              <span className="badge badge-success">準拠</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
