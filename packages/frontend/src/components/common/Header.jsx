import React from 'react';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const currentUser = {
    name: 'John Doe',
    role: 'IT Administrator',
    avatar: null
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <span className="menu-icon">☰</span>
        </button>
        <h1 className="app-title">IT Service Management</h1>
      </div>
      
      <div className="header-right">
        <div className="notifications">
          <button className="notification-button" aria-label="Notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>
        </div>
        
        <div className="user-menu">
          <div className="user-avatar">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <span className="avatar-placeholder">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;