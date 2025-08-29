import React, { useState } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 'USR-001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'IT Administrator',
      department: 'IT',
      status: 'Active',
      lastLogin: '2024-01-10T08:30:00Z',
      createdAt: '2023-03-15T10:00:00Z'
    },
    {
      id: 'USR-002',
      name: 'Jane Doe',
      email: 'jane.doe@company.com', 
      role: 'Service Desk Analyst',
      department: 'IT',
      status: 'Active',
      lastLogin: '2024-01-10T09:15:00Z',
      createdAt: '2023-04-20T14:30:00Z'
    }
  ]);

  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <button className="btn btn-primary">+ Add User</button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} onClick={() => setSelectedUser(user)}>
                <td className="user-id">{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.department}</td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
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

export default UserManagement;