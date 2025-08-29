import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Open Incidents', value: '23', trend: '+5%', color: 'error' },
    { title: 'Resolved Today', value: '18', trend: '+12%', color: 'success' },
    { title: 'Active Problems', value: '7', trend: '-2%', color: 'warning' },
    { title: 'Pending Changes', value: '12', trend: '+8%', color: 'info' },
  ];

  const recentIncidents = [
    { id: 'INC-001', title: 'Email server down', priority: 'High', status: 'Open', assignee: 'John Smith' },
    { id: 'INC-002', title: 'Network connectivity issues', priority: 'Medium', status: 'In Progress', assignee: 'Jane Doe' },
    { id: 'INC-003', title: 'Printer not working', priority: 'Low', status: 'Resolved', assignee: 'Mike Johnson' },
    { id: 'INC-004', title: 'Application crash', priority: 'High', status: 'Open', assignee: 'Sarah Wilson' },
  ];

  const upcomingChanges = [
    { id: 'CHG-001', title: 'Database migration', scheduled: '2024-01-15', risk: 'High' },
    { id: 'CHG-002', title: 'Software update', scheduled: '2024-01-16', risk: 'Medium' },
    { id: 'CHG-003', title: 'Network configuration', scheduled: '2024-01-17', risk: 'Low' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">IT Service Management Overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                {stat.trend} from last week
              </div>
            </div>
            <div className="stat-icon">
              {stat.color === 'error' && '🚨'}
              {stat.color === 'success' && '✅'}
              {stat.color === 'warning' && '⚠️'}
              {stat.color === 'info' && 'ℹ️'}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Incidents */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Incidents</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="incident-id">{incident.id}</td>
                    <td>{incident.title}</td>
                    <td>
                      <span className={`priority-badge priority-${incident.priority.toLowerCase()}`}>
                        {incident.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${incident.status.toLowerCase().replace(' ', '-')}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td>{incident.assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Changes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Changes</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Scheduled</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {upcomingChanges.map((change) => (
                  <tr key={change.id}>
                    <td className="change-id">{change.id}</td>
                    <td>{change.title}</td>
                    <td>{change.scheduled}</td>
                    <td>
                      <span className={`risk-badge risk-${change.risk.toLowerCase()}`}>
                        {change.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;