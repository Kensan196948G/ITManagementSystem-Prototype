import React, { useState } from 'react';
import './AssetManagement.css';

const AssetManagement = () => {
  const [assets, setAssets] = useState([
    {
      id: 'AST-001',
      name: 'Dell PowerEdge R740',
      type: 'Server',
      category: 'Hardware',
      status: 'Active',
      owner: 'John Smith',
      location: 'Data Center A',
      purchaseDate: '2023-05-15',
      warrantyEnd: '2026-05-15',
      cost: '$8,500',
      serialNumber: 'SN123456789'
    },
    {
      id: 'AST-002', 
      name: 'Microsoft Office 365',
      type: 'Software',
      category: 'License',
      status: 'Active',
      owner: 'IT Department',
      location: 'Cloud',
      purchaseDate: '2023-01-01',
      warrantyEnd: '2024-01-01',
      cost: '$12,000/year',
      serialNumber: 'MSO365-001'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="asset-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Asset Management</h1>
          <p className="page-subtitle">Track and manage IT assets</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Add Asset
        </button>
      </div>

      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Warranty End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} onClick={() => setSelectedAsset(asset)}>
                <td className="asset-id">{asset.id}</td>
                <td>{asset.name}</td>
                <td>{asset.type}</td>
                <td>
                  <span className={`status-badge status-${asset.status.toLowerCase()}`}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.owner}</td>
                <td>{asset.location}</td>
                <td>{asset.warrantyEnd}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" title="Edit">✏️</button>
                  <button className="btn-icon" title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetManagement;