import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

// Dashboard Component
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState('August 2024');
  const { currentUser } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const userInfo = currentUser || {
    name: 'Guest User',
    department: 'IT Operations',
    role: 'Guest'
  };

  // Mock data for widgets
  const serviceHealthData = [
    { name: 'Email Server', description: 'Exchange Online', status: 'healthy' },
    { name: 'VPN Gateway', description: 'Remote access', status: 'warning' },
    { name: 'File Server', description: 'Document storage', status: 'healthy' },
    { name: 'Database', description: 'SQL Server cluster', status: 'healthy' },
    { name: 'Web Portal', description: 'Company intranet', status: 'error' },
  ];

  const recentIncidents = [
    {
      id: 'INC-2024-001',
      title: 'Email server intermittent connectivity',
      priority: 'high',
      status: 'in-progress',
      assignee: 'Mike Johnson',
      created: '2 hours ago'
    },
    {
      id: 'INC-2024-002',
      title: 'Printer not working in Finance department',
      priority: 'medium',
      status: 'open',
      assignee: 'Sarah Wilson',
      created: '4 hours ago'
    },
    {
      id: 'INC-2024-003',
      title: 'VPN connection timeout issues',
      priority: 'low',
      status: 'resolved',
      assignee: 'David Brown',
      created: '1 day ago'
    },
    {
      id: 'INC-2024-004',
      title: 'Software installation request - Adobe Creative Suite',
      priority: 'low',
      status: 'open',
      assignee: 'Lisa Chen',
      created: '2 days ago'
    },
  ];

  const performanceMetrics = [
    { label: 'Open Tickets', value: '24', change: '+3', changeType: 'negative' },
    { label: 'Resolved Today', value: '18', change: '+12', changeType: 'positive' },
    { label: 'SLA Compliance', value: '94%', change: '-2%', changeType: 'negative' },
    { label: 'Avg Response Time', value: '2.3h', change: '-0.5h', changeType: 'positive' },
  ];

  const announcements = [
    {
      title: 'Scheduled Maintenance - Email Server',
      content: 'Planned maintenance on Exchange servers this Saturday from 2 AM to 6 AM. Minimal impact expected.',
      date: '2024-08-25',
      author: 'IT Operations Team',
      priority: 'high'
    },
    {
      title: 'New Software Available - Microsoft Office 365',
      content: 'The latest version of Office 365 is now available for installation through the Software Center.',
      date: '2024-08-24',
      author: 'Software Management',
      priority: 'medium'
    },
    {
      title: 'Security Update: Multi-Factor Authentication',
      content: 'All users must enable MFA by September 1st, 2024. Training sessions available.',
      date: '2024-08-23',
      author: 'Security Team',
      priority: 'high'
    }
  ];

  const calendarEvents = [
    { time: '09:00', title: 'IT Team Standup', type: 'meeting' },
    { time: '11:30', title: 'Server Maintenance Window', type: 'maintenance' },
    { time: '14:00', title: 'Security Review Meeting', type: 'meeting' },
    { time: '16:30', title: 'User Training Session', type: 'training' },
  ];

  const knowledgeArticles = [
    'How to reset your Windows password',
    'VPN setup guide for remote workers',
    'Troubleshooting printer connection issues',
    'Microsoft Teams best practices',
    'Setting up email on mobile devices',
    'Password policy requirements',
  ];

  return (
    <div className="dashboard slide-in">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-message">
            <h1>Welcome back, {userInfo.name}</h1>
            <p>Here's what's happening with your IT services today • {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn">
              <span>🎫</span>
              Create Ticket
            </button>
            <button className="quick-action-btn secondary">
              <span>📞</span>
              Contact Support
            </button>
            <button className="quick-action-btn secondary">
              <span>📚</span>
              Browse Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="widget-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px'}}>
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="widget">
            <div className="widget-content">
              <div className="metric-card">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className={`metric-change ${metric.changeType}`}>
                  {metric.change} from yesterday
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Widgets Grid */}
      <div className="widget-grid large">
        {/* Service Health Monitor Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>💚</span>
              Service Health Monitor
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div className="health-status">
              {serviceHealthData.map((service, index) => (
                <div key={index} className="service-status">
                  <div className="service-info">
                    <div className="service-name">{service.name}</div>
                    <div className="service-description">{service.description}</div>
                  </div>
                  <div className={`status-indicator ${service.status}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Incidents Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>🚨</span>
              Recent Incidents
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div className="incident-list">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="incident-item">
                  <div className={`incident-priority ${incident.priority}`}></div>
                  <div className="incident-details">
                    <div className="incident-title">{incident.title}</div>
                    <div className="incident-meta">
                      {incident.id} • Assigned to {incident.assignee} • {incident.created}
                    </div>
                  </div>
                  <span className={`incident-status ${incident.status}`}>
                    {incident.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>📢</span>
              Announcements
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div className="announcement-list">
              {announcements.map((announcement, index) => (
                <div key={index} className="announcement-item">
                  <div className="announcement-title">{announcement.title}</div>
                  <div className="announcement-content">{announcement.content}</div>
                  <div className="announcement-meta">
                    <span>{announcement.author}</span>
                    <span>{announcement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>⚡</span>
              Quick Actions
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <button className="quick-action-btn" style={{fontSize: '14px', padding: '16px'}}>
                <span>🎫</span>
                <div style={{textAlign: 'left'}}>
                  <div>Create Ticket</div>
                  <small style={{opacity: 0.8}}>Report an issue</small>
                </div>
              </button>
              <button className="quick-action-btn secondary" style={{fontSize: '14px', padding: '16px'}}>
                <span>🛍️</span>
                <div style={{textAlign: 'left'}}>
                  <div>Request Service</div>
                  <small style={{opacity: 0.8}}>Browse catalog</small>
                </div>
              </button>
              <button className="quick-action-btn secondary" style={{fontSize: '14px', padding: '16px'}}>
                <span>🔑</span>
                <div style={{textAlign: 'left'}}>
                  <div>Reset Password</div>
                  <small style={{opacity: 0.8}}>Self-service</small>
                </div>
              </button>
              <button className="quick-action-btn secondary" style={{fontSize: '14px', padding: '16px'}}>
                <span>📞</span>
                <div style={{textAlign: 'left'}}>
                  <div>Contact Support</div>
                  <small style={{opacity: 0.8}}>Get help</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Team Calendar Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>📅</span>
              Today's Schedule
            </h3>
            <div className="calendar-nav">
              <button className="calendar-nav-btn">‹</button>
              <span style={{fontSize: '14px', fontWeight: 500}}>Today</span>
              <button className="calendar-nav-btn">›</button>
            </div>
          </div>
          <div className="widget-content">
            <div className="calendar-events">
              {calendarEvents.map((event, index) => (
                <div key={index} className="calendar-event">
                  <span className="event-time">{event.time}</span>
                  <span>{event.title}</span>
                  <span style={{
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    background: event.type === 'meeting' ? '#E6F2FF' : 
                               event.type === 'maintenance' ? '#FFF4E6' : '#E6FFE6',
                    color: event.type === 'meeting' ? '#0052CC' : 
                           event.type === 'maintenance' ? '#FF8B00' : '#00875A',
                    marginLeft: 'auto'
                  }}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Base Search Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>📚</span>
              Knowledge Base
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div className="kb-search">
              <input 
                type="text" 
                placeholder="Search knowledge articles..." 
                className="kb-search-input"
              />
            </div>
            <div className="kb-articles">
              <h4 style={{fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)'}}>
                Popular Articles
              </h4>
              {knowledgeArticles.map((article, index) => (
                <a key={index} href="#" className="kb-article">
                  {article}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Widgets Row */}
      <div className="widget-grid">
        {/* System Performance Chart Placeholder */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>📊</span>
              System Performance
            </h3>
            <select style={{border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="widget-content">
            <div style={{height: '200px', background: 'var(--light-gray)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '48px', marginBottom: '8px'}}>📈</div>
                <div>Performance charts would display here</div>
                <small>CPU, Memory, Network, Storage metrics</small>
              </div>
            </div>
          </div>
        </div>

        {/* My Requests Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>📋</span>
              My Recent Requests
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div className="incident-list">
              <div className="incident-item">
                <div className="incident-priority low"></div>
                <div className="incident-details">
                  <div className="incident-title">Software Installation - Slack</div>
                  <div className="incident-meta">REQ-2024-089 • Submitted yesterday</div>
                </div>
                <span className="incident-status resolved">approved</span>
              </div>
              <div className="incident-item">
                <div className="incident-priority medium"></div>
                <div className="incident-details">
                  <div className="incident-title">Hardware Request - External Monitor</div>
                  <div className="incident-meta">REQ-2024-088 • Submitted 2 days ago</div>
                </div>
                <span className="incident-status in-progress">pending</span>
              </div>
              <div className="incident-item">
                <div className="incident-priority low"></div>
                <div className="incident-details">
                  <div className="incident-title">Access Request - Finance SharePoint</div>
                  <div className="incident-meta">REQ-2024-087 • Submitted 3 days ago</div>
                </div>
                <span className="incident-status resolved">granted</span>
              </div>
            </div>
          </div>
        </div>

        {/* IT News & Updates Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <span>📰</span>
              IT News & Updates
            </h3>
            <button className="widget-menu">⋯</button>
          </div>
          <div className="widget-content">
            <div className="announcement-list">
              <div className="announcement-item" style={{borderLeftColor: 'var(--success-green)'}}>
                <div className="announcement-title">Windows 11 Upgrade Available</div>
                <div className="announcement-content">Schedule your Windows 11 upgrade through the Software Center.</div>
                <div className="announcement-meta">
                  <span>System Admin</span>
                  <span>Aug 24</span>
                </div>
              </div>
              <div className="announcement-item" style={{borderLeftColor: 'var(--warning-yellow)'}}>
                <div className="announcement-title">VPN Certificate Renewal</div>
                <div className="announcement-content">VPN certificates will be automatically renewed next week.</div>
                <div className="announcement-meta">
                  <span>Network Team</span>
                  <span>Aug 23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Incident Management Component
const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2024-001',
      title: 'Email server intermittent connectivity',
      description: 'Users reporting intermittent email connectivity issues',
      priority: 'high',
      status: 'in-progress',
      assignee: 'Mike Johnson',
      created: '2024-08-25T10:00:00Z',
      updated: '2024-08-25T14:30:00Z',
      category: 'Infrastructure',
      subcategory: 'Email Services'
    },
    {
      id: 'INC-2024-002',
      title: 'Printer not working in Finance department',
      description: 'HP LaserJet printer in Finance not responding',
      priority: 'medium',
      status: 'open',
      assignee: 'Sarah Wilson',
      created: '2024-08-25T08:15:00Z',
      updated: '2024-08-25T08:15:00Z',
      category: 'Hardware',
      subcategory: 'Printers'
    },
    {
      id: 'INC-2024-003',
      title: 'VPN connection timeout issues',
      description: 'Multiple users experiencing VPN timeouts',
      priority: 'low',
      status: 'resolved',
      assignee: 'David Brown',
      created: '2024-08-24T16:20:00Z',
      updated: '2024-08-25T09:45:00Z',
      category: 'Network',
      subcategory: 'VPN'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredIncidents = incidents.filter(incident => {
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    if (filterPriority !== 'all' && incident.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#d73527';
      case 'medium': return '#ff8b00';
      case 'low': return '#00875a';
      default: return '#6b778c';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#0052cc';
      case 'in-progress': return '#ff8b00';
      case 'resolved': return '#00875a';
      case 'closed': return '#6b778c';
      default: return '#6b778c';
    }
  };

  return (
    <div className="incident-management slide-in">
      <div className="page-header">
        <div>
          <h1>🚨 Incident Management</h1>
          <p>Track and manage IT incidents and service disruptions</p>
        </div>
        <button className="btn-primary">
          <span>➕</span>
          Create New Incident
        </button>
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="incidents-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map(incident => (
              <tr key={incident.id}>
                <td><strong>{incident.id}</strong></td>
                <td>
                  <div className="incident-title">{incident.title}</div>
                  <div className="incident-category">{incident.category} › {incident.subcategory}</div>
                </td>
                <td>
                  <span 
                    className="priority-badge" 
                    style={{backgroundColor: getPriorityColor(incident.priority)}}
                  >
                    {incident.priority.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{backgroundColor: getStatusColor(incident.status)}}
                  >
                    {incident.status.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td>{incident.assignee}</td>
                <td>{new Date(incident.created).toLocaleDateString()}</td>
                <td>
                  <button className="btn-small">View</button>
                  <button className="btn-small secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Problem Management Component
const ProblemManagement = () => {
  const [problems, setProblems] = useState([
    {
      id: 'PRB-2024-001',
      title: 'Recurring email server outages',
      description: 'Investigation into repeated email server failures',
      priority: 'high',
      status: 'investigating',
      assignee: 'IT Architecture Team',
      created: '2024-08-20T09:00:00Z',
      relatedIncidents: ['INC-2024-001', 'INC-2024-045', 'INC-2024-067']
    }
  ]);

  return (
    <div className="problem-management slide-in">
      <div className="page-header">
        <div>
          <h1>🔍 Problem Management</h1>
          <p>Identify and resolve root causes of recurring incidents</p>
        </div>
        <button className="btn-primary">
          <span>➕</span>
          Create Problem Record
        </button>
      </div>

      <div className="problems-grid">
        {problems.map(problem => (
          <div key={problem.id} className="problem-card">
            <div className="problem-header">
              <h3>{problem.title}</h3>
              <span className={`status-badge ${problem.status}`}>
                {problem.status.toUpperCase()}
              </span>
            </div>
            <p>{problem.description}</p>
            <div className="problem-meta">
              <div><strong>ID:</strong> {problem.id}</div>
              <div><strong>Assignee:</strong> {problem.assignee}</div>
              <div><strong>Related Incidents:</strong> {problem.relatedIncidents.length}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Change Management Component
const ChangeManagement = () => {
  const [changes, setChanges] = useState([
    {
      id: 'CHG-2024-001',
      title: 'Email Server Upgrade - Exchange 2019 to 2022',
      description: 'Scheduled upgrade of Exchange servers to improve performance',
      priority: 'high',
      status: 'approved',
      implementer: 'Infrastructure Team',
      scheduledDate: '2024-08-30T02:00:00Z',
      risk: 'medium'
    }
  ]);

  return (
    <div className="change-management slide-in">
      <div className="page-header">
        <div>
          <h1>🔄 Change Management</h1>
          <p>Plan and implement changes to IT infrastructure and services</p>
        </div>
        <button className="btn-primary">
          <span>➕</span>
          Request Change
        </button>
      </div>

      <div className="changes-calendar">
        <h3>📅 Scheduled Changes</h3>
        <div className="calendar-placeholder" style={{
          height: '400px',
          background: 'var(--light-gray)',
          border: '2px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📅</div>
            <div>Change Calendar View</div>
            <div style={{fontSize: '14px', marginTop: '8px'}}>Upcoming changes and maintenance windows</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Service Catalog Component
const ServiceCatalog = () => {
  const [services, setServices] = useState([
    {
      id: 'SVC-001',
      name: 'New Employee Setup',
      description: 'Complete IT setup for new employees including accounts, equipment, and access',
      category: 'Account Management',
      icon: '👤',
      estimatedTime: '2-3 business days',
      popularity: 95
    },
    {
      id: 'SVC-002',
      name: 'Software Installation',
      description: 'Request installation of approved software applications',
      category: 'Software',
      icon: '💾',
      estimatedTime: '1-2 business days',
      popularity: 87
    },
    {
      id: 'SVC-003',
      name: 'Hardware Request',
      description: 'Request new hardware including laptops, monitors, peripherals',
      category: 'Hardware',
      icon: '💻',
      estimatedTime: '3-5 business days',
      popularity: 76
    },
    {
      id: 'SVC-004',
      name: 'Access Request',
      description: 'Request access to systems, applications, or network resources',
      category: 'Security',
      icon: '🔐',
      estimatedTime: '1 business day',
      popularity: 89
    }
  ]);

  const categories = ['All', 'Account Management', 'Software', 'Hardware', 'Security', 'Network'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="service-catalog slide-in">
      <div className="page-header">
        <div>
          <h1>🛍️ Service Catalog</h1>
          <p>Browse and request IT services and resources</p>
        </div>
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Search services..." />
        </div>
      </div>

      <div className="catalog-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="services-grid">
        {filteredServices.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <div className="service-content">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-meta">
                <span className="category-tag">{service.category}</span>
                <span className="time-estimate">⏱️ {service.estimatedTime}</span>
              </div>
              <button className="btn-primary service-request-btn">
                Request Service
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Configuration Management Component
const ConfigurationManagement = () => {
  return (
    <div className="configuration-management slide-in">
      <div className="page-header">
        <div>
          <h1>⚙️ Configuration Management</h1>
          <p>Manage configuration items and their relationships</p>
        </div>
        <button className="btn-primary">
          <span>➕</span>
          Add CI
        </button>
      </div>

      <div className="cmdb-dashboard">
        <div className="cmdb-stats">
          <div className="stat-card">
            <div className="stat-value">1,247</div>
            <div className="stat-label">Total CIs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">23</div>
            <div className="stat-label">CI Types</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">89%</div>
            <div className="stat-label">Data Quality</div>
          </div>
        </div>

        <div className="ci-categories">
          <h3>📊 Configuration Items by Category</h3>
          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon">💻</div>
              <div className="category-name">Hardware</div>
              <div className="category-count">456 items</div>
            </div>
            <div className="category-card">
              <div className="category-icon">💾</div>
              <div className="category-name">Software</div>
              <div className="category-count">234 items</div>
            </div>
            <div className="category-card">
              <div className="category-icon">🌐</div>
              <div className="category-name">Network</div>
              <div className="category-count">123 items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Knowledge Base Component
const KnowledgeBase = () => {
  const [articles, setArticles] = useState([
    {
      id: 'KB-001',
      title: 'How to reset your Windows password',
      category: 'Account Management',
      views: 1520,
      rating: 4.8,
      lastUpdated: '2024-08-20',
      tags: ['password', 'windows', 'account']
    },
    {
      id: 'KB-002',
      title: 'VPN setup guide for remote workers',
      category: 'Network',
      views: 987,
      rating: 4.6,
      lastUpdated: '2024-08-18',
      tags: ['vpn', 'remote', 'setup']
    },
    {
      id: 'KB-003',
      title: 'Troubleshooting printer connection issues',
      category: 'Hardware',
      views: 756,
      rating: 4.4,
      lastUpdated: '2024-08-15',
      tags: ['printer', 'troubleshooting', 'network']
    }
  ]);

  return (
    <div className="knowledge-base slide-in">
      <div className="page-header">
        <div>
          <h1>📚 Knowledge Base</h1>
          <p>Search for solutions and browse helpful articles</p>
        </div>
        <button className="btn-primary">
          <span>➕</span>
          Create Article
        </button>
      </div>

      <div className="kb-search">
        <div className="search-box large">
          <span>🔍</span>
          <input type="text" placeholder="Search knowledge articles..." />
          <button className="search-btn">Search</button>
        </div>
      </div>

      <div className="kb-content">
        <div className="popular-articles">
          <h3>🔥 Popular Articles</h3>
          <div className="articles-list">
            {articles.map(article => (
              <div key={article.id} className="article-card">
                <div className="article-header">
                  <h4>{article.title}</h4>
                  <span className="article-category">{article.category}</span>
                </div>
                <div className="article-meta">
                  <span>👁️ {article.views} views</span>
                  <span>⭐ {article.rating}</span>
                  <span>📅 Updated {article.lastUpdated}</span>
                </div>
                <div className="article-tags">
                  {article.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = () => {
  const [reportType, setReportType] = useState('incidents');
  const [dateRange, setDateRange] = useState('last-30-days');

  const reportTypes = [
    { id: 'incidents', name: 'Incident Reports', icon: '🚨' },
    { id: 'performance', name: 'Performance Reports', icon: '📊' },
    { id: 'user-activity', name: 'User Activity', icon: '👥' },
    { id: 'system-health', name: 'System Health', icon: '💚' }
  ];

  return (
    <div className="reports slide-in">
      <div className="page-header">
        <div>
          <h1>📈 Reports & Analytics</h1>
          <p>Generate and view reports on IT service performance</p>
        </div>
        <button className="btn-primary">
          <span>📥</span>
          Export Report
        </button>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {reportTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="last-90-days">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <div className="report-visualization">
        <div style={{
          height: '400px',
          background: 'var(--light-gray)',
          border: '2px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
            <div>Report Visualization</div>
            <div style={{fontSize: '14px', marginTop: '8px'}}>
              {reportTypes.find(type => type.id === reportType)?.name} for {dateRange.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔐' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' }
  ];

  return (
    <div className="settings slide-in">
      <div className="page-header">
        <div>
          <h1>⚙️ Settings</h1>
          <p>Configure your portal preferences and account settings</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Preferences</h3>
              <div className="setting-item">
                <label>Theme:</label>
                <select defaultValue="light">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Language:</label>
                <select defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Email notifications for new incidents
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Browser notifications for urgent issues
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="setting-item">
                <label>Multi-Factor Authentication:</label>
                <button className="btn-secondary">Configure MFA</button>
              </div>
              <div className="setting-item">
                <label>Password:</label>
                <button className="btn-secondary">Change Password</button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h3>Third-party Integrations</h3>
              <div className="integration-item">
                <div>
                  <strong>Microsoft Teams</strong>
                  <div>Receive incident notifications in Teams</div>
                </div>
                <button className="btn-secondary">Connect</button>
              </div>
              <div className="integration-item">
                <div>
                  <strong>Slack</strong>
                  <div>Send alerts to Slack channels</div>
                </div>
                <button className="btn-secondary">Connect</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export all components
export {
  Dashboard,
  IncidentManagement,
  ProblemManagement,
  ChangeManagement,
  ServiceCatalog,
  ConfigurationManagement,
  KnowledgeBase,
  Reports,
  Settings
};