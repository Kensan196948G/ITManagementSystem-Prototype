import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const navigation = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Service Catalog', path: '/service-catalog', icon: '🛍️' },
        { name: 'My Requests', path: '/my-requests', icon: '📋' },
      ]
    },
    {
      title: 'INCIDENT MANAGEMENT',
      items: [
        { name: 'Incidents', path: '/incidents', icon: '🚨' },
        { name: 'Create Incident', path: '/incidents/create', icon: '➕' },
        { name: 'My Incidents', path: '/my-incidents', icon: '👤' },
      ]
    },
    {
      title: 'KNOWLEDGE & REPORTS',
      items: [
        { name: 'Knowledge Base', path: '/knowledge-base', icon: '📚' },
        { name: 'Reports', path: '/reports', icon: '📈' },
        { name: 'Analytics', path: '/analytics', icon: '📊' },
      ]
    }
  ];

  const quickLinks = [
    { name: 'Create Ticket', icon: '🎫' },
    { name: 'Password Reset', icon: '🔑' },
    { name: 'VPN Access', icon: '🔒' },
    { name: 'Software Request', icon: '💾' },
  ];

  const recentItems = [
    'INC-2024-001: Email Server Down',
    'REQ-2024-045: New Laptop Request',
    'KB-2024-012: VPN Setup Guide',
  ];

  const userDisplayInfo = currentUser ? {
    name: currentUser.name,
    initials: currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    email: currentUser.email,
    department: currentUser.department || 'IT Operations',
    lastLogin: currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Unknown'
  } : {
    name: 'Guest User',
    initials: 'GU',
    email: 'guest@company.com',
    department: 'Guest',
    lastLogin: 'N/A'
  };

  return (
    <div className="layout-container">
      {/* Portal Header */}
      <header className="portal-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo">IT</div>
              <span className="brand-text">ServicePortal</span>
            </div>
            
            <div className="global-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search tickets, services, knowledge..." 
                className="search-input"
              />
            </div>
          </div>

          <div className="header-right">
            <select className="header-icon" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '14px', borderRadius: '20px', padding: '8px 12px'}}>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>

            <div className="header-icon">
              <span>⚙️</span>
            </div>

            <div className="header-icon">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </div>

            <div className="user-profile">
              <div className="user-avatar">{userDisplayInfo.initials}</div>
              <span className="user-name">{userDisplayInfo.name}</span>
              <span>▼</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Navigation</span>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Favorites Section */}
        <div className="nav-section">
          <div className="nav-section-title">FAVORITES</div>
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <span className="nav-icon">⭐</span>
            Dashboard
          </Link>
          <Link to="/incidents" className={`nav-item ${location.pathname === '/incidents' ? 'active' : ''}`}>
            <span className="nav-icon">⭐</span>
            My Incidents
          </Link>
        </div>

        {/* Main Navigation */}
        {navigation.map((section, index) => (
          <div key={index} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item, itemIndex) => (
              <Link 
                key={itemIndex}
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && item.name}
              </Link>
            ))}
          </div>
        ))}

        {/* Quick Links */}
        {!sidebarCollapsed && (
          <div className="nav-section">
            <div className="nav-section-title">QUICK LINKS</div>
            {quickLinks.map((link, index) => (
              <a key={index} href="#" className="nav-item">
                <span className="nav-icon">{link.icon}</span>
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Recently Accessed */}
        {!sidebarCollapsed && (
          <div className="nav-section">
            <div className="nav-section-title">RECENT</div>
            {recentItems.map((item, index) => (
              <a key={index} href="#" className="nav-item" style={{fontSize: '13px', padding: '8px 20px'}}>
                <span className="nav-icon">📄</span>
                {item.length > 25 ? item.substring(0, 25) + '...' : item}
              </a>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        {children}
      </main>

      {/* Portal Footer */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>IT Service Portal</h3>
            <div className="footer-links">
              <a href="#">Service Catalog</a>
              <a href="#">Knowledge Base</a>
              <a href="#">System Status</a>
              <a href="#">Service Level Agreements</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <div className="footer-links">
              <a href="#">Contact IT Support</a>
              <a href="#">Emergency Contacts</a>
              <a href="#">Submit Feedback</a>
              <a href="#">Training Resources</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Actions</h3>
            <div className="footer-links">
              <a href="#">Reset Password</a>
              <a href="#">Request Access</a>
              <a href="#">Report Issue</a>
              <a href="#">Book Meeting Room</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Resources</h3>
            <div className="footer-links">
              <a href="#">IT Policies</a>
              <a href="#">Security Guidelines</a>
              <a href="#">Software Downloads</a>
              <a href="#">Mobile Apps</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <p>&copy; 2024 Company IT Services. All rights reserved. | Version 2.4.1</p>
          </div>
          <div>
            <p>Last login: {userDisplayInfo.lastLogin} | User: {userDisplayInfo.email}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;