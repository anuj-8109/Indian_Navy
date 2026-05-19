import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Logs from './pages/Logs';
import VisitorModal from './components/VisitorModal';
import { apiFetch, setToken } from './utils/api';
import { Plus } from 'lucide-react';

export default function App() {
  const [token, setTokenState] = useState(localStorage.getItem('navy_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('navy_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('navy_theme') || 'light');
  
  // Modals & Navigation State
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [editingVisitor, setEditingVisitor] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('navy_theme', theme);
  }, [theme]);

  // Handle route hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Auth failure listener (automated 401 logout)
    const handleAuthFailed = () => {
      setTokenState('');
      setAdminUser(null);
      window.location.hash = '#/login';
    };
    window.addEventListener('auth_failed', handleAuthFailed);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('auth_failed', handleAuthFailed);
    };
  }, []);

  // Validate session on load
  useEffect(() => {
    if (token) {
      const validateSession = async () => {
        try {
          const data = await apiFetch('/auth/me');
          if (data.success) {
            setAdminUser(data.user);
            localStorage.setItem('navy_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('Session validation failed', err);
          // Handled by auth_failed event
        }
      };
      validateSession();
    }
  }, [token]);

  const handleLoginSuccess = (user, jwtToken) => {
    setToken(jwtToken);
    setTokenState(jwtToken);
    setAdminUser(user);
    localStorage.setItem('navy_user', JSON.stringify(user));
    window.location.hash = '#/dashboard';
  };

  const handleLogout = () => {
    setToken('');
    setTokenState('');
    setAdminUser(null);
    localStorage.removeItem('navy_user');
    window.location.hash = '#/login';
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleViewVisitor = (visitor) => {
    setSelectedVisitor(visitor);
  };

  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    window.location.hash = '#/register';
  };

  const handleSaveSuccess = () => {
    setEditingVisitor(null);
    window.location.hash = '#/visitors';
  };

  const handleCancelEdit = () => {
    setEditingVisitor(null);
    window.location.hash = '#/visitors';
  };

  const navigate = (hash) => {
    window.location.hash = hash;
  };

  // Route Resolution
  const isVerifyRoute = currentPath.startsWith('#/visitor/');
  const verifyPassNoParam = isVerifyRoute ? currentPath.replace('#/visitor/', '') : '';

  if (isVerifyRoute) {
    return <Verify passNoParam={verifyPassNoParam} />;
  }

  // Not logged in -> Show Login
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigate}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* Main Panel Content */}
      <main className="main-content">
        <Header
          currentPath={currentPath}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        >
          {currentPath === '#/visitors' && (
            <button
              onClick={() => navigate('#/register')}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Add Visitor
            </button>
          )}
        </Header>

        {/* Content routing */}
        {(currentPath === '#/dashboard' || currentPath === '#/') && (
          <Dashboard onNavigate={navigate} onViewVisitor={handleViewVisitor} />
        )}

        {currentPath === '#/visitors' && (
          <Users
            onNavigate={navigate}
            onEditVisitor={handleEditVisitor}
            onViewVisitor={handleViewVisitor}
          />
        )}

        {currentPath === '#/register' && (
          <Register
            editVisitor={editingVisitor}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCancelEdit}
          />
        )}

        {currentPath === '#/logs' && (
          <Logs />
        )}
      </main>

      {/* Detailed Dossier Modal Popup */}
      {selectedVisitor && (
        <VisitorModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}
    </div>
  );
}
