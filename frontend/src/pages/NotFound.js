import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <ExclamationTriangleIcon className="h-20 w-20 text-warning-500 mx-auto" />
        <h1 className="mt-6 text-3xl font-bold text-secondary-900">404 Not Found</h1>
        <p className="mt-3 text-xl text-secondary-600">お探しのページが見つかりませんでした。</p>
        <p className="mt-2 text-secondary-500">
          URLが正しいかご確認いただくか、システム管理者にお問い合わせください。
        </p>
        <div className="mt-8">
          <Link to="/" className="btn btn-primary inline-flex items-center">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
