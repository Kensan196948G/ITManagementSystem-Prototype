import React, { useState } from 'react';
import {
  ChartBarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ServerIcon,
  CpuChipIcon,
  CloudIcon,
  WrenchIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// メトリクスカードコンポーネント
function MetricCard({
  title, value, unit, trend, change, icon: Icon, color,
}) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-danger-600';
    if (trend === 'down') return 'text-success-600';
    return 'text-secondary-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-500">{title}</p>
          <div className="flex items-end space-x-1 mt-1">
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
            <p className="text-sm text-secondary-500 mb-1">{unit}</p>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-2">
        <span className={`text-xs font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          {' '}
          {change}
          %
        </span>
        <span className="text-xs text-secondary-500 ml-1">前月比</span>
      </div>
    </div>
  );
}

// チャートコンポーネント（簡易表現）
function SimpleChart({
  title, description, color, onViewDetails,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-md font-medium text-secondary-900">{title}</h3>
          <p className="text-xs text-secondary-500 mt-1">{description}</p>
        </div>
        <button
          className="text-primary-600 hover:text-primary-700 text-xs"
          onClick={() => onViewDetails(title, description, color)}
        >
          詳細を表示
        </button>
      </div>

      {/* 簡易的なチャート表現 */}
      <div className="w-full h-40 bg-secondary-50 border border-secondary-200 rounded-lg flex items-end p-2">
        {Array.from({ length: 12 }).map((_, index) => {
          // ランダムな高さを生成
          const height = 15 + Math.floor(Math.random() * 70);
          return (
            <div
              key={index}
              className={`${color} mx-1 rounded-t-sm`}
              style={{ height: `${height}%`, width: '7%' }}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-xs text-secondary-500">
        <span>4月</span>
        <span>5月</span>
        <span>6月</span>
        <span>7月</span>
        <span>8月</span>
        <span>9月</span>
        <span>10月</span>
        <span>11月</span>
        <span>12月</span>
        <span>1月</span>
        <span>2月</span>
        <span>3月</span>
      </div>
    </div>
  );
}

// チャート詳細モーダルコンポーネント
function ChartDetailModal({ chartData, onClose }) {
  if (!chartData) return null;

  const { title, description, color } = chartData;

  // 詳細チャート用のダミーデータを生成
  const generateDetailData = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      // より細かいデータポイントを生成
      data.push({
        date: `2025/03/${String(i + 1).padStart(2, '0')}`,
        value: 20 + Math.floor(Math.random() * 60),
      });
    }
    return data;
  };

  const detailData = generateDetailData();

  const getColorClass = (color) => {
    // バーの色に基づいて適切なテキスト色を返す
    if (color === 'bg-primary-500') return 'text-primary-600';
    if (color === 'bg-warning-500') return 'text-warning-600';
    if (color === 'bg-danger-500') return 'text-danger-600';
    if (color === 'bg-success-500') return 'text-success-600';
    return 'text-secondary-600';
  };

  const colorTextClass = getColorClass(color);

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50" />
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900">
                    {title}
                  </h3>
                  <span className={`ml-2 text-xs font-medium ${colorTextClass} bg-opacity-10 px-2 py-1 rounded-full`}>
                    詳細データ
                  </span>
                </div>
                <div className="mt-1 text-sm text-secondary-500">
                  {description}
                </div>

                <div className="mt-6 space-y-6">
                  {/* 詳細チャート表示 */}
                  <div className="border border-secondary-200 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-4">日次データ詳細</h4>

                    {/* 詳細グラフ */}
                    <div className="w-full h-64 bg-secondary-50 border border-secondary-200 rounded-lg flex items-end p-2">
                      {detailData.map((item, index) => (
                        <div key={index} className="group relative flex-1 mx-px">
                          <div
                            className={`${color} rounded-t-sm`}
                            style={{ height: `${item.value}%` }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-secondary-800 text-white text-xs rounded p-1 text-center mx-auto">
                              {item.value}
                              %
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 text-xs text-secondary-500 grid grid-cols-6 md:grid-cols-10">
                      {[1, 5, 10, 15, 20, 25, 30].map((day) => (
                        <span key={day}>
                          {day}
                          日
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 統計情報 */}
                  <div className="border border-secondary-200 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-4">統計情報</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-secondary-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-secondary-500">平均値</p>
                        <p className={`text-lg font-bold ${colorTextClass}`}>
                          {(detailData.reduce((sum, item) => sum + item.value, 0) / detailData.length).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-secondary-500">最大値</p>
                        <p className={`text-lg font-bold ${colorTextClass}`}>
                          {Math.max(...detailData.map((item) => item.value))}
                          %
                        </p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-secondary-500">最小値</p>
                        <p className={`text-lg font-bold ${colorTextClass}`}>
                          {Math.min(...detailData.map((item) => item.value))}
                          %
                        </p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-secondary-500">標準偏差</p>
                        <p className={`text-lg font-bold ${colorTextClass}`}>
                          {(() => {
                            const avg = detailData.reduce((sum, item) => sum + item.value, 0) / detailData.length;
                            const squareDiffs = detailData.map((item) => {
                              const diff = item.value - avg;
                              return diff * diff;
                            });
                            const avgSquareDiff = squareDiffs.reduce((sum, item) => sum + item, 0) / squareDiffs.length;
                            return Math.sqrt(avgSquareDiff).toFixed(1);
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={onClose}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsAnalysis() {
  const [dateRange, setDateRange] = useState('month');
  const [selectedChart, setSelectedChart] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">メトリクス分析</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/13 18:25</span>
        </div>
      </div>

      {/* 日付範囲セレクター */}
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            dateRange === 'day' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
          }`}
          onClick={() => setDateRange('day')}
        >
          日次
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            dateRange === 'week' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
          }`}
          onClick={() => setDateRange('week')}
        >
          週次
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            dateRange === 'month' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
          }`}
          onClick={() => setDateRange('month')}
        >
          月次
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            dateRange === 'year' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
          }`}
          onClick={() => setDateRange('year')}
        >
          年次
        </button>
      </div>

      {/* メトリクスカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU使用率"
          value="48.2"
          unit="%"
          trend="up"
          change="5.3"
          icon={CpuChipIcon}
          color="bg-primary-600"
        />
        <MetricCard
          title="メモリ使用率"
          value="62.7"
          unit="%"
          trend="up"
          change="2.1"
          icon={ServerIcon}
          color="bg-warning-600"
        />
        <MetricCard
          title="ディスク使用率"
          value="75.4"
          unit="%"
          trend="up"
          change="8.7"
          icon={ServerIcon}
          color="bg-danger-600"
        />
        <MetricCard
          title="レスポンスタイム"
          value="215"
          unit="ms"
          trend="down"
          change="3.6"
          icon={ClockIcon}
          color="bg-success-600"
        />
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleChart
          title="CPU使用率推移"
          description="主要サーバーのCPU使用率平均値の推移"
          color="bg-primary-500"
          onViewDetails={(title, description, color) => setSelectedChart({ title, description, color })}
        />
        <SimpleChart
          title="メモリ使用率推移"
          description="主要サーバーのメモリ使用率平均値の推移"
          color="bg-warning-500"
          onViewDetails={(title, description, color) => setSelectedChart({ title, description, color })}
        />
        <SimpleChart
          title="ディスク使用率推移"
          description="ファイルサーバーのディスク使用率の推移"
          color="bg-danger-500"
          onViewDetails={(title, description, color) => setSelectedChart({ title, description, color })}
        />
        <SimpleChart
          title="レスポンスタイム推移"
          description="主要サービスのレスポンスタイム平均値の推移"
          color="bg-success-500"
          onViewDetails={(title, description, color) => setSelectedChart({ title, description, color })}
        />
      </div>

      {/* チャート詳細モーダル */}
      <ChartDetailModal
        chartData={selectedChart}
        onClose={() => setSelectedChart(null)}
      />

      {/* サービス別メトリクス */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
        <h3 className="text-md font-medium text-secondary-900 mb-4">サービス別メトリクス</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  サービス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  稼働率
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  平均応答時間
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  リクエスト/分
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  前月比
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <CloudIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">Microsoft 365</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">99.98%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">180ms</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">1,245</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-success-600">
                  +2.3%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-warning-100 flex items-center justify-center">
                      <CloudIcon className="h-4 w-4 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">Exchange Online</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">99.7%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">220ms</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">892</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-danger-600">
                  -1.5%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                      <ServerIcon className="h-4 w-4 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">ファイルサーバー</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">99.95%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">150ms</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">457</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-success-600">
                  +3.7%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-danger-100 flex items-center justify-center">
                      <WrenchIcon className="h-4 w-4 text-danger-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">HENGEOINE</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">99.9%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">320ms</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-secondary-900">215</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-warning-600">
                  +0.5%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MetricsAnalysis;
