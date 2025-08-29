import React, { useState } from 'react';
import './ChangeManagement.css';

const ChangeManagement = () => {
  const [changes, setChanges] = useState([
    {
      id: 'CHG-001',
      title: 'Database migration to new server',
      description: 'Migrate production database to new high-performance server',
      category: 'Infrastructure',
      type: 'Standard',
      priority: 'High',
      status: 'Approved',
      requestor: 'John Smith',
      assignee: 'Jane Doe',
      plannedStart: '2024-01-15T02:00:00Z',
      plannedEnd: '2024-01-15T06:00:00Z',
      risk: 'High',
      impact: 'High',
      createdAt: '2024-01-08T10:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      id: 'CHG-002',
      title: 'Software update deployment',
      description: 'Deploy security patches to web servers',
      category: 'Software',
      type: 'Standard',
      priority: 'Medium',
      status: 'Scheduled',
      requestor: 'Mike Johnson',
      assignee: 'Sarah Wilson',
      plannedStart: '2024-01-16T20:00:00Z',
      plannedEnd: '2024-01-16T22:00:00Z',
      risk: 'Medium',
      impact: 'Low',
      createdAt: '2024-01-09T14:15:00Z',
      updatedAt: '2024-01-10T09:20:00Z'
    },
    {
      id: 'CHG-003',
      title: 'Network configuration update',
      description: 'Update firewall rules for new application',
      category: 'Network',
      type: 'Normal',
      priority: 'Low',
      status: 'Pending',
      requestor: 'Sarah Wilson',
      assignee: 'Mike Johnson',
      plannedStart: '2024-01-17T18:00:00Z',
      plannedEnd: '2024-01-17T19:00:00Z',
      risk: 'Low',
      impact: 'Medium',
      createdAt: '2024-01-10T11:45:00Z',
      updatedAt: '2024-01-10T11:45:00Z'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [newChange, setNewChange] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    type: 'Standard',
    priority: 'Medium',
    requestor: '',
    assignee: '',
    plannedStart: '',
    plannedEnd: '',
    risk: 'Medium',
    impact: 'Medium'
  });

  const handleCreateChange = () => {
    const change = {
      id: `CHG-${String(changes.length + 1).padStart(3, '0')}`,
      ...newChange,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setChanges([change, ...changes]);
    setNewChange({
      title: '',
      description: '',
      category: 'Infrastructure',
      type: 'Standard',
      priority: 'Medium',
      requestor: '',
      assignee: '',
      plannedStart: '',
      plannedEnd: '',
      risk: 'Medium',
      impact: 'Medium'
    });
    setShowCreateModal(false);
  };

  const handleStatusChange = (changeId, newStatus) => {
    setChanges(changes.map(change => 
      change.id === changeId 
        ? { ...change, status: newStatus, updatedAt: new Date().toISOString() }
        : change
    ));
  };

  const filteredChanges = changes.filter(change => {
    const matchesStatus = filterStatus === 'All' || change.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || change.priority === filterPriority;
    const matchesType = filterType === 'All' || change.type === filterType;
    const matchesSearch = change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         change.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         change.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesType && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateForInput = (dateString) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="change-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Change Management</h1>
          <p className="page-subtitle">Plan, approve, and track IT changes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Change
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search changes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Types</option>
            <option value="Emergency">Emergency</option>
            <option value="Standard">Standard</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Changes Table */}
      <div className="changes-table-container">
        <table className="changes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Risk</th>
              <th>Planned Start</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChanges.map((change) => (
              <tr key={change.id} onClick={() => setSelectedChange(change)}>
                <td className="change-id">{change.id}</td>
                <td className="change-title">{change.title}</td>
                <td>
                  <span className={`type-badge type-${change.type.toLowerCase()}`}>
                    {change.type}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge priority-${change.priority.toLowerCase()}`}>
                    {change.priority}
                  </span>
                </td>
                <td>
                  <select
                    value={change.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(change.id, e.target.value);
                    }}
                    className={`status-select status-${change.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>{change.assignee}</td>
                <td>
                  <span className={`risk-badge risk-${change.risk.toLowerCase()}`}>
                    {change.risk}
                  </span>
                </td>
                <td>{formatDate(change.plannedStart)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon" title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Change Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Create New Change</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newChange.title}
                  onChange={(e) => setNewChange({...newChange, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newChange.description}
                  onChange={(e) => setNewChange({...newChange, description: e.target.value})}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newChange.category}
                    onChange={(e) => setNewChange({...newChange, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Network">Network</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newChange.type}
                    onChange={(e) => setNewChange({...newChange, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Standard">Standard</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newChange.priority}
                    onChange={(e) => setNewChange({...newChange, priority: e.target.value})}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Risk</label>
                  <select
                    value={newChange.risk}
                    onChange={(e) => setNewChange({...newChange, risk: e.target.value})}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Impact</label>
                  <select
                    value={newChange.impact}
                    onChange={(e) => setNewChange({...newChange, impact: e.target.value})}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Requestor *</label>
                  <input
                    type="text"
                    value={newChange.requestor}
                    onChange={(e) => setNewChange({...newChange, requestor: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <input
                  type="text"
                  value={newChange.assignee}
                  onChange={(e) => setNewChange({...newChange, assignee: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Planned Start *</label>
                  <input
                    type="datetime-local"
                    value={newChange.plannedStart}
                    onChange={(e) => setNewChange({...newChange, plannedStart: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Planned End *</label>
                  <input
                    type="datetime-local"
                    value={newChange.plannedEnd}
                    onChange={(e) => setNewChange({...newChange, plannedEnd: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateChange}
                disabled={!newChange.title || !newChange.description || !newChange.requestor || !newChange.plannedStart || !newChange.plannedEnd}
              >
                Create Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Detail Modal */}
      {selectedChange && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{selectedChange.title}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedChange(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="change-details">
                <div className="detail-row">
                  <strong>ID:</strong> {selectedChange.id}
                </div>
                <div className="detail-row">
                  <strong>Description:</strong> {selectedChange.description}
                </div>
                <div className="detail-row">
                  <strong>Category:</strong> {selectedChange.category}
                </div>
                <div className="detail-row">
                  <strong>Type:</strong> 
                  <span className={`type-badge type-${selectedChange.type.toLowerCase()}`}>
                    {selectedChange.type}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong> 
                  <span className={`priority-badge priority-${selectedChange.priority.toLowerCase()}`}>
                    {selectedChange.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> 
                  <span className={`status-badge status-${selectedChange.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedChange.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Risk:</strong> 
                  <span className={`risk-badge risk-${selectedChange.risk.toLowerCase()}`}>
                    {selectedChange.risk}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Impact:</strong> 
                  <span className={`risk-badge risk-${selectedChange.impact.toLowerCase()}`}>
                    {selectedChange.impact}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Requestor:</strong> {selectedChange.requestor}
                </div>
                <div className="detail-row">
                  <strong>Assignee:</strong> {selectedChange.assignee}
                </div>
                <div className="detail-row">
                  <strong>Planned Start:</strong> {formatDate(selectedChange.plannedStart)}
                </div>
                <div className="detail-row">
                  <strong>Planned End:</strong> {formatDate(selectedChange.plannedEnd)}
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {formatDate(selectedChange.createdAt)}
                </div>
                <div className="detail-row">
                  <strong>Last Updated:</strong> {formatDate(selectedChange.updatedAt)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedChange(null)}
              >
                Close
              </button>
              <button className="btn btn-primary">
                Edit Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeManagement;