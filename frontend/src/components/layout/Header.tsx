import React from 'react';
import { Bars3Icon } from '@heroicons/react';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    return (
        <header className="bg-white shadow-sm h-16 flex items-center px-4">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={toggleSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex justify-end">
                {/* ここにユーザー情報や通知アイコンなどを追加 */}
            </div>
        </header>
    );
};

export default Header;