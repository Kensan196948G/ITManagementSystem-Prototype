import React, { useState } from 'react';
import './IncidentManagement.css';

const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-001',
      title: 'Email server down',
      description: 'Users unable to access email services',
      priority: 'High',
      status: 'Open',
      assignee: 'John Smith',
      reporter: 'Jane Doe',
      category: 'Infrastructure',
      createdAt: '2024-01-10T10:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      id: 'INC-002',
      title: 'Network connectivity issues',
      description: 'Intermittent network connectivity in Building A',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'Jane Doe',
      reporter: 'Mike Johnson',
      category: 'Network',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-10T13:45:00Z'
    },
    {
      id: 'INC-003',
      title: 'Printer not working',
      description: 'Printer in HR department is not responding',
      priority: 'Low',
      status: 'Resolved',
      assignee: 'Mike Johnson',
      reporter: 'Sarah Wilson',
      category: 'Hardware',
      createdAt: '2024-01-09T16:20:00Z',
      updatedAt: '2024-01-10T11:00:00Z'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Infrastructure',
    reporter: '',
    assignee: ''
  });

  const handleCreateIncident = () => {
    const incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      ...newIncident,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setIncidents([incident, ...incidents]);
    setNewIncident({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'Infrastructure',
      reporter: '',
      assignee: ''
    });
    setShowCreateModal(false);
  };

  const handleStatusChange = (incidentId, newStatus) => {
    setIncidents(incidents.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: newStatus, updatedAt: new Date().toISOString() }
        : incident
    ));
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || incident.priority === filterPriority;
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="incident-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Incident Management</h1>
          <p className="page-subtitle">Manage and track IT service incidents</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Incident
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search incidents..."
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
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
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
        </div>
      </div>

      {/* Incidents Table */}
      <div className="incidents-table-container">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Category</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((incident) => (
              <tr key={incident.id} onClick={() => setSelectedIncident(incident)}>
                <td className="incident-id">{incident.id}</td>
                <td className="incident-title">{incident.title}</td>
                <td>
                  <span className={`priority-badge priority-${incident.priority.toLowerCase()}`}>
                    {incident.priority}
                  </span>
                </td>
                <td>
                  <select
                    value={incident.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(incident.id, e.target.value);
                    }}
                    className={`status-select status-${incident.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td>{incident.assignee}</td>
                <td>{incident.category}</td>
                <td>{formatDate(incident.createdAt)}</td>
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

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Incident</h2>
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
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newIncident.priority}
                    onChange={(e) => setNewIncident({...newIncident, priority: e.target.value})}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({...newIncident, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Network">Network</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Reporter *</label>
                  <input
                    type="text"
                    value={newIncident.reporter}
                    onChange={(e) => setNewIncident({...newIncident, reporter: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Assignee</label>
                  <input
                    type="text"
                    value={newIncident.assignee}
                    onChange={(e) => setNewIncident({...newIncident, assignee: e.target.value})}
                    className="form-input"
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
                onClick={handleCreateIncident}
                disabled={!newIncident.title || !newIncident.description || !newIncident.reporter}
              >
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{selectedIncident.title}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedIncident(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="incident-details">
                <div className="detail-row">
                  <strong>ID:</strong> {selectedIncident.id}
                </div>
                <div className="detail-row">
                  <strong>Description:</strong> {selectedIncident.description}
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong> 
                  <span className={`priority-badge priority-${selectedIncident.priority.toLowerCase()}`}>
                    {selectedIncident.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> 
                  <span className={`status-badge status-${selectedIncident.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Category:</strong> {selectedIncident.category}
                </div>
                <div className="detail-row">
                  <strong>Reporter:</strong> {selectedIncident.reporter}
                </div>
                <div className="detail-row">
                  <strong>Assignee:</strong> {selectedIncident.assignee}
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {formatDate(selectedIncident.createdAt)}
                </div>
                <div className="detail-row">
                  <strong>Last Updated:</strong> {formatDate(selectedIncident.updatedAt)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedIncident(null)}
              >
                Close
              </button>
              <button className="btn btn-primary">
                Edit Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;