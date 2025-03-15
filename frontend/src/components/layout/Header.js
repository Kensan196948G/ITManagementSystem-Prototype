import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // メニュー外をクリックした時に閉じる処理
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-secondary-900">ITサービス管理システム</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* 通知ボタン */}
          <button className="relative p-2 rounded-full text-secondary-500 hover:bg-secondary-100 focus:outline-none">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white"></span>
          </button>

          {/* ユーザーメニュー */}
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <UserCircleIcon className="h-8 w-8 text-secondary-500" />
              <div className="hidden md:block">
                {/* ユーザー名の表示 */}
                {currentUser && (
                  <p className="text-sm font-medium text-secondary-900">
                    {localStorage.getItem('userRole') === 'msuser' && currentUser.microsoftInfo ? (
                      // Microsoftログインの場合は表示名を使用
                      currentUser.microsoftInfo.displayName || `${currentUser.first_name} ${currentUser.last_name}`
                    ) : (
                      // 通常ログインの場合は名前を表示
                      `${currentUser.first_name} ${currentUser.last_name}`
                    )}
                  </p>
                )}
                
                {/* ユーザーロールの表示 */}
                <p className="text-xs text-secondary-700">
                  <span className="font-medium">{currentUser?.role}</span>
                </p>
                
                {/* アカウントタイプのバッジ表示 */}
                {currentUser && (
                  <p className="mt-0.5">
                    {localStorage.getItem('userRole') === 'msuser' && currentUser.microsoftInfo ? (
                      // Microsoft Entra IDユーザーの場合
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-3 w-3 mr-1" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M0 0h7.5v7.5H0V0zm8.5 0H16v7.5H8.5V0zM0 8.5h7.5V16H0V8.5zm8.5 0H16V16H8.5V8.5z"/>
                        </svg>
                        {currentUser.microsoftInfo.accountType || 'Microsoft Entra ID'}
                      </span>
                    ) : (
                      // 通常ユーザーの場合（admin/user/guest）
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {currentUser.id === '1' ? 'admin' : 
                         currentUser.id === '2' ? 'user' : 
                         currentUser.id === '3' ? 'guest' : '不明'}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* 簡易ドロップダウンメニュー (クリックして表示) */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20">
                <a 
                  href="#profile" 
                  className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  onClick={() => setMenuOpen(false)}
                >
                  プロフィール
                </a>
                <a 
                  href="#settings" 
                  className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  onClick={() => setMenuOpen(false)}
                >
                  設定
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
