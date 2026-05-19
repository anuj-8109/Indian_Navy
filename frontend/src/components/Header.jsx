import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Header({ currentPath, theme, onToggleTheme, children }) {
  const getHeaderDetails = () => {
    switch (currentPath) {
      case '#/dashboard':
      case '#/':
        return {
          title: 'Dashboard Control',
          subtitle: 'Real-time entry stats, classification breakdown, and gate logs'
        };
      case '#/visitors':
        return {
          title: 'Visitor Management',
          subtitle: 'Search, filter, view details, edit records, and print ID badges'
        };
      case '#/register':
        return {
          title: 'New Visitor Registration',
          subtitle: 'Create a new gate pass and auto-generate unique ID & QR code'
        };
      case '#/logs':
        return {
          title: 'Admin Activity Logs',
          subtitle: 'System auditing, registration logs, edits, and security logs'
        };
      default:
        return {
          title: 'Indian Navy Control',
          subtitle: 'Secure Visitor Registration & Gate Control'
        };
    }
  };

  const details = getHeaderDetails();

  return (
    <div className="header">
      <div className="header-title">
        <h2 style={{ margin: 0 }}>{details.title}</h2>
        <p style={{ marginTop: '0.25rem' }}>{details.subtitle}</p>
      </div>

      <div className="header-actions">
        {children}
        <button
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}
