import React, { useState } from 'react';
import './ProblemManagement.css';

const ProblemManagement = () => {
  const [problems, setProblems] = useState([
    {
      id: 'PRB-001',
      title: 'Recurring email server outages',
      description: 'Email server experiences frequent outages affecting multiple users',
      priority: 'High',
      status: 'Open',
      assignee: 'John Smith',
      category: 'Infrastructure',
      relatedIncidents: ['INC-001', 'INC-005', 'INC-012'],
      createdAt: '2024-01-08T10:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      id: 'PRB-002',
      title: 'Network performance degradation',
      description: 'Periodic network slowdown during peak hours',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'Jane Doe',
      category: 'Network',
      relatedIncidents: ['INC-002', 'INC-007'],
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-09T16:20:00Z'
    },
    {
      id: 'PRB-003',
      title: 'Application memory leaks',
      description: 'CRM application consuming excessive memory over time',
      priority: 'Medium',
      status: 'Resolved',
      assignee: 'Mike Johnson',
      category: 'Software',
      relatedIncidents: ['INC-008', 'INC-011'],
      createdAt: '2024-01-03T14:45:00Z',
      updatedAt: '2024-01-08T11:30:00Z'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Infrastructure',
    assignee: '',
    relatedIncidents: ''
  });

  const handleCreateProblem = () => {
    const problem = {
      id: `PRB-${String(problems.length + 1).padStart(3, '0')}`,
      ...newProblem,
      relatedIncidents: newProblem.relatedIncidents.split(',').map(id => id.trim()).filter(id => id),
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProblems([problem, ...problems]);
    setNewProblem({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'Infrastructure',
      assignee: '',
      relatedIncidents: ''
    });
    setShowCreateModal(false);
  };

  const handleStatusChange = (problemId, newStatus) => {
    setProblems(problems.map(problem => 
      problem.id === problemId 
        ? { ...problem, status: newStatus, updatedAt: new Date().toISOString() }
        : problem
    ));
  };

  const filteredProblems = problems.filter(problem => {
    const matchesStatus = filterStatus === 'All' || problem.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || problem.priority === filterPriority;
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="problem-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Problem Management</h1>
          <p className="page-subtitle">Identify and resolve root causes of incidents</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Problem
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search problems..."
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

      {/* Problems Table */}
      <div className="problems-table-container">
        <table className="problems-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Category</th>
              <th>Related Incidents</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem) => (
              <tr key={problem.id} onClick={() => setSelectedProblem(problem)}>
                <td className="problem-id">{problem.id}</td>
                <td className="problem-title">{problem.title}</td>
                <td>
                  <span className={`priority-badge priority-${problem.priority.toLowerCase()}`}>
                    {problem.priority}
                  </span>
                </td>
                <td>
                  <select
                    value={problem.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(problem.id, e.target.value);
                    }}
                    className={`status-select status-${problem.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td>{problem.assignee}</td>
                <td>{problem.category}</td>
                <td>
                  <div className="related-incidents">
                    {problem.relatedIncidents.slice(0, 2).map(incidentId => (
                      <span key={incidentId} className="incident-badge">
                        {incidentId}
                      </span>
                    ))}
                    {problem.relatedIncidents.length > 2 && (
                      <span className="more-incidents">
                        +{problem.relatedIncidents.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td>{formatDate(problem.createdAt)}</td>
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

      {/* Create Problem Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Problem</h2>
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
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newProblem.priority}
                    onChange={(e) => setNewProblem({...newProblem, priority: e.target.value})}
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
                    value={newProblem.category}
                    onChange={(e) => setNewProblem({...newProblem, category: e.target.value})}
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
              <div className="form-group">
                <label>Assignee</label>
                <input
                  type="text"
                  value={newProblem.assignee}
                  onChange={(e) => setNewProblem({...newProblem, assignee: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Related Incidents (comma separated)</label>
                <input
                  type="text"
                  value={newProblem.relatedIncidents}
                  onChange={(e) => setNewProblem({...newProblem, relatedIncidents: e.target.value})}
                  className="form-input"
                  placeholder="INC-001, INC-002, ..."
                />
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
                onClick={handleCreateProblem}
                disabled={!newProblem.title || !newProblem.description}
              >
                Create Problem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{selectedProblem.title}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedProblem(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="problem-details">
                <div className="detail-row">
                  <strong>ID:</strong> {selectedProblem.id}
                </div>
                <div className="detail-row">
                  <strong>Description:</strong> {selectedProblem.description}
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong> 
                  <span className={`priority-badge priority-${selectedProblem.priority.toLowerCase()}`}>
                    {selectedProblem.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> 
                  <span className={`status-badge status-${selectedProblem.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedProblem.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Category:</strong> {selectedProblem.category}
                </div>
                <div className="detail-row">
                  <strong>Assignee:</strong> {selectedProblem.assignee}
                </div>
                <div className="detail-row">
                  <strong>Related Incidents:</strong>
                  <div className="related-incidents-detail">
                    {selectedProblem.relatedIncidents.map(incidentId => (
                      <span key={incidentId} className="incident-badge">
                        {incidentId}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {formatDate(selectedProblem.createdAt)}
                </div>
                <div className="detail-row">
                  <strong>Last Updated:</strong> {formatDate(selectedProblem.updatedAt)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedProblem(null)}
              >
                Close
              </button>
              <button className="btn btn-primary">
                Edit Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemManagement;