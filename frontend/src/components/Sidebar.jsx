import React from 'react';
import { LayoutDashboard, Users, UserPlus, LogOut, ShieldAlert, History } from 'lucide-react';

export default function Sidebar({ currentPath, onNavigate, adminUser, onLogout }) {
  const isTabActive = (tabHash) => {
    if (tabHash === '#/dashboard' && (currentPath === '#/dashboard' || currentPath === '#/')) {
      return true;
    }
    return currentPath === tabHash;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <ShieldAlert size={24} />
        <span>NAVY CONTROL</span>
      </div>

      <ul className="sidebar-menu">
        <li>
          <button
            onClick={() => onNavigate('#/dashboard')}
            className={`sidebar-item ${isTabActive('#/dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard Home</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onNavigate('#/visitors')}
            className={`sidebar-item ${isTabActive('#/visitors') ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Users Management</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onNavigate('#/register')}
            className={`sidebar-item ${isTabActive('#/register') ? 'active' : ''}`}
          >
            <UserPlus size={20} />
            <span>Register Visitor</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => onNavigate('#/logs')}
            className={`sidebar-item ${isTabActive('#/logs') ? 'active' : ''}`}
          >
            <History size={20} />
            <span>Activity Logs</span>
          </button>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="admin-badge" style={{ marginBottom: '1rem' }}>
          <div className="admin-avatar">
            {adminUser ? adminUser.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {adminUser ? adminUser.username : 'Admin'}
            </div>
            <div style={{ fontSize: '0.75rem' }}>Gate Admin</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="sidebar-item"
          style={{ color: 'var(--danger)', paddingLeft: '0.5rem' }}
        >
          <LogOut size={20} style={{ marginRight: '0.5rem' }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
