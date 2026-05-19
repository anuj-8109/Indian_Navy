import React, { useState } from 'react';
import { apiFetch, setToken } from '../utils/api';
import { Lock, User, ShieldAlert } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Force Change Password flow state
  const [forceChangePassword, setForceChangePassword] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password }
      });

      if (data.success) {
        if (!data.user.isPasswordChanged) {
          // Force password update flow
          setTempToken(data.token);
          setToken(data.token); // Temporarily store for next request
          setForceChangePassword(true);
        } else {
          // Standard login success
          onLoginSuccess(data.user, data.token);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: {
          oldPassword: password, // The password they just typed
          newPassword: newPassword
        }
      });

      if (data.success) {
        // Success: proceed to dashboard
        const meData = await apiFetch('/auth/me');
        onLoginSuccess(meData.user, tempToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="navy-crest-logo">
          <ShieldAlert size={48} />
        </div>
        
        {!forceChangePassword ? (
          <>
            <h1>INDIAN NAVY</h1>
            <p>Visitor Registration & Gate Control System</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter admin username"
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>UPDATE PASSWORD</h1>
            <p>Security Policy: Please update your default password to continue.</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handlePasswordChange}>
              <div className="form-group" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  style={{ width: '100%' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  style={{ width: '100%' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Updating Password...' : 'Save & Continue'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
