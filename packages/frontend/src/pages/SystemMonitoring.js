import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button } from 'antd';
import api from '../api';

const SelfHealingTab = () => {
  const [repairHistory, setRepairHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'システム名',
      dataIndex: 'system_name',
      key: 'system_name',
    },
    {
      title: 'ステータス',
      dataIndex: 'repair_status',
      key: 'repair_status',
      render: status => (
        <Tag color={status === 'success' ? 'green' : status === 'failed' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '実行日時',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewDetails(record)}
        >
          詳細
        </Button>
      ),
    },
  ];

  const fetchRepairHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/self-healing/history');
      setRepairHistory(response.data.history);
    } catch (error) {
      console.error('修復履歴の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRepair = async () => {
    try {
      await api.post('/api/v1/self-healing/trigger', {
        context: { trigger: 'manual' }
      });
      fetchRepairHistory();
    } catch (error) {
      console.error('修復プロセスの開始に失敗しました', error);
    }
  };

  useEffect(() => {
    fetchRepairHistory();
  }, []);

  return (
    <Card
      title="自律修復モジュール"
      extra={<Button type="primary" onClick={handleTriggerRepair}>修復実行</Button>}
    >
      <Table
        columns={columns}
        dataSource={repairHistory}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default SelfHealingTab;
